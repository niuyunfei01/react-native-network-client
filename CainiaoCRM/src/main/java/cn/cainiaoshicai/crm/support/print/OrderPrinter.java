package cn.cainiaoshicai.crm.support.print;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;

import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;

/**
 * Created by liuzhr on 4/30/16.
 */
public class OrderPrinter {
    private static final String GBK = "gbk";
    private final OutputStream btos;
    private byte[] newLine = "\n".getBytes();
    private final byte[] starLine = "********************************".getBytes();
    private final String split_line = "--------------------------------";
    private final String space_line = "                                ";

    public OrderPrinter(OutputStream btos) {
        this.btos = btos;
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
        btos.write(bytes(split_line));
        this.newLine();
        return this;
    }

    public OrderPrinter spaceLine() throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
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
