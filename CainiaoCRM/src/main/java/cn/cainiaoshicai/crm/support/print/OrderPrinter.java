package cn.cainiaoshicai.crm.support.print;

import android.bluetooth.BluetoothDevice;
import android.content.Context;
import android.text.TextUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Set;

import cn.cainiaoshicai.crm.AppInfo;
import cn.cainiaoshicai.crm.AudioUtils;
import cn.cainiaoshicai.crm.CrashReportHelper;
import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.domain.ProductEstimate;
import cn.cainiaoshicai.crm.domain.ProductProvideList;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.CartItem;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.orders.util.Log;
import cn.cainiaoshicai.crm.orders.util.TextUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.utils.AidlUtil;
import cn.cainiaoshicai.crm.utils.PrintQueue;

/**
 * Created by liuzhr on 10/27/16.
 */

public class OrderPrinter {

    private static final int MAX_TITLE_PART = 16;

    public static void printWhenNeverPrinted(final int platform, final String platformOid) {
        printWhenNeverPrinted(platform, platformOid, null);
    }

    public static void printWhenNeverPrinted(final int platform, final String platformOid, final BasePrinter.PrintCallback printedCallback) {
        new MyAsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                try {
                    final boolean supportSunMiPrinter = supportSunMiPrinter();
                    final String access_token = GlobalCtx.app().getAccountBean().getAccess_token();
                    final Order order = new OrderActionDao(access_token).getOrder(platform, platformOid);
                    if (supportSunMiPrinter) {
                        smPrintOrder(order);
                    } else {
                        if (order != null && order.getPrint_times() == 0) {
                            PrintQueue.getQueue(GlobalCtx.app()).add(order);
                        } else {
                            AppLogger.e("[print]error to get order platform=:" + platform + ", oid=" + platformOid);
                        }
                    }
                } catch (Exception e) {
                    Log.e("auto print order error", e);
                }
                return null;
            }
        }.executeOnNormal();
    }

    public static BluetoothPrinters.DeviceStatus resetDeviceStatus(BluetoothPrinters.DeviceStatus ds) {
        boolean shouldReconnect = true;
        if (ds == null) {
            boolean connectSuccess = autoConnectBluetoothPrinters();
            if (connectSuccess) {
                shouldReconnect = false;
                ds = BluetoothPrinters.INS.getCurrentPrinter();
            }
        }
        if (ds != null && shouldReconnect) {
            try {
                android.bluetooth.BluetoothAdapter btAdapter = android.bluetooth.BluetoothAdapter.getDefaultAdapter();
                final BluetoothConnector btConnector = new BluetoothConnector(ds.getDevice(), false, btAdapter, null);
                final BluetoothConnector.BluetoothSocketWrapper socketWrapper = btConnector.connect();
                ds.resetSocket(socketWrapper);
            } catch (Exception e) {
                Log.e("reset bt socket error ", e);
                ds = null;
            }
        }
        return ds;
    }

    public static boolean autoConnectBluetoothPrinters() {
        String lastAddress = SettingUtility.getLastConnectedPrinterAddress();
        android.bluetooth.BluetoothAdapter btAdapter = android.bluetooth.BluetoothAdapter.getDefaultAdapter();
        Set<BluetoothDevice> btDeviceList = btAdapter.getBondedDevices();
        BluetoothDevice lastDevice = null;
        for (BluetoothDevice device : btDeviceList) {
            if (device.getAddress().equals(lastAddress)) {
                lastDevice = device;
                break;
            }
        }
        if (lastDevice != null) {
            try {
                final BluetoothConnector btConnector = new BluetoothConnector(lastDevice, false, btAdapter, null);
                final BluetoothConnector.BluetoothSocketWrapper socketWrapper = btConnector.connect();
                BluetoothPrinters.DeviceStatus deviceStatus = new BluetoothPrinters.DeviceStatus(lastDevice);
                deviceStatus.resetSocket(socketWrapper);
                SettingUtility.setLastConnectedPrinterAddress(lastDevice.getAddress());
                BluetoothPrinters.INS.setCurrentPrinter(deviceStatus);
                return true;
            } catch (Exception e) {
                Log.e("skip to print for printer is not connected!", e);
            }
        }
        return false;
    }

    public static void printEstimate(BluetoothConnector.BluetoothSocketWrapper btsocket,
                                     ProductEstimate estimate) throws IOException {
        try {
            OutputStream btos = btsocket.getOutputStream();
            BasePrinter printer = new BasePrinter(btos);

            btos.write(new byte[]{0x1B, 0x21, 0});
            btos.write(GPrinterCommand.left);

            printer.starLine().highBigText("   估货单").newLine()
                    .newLine().highBigText("  #" + estimate.getDay());

            printer.normalText(GlobalCtx.app().getStoreName(estimate.getStore_id())).newLine();

            printer.normalText("负责人：___________").newLine();

            printer.starLine().highText(String.format("品名%22s", "份数")).newLine().splitLine();

            int total = 0;
            for (ProductEstimate.Item item : estimate.getLists()) {
                String name = item.getName();
                for (int idx = 0; idx < name.length(); ) {

                    String text = name.substring(idx, Math.min(name.length(), idx + MAX_TITLE_PART));

                    boolean isEnd = idx + MAX_TITLE_PART >= name.length();
                    if (isEnd) {
                        String format = "%s%" + Math.max(32 - (printer.printWidth(text)), 1) + "s";
                        text = String.format(format, text, "x" + item.getTo_ready());
                    }
                    printer.highText(text).newLine();
                    if (isEnd) {
                        printer.spaceLine();
                    }

                    idx += MAX_TITLE_PART;
                }
                total += item.getTo_ready();
            }

            printer.highText(String.format("合计 %27s", "x" + total)).newLine();

            printer.starLine().normalText("当天的菜，必须包好进入冷库和货架！").newLine();

            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(GPrinterCommand.walkPaper((byte) 4));
            btos.flush();
        } catch (Exception e) {
            AppLogger.e("error in printing estimate lists", e);
            throw e;
        }
    }

    public static void printTest() throws IOException {
        try {
            BasePrinter printer = new BasePrinter();
            byte[] testData = new byte[]{0x1B, 0x21, 0};
            testData = printer.concatenate(testData, GPrinterCommand.left);
            testData = printer.concatenate(testData, printer.startLineBytes());
            testData = printer.concatenate(testData, printer.highTextBytes("   打印测试单"));
            testData = printer.concatenate(testData, printer.newLineBytes());
            testData = printer.concatenate(testData, printer.highTextBytes(String.format("合计 %27s", "x100")));
            testData = printer.concatenate(testData, printer.newLineBytes());
            testData = printer.concatenate(testData, printer.startLineBytes());
            testData = printer.concatenate(testData, printer.normalTextBytes("外送帮，好生意！"));
            testData = printer.concatenate(testData, printer.newLineBytes());
            testData = printer.concatenate(testData, new byte[]{0x0D,0x0D,0x0D});
            testData = printer.concatenate(testData, GPrinterCommand.walkPaper((byte) 4));
            PrintQueue.getQueue(GlobalCtx.app()).write(testData);
        } catch (Exception e) {
            AppLogger.e("error in printing test", e);
            throw e;
        }
    }

    public static void printProvideList(BluetoothConnector.BluetoothSocketWrapper btsocket, ProductProvideList list) throws IOException {
        try {
            OutputStream btos = btsocket.getOutputStream();
            BasePrinter printer = new BasePrinter(btos);

            btos.write(new byte[]{0x1B, 0x21, 0});
            btos.write(GPrinterCommand.left);

            printer.starLine().highBigText("  订货单#" + list.getOrderId()).newLine();

            printer.normalText("送达时间:" + list.getExpectTimeStr()).newLine();
            printer.normalText("送达地点:" + list.getExpectToAddr()).newLine();

            printer.normalText("订货员姓名:" + list.getOrderByName()).newLine();
            printer.normalText("订货员电话:" + list.getOrderByPhone()).newLine();

            printer.normalText("供应商姓名:" + list.getProvideName()).newLine();
            printer.normalText("供应商电话:" + list.getProvidePhone()).newLine();


            printer.starLine().highText(String.format("品名%22s", "数量")).newLine().splitLine();

            int total = 0;
            for (ProductProvideList.Item item : list.getItems()) {
                String name = item.getName();
                for (int idx = 0; idx < name.length(); ) {

                    String text = name.substring(idx, Math.min(name.length(), idx + MAX_TITLE_PART));

                    boolean isEnd = idx + MAX_TITLE_PART >= name.length();
                    if (isEnd) {
                        String format = "%s%" + Math.max(32 - (printer.printWidth(text)), 1) + "s";
                        text = String.format(format, text, "x" + item.getQuantity());
                    }
                    printer.highText(text).newLine();
                    if (isEnd) {
                        printer.spaceLine();
                    }

                    idx += MAX_TITLE_PART;
                }
                total++;
            }

            printer.highText(String.format("合计 %27s", "x" + total)).newLine();

            printer.starLine().normalText("当天的菜，必须包好进入冷库和货架！").newLine();

            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(GPrinterCommand.walkPaper((byte) 4));
            btos.flush();
        } catch (Exception e) {
            AppLogger.e("error in printing list lists", e);
            throw e;
        }
    }

    public static void smPrintOrder(Order order) {
        String mobile = order.getMobile();
        mobile = mobile.replace("_", "转").replace(",", "转");

        try {
            ByteArrayOutputStream btos = new ByteArrayOutputStream();
            BasePrinter printer = new BasePrinter(btos);
            btos.write(new byte[]{0x1B, 0x21, 0});
            btos.write(GPrinterCommand.left);

            printer.starLine().highBigText(" " + order.getFullStoreName()).newLine()
                    .newLine().highBigText("  #" + order.getDayId());

            printer.normalText(order.platformWithId()).newLine();

            printer.starLine().highText("支付状态：" + (order.isPaidDone() ? "在线支付" : "待付款(以平台为准)")).newLine();

            printer.starLine()
                    .highText(TextUtil.replaceWhiteStr(order.getUserName()) + " " + mobile)
                    .newLine()
                    .highText(TextUtil.replaceWhiteStr(order.getAddress()));
            if (!TextUtils.isEmpty(order.getDirection())) {
                printer.highText("[" + order.getDirection() + "]");
            }
            printer.newLine();

            String expectedStr = order.getExpectTimeStr();
            if (expectedStr == null) {
                expectedStr = DateTimeUtils.mdHourMinCh(order.getExpectTime());
            }
            printer.starLine().highText("期望送达：" + expectedStr).newLine();
            if (!TextUtils.isEmpty(order.getRemark())) {
                printer.highText("用户备注：" + order.getRemark())
                        .newLine();
            }

            printer.starLine()
                    .normalText("订单编号：" + Cts.Platform.find(order.getPlatform()).name + "-" + order.getPlatform_oid())
                    .newLine()
                    .normalText("下单时间：" + DateTimeUtils.shortYmdHourMin(order.getOrderTime()))
                    .newLine();

            printer.starLine().highText(String.format("食材名称%22s", "数量")).newLine().splitLine();

            int total = 0;
            for (CartItem item : order.getItems()) {
                String name = item.getProduct_name();
                String tagCode = item.getTag_code();
                if (tagCode != null && !"".equals(tagCode) && !"0".equals(tagCode)) {
                    name = name + "#" + tagCode;
                }
                if (item.getPrice() >= 0) {
                    for (int idx = 0; idx < name.length(); ) {

                        String text = name.substring(idx, Math.min(name.length(), idx + MAX_TITLE_PART));

                        boolean isEnd = idx + MAX_TITLE_PART >= name.length();
                        if (isEnd) {
                            String format = "%s%" + Math.max(32 - (printer.printWidth(text)), 1) + "s";
                            text = String.format(format, text, "x" + item.getNum());
                        }
                        printer.highText(text).newLine();
                        if (isEnd) {
                            printer.spaceLine();
                        }

                        idx += MAX_TITLE_PART;
                    }
                    total += item.getNum();
                }
            }
            printer.highText(String.format("合计 %27s", "x" + total)).newLine();
            if (!TextUtils.isEmpty(order.getLine_additional())) {
                printer.starLine().normalText(order.getLine_additional());
            }
            printer.starLine().highText(order.getLine_money_total()).newLine();

            printer.starLine().normalText(order.getPrintFooter1())
                    .newLine().normalText(order.getPrintFooter2());

            String printFooter3 = order.getPrintFooter3();
            if (!TextUtils.isEmpty(printFooter3)) {
                printer.newLine().normalText(printFooter3);
            }
            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(GPrinterCommand.walkPaper((byte) 4));
            AidlUtil.getInstance().sendRawData(btos.toByteArray());
            try {
                final String access_token = GlobalCtx.app().token();
                new OrderActionDao(access_token).logOrderPrinted(order.getId());
            } catch (ServiceException e) {
                AppLogger.e("error Service Exception:" + e.getMessage());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static byte[] printOrder(Order order) throws IOException {
        if (order == null) {
            return new byte[]{};
        }
        String mobile = order.getMobile();
        mobile = mobile.replace("_", "转").replace(",", "转");
        ByteArrayOutputStream btos = new ByteArrayOutputStream();
        boolean isDirectVendor = false;
        try {
            isDirectVendor = GlobalCtx.app().isDirectVendor();
        } catch (Exception e) {

        }
        try {
            BasePrinter printer = new BasePrinter(btos);
            btos.write(new byte[]{0x1B, 0x21, 0});
            btos.write(GPrinterCommand.left);

            if (isDirectVendor) {
                printer.starLine().highBigText(" " + order.getFullStoreName()).newLine()
                        .newLine().highBigText("  #" + order.getDayId());
                printer.highBigText(order.platformWithId()).newLine();
            } else {
                printer.starLine().highBigText(" " + order.getFullStoreName()).newLine()
                        .newLine().highBigText(order.platformWithId());
                printer.highBigText("  #" + order.getDayId()).newLine();
            }

            printer.starLine().highText("支付状态：" + (order.isPaidDone() ? "在线支付" : "待付款(以平台为准)")).newLine();

            printer.starLine()
                    .highText(TextUtil.replaceWhiteStr(order.getUserName()) + " " + mobile)
                    .newLine()
                    .highText(TextUtil.replaceWhiteStr(order.getAddress()));
            if (!TextUtils.isEmpty(order.getDirection())) {
                printer.highText("[" + order.getDirection() + "]");
            }
            printer.newLine();

            String expectedStr = order.getExpectTimeStr();
            if (expectedStr == null) {
                expectedStr = DateTimeUtils.mdHourMinCh(order.getExpectTime());
            }
            printer.starLine().highText("期望送达：" + expectedStr).newLine();
            if (!TextUtils.isEmpty(order.getRemark())) {
                printer.highText("用户备注：" + order.getRemark())
                        .newLine();
            }

            printer.starLine()
                    .normalText("订单编号：" + Cts.Platform.find(order.getPlatform()).name + "-" + order.getPlatform_oid())
                    .newLine()
                    .normalText("下单时间：" + DateTimeUtils.shortYmdHourMin(order.getOrderTime()))
                    .newLine();

            printer.starLine().highText(String.format("食材名称%22s", "数量")).newLine().splitLine();

            int total = 0;
            for (CartItem item : order.getItems()) {
                String name = item.getProduct_name();
                String tagCode = item.getTag_code();
                if (tagCode != null && !"".equals(tagCode) && !"0".equals(tagCode)) {
                    name = name + "#" + tagCode;
                }
                if (item.getPrice() >= 0) {
                    for (int idx = 0; idx < name.length(); ) {

                        String text = name.substring(idx, Math.min(name.length(), idx + MAX_TITLE_PART));

                        boolean isEnd = idx + MAX_TITLE_PART >= name.length();
                        if (isEnd) {
                            String format = "%s%" + Math.max(32 - (printer.printWidth(text)), 1) + "s";
                            text = String.format(format, text, "x" + item.getNum());
                        }
                        printer.highText(text).newLine();
                        if (isEnd) {
                            printer.spaceLine();
                        }

                        idx += MAX_TITLE_PART;
                    }
                    total += item.getNum();
                }
            }

            printer.highText(String.format("合计 %27s", "x" + total)).newLine();

            if (!TextUtils.isEmpty(order.getLine_additional())) {
                printer.starLine().normalText(order.getLine_additional());
            }
//            if (order.getAdditional_to_pay() != 0) {
//                printer.starLine(). normalText(String.format("客户追加：%14.2f", (order.getAdditional_to_pay()/100.0))).newLine();
//            }

//            double totalMoney = order.isPaidDone() ? ((order.getOrderMoney() * 100 + order.getAdditional_to_pay()) / 100) : ((order.getPaid_by_user() * 100 + order.getAdditional_to_pay()) / 100);
//            String lineMoneyTotal = String.format("%s：%22.2f", (order.isPaidDone() ? "实付金额" : "客户待付(含追加)"), totalMoney);

            printer.starLine().highText(order.getLine_money_total()).newLine();

            printer.starLine().normalText(order.getPrintFooter1())
                    .newLine().normalText(order.getPrintFooter2());

            String printFooter3 = order.getPrintFooter3();
            if (!TextUtils.isEmpty(printFooter3)) {
                printer.newLine().normalText(printFooter3);
            }

            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(GPrinterCommand.walkPaper((byte) 4));

            byte[] data;
            btos.flush();
            data = btos.toByteArray();
            btos.close();
            btos = null;
            return data;
        } catch (Exception e) {
            CrashReportHelper.handleUncaughtException(null, e);
        } finally {
            if (btos != null) {
                btos.flush();
                btos.close();
                btos = null;
            }
        }
        return new byte[]{};
    }


    public static void print(final Order order) {
        _print(order, false, null);
    }


    public static boolean supportSunMiPrinter() {
        int tryTimes = 3;
        boolean enable = false;
        Context context = GlobalCtx.app();
        try {
            while (tryTimes > 0) {
                AidlUtil.getInstance().connectPrinterService(context);
                boolean isEnable = GlobalCtx.smPrintIsEnable();
                if (isEnable) {
                    enable = isEnable;
                    break;
                }
                tryTimes--;
            }
        } catch (Exception e) {
            AppLogger.e("error check support sun mi", e);
        }
        return enable;
    }

    public static void logOrderPrint(Order order) {
        try {
            final String access_token = GlobalCtx.app().token();
            new OrderActionDao(access_token).logOrderPrinted(order.getId());
        } catch (ServiceException e) {
            AppLogger.e("error Service Exception:" + e.getMessage());
        }
    }

    /**
     * @param order     Must contain items!!!!
     * @param isAutoPrint
     * @param printedCallback
     */
    public static void _print(final Order order, final boolean isAutoPrint, final BasePrinter.PrintCallback printedCallback) {

        if (order == null || order.getId() <= 0) {
            AppLogger.e("order is null, skip print!");
            return;
        }

        new MyAsyncTask<Void, Order, Boolean>() {
            @Override
            protected Boolean doInBackground(Void... params) {
                boolean result = false;
                String reason = "";
                if (!isAutoPrint || (order.shouldTryAutoPrint())) {
                    if (isAutoPrint && !GlobalCtx.isAutoPrint(order.getStore_id())) {
                        AppLogger.e("[print] auto print failed for store");
                        reason = "此订单不在您设置的自动打印店面中！";
                    } else {
                        String speak = "";
                        Throwable ex = null;
                        final boolean supportSunMiPrinter = supportSunMiPrinter();
                        if (GlobalCtx.app().isConnectPrinter()) {
                            try {
                                //OrderPrinter.printOrder(ds.getSocket(), order);
                                PrintQueue.getQueue(GlobalCtx.app()).write(printOrder(order));
                                result = true;
                            } catch (Exception e) {
                                AppLogger.e("[print]error IOException:" + e.getMessage(), e);
                                reason = "打印错误：请从运行中程序列表清除CRM，重新启动CRM并连接打印机";
                                speak = "订单打印发生错误，请重新连接打印机！";
                                ex = e;
                            }
                            if (result) {
                                logOrderPrint(order);
                            }
                        } else if (supportSunMiPrinter) {
                            try {
                                smPrintOrder(order);
                                result = true;
                            } catch (Exception e) {
                                AppLogger.e("[print]error IOException:" + e.getMessage(), e);
                                reason = "打印错误：重新启动CRM";
                                speak = "商米打印机 订单打印发生错误，请重试！";
                                ex = e;
                            }
                            if (result) {
                                logOrderPrint(order);
                            }
                        } else {
                            reason = "未连接到打印机";
                            speak = "订单打印失败，请重新连接打印机，然后手动打印！";
                            ex = new Exception(reason);
                        }

                        if (ex != null) {
                            CrashReportHelper.handleUncaughtException(Thread.currentThread(), ex);
                        }
                        if (!TextUtils.isEmpty(speak)) {
                            AudioUtils.getInstance().speakText(speak);
                        }
                    }
                } else {
                    reason = "订单已经打印过啦";
                }

                if (printedCallback != null) {
                    printedCallback.run(result, reason);
                }

                return result;
            }
        }.executeOnExecutor(MyAsyncTask.SERIAL_EXECUTOR);
    }

}
