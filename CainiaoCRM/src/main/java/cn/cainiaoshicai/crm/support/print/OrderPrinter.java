package cn.cainiaoshicai.crm.support.print;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 * Created by liuzhr on 4/30/16.
 */
public class OrderPrinter {
    private static final String GBK = "gbk";
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
                        if (ds != null && ds.getSocket() != null) {
                            try {
                                OrderSingleActivity.printOrder(ds.getSocket(), order);
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
