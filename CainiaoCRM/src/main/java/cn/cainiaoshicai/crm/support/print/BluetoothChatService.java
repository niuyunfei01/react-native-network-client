/*
 * Copyright (C) 2009 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package cn.cainiaoshicai.crm.support.print;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.UUID;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

/**
 * This class does all the work for setting up and managing Bluetooth
 * connections with other devices. It has a thread that listens for
 * incoming connections, a thread for connecting with a device, and a
 * thread for performing data transmissions when connected.
 */
public class BluetoothChatService {
    private static InputStream mmInStream;
    private static OutputStream mmOutStream;
    // Debugging
    private static final String TAG = "BluetoothChatService";
    private static final boolean D = true;

    // Name for the SDP record when creating server socket
    private static final String NAME = "BluetoothChat";

    // Unique UUID for this application
//    00001120-0000-1000-8000-00805F9B34FB
    private static final UUID MY_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    // Member fields
    private final BluetoothAdapter mAdapter;
    private final Handler mHandler;
    private AcceptThread mAcceptThread;
    private ConnectThread mConnectThread;
    private ConnectedThread mConnectedThread;
    private int mState;

    // Constants that indicate the current connection state
    public static final int STATE_NONE = 0;       // we're doing nothing
    public static final int STATE_LISTEN = 1;     // now listening for incoming connections
    public static final int STATE_CONNECTING = 2; // now initiating an outgoing connection
    public static final int STATE_CONNECTED = 3;  // now connected to a remote device

    /**
     * Constructor. Prepares a new BluetoothChat session.
     * @param context  The UI Activity Context
     * @param handler  A Handler to send messages back to the UI Activity
     */
    public BluetoothChatService(Context context, Handler handler) {
        mAdapter = BluetoothAdapter.getDefaultAdapter();
        mState = STATE_NONE;
        mHandler = handler;
    }

    /**
     * Set the current state of the chat connection
     * @param state  An integer defining the current connection state
     */
    private synchronized void setState(int state) {
        if (D) Log.d(TAG, "setState() " + mState + " -> " + state);
        mState = state;

        // Give the new state to the Handler so the UI Activity can update
        mHandler.obtainMessage(BluetoothChat.MESSAGE_STATE_CHANGE, state, -1).sendToTarget();
    }

    /**
     * Return the current connection state. */
    public synchronized int getState() {
        return mState;
    }

    /**
     * Start the chat service. Specifically start AcceptThread to begin a
     * session in listening (server) mode. Called by the Activity onResume() */
    public synchronized void start() {
        if (D) Log.d(TAG, "start");

        // Cancel any thread attempting to make a connection
        if (mConnectThread != null) {mConnectThread.cancel(); mConnectThread = null;}

        // Cancel any thread currently running a connection
        if (mConnectedThread != null) {mConnectedThread.cancel(); mConnectedThread = null;}

        // Start the thread to listen on a BluetoothServerSocket
        if (mAcceptThread == null) {
            mAcceptThread = new AcceptThread();
            mAcceptThread.start();
        }
        setState(STATE_LISTEN);
    }

    /**
     * Start the ConnectThread to initiate a connection to a remote device.
     * @param device  The BluetoothDevice to connect
     */
    public synchronized void connect(BluetoothDevice device) {
        if (D) Log.d(TAG, "connect to: " + device);
        
        // Cancel any thread attempting to make a connection
        if (mState == STATE_CONNECTING) {
            if (mConnectThread != null) {mConnectThread.cancel(); mConnectThread = null;}
        }

        // Cancel any thread currently running a connection
        if (mConnectedThread != null) {mConnectedThread.cancel(); mConnectedThread = null;}

        // Start the thread to connect with the given device
        mConnectThread = new ConnectThread(device);
        mConnectThread.start();
        setState(STATE_CONNECTING);
    }

    /**
     * Start the ConnectedThread to begin managing a Bluetooth connection
     * @param socket  The BluetoothSocket on which the connection was made
     * @param device  The BluetoothDevice that has been connected
     */
    public synchronized void connected(BluetoothSocket socket, BluetoothDevice device) {
        if (D) Log.d(TAG, "connected");

        // Cancel the thread that completed the connection
        if (mConnectThread != null) {mConnectThread.cancel(); mConnectThread = null;}

        // Cancel any thread currently running a connection
        if (mConnectedThread != null) {mConnectedThread.cancel(); mConnectedThread = null;}

        // Cancel the accept thread because we only want to connect to one device
        if (mAcceptThread != null) {mAcceptThread.cancel(); mAcceptThread = null;}

        // Start the thread to manage the connection and perform transmissions
        mConnectedThread = new ConnectedThread(socket);
        mConnectedThread.start();

        // Send the name of the connected device back to the UI Activity
        Message msg = mHandler.obtainMessage(BluetoothChat.MESSAGE_DEVICE_NAME);
        Bundle bundle = new Bundle();
        bundle.putString(BluetoothChat.DEVICE_NAME, device.getName());
        msg.setData(bundle);
        mHandler.sendMessage(msg);

        setState(STATE_CONNECTED);
    }

