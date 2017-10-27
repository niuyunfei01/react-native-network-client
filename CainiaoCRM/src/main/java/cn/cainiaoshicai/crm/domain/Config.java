package cn.cainiaoshicai.crm.domain;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.SortedMap;

/**
 * Created by liuzhr on 3/8/17.
 */
public class Config {

    private final long createdTs = System.currentTimeMillis();

    private String supportTel = "";

    private Vendor vendor;

    private SortedMap<Integer, Worker> workers;
    private SortedMap<Integer, Worker> ship_workers;
    private String[] delayReasons;
    private HashMap<String, String> configUrls;
    private String[] coupons;
    private boolean cloudPrint = false;
    private String lastHash;
    private SortedMap<Integer, TaskType> task_types;
    private Vendor[] can_read_vendors;

    public Config(SortedMap<Integer, Worker> workers, String[] delayReasons, HashMap<String, String> configUrls) {
        this.workers = workers;
        this.delayReasons = delayReasons;
        this.configUrls = configUrls;
    }

    public SortedMap<Integer, Worker> getShip_workers() {
        return ship_workers;
    }

    public void setShip_workers(SortedMap<Integer, Worker> ship_workers) {
        this.ship_workers = ship_workers;
    }

    public SortedMap<Integer, Worker> getWorkers() {
        return workers;
    }

    public String[] getDelayReasons() {
        return delayReasons;
    }

    public HashMap<String, String> getConfigUrls() {
        return configUrls;
    }

    public String[] getCoupons() {
        return coupons;
    }

    public void setCoupons(String[] coupons) {
        this.coupons = coupons;
    }

    public long getCreatedTs() {
        return createdTs;
    }

    public String getSupportTel() {
        return supportTel;
    }

    public void setSupportTel(String supportTel) {
        this.supportTel = supportTel;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public void setVendor(Vendor vendor) {
        this.vendor = vendor;
    }

    public String getLastHash() {
        return lastHash;
    }

    public void setLastHash(String lastHash) {
        this.lastHash = lastHash;
    }

    public boolean isCloudPrint() {
        return cloudPrint;
    }

    public void setCloudPrint(boolean cloudPrint) {
        this.cloudPrint = cloudPrint;
    }

    public SortedMap<Integer, TaskType> getTask_types() {
        return task_types;
    }

    public void setTask_types(SortedMap<Integer, TaskType> task_types) {
        this.task_types = task_types;
    }

    public Vendor[] getCan_read_vendors() {
        return can_read_vendors;
    }

    public void setCan_read_vendors(Vendor[] can_read_vendors) {
        this.can_read_vendors = can_read_vendors;
    }

    private class TaskType {
        public String name;
        public int sort;
    }
}
