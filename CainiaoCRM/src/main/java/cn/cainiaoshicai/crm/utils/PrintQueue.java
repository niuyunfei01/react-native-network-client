package cn.cainiaoshicai.crm.utils;


import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.text.TextUtils;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

import org.greenrobot.eventbus.EventBus;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.concurrent.TimeUnit;

import cn.cainiaoshicai.crm.AudioUtils;
import cn.cainiaoshicai.crm.bt.BtService;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.print.PrintMsgEvent;
import cn.cainiaoshicai.crm.print.PrintUtil;
import cn.cainiaoshicai.crm.print.PrinterMsgType;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;

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

    /**
     * context
     */
    private static Context mContext;

    /**
     * bluetooth service
     */
    private BtService mBtService;

    /**
     * 打印失败 播放文字
     */
    static String SPEAK_WORD = "订单打印失败，请重新连接打印机，然后手动打印！";


    LoadingCache<Integer, Boolean> graphs = CacheBuilder.newBuilder()
            .maximumSize(10000)
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .build(new CacheLoader<Integer, Boolean>() {
                public Boolean load(Integer key) {
                    return false;
                }
            });


    private PrintQueue() {
    }

    public static PrintQueue getQueue(Context context) {
        if (null == mContext) {
            mContext = context;
        }
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
            mQueue = new ArrayList<>();
        }
        if (null != order) {
            mQueue.add(order);
            graphs.put(order.getId(), false);
        }
        mQueue = removeDuplicates(mQueue);
        print();
    }

    static ArrayList<Order> removeDuplicates(ArrayList<Order> list) {
        // Store unique items in result.
        ArrayList<Order> result = new ArrayList<>();
        // Record encountered Strings in HashSet.
        HashSet<Integer> set = new HashSet<>();
        // Loop over argument list.
        for (int j = list.size() - 1; j >= 0; j--) {
            // whatever
            Order item = list.get(j);
            // If String is not in set, add it to the list and the set.
            if (!set.contains(item.getId())) {
                result.add(item);
                set.add(item.getId());
            }
        }
        return result;
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
            if (null == mBtService) {
                mBtService = new BtService(mContext);
            }
            if (mBtService.getState() != BtService.STATE_CONNECTED) {
                String bindPrintAddress = PrintUtil.getDefaultBluethoothDeviceAddress(mContext);
                if (!TextUtils.isEmpty(bindPrintAddress)) {
                    BluetoothDevice device = mAdapter.getRemoteDevice(bindPrintAddress);
                    mBtService.connect(device);
                    return;
                }
            }
            int times = 1;
            while (times < 3) {
                if (mBtService.getState() == BtService.STATE_CONNECTED) {
                    break;
                }
                Thread.sleep(1000);
                times++;
            }
            if (mBtService.getState() == BtService.STATE_CONNECTED) {
                while (mQueue.size() > 0) {
                    Order order = mQueue.remove(0);
                    if (graphs.get(order.getId())) {
                        continue;
                    }
                    byte[] data = OrderPrinter.printOrder(order);
                    boolean success = mBtService.write(data, 2000);
                    if (success) {
                        graphs.put(order.getId(), true);
                        OrderPrinter.logOrderPrint(order);
                    } else {
                        mQueue.add(order);
                    }
                }
            } else {
                AudioUtils.getInstance().speakText(SPEAK_WORD);
            }
        } catch (Exception e) {
            AudioUtils.getInstance().speakText(SPEAK_WORD);
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

    public boolean isConnect() {
        return mBtService.getState() == BtService.STATE_CONNECTED;
    }

    /**
     * when bluetooth status is changed, if the printer is in use,
     * connect it,else do nothing
     */
    public void tryConnect() {
        try {
            String address = PrintUtil.getDefaultBluethoothDeviceAddress(mContext);
            if (TextUtils.isEmpty(address)) {
                return;
            }
            if (null == mAdapter) {
                mAdapter = BluetoothAdapter.getDefaultAdapter();
            }
            if (null == mAdapter) {
                return;
            }
            if (null == mBtService) {
                mBtService = new BtService(mContext);
            }
            if (mBtService.getState() != BtService.STATE_CONNECTED) {
                mBtService.stop();
                if (!TextUtils.isEmpty(address)) {
                    BluetoothDevice device = mAdapter.getRemoteDevice(address);
                    mBtService.connect(device);
                }
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
            if (null == mBtService) {
                mBtService = new BtService(mContext);
            }
            if (mBtService.getState() != BtService.STATE_CONNECTED) {
                String deviceAddress = PrintUtil.getDefaultBluethoothDeviceAddress(mContext);
                if (!TextUtils.isEmpty(deviceAddress)) {
                    BluetoothDevice device = mAdapter.getRemoteDevice(deviceAddress);
                    mBtService.connect(device);
                }
            }
            if (mBtService.getState() == BtService.STATE_CONNECTED) {
                mBtService.write(bytes);
            } else {
                AudioUtils.getInstance().speakText(SPEAK_WORD);
            }
        } catch (Exception e) {
            AudioUtils.getInstance().speakText(SPEAK_WORD);
            e.printStackTrace();
        }
    }
}
