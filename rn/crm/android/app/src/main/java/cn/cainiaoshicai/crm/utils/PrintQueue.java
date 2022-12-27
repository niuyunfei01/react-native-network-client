package cn.cainiaoshicai.crm.utils;


import static cn.cainiaoshicai.crm.support.helper.SettingUtility.getAutoPrintSetting;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.text.TextUtils;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.util.concurrent.RateLimiter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.concurrent.TimeUnit;

import cn.cainiaoshicai.crm.CrashReportHelper;
import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.bt.BtService;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.print.PrintUtil;
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

    private ArrayList<Order> manualPrintQueue;
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
            .expireAfterWrite(60, TimeUnit.MINUTES)
            .build(new CacheLoader<Integer, Boolean>() {
                public Boolean load(Integer key) {
                    return false;
                }
            });


    LoadingCache<Integer, Boolean> manualPrintFlag = CacheBuilder.newBuilder()
            .maximumSize(10000)
            .expireAfterWrite(30, TimeUnit.SECONDS)
            .build(new CacheLoader<Integer, Boolean>() {
                public Boolean load(Integer key) {
                    return false;
                }
            });

    RateLimiter rateLimiter = RateLimiter.create(3.0 / (60 * 60));

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
     * @param order
     */
    public synchronized void addManual(Order order) {
        if (null == manualPrintQueue) {
            manualPrintQueue = new ArrayList<>();
        }
        if (null != order) {
            manualPrintQueue.add(order);
        }
        manualPrintQueue = removeDuplicates(manualPrintQueue);
        printManual();
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

    public synchronized void printManual() {
        doPrint(manualPrintQueue, false);
    }

    /**
     * print queue
     */
    public synchronized void print() {
        doPrint(mQueue, true);
    }

    private void doPrint(ArrayList<Order> queue, boolean checkDupPrint) {
        Order pOrder = null;
        try {
            if (null == queue || queue.size() <= 0) {
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
                while (queue.size() > 0) {
                    Order order = queue.remove(0);
                    if (checkDupPrint) {
                        if (order.getPrint_times() > 0) {
                            continue;
                        }
                        if (order.getOrderStatus() != Cts.WM_ORDER_STATUS_TO_READY && order.getOrderStatus() != Cts.WM_ORDER_STATUS_TO_SHIP) {
                            continue;
                        }
                        if (graphs.get(order.getId())) {
                            continue;
                        }
                        pOrder = order;
                    } else {
                        if (manualPrintFlag.get(order.getId())) {
                            continue;
                        }
                    }
                    byte[] data = OrderPrinter.printOrder(order);
                    boolean success = mBtService.write(data, 2000);
                    if (success) {
                        if (checkDupPrint) {
                            graphs.put(order.getId(), true);
                        } else {
                            manualPrintFlag.put(order.getId(), true);
                        }
                        OrderPrinter.logOrderPrint(order);
                    } else {
                        queue.add(order);
                        removeDuplicates(queue);
                    }
                }
            }
        } catch (Exception e) {

            if (pOrder != null) {
                queue.add(pOrder);
                removeDuplicates(queue);
            }
            CrashReportHelper.handleUncaughtException(null, e);
        }
    }

    /**
     * disconnect remote device
     */
    public void disconnect() {
        try {
            BluetoothPrinters.DeviceStatus printer = BluetoothPrinters.INS.getCurrentPrinter();
            if (printer != null)
                printer.closeSocket();
        } catch (Exception e) {
            CrashReportHelper.handleUncaughtException(null, e);
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
            }
        } catch (Exception e) {

            CrashReportHelper.handleUncaughtException(null, e);
        }
    }
}
