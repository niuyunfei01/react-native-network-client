package cn.cainiaoshicai.crm.support.print;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 * Created by liuzhr on 4/30/16.
 */
public class BasePrinter {
    private static final String GBK = "gbk";
    private final OutputStream btos;
    private byte[] newLine = "\n".getBytes();
    private final byte[] starLine = "********************************".getBytes();

    public BasePrinter(OutputStream btos) {
        this.btos = btos;
    }

    public interface PrintCallback {
        void run(boolean result, String desc);
    }

    public BasePrinter newLine() throws IOException {
        btos.write(newLine);
        return this;
    }

    public BasePrinter starLine() throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        btos.write(starLine);
        btos.write(newLine);

        return this;
    }

    public BasePrinter highText(String s) throws IOException {
        btos.write(GPrinterCommand.text_big_height);
        btos.write(bytes(s));
        return this;
    }

    public BasePrinter highBigText(String s) throws IOException {
        btos.write(GPrinterCommand.text_big_size);
        btos.write(bytes(s));
        return this;
    }


    private byte[] bytes(String msg) throws UnsupportedEncodingException {
        return msg.getBytes(GBK);
    }

    public BasePrinter normalText(String text) throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        btos.write(bytes(text));
        return this;
    }

    public BasePrinter splitLine() throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        String split_line = "--------------------------------";
        btos.write(bytes(split_line));
        this.newLine();
        return this;
    }

    public BasePrinter spaceLine() throws IOException {
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
