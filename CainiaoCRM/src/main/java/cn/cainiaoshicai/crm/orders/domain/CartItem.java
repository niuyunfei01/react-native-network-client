package cn.cainiaoshicai.crm.orders.domain;

/**
 * Created by liuzhr on 4/7/16.
 */
public class CartItem {
    private String product_name;
    private int num;
    private int product_id;
    private double price;
    private String tag_code;
    private String shelf_no;

    public String getProduct_name() {
        return product_name;
    }

    public void setProduct_name(String product_name) {
        this.product_name = product_name;
    }

    public int getNum() {
        return num;
    }

    public void setNum(int num) {
        this.num = num;
    }

    public int getProduct_id() {
        return product_id;
    }

    public void setProduct_id(int product_id) {
        this.product_id = product_id;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getTag_code() {
        return tag_code;
    }

    public void setTag_code(String tag_code) {
        this.tag_code = tag_code;
    }

    public String getShelf_no() {
        return shelf_no;
    }

    public void setShelf_no(String shelf_no) {
        this.shelf_no = shelf_no;
    }
}
