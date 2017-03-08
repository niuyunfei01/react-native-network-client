package cn.cainiaoshicai.crm.domain;

import java.util.HashMap;
import java.util.SortedMap;

/**
 * Created by liuzhr on 3/8/17.
 */
public class Config {
    private SortedMap<Integer, Worker> workers;
    private SortedMap<Integer, Worker> ship_workers;
    private String[] delayReasons;
    private HashMap<String, String> configUrls;
    private String[] coupons;

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
}