    /**
     * Stop all threads
     */
    public synchronized void stop() {
        if (D) Log.d(TAG, "stop");
        if (mConnectThread != null) {mConnectThread.cancel(); mConnectThread = null;}
        if (mConnectedThread != null) {mConnectedThread.cancel(); mConnectedThread = null;}
        if (mAcceptThread != null) {mAcceptThread.cancel(); mAcceptThread = null;}
        setState(STATE_NONE);
    }

    /**
     * Write to the ConnectedThread in an unsynchronized manner
     * @param out The bytes to write
     * @see ConnectedThread#write(byte[])
     */
    public void write(byte[] out) {
        // Create temporary object
        ConnectedThread r;
        // Synchronize a copy of the ConnectedThread
        synchronized (this) {
            if (mState != STATE_CONNECTED) return;
            r = mConnectedThread;
        }
        // Perform the write unsynchronized
        r.write(out);
    }

    /**
     * Indicate that the connection attempt failed and notify the UI Activity.
     */
    private void connectionFailed() {
        setState(STATE_LISTEN);

        // Send a failure message back to the Activity
        Message msg = mHandler.obtainMessage(BluetoothChat.MESSAGE_TOAST);
        Bundle bundle = new Bundle();
        bundle.putString(BluetoothChat.TOAST, "不能连接到打印机");
        msg.setData(bundle);
        mHandler.sendMessage(msg);
    }

    /**
     * Indicate that the connection was lost and notify the UI Activity.
     */
    private void connectionLost() {
        setState(STATE_LISTEN);

        // Send a failure message back to the Activity
        Message msg = mHandler.obtainMessage(BluetoothChat.MESSAGE_TOAST);
        Bundle bundle = new Bundle();
        bundle.putString(BluetoothChat.TOAST, "已断开与打印机的连接");
        msg.setData(bundle);
        mHandler.sendMessage(msg);
    }

    /**
     * This thread runs while listening for incoming connections. It behaves
     * like a server-side client. It runs until a connection is accepted
     * (or until cancelled).
     */
    private class AcceptThread extends Thread {
        // The local server socket
        private final BluetoothServerSocket mmServerSocket;

        public AcceptThread() {
            BluetoothServerSocket tmp = null;

            // Create a new listening server socket
            try {
                tmp = mAdapter.listenUsingRfcommWithServiceRecord(NAME, MY_UUID);
            } catch (IOException e) {
                Log.e(TAG, "listen() failed", e);
            }
            mmServerSocket = tmp;
        }

        public void run() {
            if (D) Log.d(TAG, "BEGIN mAcceptThread" + this);
            setName("AcceptThread");
            BluetoothSocket socket = null;

            // Listen to the server socket if we're not connected
            while (mState != STATE_CONNECTED) {
                try {
                    // This is a blocking call and will only return on a
                    // successful connection or an exception
                    socket = mmServerSocket.accept();
                } catch (IOException e) {
                    Log.e(TAG, "accept() failed", e);
                    break;
                }

                // If a connection was accepted
                if (socket != null) {
                    synchronized (BluetoothChatService.this) {
                        switch (mState) {
                        case STATE_LISTEN:
                        case STATE_CONNECTING:
                            // Situation normal. Start the connected thread.
                            connected(socket, socket.getRemoteDevice());
                            break;
                        case STATE_NONE:
                        case STATE_CONNECTED:
                            // Either not ready or already connected. Terminate new socket.
                            try {
                                socket.close();
                            } catch (IOException e) {
                                Log.e(TAG, "Could not close unwanted socket", e);
                            }
                            break;
                        }
                    }
                }
            }
            if (D) Log.i(TAG, "END mAcceptThread");
        }

        public void cancel() {
            if (D) Log.d(TAG, "cancel " + this);
            try {
                mmServerSocket.close();
            } catch (IOException e) {
                Log.e(TAG, "close() of server failed", e);
            }
        }
    }


    /**
     * This thread runs while attempting to make an outgoing connection
     * with a device. It runs straight through; the connection either
     * succeeds or fails.
     */
    private class ConnectThread extends Thread {
        private final BluetoothSocket mmSocket;
        private final BluetoothDevice mmDevice;

        public ConnectThread(BluetoothDevice device) {
            mmDevice = device;
            BluetoothSocket tmp = null;

            // Get a BluetoothSocket for a connection with the
            // given BluetoothDevice
            try {
                tmp = device.createRfcommSocketToServiceRecord(MY_UUID);
            } catch (IOException e) {
                Log.e(TAG, "create() failed", e);
            }
            mmSocket = tmp;
        }

