package cn.cainiaoshicai.crm.support.print;

import android.text.TextUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.CartItem;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.orders.util.TextUtil;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 * Created by liuzhr on 4/30/16.
 */
public class OrderPrinter {
    private static final String GBK = "gbk";
    private static final int MAX_TITLE_PART = 16;
    private final OutputStream btos;
    private byte[] newLine = "\n".getBytes();
    private final byte[] starLine = "********************************".getBytes();

    public OrderPrinter(OutputStream btos) {
        this.btos = btos;
    }

    public static void printWhenNeverPrinted(final int platform, final String platformOid) {
        printWhenNeverPrinted(platform, platformOid, null);
    }

    public static void printWhenNeverPrinted(final int platform, final String platformOid, final PrintCallback printedCallback) {
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
                    _print(order, true, printedCallback);
                } else {
                    AppLogger.e("[print]error to get order platform=:" + platform + ", oid=" + platformOid);
                }
                return null;
            }
        }.executeOnNormal();
    }

    public static void print(final Order order) {
        _print(order, false, null);
    }


    /**
     *  @param order Must contain items!!!!
     * @param isAutoPrint
     * @param printedCallback
     */
    private static void _print(final Order order, final boolean isAutoPrint, final PrintCallback printedCallback) {

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
                                printOrder(ds.getSocket(), order);
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

    public static void printOrder(BluetoothConnector.BluetoothSocketWrapper btsocket, Order order) throws IOException {
        try {
            OutputStream btos = btsocket.getOutputStream();
            OrderPrinter printer = new OrderPrinter(btos);


            btos.write(new byte[]{0x1B, 0x21, 0});
            btos.write(GPrinterCommand.left);

            printer.starLine().highBigText("   菜鸟食材").newLine()
                    .newLine().highBigText("  #" + order.getSimplifiedId());

            printer.normalText(order.platformWithId()).newLine();

            printer.starLine().highText("支付状态：" + (order.isPaidDone() ? "在线支付" : "待付款(以平台为准)")).newLine();

            printer.starLine()
                    .highText(TextUtil.replaceWhiteStr(order.getUserName()) + " " + order.getMobile())
                            .newLine()
                            .highText(TextUtil.replaceWhiteStr(order.getAddress()))
                            .newLine();

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

            printer.highText(String.format("合计 %27s", "x" + total)).newLine();

            printer.starLine().highText(String.format("实付金额：%22.2f", order.getOrderMoney())).newLine();

            printer.starLine().normalText("我们承诺坏一赔二，请您放心买菜。").newLine().normalText("客服电话：400-018-6069");

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

    public interface PrintCallback {
        void run(boolean result, String desc);
    }

    public OrderPrinter newLine() throws IOException {
        btos.write(newLine);
        return this;
    }

    public OrderPrinter starLine() throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        btos.write(starLine);
        btos.write(newLine);

        return this;
    }

    public OrderPrinter highText(String s) throws IOException {
        btos.write(GPrinterCommand.text_big_height);
        btos.write(bytes(s));
        return this;
    }

    public OrderPrinter highBigText(String s) throws IOException {
        btos.write(GPrinterCommand.text_big_size);
        btos.write(bytes(s));
        return this;
    }


    byte[] bytes(String msg) throws UnsupportedEncodingException {
        return msg.getBytes(GBK);
    }

    public OrderPrinter normalText(String text) throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        btos.write(bytes(text));
        return this;
    }

    public OrderPrinter splitLine() throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        String split_line = "--------------------------------";
        btos.write(bytes(split_line));
        this.newLine();
        return this;
    }

    public OrderPrinter spaceLine() throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        String space_line = "                                ";
        btos.write(bytes(space_line));
        this.newLine();
        return this;
    }

    public int printWidth(String text) {
        if (text == null) return 0;
        int width = 0;
        for (int idx = 0; idx < text.length(); idx++) {
            char c = text.charAt(idx);
            if (c < 256) {
                width++;
            } else {
                width += 2;
            }
        }
        return width;
    }
}
