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
    private int vice_mgr;
    private int owner_id;
    private String open_end;
    private String open_start;
    private int call_not_print;
    private int ship_way;
    private int fn_price_controlled;
    private int fn_profit_controlled;
    private String alias;
    private String city;
    private String cityCode;
    private String owner_name;
    private String district;
    private String city_code;


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

    public int getVice_mgr() {
        return vice_mgr;
    }

    public void setVice_mgr(int vice_mgr) {
        this.vice_mgr = vice_mgr;
    }

    public int getOwner_id() {
        return owner_id;
    }

    public void setOwner_id(int owner_id) {
        this.owner_id = owner_id;
    }

    public String getOpen_end() {
        return open_end;
    }

    public void setOpen_end(String open_end) {
        this.open_end = open_end;
    }

    public String getOpen_start() {
        return open_start;
    }

    public void setOpen_start(String open_start) {
        this.open_start = open_start;
    }

    public int getCall_not_print() {
        return call_not_print;
    }

    public void setCall_not_print(int call_not_print) {
        this.call_not_print = call_not_print;
    }

    public int getShip_way() {
        return ship_way;
    }

    public void setShip_way(int ship_way) {
        this.ship_way = ship_way;
    }

    public int getFn_price_controlled() {
        return fn_price_controlled;
    }

    public int getFn_profit_controlled() {
        return fn_profit_controlled;
    }

    public void setFn_profit_controlled(int fn_profit_controlled) {
        this.fn_profit_controlled = fn_profit_controlled;
    }

    public void setFn_price_controlled(int fn_price_controlled) {
        this.fn_price_controlled = fn_price_controlled;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }

    public float getLocation_long() {
        return location_long;
    }

    public void setLocation_long(float location_long) {
        this.location_long = location_long;
    }

    public float getLocation_lat() {
        return location_lat;
    }

    public void setLocation_lat(float location_lat) {
        this.location_lat = location_lat;
    }

    public String getLoc_lng() {
        return loc_lng;
    }

    public void setLoc_lng(String loc_lng) {
        this.loc_lng = loc_lng;
    }

    public String getLoc_lat() {
        return loc_lat;
    }

    public void setLoc_lat(String loc_lat) {
        this.loc_lat = loc_lat;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCityCode() {
        return cityCode;
    }

    public void setCityCode(String cityCode) {
        this.cityCode = cityCode;
    }

    public String getOwner_name() {
        return owner_name;
    }

    public void setOwner_name(String owner_name) {
        this.owner_name = owner_name;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity_code() {
        return city_code;
    }

    public void setCity_code(String city_code) {
        this.city_code = city_code;
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
        b.putString("vendor_id", String.valueOf(type));
        b.putString("vendor", vendor);
        b.putString("owner_id", String.valueOf(owner_id));
        b.putString("vice_mgr", String.valueOf(vice_mgr));
        b.putString("ship_way", String.valueOf(ship_way));
        b.putString("open_start", open_start);
        b.putString("open_end", open_end);
        b.putString("cloudPrinter", this.cloudPrinter);
        b.putBoolean("shipCapable", shipCapable);
        b.putBoolean("cloudPrinterWorking", cloudPrinterWorking);
        b.putString("id", String.valueOf(id));
        b.putInt("fnPriceControlled", fn_price_controlled);
        b.putInt("fn_price_controlled", fn_price_controlled);
        b.putString("city", city);
        b.putString("city_code", city_code);
        b.putString("district", district);
        return b;
    }
}
