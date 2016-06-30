package cn.cainiaoshicai.crm.domain;

/**
 * Created by liuzhr on 6/29/16.
 */
public class StorageItem {

    private int id;
    private String name;
    private int total_last_stat;
    private int total_sold;
    private int left_since_last_stat;
    private int product_id;

    public int getProduct_id() {
        return product_id;
    }

    public void setProduct_id(int product_id) {
        this.product_id = product_id;
    }

    public StorageItem() {
    }

    public StorageItem(int id, String name, int total_last_stat, int total_sold) {
        this.id = id;
        this.name = name;
        this.total_last_stat = total_last_stat;
        this.total_sold = total_sold;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getTotal_last_stat() {
        return total_last_stat;
    }

    public void setTotal_last_stat(int total_last_stat) {
        this.total_last_stat = total_last_stat;
    }

    public int getTotal_sold() {
        return total_sold;
    }

    public void setTotal_sold(int total_sold) {
        this.total_sold = total_sold;
    }

    public String getIdAndNameStr() {
        String name = getName();
        if (name.length() > 15) {
            name = name.substring(0, 15);
        }
        return String.format("#%s\n%s", getId(), name);
    }

    public int getLeft_since_last_stat() {
        return left_since_last_stat;
    }

    public void setLeft_since_last_stat(int left_since_last_stat) {
        this.left_since_last_stat = left_since_last_stat;
    }
}
