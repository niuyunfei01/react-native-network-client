package cn.cainiaoshicai.crm.domain;

/**
 * Created by liuzhr on 6/30/16.
 */
public class Store {
    private String name;
    private int id;
    private String mobile;
    private String tel;
    private float location_long;
    private float location_lat;

    public Store() {
    }

    public Store(String storeName, int storeId) {
        this.name = storeName;
        this.id = storeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return name;
    }
}
