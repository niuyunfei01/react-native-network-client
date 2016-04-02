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

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.Window;
import android.view.inputmethod.EditorInfo;
import android.widget.ArrayAdapter;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import cn.cainiaoshicai.crm.R;

/**
 * This is the main Activity that displays the current chat session.
 */
public class BluetoothChat extends Activity {
    // Debugging
    private static final String TAG = "BluetoothChat";
    private static final boolean D = true;

    // Message types sent from the BluetoothChatService Handler
    public static final int MESSAGE_STATE_CHANGE = 1;
    public static final int MESSAGE_READ = 2;
    public static final int MESSAGE_WRITE = 3;
    public static final int MESSAGE_DEVICE_NAME = 4;
    public static final int MESSAGE_TOAST = 5;

    // Key names received from the BluetoothChatService Handler
    public static final String DEVICE_NAME = "device_name";
    public static final String TOAST = "toast";

    // Intent request codes
    private static final int REQUEST_CONNECT_DEVICE = 1;
    private static final int REQUEST_ENABLE_BT = 2;

    // Layout Views
    private TextView mTitle;
    private Button mSendButton;

    // Name of the connected device
    private String mConnectedDeviceName = null;
    // Array adapter for the conversation thread
    private ArrayAdapter<String> mConversationArrayAdapter;
    // String buffer for outgoing messages
    private StringBuffer mOutStringBuffer;
    // Local Bluetooth adapter
    private BluetoothAdapter mBluetoothAdapter = null;
    // Member object for the chat services
    private BluetoothChatService mChatService = null;

	private EditText invoice_content;
	private static TextView invoice_totalcount;
	private static TextView invoice_invoiceno;
	private ListView invoice_listview;
	private Menu mMenu;
	private static ArrayList<HashMap> DATALIST = null;
	private static HashMap<String, String> LIST_TITLES = new HashMap<String, String>();
	
	public static ArrayList<String> getInvoiceInfoList(){
		ArrayList<String> invoiceinfoList = new ArrayList<String>();
		
		invoiceinfoList.add("发票号码：00000036");
		invoiceinfoList.add("机器编码：008973644");
		invoiceinfoList.add("收款单位：深圳市鸿华兴饮食管理有限公司");
		invoiceinfoList.add("税务证号：440300755230260");
		invoiceinfoList.add("开票日期：2010-12-07");
		invoiceinfoList.add("开票人：张雨凡");
		
		invoiceinfoList.add("项目\t\t单价\t数量\t金额");
		for (int i = 1; i < DATALIST.size(); i++) {
			HashMap item = DATALIST.get(i);
			String project = (String)item.get("project");
			String unit = (String)item.get("unit");
			String amount = (String)item.get("amount");

			invoiceinfoList.add(project+"\t\t"+unit+"\t"+1+"\t"+amount);
		}
		
		String totalcount = invoice_totalcount.getText()+"";
		invoiceinfoList.add("小写合计：￥"+totalcount);
//		invoiceinfoList.add("大写合计："+ChangeRMB.changeDX(totalcount.replaceAll(",", "")));
		invoiceinfoList.add("税控码: 450099488000092");

		return invoiceinfoList;
	}
	
    public void initInvoiceList(){
		DATALIST = new ArrayList<HashMap>();
		DATALIST.add(LIST_TITLES);
		invoice_listview.setAdapter(new InvoieListAdapter(this));
		invoice_totalcount.setText("0.00");
    }
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if(D) Log.e(TAG, "+++ ON CREATE +++");

        // Set up the window layout
        requestWindowFeature(Window.FEATURE_CUSTOM_TITLE);
        setContentView(R.layout.main);
//        getWindow().setFeatureInt(Window.FEATURE_CUSTOM_TITLE, R.layout.custom_title);

        // Set up the custom title
//        mTitle = (TextView) findViewById(R.id.title_left_text);
        mTitle.setText(R.string.app_name);
//        mTitle = (TextView) findViewById(R.id.title_right_text);