        public void run() {
            Log.i(TAG, "BEGIN mConnectThread");
            setName("ConnectThread");

            // Always cancel discovery because it will slow down a connection
            mAdapter.cancelDiscovery();

            // Make a connection to the BluetoothSocket
            try {
                // This is a blocking call and will only return on a
                // successful connection or an exception
                mmSocket.connect();
            } catch (IOException e) {
                connectionFailed();
                // Close the socket
                try {
                    mmSocket.close();
                } catch (IOException e2) {
                    Log.e(TAG, "unable to close() socket during connection failure", e2);
                }
                // Start the service over to restart listening mode
                BluetoothChatService.this.start();
                return;
            }

            // Reset the ConnectThread because we're done
            synchronized (BluetoothChatService.this) {
                mConnectThread = null;
            }

            // Start the connected thread
            connected(mmSocket, mmDevice);
        }

        public void cancel() {
            try {
                mmSocket.close();
            } catch (IOException e) {
                Log.e(TAG, "close() of connect socket failed", e);
            }
        }
    }

    /**
     * This thread runs during a connection with a remote device.
     * It handles all incoming and outgoing transmissions.
     */
    private class ConnectedThread extends Thread {
        private final BluetoothSocket mmSocket;

        public ConnectedThread(BluetoothSocket socket) {
            Log.d(TAG, "create ConnectedThread");
            mmSocket = socket;
            InputStream tmpIn = null;
            OutputStream tmpOut = null;

            // Get the BluetoothSocket input and output streams
            try {
                tmpIn = socket.getInputStream();
                tmpOut = socket.getOutputStream();
            } catch (IOException e) {
                Log.e(TAG, "temp sockets not created", e);
            }

            mmInStream = tmpIn;
            mmOutStream = tmpOut;
        }

        public void run() {
            Log.i(TAG, "BEGIN mConnectedThread");
            byte[] buffer = new byte[1024];
            int bytes;

            // Keep listening to the InputStream while connected
            while (true) {
                try {
                    // Read from the InputStream
                    bytes = mmInStream.read(buffer);

                    // Send the obtained bytes to the UI Activity
                    mHandler.obtainMessage(BluetoothChat.MESSAGE_READ, bytes, -1, buffer)
                            .sendToTarget();
                } catch (IOException e) {
                    Log.e(TAG, "disconnected", e);
                    connectionLost();
                    break;
                }
            }
        }
        
        /**
         * Write to the connected OutStream.
         * @param buffer  The bytes to write
         */
        public void write(byte[] buffer) {

            try {
            	InvoiceToList pi = new InvoiceToList();
            	Invoice invoice = new Invoice();
            	invoice.setINVOICE_NO("0000981");
            	invoice.setTAXPAYER_NAME("深圳赛格电脑城");
            	invoice.setTAXREGISTERNO("450100791336432");
            	invoice.setINVOICE_START_DATE("2010-12-15 15:35:12");
            	invoice.setOPERATOR("王龙");
            	invoice.setPAYER("中润四方科技有限公司");
            	InvoiceItem ii1 = new InvoiceItem();
            	ii1.setITEM_NAME("神州笔记本电脑一台、配件：适配器一件、电池一件、光电鼠标一件、清洁套装一套。公司承诺7天无条件退货，全国联保，商品总价7688元，开具神州电脑通用发票");
            	invoice.getInvoiceItems().add(ii1);
            	invoice.setSMALL_SUM("7688");
            	invoice.setCHECK_CODE("ABCDEFGHCHFHBFCGBVV");
//            	ArrayList<String> invoiceInfoList = pi.print002(invoice);
            	ArrayList<String> invoiceInfoList = BluetoothChat.getInvoiceInfoList();
//            	ArrayList<String> invoiceInfoList = InvoiceActivity.getInvoiceInfoList();
            	
            	byte[] printbyte = null;
            	String value = null;
            	String tempvalue = null;
            	int len =0;
            	for (int i = 0; i < invoiceInfoList.size(); i++) {
            		value = (String)invoiceInfoList.get(i);
            		len = value.length();
            		for (int j = 0; j < value.length(); j++) {
						tempvalue = new String(new char[]{value.charAt(j)});
        				printbyte = tempvalue.getBytes("gbk");
                		mmOutStream.write(printbyte.length);
                    	mmOutStream.write(printbyte);
					}
                	mmOutStream.write(0x0A);
				}
            	
            	mmOutStream.write(0x0A); 
            	mmOutStream.write(0x0A); 
            	mmOutStream.write(0x0A); 
            	mmOutStream.write(0x0A); 
            	mmOutStream.write(0x0A); 
            	mmOutStream.write(0x0A); 
            	mmOutStream.flush();
                
                // Share the sent message back to the UI Activity
                /*mHandler.obtainMessage(BluetoothChat.MESSAGE_WRITE, -1, -1, buffer)
                        .sendToTarget();*/
            } catch (IOException e) {
                Log.e(TAG, "Exception during write", e);
            }
        }

