package cn.cainiaoshicai.crm.utils;


import android.bluetooth.BluetoothAdapter;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;

import static cn.cainiaoshicai.crm.support.print.OrderPrinter.resetDeviceStatus;

public class PrintQueue {

    /**
     * instance
     */
    private static PrintQueue mInstance;

    /**
     * print queue
     */
    private ArrayList<Order> mQueue;
    /**
     * bluetooth adapter
     */
    private BluetoothAdapter mAdapter;


    private PrintQueue() {
    }

    public static PrintQueue getQueue() {
        if (null == mInstance) {
            mInstance = new PrintQueue();
        }
        return mInstance;
    }


    /**
     * add print bytes to queue. and call print
     *
     * @param order
     */
    public synchronized void add(Order order) {
        if (null == mQueue) {
            mQueue = new ArrayList<Order>();
        }
        if (null != order) {
            mQueue.add(order);
        }
        print();
    }

    /**
     * add print bytes to queue. and call print
     */
    public synchronized void add(ArrayList<Order> orderList) {
        if (null == mQueue) {
            mQueue = new ArrayList<>();
        }
        if (null != orderList) {
            mQueue.addAll(orderList);
        }
        print();
    }

    /**
     * print queue
     */
    public synchronized void print() {
        try {
            if (null == mQueue || mQueue.size() <= 0) {
                return;
            }
            if (null == mAdapter) {
                mAdapter = BluetoothAdapter.getDefaultAdapter();
            }
            while (mQueue.size() > 0) {
                Order order = mQueue.remove(0);
                OrderPrinter.print(order);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * disconnect remote device
     */
    public void disconnect() {
        try {
            BluetoothPrinters.DeviceStatus printer = BluetoothPrinters.INS.getCurrentPrinter();
            printer.closeSocket();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * when bluetooth status is changed, if the printer is in use,
     * connect it,else do nothing
     */
    public void tryConnect() {
        try {
            BluetoothPrinters.DeviceStatus printer = BluetoothPrinters.INS.getCurrentPrinter();
            if (printer == null || printer.getSocket() == null || !printer.isConnected()) {
                resetDeviceStatus(printer);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } catch (Error e) {
            e.printStackTrace();
        }
    }

    /**
     * 将打印命令发送给打印机
     *
     * @param bytes bytes
     */
    public void write(byte[] bytes) {
        try {
            if (null == bytes || bytes.length <= 0) {
                return;
            }
            if (null == mAdapter) {
                mAdapter = BluetoothAdapter.getDefaultAdapter();
            }
            BluetoothPrinters.DeviceStatus printer = BluetoothPrinters.INS.getCurrentPrinter();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
