package cn.cainiaoshicai.crm.domain;

import java.util.HashMap;
import java.util.List;

/**
 * Created by liuzhr on 3/8/17.
 */
public class StorageStatusResults {
    List<StoreProduct> store_products;
    HashMap<Integer, Product> products;
    public StoreStatusStat stats;
    private int total_req_cnt;

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
}
