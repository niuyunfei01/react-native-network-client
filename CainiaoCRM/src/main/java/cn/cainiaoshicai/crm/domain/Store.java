package cn.cainiaoshicai.crm.domain;

import android.os.Bundle;
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
    private String loc_lng;
    private String loc_lat;
    private boolean shipCapable;
    private String cloudPrinter;
    private boolean cloudPrinterWorking;
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

    public String getCloudPrinter() {
        return cloudPrinter;
    }

    public void setCloudPrinter(String cloudPrinter) {
        this.cloudPrinter = cloudPrinter;
    }

    public boolean isCloudPrinterWorking() {
        return cloudPrinterWorking;
    }

    public void setCloudPrinterWorking(boolean cloudPrinterWorking) {
        this.cloudPrinterWorking = cloudPrinterWorking;
    }

    public String namePrefixVendor() {
        String vendorName = TextUtils.isEmpty(this.vendor) ? "" : (this.vendor + ":");
        return vendorName + this.getName();
    }

    public Bundle toBundle() {
        Bundle b = new Bundle();
        b.putString("name", name);
        b.putString("loc_lng", loc_lng);
        b.putString("loc_lat", loc_lat);
        b.putString("mobile", mobile);
        b.putString("tel", tel);
        b.putString("vendor", vendor);
        b.putString("cloudPrinter", this.cloudPrinter);
        b.putBoolean("shipCapable", shipCapable);
        b.putBoolean("cloudPrinterWorking", cloudPrinterWorking);
        b.putString("id", String.valueOf(id));
        return b;
    }
}
