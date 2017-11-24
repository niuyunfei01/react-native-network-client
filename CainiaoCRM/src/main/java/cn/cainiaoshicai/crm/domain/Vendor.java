package cn.cainiaoshicai.crm.domain;

import android.os.Bundle;
import android.text.TextUtils;

import java.util.List;

/**
 * Created by liuzhr on 6/16/17.
 */

public class Vendor {

    private int id;
    private int creator;
    private String brand_name;
    private String contact_name;
    private String version;
    private int service_uid;
    private String support_tel = "010-80747218";
    private List<Long> service_mgr;
    private List<Long> store_mgr;
    private List<Long> store_vice_mgr;
    private boolean fnProvidingOnway;

    public Vendor() {
    }

    public int getCreator() {
        return creator;
    }

    public void setCreator(int creator) {
        this.creator = creator;
    }

    public String getBrand_name() {
        return brand_name;
    }

    public void setBrand_name(String brand_name) {
        this.brand_name = brand_name;
    }

    public String getContact_name() {
        return contact_name;
    }

    public void setContact_name(String contact_name) {
        this.contact_name = contact_name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getService_uid() {
        return service_uid;
    }

    public void setService_uid(int service_uid) {
        this.service_uid = service_uid;
    }

    public List<Long> getService_mgr() {
        return service_mgr;
    }

    public void setService_mgr(List<Long> service_mgr) {
        this.service_mgr = service_mgr;
    }

    public boolean isServiceMgr(long currUid) {
        return this.service_mgr != null && this.service_mgr.contains(currUid);
    }

    public boolean isStoreMgr(long currUid) {
        return this.store_mgr != null && this.store_mgr.contains(currUid);
    }

    public void setStore_mgr(List<Long> store_mgr) {
        this.store_mgr = store_mgr;
    }

    public List<Long> getStore_vice_mgr() {
        return store_vice_mgr;
    }

    public void setStore_vice_mgr(List<Long> store_vice_mgr) {
        this.store_vice_mgr = store_vice_mgr;
    }

    public boolean isStoreViceMgr(long currUid) {
        return this.store_vice_mgr != null && this.store_vice_mgr.contains(currUid);
    }

    public String getSupport_tel() {
        return support_tel;
    }

    public void setSupport_tel(String support_tel) {
        this.support_tel = support_tel;
    }

    public Bundle toBundle() {
        Bundle b = new Bundle();
        b.putString("id", String.valueOf(id));
        b.putString("creator", String.valueOf(creator));
        b.putString("brand_name", brand_name);
        b.putString("contact_name", contact_name);
        b.putString("version", version);
        b.putString("service_uid", String.valueOf(service_uid));
        b.putString("service_mgr", TextUtils.join(",", this.service_mgr.toArray()));
        b.putString("support_tel", this.support_tel);
        b.putBoolean("fnProvidingOnway", this.fnProvidingOnway);

        return b;
    }

    public boolean isFnProvidingOnway() {
        return fnProvidingOnway;
    }

    public void setFnProvidingOnway(boolean fnProvidingOnway) {
        this.fnProvidingOnway = fnProvidingOnway;
    }
}
