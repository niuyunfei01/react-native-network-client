package cn.cainiaoshicai.crm.support.print;

import android.text.TextUtils;

import java.io.IOException;
import java.io.OutputStream;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.domain.ProductEstimate;
import cn.cainiaoshicai.crm.domain.ProductProvideList;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.CartItem;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.orders.util.TextUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

import static android.R.attr.order;

/**
 * Created by liuzhr on 10/27/16.
 */

public class OrderPrinter {

    private static final int MAX_TITLE_PART = 16;

    public static void printWhenNeverPrinted(final int platform, final String platformOid) {
        printWhenNeverPrinted(platform, platformOid, null);
    }

    public static void printWhenNeverPrinted(final int platform, final String platformOid, final BasePrinter.PrintCallback printedCallback) {
        BluetoothPrinters.DeviceStatus printer = BluetoothPrinters.INS.getCurrentPrinter();
        if (printer == null || !printer.isConnected()) {
            AppLogger.e("skip to print for printer is not connected!");
            return;
        }

        new MyAsyncTask<Void, Void, Void>() {

            @Override
            protected Void doInBackground(Void... params) {

                final String access_token = GlobalCtx.getInstance().getAccountBean().getAccess_token();
                final Order order = new OrderActionDao(access_token).getOrder(platform, platformOid);
                if (order != null) {
                    OrderPrinter._print(order, true, printedCallback);
                } else {
                    AppLogger.e("[print]error to userTalkStatus order platform=:" + platform + ", oid=" + platformOid);
                }
                return null;
            }
        }.executeOnNormal();
    }

    public static void printEstimate(BluetoothConnector.BluetoothSocketWrapper btsocket, ProductEstimate estimate) throws IOException {
        try {
            OutputStream btos = btsocket.getOutputStream();
            BasePrinter printer = new BasePrinter(btos);

            btos.write(new byte[]{0x1B, 0x21, 0});
            btos.write(GPrinterCommand.left);

            printer.starLine().highBigText("   估货单").newLine()
                    .newLine().highBigText("  #" + estimate.getDay());

            printer.normalText(GlobalCtx.getApplication().getStoreName(estimate.getStore_id()) ).newLine();

            printer.normalText("负责人：___________").newLine();

            printer.starLine().highText(String.format("品名%22s", "份数")).newLine().splitLine();

            int total = 0;
            for (ProductEstimate.Item item :  estimate.getLists()) {
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
            for (ProductProvideList.Item item :  list.getItems()) {
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
                total ++;
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

    public static void printOrder(BluetoothConnector.BluetoothSocketWrapper btsocket, Order order) throws IOException {
        try {
            OutputStream btos = btsocket.getOutputStream();
            BasePrinter printer = new BasePrinter(btos);


            btos.write(new byte[]{0x1B, 0x21, 0});
            btos.write(GPrinterCommand.left);

            printer.starLine().highBigText("   菜鸟食材").newLine()
                    .newLine().highBigText("  #" + order.getSimplifiedId());

            printer.normalText(order.platformWithId()).newLine();

            printer.starLine().highText("支付状态：" + (order.isPaidDone() ? "在线支付" : "待付款(以平台为准)")).newLine();

            printer.starLine()
                    .highText(TextUtil.replaceWhiteStr(order.getUserName()) + " " + order.getMobile())
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

            if (order.getAdditional_to_pay() > 0) {
                printer.starLine(). normalText(String.format("客户追加应付：%22.2f", order.getAdditional_to_pay()/100)).newLine();
            }

            double totalMoney = (order.getOrderMoney() * 100 + order.getAdditional_to_pay()) / 100;
            printer.starLine().highText(String.format("%s：%22.2f", (order.isPaidDone() ? "实付金额" : "客户合计待付"), totalMoney)).newLine();

            printer.starLine().normalText("生鲜娇嫩，请您妥善储存。售后问题").newLine().normalText("请致电客服：400-018-6069");

            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(GPrinterCommand.walkPaper((byte) 4));
            btos.flush();
        } catch (Exception e) {
            AppLogger.e("error in printing order", e);
            throw e;
        }
    }


    public static void print(final Order order) {
        _print(order, false, null);
    }


    /**
     *  @param order Must contain items!!!!
     * @param isAutoPrint
     * @param printedCallback
     */
    private static void _print(final Order order, final boolean isAutoPrint, final BasePrinter.PrintCallback printedCallback) {

        if (order == null || order.getId() <=0 ) {
            AppLogger.e("order is null, skip print!");
            return;
        }

        final String access_token = GlobalCtx.getInstance().getAccountBean().getAccess_token();
        new MyAsyncTask<Void, Order, Boolean>() {
            @Override
            protected Boolean doInBackground(Void... params) {

                boolean result = false;
                String reason = "";
                if (!isAutoPrint || (order.shouldTryAutoPrint()) ) {

                    if (isAutoPrint && !GlobalCtx.isAutoPrint(order.getStore_id())) {
                        AppLogger.e("[print] auto print failed for store");
                        reason = "此订单不在您设置的自动打印店面中！";
                    } else {
                        final BluetoothPrinters.DeviceStatus ds = BluetoothPrinters.INS.getCurrentPrinter();
                        if (ds != null && ds.getSocket() != null && ds.isConnected()) {
                            try {
                                OrderPrinter.printOrder(ds.getSocket(), order);
                                try {
                                    new OrderActionDao(access_token).logOrderPrinted(order.getId());
                                } catch (ServiceException e) {
                                    AppLogger.e("error Service Exception:" + e.getMessage());
                                }
                                result = true;
                            } catch (Exception e) {
                                AppLogger.e("[print]error IOException:" + e.getMessage(), e);
                                reason = "打印错误：" + e.getMessage();
                                if (e instanceof IOException) {
                                    ds.closeSocket();
                                    ds.reconnect();
                                }
                            }
                        } else {
                            AppLogger.e("Printer is not connected!");
                            reason = "未连接到打印机";
                        }
                    }
                } else {
                    AppLogger.e("order is already printed!");
                    reason = "订单已经打印过啦";
                }

                if(printedCallback != null) {
                    printedCallback.run(result, reason);
                }

                return result;
            }
        }.executeOnExecutor(MyAsyncTask.SERIAL_EXECUTOR);
    }

}
