package cn.cainiaoshicai.crm.domain;

import android.text.TextUtils;

/**
 * Created by liuzhr on 6/30/16.
 */
public class Store {
    private String name;
    private long id;
    private String mobile;
    private String tel;
    private float location_long;
    private float location_lat;
    private boolean shipCapable;
    private int type;
    private String vendor;

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

    public long getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return name;
    }

    public boolean isShipCapable() {
        return shipCapable;
    }

    public void setShipCapable(boolean shipCapable) {
        this.shipCapable = shipCapable;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }

    public String getVendor() {
        return vendor;
    }

    public void setVendor(String vendor) {
        this.vendor = vendor;
    }

    public String namePrefixVendor() {
        String vendorName = TextUtils.isEmpty(this.vendor) ? "" : (this.vendor + ":");
        return vendorName + this.getName();
    }
}
