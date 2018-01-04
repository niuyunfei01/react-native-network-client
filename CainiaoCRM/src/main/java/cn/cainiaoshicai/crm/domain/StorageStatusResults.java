package cn.cainiaoshicai.crm.domain;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by liuzhr on 3/8/17.
 */
public class StorageStatusResults {
    private boolean success = false;
    private String errorAlert;

    List<StoreProduct> store_products;
    HashMap<Integer, Product> products;
    public StoreStatusStat stats;
    private int total_req_cnt;
    private ExtPrice ext_price;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getErrorAlert() {
        return errorAlert;
    }

    public void setErrorAlert(String errorAlert) {
        this.errorAlert = errorAlert;
    }

    public List<StoreProduct> getStore_products() {
        return store_products;
    }

    public void setStore_products(List<StoreProduct> store_products) {
        this.store_products = store_products;
    }

    public int getTotal_req_cnt() {
        return total_req_cnt;
    }

    public void setTotal_req_cnt(int total_req_cnt) {
        this.total_req_cnt = total_req_cnt;
    }

    public HashMap<Integer, Product> getProducts() {
        return products;
    }

    public void setProducts(HashMap<Integer, Product> products) {
        this.products = products;
    }

    public ExtPrice getExt_price() {
        return ext_price;
    }

    public void setExt_price(ExtPrice ext_price) {
        this.ext_price = ext_price;
    }


    public static class WMPrice {
        private int ext_store_id;
        private int id;
        private int pid;
        private int status;
        private int price;

        public int getExt_store_id() {
            return ext_store_id;
        }

        public int getId() {
            return id;
        }

        public int getPid() {
            return pid;
        }

        public int getStatus() {
            return status;
        }

        public int getPrice() {
            return price;
        }
    }

    public static class ExtPrice {
        private HashMap<Integer, Integer> ext_store = new HashMap<>();
        private List<WMPrice> wm = new ArrayList<>();
        private HashMap<Integer, List<WMPrice>> wmPricesOfPid = null;

        public HashMap<Integer, Integer> getExt_store() {
            return ext_store;
        }

        public void setExt_store(HashMap<Integer, Integer> ext_store) {
            this.ext_store = ext_store;
        }

        public HashMap<Integer, List<WMPrice>> getWmPricesOfPid() {
            if (wmPricesOfPid == null) {
                wmPricesOfPid = new HashMap<>();
                if (this.wm != null) {
                    for (WMPrice wmp : this.wm) {
                        List<WMPrice> l = wmPricesOfPid.get(wmp.pid);
                        if (l == null) {
                            l = new ArrayList<>();
                            wmPricesOfPid.put(wmp.pid, l);
                            l.add(wmp);
                        } else {
                            l.add(wmp);
                        }
                    }
                }
            }
            return wmPricesOfPid;
        }

        public List<WMPrice> getWm() {
            return wm;
        }

        public void setWm(List<WMPrice> wm) {
            this.wm = wm;
        }
    }
}