        // Get local Bluetooth adapter
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
		LIST_TITLES.put("project", "项目");
		LIST_TITLES.put("unit", "单位");
		LIST_TITLES.put("amount", "金额");
//		invoice_content = (EditText) findViewById(R.id.invoice_content);
//		invoice_totalcount = (TextView) findViewById(R.id.invoice_totalcount);
//		invoice_invoiceno = (TextView) findViewById(R.id.invoice_no);
//		invoice_listview = (ListView) findViewById(R.id.invoice_listview);
		try {
			String invoieno = "20300399485";
			invoice_invoiceno.setText(invoieno.toCharArray(), 0,
					invoieno.length());

			String totalcount = "0.00";
			invoice_totalcount.setText(totalcount.toCharArray(), 0,
					totalcount.length());

			String[] GENRES = new String[] { "DeShi-142", "BlackBerry 8310",
					"TP PRINTER" };

			DATALIST = new ArrayList<HashMap>();
			DATALIST.add(LIST_TITLES);

			invoice_listview.setAdapter(new InvoieListAdapter(this));

			invoice_content.setOnKeyListener(new EditText.OnKeyListener() {

				public boolean onKey(View v, int keyCode, KeyEvent event) {
					if (keyCode == KeyEvent.KEYCODE_ENTER) {

						String str = invoice_content.getText().toString();
						String[] values = str.split(" ");
						if (values.length < 3) {
							return false;
						}

						HashMap item = new HashMap();
						item.put("project", values[0]);
						item.put("unit", values[1]);
						item.put("amount", formatAmount(values[2]));
						item.put("amountvalue", getDoubleValue(values[2]));
						DATALIST.add(item);
						invoice_listview.setAdapter(new InvoieListAdapter(
								BluetoothChat.this));

						invoice_content.setText("");

						totalAmount();
						return true;
					}
					return false;
				}
			});
		} catch (Exception e) {
			e.printStackTrace();
		}
        // If the adapter is null, then Bluetooth is not supported
        if (mBluetoothAdapter == null) {
            Toast.makeText(this, "Bluetooth is not available", Toast.LENGTH_LONG).show();
            finish();
            return;
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if(D) Log.e(TAG, "++ ON START ++");

        // If BT is not on, request that it be enabled.
        // setupChat() will then be called during onActivityResult
        if (!mBluetoothAdapter.isEnabled()) {
            Intent enableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableIntent, REQUEST_ENABLE_BT);
        // Otherwise, setup the chat session
        } else {
            if (mChatService == null) setupChat();
        }
    }

    @Override
    public synchronized void onResume() {
        super.onResume();
        if(D) Log.e(TAG, "+ ON RESUME +");

        // Performing this check in onResume() covers the case in which BT was
        // not enabled during onStart(), so we were paused to enable it...
        // onResume() will be called when ACTION_REQUEST_ENABLE activity returns.
        if (mChatService != null) {
            // Only if the state is STATE_NONE, do we know that we haven't started already
            if (mChatService.getState() == BluetoothChatService.STATE_NONE) {
              // Start the Bluetooth chat services
              mChatService.start();
            }
        }
    }

    private void setupChat() {
        Log.d(TAG, "setupChat()");

        // Initialize the array adapter for the conversation thread
//        mConversationArrayAdapter = new ArrayAdapter<String>(this, R.layout.message);

        // Initialize the compose field with a listener for the return key
//        mOutEditText = (EditText) findViewById(R.id.edit_text_out);
//        mOutEditText.setOnEditorActionListener(mWriteListener);

        // Initialize the send button with a listener that for click events
//        mSendButton = (Button) findViewById(R.id.btn_invoice);
        mSendButton.setOnClickListener(new OnClickListener() {
            public void onClick(View v) {
                // Send a message using content of the edit text widget
//                TextView view = (TextView) findViewById(R.id.edit_text_out);
//                String message = view.getText().toString();
            	/*
            	if(DATALIST.size()==1){
            		 Toast.makeText(BluetoothChat.this, "请先录入您要开票的内容", Toast.LENGTH_SHORT).show();
            		 return;
            	}*/
  
                if(sendMessage("123")){
                	initInvoiceList();
                	Toast.makeText(BluetoothChat.this, "开票成功", Toast.LENGTH_SHORT).show();
                }

            }
        });

        // Initialize the BluetoothChatService to perform bluetooth connections
        mChatService = new BluetoothChatService(this, mHandler);

        // Initialize the buffer for outgoing messages
        mOutStringBuffer = new StringBuffer("");
    }

    @Override
    public synchronized void onPause() {
        super.onPause();
        if(D) Log.e(TAG, "- ON PAUSE -");
    }

    @Override
    public void onStop() {
        super.onStop();
        if(D) Log.e(TAG, "-- ON STOP --");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        // Stop the Bluetooth chat services
        if (mChatService != null) mChatService.stop();
        if(D) Log.e(TAG, "--- ON DESTROY ---");
    }

    private void ensureDiscoverable() {
        if(D) Log.d(TAG, "ensure discoverable");
        if (mBluetoothAdapter.getScanMode() !=
            BluetoothAdapter.SCAN_MODE_CONNECTABLE_DISCOVERABLE) {
            Intent discoverableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);
            discoverableIntent.putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 300);
            startActivity(discoverableIntent);
        }
    }

    /**
     * Sends a message.
     * @param message  A string of text to send.
     */
    private boolean sendMessage(String message) {
        // Check that we're actually connected before trying anything
        if (mChatService.getState() != BluetoothChatService.STATE_CONNECTED) {
            Toast.makeText(this, R.string.not_connected, Toast.LENGTH_SHORT).show();
            return false;
        }

        // Check that there's actually something to send
        if (message.length() > 0) {
            // Get the message bytes and tell the BluetoothChatService to write
            byte[] send = message.getBytes();
            mChatService.write(send);

            // Reset out string buffer to zero and clear the edit text field
            mOutStringBuffer.setLength(0);
        }
        return true;
    }

    // The action listener for the EditText widget, to listen for the return key
    private TextView.OnEditorActionListener mWriteListener =
        new TextView.OnEditorActionListener() {
        public boolean onEditorAction(TextView view, int actionId, KeyEvent event) {
            // If the action is a key-up event on the return key, send the message
            if (actionId == EditorInfo.IME_NULL && event.getAction() == KeyEvent.ACTION_UP) {
                String message = view.getText().toString();
                sendMessage(message);
            }
            if(D) Log.i(TAG, "END onEditorAction");
            return true;
        }
    };

    // The Handler that gets information back from the BluetoothChatService
    private final Handler mHandler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
            case MESSAGE_STATE_CHANGE:
                if(D) Log.i(TAG, "MESSAGE_STATE_CHANGE: " + msg.arg1);
                switch (msg.arg1) {
                case BluetoothChatService.STATE_CONNECTED:
                    mTitle.setText(R.string.title_connected_to);
                    mTitle.append(mConnectedDeviceName);
                    mConversationArrayAdapter.clear();
                    break;
                case BluetoothChatService.STATE_CONNECTING:
                    mTitle.setText(R.string.title_connecting);
                    break;
                case BluetoothChatService.STATE_LISTEN:
                case BluetoothChatService.STATE_NONE:
                    mTitle.setText(R.string.title_not_connected);
                    break;
                }
                break;
            case MESSAGE_WRITE:
                byte[] writeBuf = (byte[]) msg.obj;
                // construct a string from the buffer
                String writeMessage = new String(writeBuf);
                mConversationArrayAdapter.add("Me:  " + writeMessage);
                break;
            case MESSAGE_READ:
                byte[] readBuf = (byte[]) msg.obj;
                // construct a string from the valid bytes in the buffer
                String readMessage = new String(readBuf, 0, msg.arg1);
                mConversationArrayAdapter.add(mConnectedDeviceName+":  " + readMessage);
                break;
            case MESSAGE_DEVICE_NAME:
                // save the connected device's name
                mConnectedDeviceName = msg.getData().getString(DEVICE_NAME);
                Toast.makeText(getApplicationContext(), "连接到 "
                               + mConnectedDeviceName, Toast.LENGTH_SHORT).show();
                break;
            case MESSAGE_TOAST:
                Toast.makeText(getApplicationContext(), msg.getData().getString(TOAST),
                               Toast.LENGTH_SHORT).show();
                break;
            }
        }
    };

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if(D) Log.d(TAG, "onActivityResult " + resultCode);
        switch (requestCode) {
        case REQUEST_CONNECT_DEVICE:
            // When DeviceListActivity returns with a device to connect
            if (resultCode == Activity.RESULT_OK) {
                // Get the device MAC address
                String address = "";//data.getExtras()
                                     //.getString(DeviceListActivity.EXTRA_DEVICE_ADDRESS);
                // Get the BLuetoothDevice object
                BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(address);
                // Attempt to connect to the device
                mChatService.connect(device);
            }
            break;
        case REQUEST_ENABLE_BT:
            // When the request to enable Bluetooth returns
            if (resultCode == Activity.RESULT_OK) {
                // Bluetooth is now enabled, so set up a chat session
                setupChat();
            } else {
                // User did not enable Bluetooth or an error occured
                Log.d(TAG, "BT not enabled");
                Toast.makeText(this, R.string.bt_not_enabled_leaving, Toast.LENGTH_SHORT).show();
                finish();
            }
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
//        inflater.inflate(R.menu.option_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
//        case R.id.scan:
            // Launch the DeviceListActivity to see devices and do scan
//            Intent serverIntent = new Intent(this, DeviceListActivity.class);
//            startActivityForResult(serverIntent, REQUEST_CONNECT_DEVICE);
//            return true;
//        case R.id.discoverable:
//            // Ensure this device is discoverable by others
//            ensureDiscoverable();
//            return true;
        }
        return false;
    }
	private static class InvoieListAdapter extends BaseAdapter {
		private LayoutInflater mInflater;

		public InvoieListAdapter(Context context) {
			// Cache the LayoutInflate to avoid asking for a new one each time.
			mInflater = LayoutInflater.from(context);

			// Icons bound to the rows.
			// mIcon1 = BitmapFactory.decodeResource(context.getResources(),
			// R.drawable.icon48x48_1);
		}

		/**
		 * The number of items in the list is determined by the number of
		 * speeches in our array.
		 * 
		 * @see android.widget.ListAdapter#getCount()
		 */
		public int getCount() {
			return DATALIST.size();
		}

		/**
		 * Since the data comes from an array, just returning the index is
		 * sufficent to get at the data. If we were using a more complex data
		 * structure, we would return whatever object represents one row in the
		 * list.
		 * 
		 * @see android.widget.ListAdapter#getItem(int)
		 */
		public Object getItem(int position) {
			return position;
		}

		/**
		 * Use the array index as a unique id.
		 * 
		 * @see android.widget.ListAdapter#getItemId(int)
		 */
		public long getItemId(int position) {
			return position;
		}

		/**
		 * Make a view to hold each row.
		 * 
		 * @see android.widget.ListAdapter#getView(int, View,
		 *      ViewGroup)
		 */
		public View getView(int position, View convertView, ViewGroup parent) {
			// A ViewHolder keeps references to children views to avoid
			// unneccessary calls
			// to findViewById() on each row.
			ViewHolder holder;

			// When convertView is not null, we can reuse it directly, there is
			// no need
			// to reinflate it. We only inflate a new View when the convertView
			// supplied
			// by ListView is null.
			if (convertView == null) {
//				convertView = mInflater.inflate(R.layout.invoice_list_item,
//						null);
//
//				// Creates a ViewHolder and store references to the two children
//				// views
//				// we want to bind data to.
//				holder = new ViewHolder();
//				holder.textProject = (TextView) convertView
//						.findViewById(R.id.invoice_list_item_project);
//				holder.textUnit = (TextView) convertView
//						.findViewById(R.id.invoice_list_item_unit);
//				holder.textAmount = (TextView) convertView
//						.findViewById(R.id.invoice_list_item_amount);

				//convertView.setTag(holder);
			} else {
				// Get the ViewHolder back to get fast access to the TextView
				// and the ImageView.
				holder = (ViewHolder) convertView.getTag();
			}

			// Bind the data efficiently with the holder.
			HashMap map = DATALIST.get(position);
			//holder.textProject.setText((String) map.get("project"));
			//holder.textUnit.setText((String) map.get("unit"));
			//holder.textAmount.setText((String) map.get("amount"));

			return convertView;
		}

		static class ViewHolder {
			TextView textProject;
			TextView textUnit;
			TextView textAmount;
		}
	}
	private String formatAmount(String str) {
		DecimalFormat bf = new DecimalFormat("###,##0.00");
		double d;
		String outStr = null;
		try {
			d = Double.parseDouble(str);
			outStr = bf.format(d);
		} catch (Exception e) {
			e.printStackTrace();
			return "0.00";
		}
		return outStr;
	}
	private Double getDoubleValue(String value) {
		Double dl = null;
		try {
			dl = new Double(value);
		} catch (Exception e) {
			return new Double(0.00);
		}
		return dl;
	}
	public void totalAmount() {

		double totalamount = 0;
		HashMap data = null;
		for (int i = 1; i < DATALIST.size(); i++) {
			data = DATALIST.get(i);
			totalamount += ((Double) data.get("amountvalue")).doubleValue();
		}
		invoice_totalcount.setText(formatAmount(String.valueOf(totalamount)));
	}

}