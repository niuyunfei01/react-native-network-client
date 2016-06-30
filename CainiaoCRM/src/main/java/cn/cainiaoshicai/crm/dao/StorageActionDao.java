package cn.cainiaoshicai.crm.dao;

import android.support.annotation.Nullable;
import android.util.Pair;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.domain.Product;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.StoreProduct;
import cn.cainiaoshicai.crm.orders.dao.URLHelper;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Date: 13-2-14
 */
public class StorageActionDao {

    public ResultBean store_status_reset_stat_num(int storeId, int product_id, int lastStat) throws ServiceException {
        return actionWithResult(String.format("/store_status_reset_stat_num/%d/%d/%d", storeId, product_id, lastStat), null);
    }

    static public class StoreStatusStat {

        private int total;
        private int total_risk;
        private int total_sold_out;

        public int getTotal() {
            return total;
        }

        public void setTotal(int total) {
            this.total = total;
        }

        public int getTotal_risk() {
            return total_risk;
        }

        public void setTotal_risk(int total_risk) {
            this.total_risk = total_risk;
        }

        public int getTotal_sold_out() {
            return total_sold_out;
        }

        public void setTotal_sold_out(int total_sold_out) {
            this.total_sold_out = total_sold_out;
        }
    }

    static public class StorageStatusResults {
        List<StoreProduct> store_products;
        HashMap<Integer, Product> products;
        StoreStatusStat stats;

        public List<StoreProduct> getStore_products() {
            return store_products;
        }

        public void setStore_products(List<StoreProduct> store_products) {
            this.store_products = store_products;
        }

        public HashMap<Integer, Product> getProducts() {
            return products;
        }

        public void setProducts(HashMap<Integer, Product> products) {
            this.products = products;
        }
    }

    public Pair<List<StorageItem>, StoreStatusStat> getStorageItems(Store store) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        ArrayList<StorageItem> storageItems = new ArrayList<>();
        try {
            String json = getJson("/list_store_storage_status/" + store.getStoreId(), params);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            StorageStatusResults storagesMap = gson.fromJson(json, new TypeToken<StorageStatusResults>() {
            }.getType());
            if (storagesMap.getStore_products() != null) {
                for(StoreProduct sp : storagesMap.getStore_products()) {
                    StorageItem si = new StorageItem();
                    si.setId(sp.getProduct_id());
                    si.setTotal_last_stat(sp.getTotal_last_stat());
                    si.setTotal_sold(sp.getSold_from_last_stat());
                    si.setProduct_id(sp.getProduct_id());
                    HashMap<Integer, Product> products = storagesMap.getProducts();
                    Product pd = products.get(sp.getProduct_id());
                    if (pd != null) {
                        si.setName(pd.getName());
                    }
                    storageItems.add(si);
                }
            }
            return new Pair<List<StorageItem>, StoreStatusStat>(storageItems, storagesMap.stats);
        } catch (JsonSyntaxException e) {
            AppLogger.e("[getStorageItems] json syntax error:" + e.getMessage(), e);
            return new Pair<List<StorageItem>, StoreStatusStat>(storageItems, new StoreStatusStat());
        }
    }

    private String getJson(String pathSuffix, HashMap<String, String> params) throws ServiceException {
        String url = URLHelper.API_ROOT + pathSuffix + ".json" ;

        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);
        map.putAll(params);
        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
    }

    @Nullable
    private ResultBean actionWithResult(String path, HashMap<String, String> params) throws ServiceException {
        if (params == null) {
            params = new HashMap<>();
        }

        String json = getJson(path, params);

        AppLogger.v("action" + path + ":" + json);

        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ResultBean>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
            return ResultBean.readingFailed();
        }
    }

    private String access_token;
    public StorageActionDao(String access_token) {
        this.access_token = access_token;
    }
}