        public void cancel() {
            try {
                mmSocket.close();
            } catch (IOException e) {
                Log.e(TAG, "close() of connect socket failed", e);
            }
        }

        private class InvoiceToList {

        }
    }
    /**
	 * 卷筒打印机初始化
	 */
        @SuppressWarnings("unused")
		public void printInit(){
        	
        	//设置黑标模式
			try {
				mmOutStream.write(0x1B);
				mmOutStream.write(0x4E);
				mmOutStream.write(0x7);
				mmOutStream.write(1);   // 0 非黑标   1 黑标
				//结束
				//设置打印宽度指令
				mmOutStream.write(0x1B); 
				mmOutStream.write(0x4E);
				mmOutStream.write(0x0A);
				mmOutStream.write(1);  //0 57  1 86
				//结束
				mmOutStream.write(0x1D); //切撕纸偏移量
				mmOutStream.write(0x28);
				mmOutStream.write(0x46);
				mmOutStream.write(0x4);
				mmOutStream.write(0x0);
				mmOutStream.write(0x2);
				mmOutStream.write(0x0);
				mmOutStream.write(Constant.PAPER_CUT_OFFSET);
				mmOutStream.write(0x0);
				mmOutStream.write(0x1D); //打印位置偏移量
				mmOutStream.write(0x28);
				mmOutStream.write(0x46);
				mmOutStream.write(0x4);
				mmOutStream.write(0x0);
				mmOutStream.write(0x1);
				mmOutStream.write(0x0);
				mmOutStream.write(Constant.PRINT_POSITION_OFFSET);
				mmOutStream.write(0x0);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} 
        }
        /**
         * 打印机实时状态指令
         */
        @SuppressWarnings("unused")
		public void printState(){
        	try {
				mmOutStream.write(0x10);
				mmOutStream.write(0x04);
				mmOutStream.write(4);
				mmOutStream.flush();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    private class InvoiceItem {
        private String ITEM_NAME;

        public String getITEM_NAME() {
            return ITEM_NAME;
        }

        public void setITEM_NAME(String ITEM_NAME) {
            this.ITEM_NAME = ITEM_NAME;
        }
    }

    static public class Invoice {

        private String INVOICE_NO;
        private String TAXPAYER_NAME;
        private String TAXREGISTERNO;
        private String INVOICE_START_DATE;
        private String OPERATOR;
        private String PAYER;
        private String SMALL_SUM;
        private String CHECK_CODE;

        private ArrayList<InvoiceItem> invoiceItems = new ArrayList<>();

        public String getINVOICE_NO() {
            return INVOICE_NO;
        }

        public void setINVOICE_NO(String INVOICE_NO) {
            this.INVOICE_NO = INVOICE_NO;
        }

        public String getTAXPAYER_NAME() {
            return TAXPAYER_NAME;
        }

        public void setTAXPAYER_NAME(String TAXPAYER_NAME) {
            this.TAXPAYER_NAME = TAXPAYER_NAME;
        }

        public String getTAXREGISTERNO() {
            return TAXREGISTERNO;
        }

        public void setTAXREGISTERNO(String TAXREGISTERNO) {
            this.TAXREGISTERNO = TAXREGISTERNO;
        }

        public String getINVOICE_START_DATE() {
            return INVOICE_START_DATE;
        }

        public void setINVOICE_START_DATE(String INVOICE_START_DATE) {
            this.INVOICE_START_DATE = INVOICE_START_DATE;
        }

        public String getOPERATOR() {
            return OPERATOR;
        }

        public void setOPERATOR(String OPERATOR) {
            this.OPERATOR = OPERATOR;
        }

        public String getPAYER() {
            return PAYER;
        }

        public void setPAYER(String PAYER) {
            this.PAYER = PAYER;
        }

        public ArrayList<InvoiceItem> getInvoiceItems() {
            return invoiceItems;
        }

        public void setInvoiceItems(ArrayList<InvoiceItem> invoiceItems) {
            this.invoiceItems = invoiceItems;
        }

        public String getSMALL_SUM() {
            return SMALL_SUM;
        }

        public void setSMALL_SUM(String SMALL_SUM) {
            this.SMALL_SUM = SMALL_SUM;
        }

        public String getCHECK_CODE() {
            return CHECK_CODE;
        }

        public void setCHECK_CODE(String CHECK_CODE) {
            this.CHECK_CODE = CHECK_CODE;
        }

        public static void actionInvoice(BluetoothSetting bluetoothSetting) {

        }
    }
}
