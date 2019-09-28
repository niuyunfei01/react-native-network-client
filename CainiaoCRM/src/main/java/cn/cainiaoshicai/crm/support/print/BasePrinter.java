package cn.cainiaoshicai.crm.support.print;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Array;

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

    private static String hexStr = "0123456789ABCDEF";
    private static String[] binaryArray = {"0000", "0001", "0010", "0011",
            "0100", "0101", "0110", "0111", "1000", "1001", "1010", "1011",
            "1100", "1101", "1110", "1111"};

    public static final byte ESC = 27;//换码
    public static final byte FS = 28;//文本分隔符
    public static final byte GS = 29;//组分隔符
    @SuppressWarnings("unused")
    public static final byte DLE = 16;//数据连接换码
    @SuppressWarnings("unused")
    public static final byte EOT = 4;//传输结束
    @SuppressWarnings("unused")
    public static final byte ENQ = 5;//询问字符
    @SuppressWarnings("unused")
    public static final byte SP = 32;//空格
    public static final byte HT = 9;//横向列表
    public static final byte LF = 10;//打印并换行（水平定位）
    @SuppressWarnings("unused")
    public static final byte CR = 13;//归位键
    @SuppressWarnings("unused")
    public static final byte FF = 12;//走纸控制（打印并回到标准模式（在页模式下） ）
    @SuppressWarnings("unused")
    public static final byte CAN = 24;//作废（页模式下取消打印数据 ）

    private static final String GBK = "gbk";
    private final OutputStream btos;
    private byte[] newLine = "\n".getBytes();
    private final byte[] starLine = "********************************".getBytes();

    /**
     * CodePage table
     */
    @SuppressWarnings("unused")
    public static class CodePage {
        public static final byte PC437 = 0;
        public static final byte KATAKANA = 1;
        public static final byte PC850 = 2;
        public static final byte PC860 = 3;
        public static final byte PC863 = 4;
        public static final byte PC865 = 5;
        public static final byte WPC1252 = 16;
        public static final byte PC866 = 17;
        public static final byte PC852 = 18;
        public static final byte PC858 = 19;
    }


    /**
     * BarCode table
     */
    @SuppressWarnings("unused")
    public static class BarCode {
        public static final byte UPC_A = 0;
        public static final byte UPC_E = 1;
        public static final byte EAN13 = 2;
        public static final byte EAN8 = 3;
        public static final byte CODE39 = 4;
        public static final byte ITF = 5;
        public static final byte NW7 = 6;
        public static final byte CODE93 = 72;
        public static final byte CODE128 = 73;
    }

    public BasePrinter() {
        btos = null;
    }

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

    public byte[] newLineBytes() {
        return newLine;
    }

    public BasePrinter starLine() throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        btos.write(starLine);
        btos.write(newLine);

        return this;
    }

    public byte[] startLineBytes() {
        return concatenate(GPrinterCommand.text_normal_size, concatenate(starLine, newLine));
    }

    public BasePrinter highText(String s) throws IOException {
        btos.write(GPrinterCommand.text_big_height);
        btos.write(bytes(s));
        return this;
    }

    public byte[] highTextBytes(String s) throws UnsupportedEncodingException {
        return concatenate(GPrinterCommand.text_big_height, bytes(s));
    }

    public BasePrinter highBigText(String s) throws IOException {
        btos.write(GPrinterCommand.text_big_size);
        btos.write(bytes(s));
        return this;
    }

    public byte[] highBigTextBytes(String s) throws UnsupportedEncodingException {
        return concatenate(GPrinterCommand.text_big_size, bytes(s));
    }


    private byte[] bytes(String msg) throws UnsupportedEncodingException {
        return msg.getBytes(GBK);
    }

    public BasePrinter normalText(String text) throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        btos.write(bytes(text));
        return this;
    }

    public byte[] normalTextBytes(String text) throws UnsupportedEncodingException {
        return concatenate(GPrinterCommand.text_normal_size, bytes(text));
    }

    public BasePrinter splitLine() throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        String split_line = "--------------------------------";
        btos.write(bytes(split_line));
        this.newLine();
        return this;
    }


    public BasePrinter barcode_height(byte dots) throws IOException {
        byte[] result = new byte[3];
        result[0] = GS;
        result[1] = 104;
        result[2] = dots;
        btos.write(result);
        return this;
    }


    public BasePrinter select_position_hri(byte n) throws IOException {
        byte[] result = new byte[3];
        result[0] = GS;
        result[1] = 72;
        result[2] = n;
        btos.write(result);
        return this;
    }

    /**
     * justification_center
     * ESC a n
     *
     * @return bytes for this command
     */
    public BasePrinter justification_center() throws IOException {
        byte[] result = new byte[3];
        result[0] = ESC;
        result[1] = 97;
        result[2] = 1;
        btos.write(result);
        return this;
    }

    /**
     * print bar code
     *
     * @param barcode_typ   ( Barcode.CODE39, Barcode.EAN8 ,...)
     * @param barcode2print value
     * @return BaserPrinter
     */
    public BasePrinter print_bar_code(byte barcode_typ, String barcode2print) throws IOException {
        byte[] barcodeBytes = barcode2print.getBytes();
        byte[] result = new byte[3 + barcodeBytes.length + 1];
        result[0] = GS;
        result[1] = 107;
        result[2] = barcode_typ;
        int idx = 3;
        for (byte b : barcodeBytes) {
            result[idx] = b;
            idx++;
        }
        result[idx] = 0;
        btos.write(result);
        return this;
    }

    public BasePrinter print_linefeed() throws IOException {
        byte[] result = new byte[1];
        result[0] = LF;
        btos.write(result);
        return this;
    }

    public BasePrinter print_and_feed_lines(byte n) throws IOException {
        byte[] result = new byte[3];
        result[0] = ESC;
        result[1] = 100;
        result[2] = n;
        btos.write(result);
        return this;
    }

    /**
     * white printing mode on
     * Turn white/black reverse printing mode on
     * GS B n
     *
     * @return bytes for this command
     */
    public BasePrinter white_printing_on() throws IOException {
        byte[] result = new byte[3];
        result[0] = GS;
        result[1] = 66;
        result[2] = (byte) 128;
        btos.write(result);
        return this;
    }

    /**
     * white printing mode off
     * Turn white/black reverse printing mode off
     * GS B n
     *
     * @return bytes for this command
     */
    public BasePrinter white_printing_off() throws IOException {
        byte[] result = new byte[3];
        result[0] = GS;
        result[1] = 66;
        result[2] = 0;
        btos.write(result);
        return this;
    }


    public byte[] splitLineBytes() throws UnsupportedEncodingException {
        String split_line = "--------------------------------";
        return concatenate(GPrinterCommand.text_normal_size, concatenate(bytes(split_line), newLine));
    }

    public BasePrinter spaceLine() throws IOException {
        btos.write(GPrinterCommand.text_normal_size);
        String space_line = "                                ";
        btos.write(bytes(space_line));
        this.newLine();
        return this;
    }

    public byte[] spaceLineBytes() throws UnsupportedEncodingException {
        byte[] bytes = GPrinterCommand.text_normal_size;
        String space_line = "                                ";
        return concatenate(bytes, concatenate(bytes(space_line), newLine));
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

    public static String getGBK() {
        return GBK;
    }

    public byte[] getNewLine() {
        return newLine;
    }

    public byte[] getStarLine() {
        return starLine;
    }

    public byte[] concatenate(byte[] a, byte[] b) {
        int aLen = a.length;
        int bLen = b.length;
        @SuppressWarnings("unchecked")
        byte[] c = (byte[]) Array.newInstance(a.getClass().getComponentType(), aLen + bLen);
        System.arraycopy(a, 0, c, 0, aLen);
        System.arraycopy(b, 0, c, aLen, bLen);
        return c;
    }

}
