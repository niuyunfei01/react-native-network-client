package cn.cainiaoshicai.crm.domain;

/**
 * Created by liuzhr on 10/26/16.
 */

public class Tag {

    private int id;
    private String name;
    private int total;

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

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    @Override
    public String toString() {
        return  name;
    }
}
