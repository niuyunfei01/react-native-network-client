package cn.cainiaoshicai.crm.dao;

import android.support.annotation.Nullable;
import android.util.Pair;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.domain.Product;
import cn.cainiaoshicai.crm.domain.ProductEstimate;
import cn.cainiaoshicai.crm.domain.ProvideReq;
import cn.cainiaoshicai.crm.domain.ResultEditReq;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.StorageStatusResults;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.StoreProduct;
import cn.cainiaoshicai.crm.domain.StoreStatusStat;
import cn.cainiaoshicai.crm.domain.Tag;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.domain.ResultObject;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.service.ServiceException;
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

    public ResultBean chg_item_status(int storeId, int product_id, int status, int destStatus) throws ServiceException {

        return actionWithResult(String.format("/store_chg_status/%d/%d/%d/%d", storeId, product_id, status, destStatus), null);
    }

    public ResultEditReq store_edit_provide_req(int pid, int store_id, int total_req, String remark) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("remark", remark);
        params.put("day", DateTimeUtils.shortYmd(new Date()));
        return actionEditReq(String.format("/store_edit_provide_req/%d/%d/%d", pid, store_id, total_req), params);
    }

    public ResultObject store_provide_req(Integer storeId, int reqId) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        String json = getJson("/store_curr_provide_req/" + storeId +"/" + reqId, params);

        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ResultObject<ProvideReq>>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
            ResultBean bean = ResultBean.readingFailed();
            return new ResultObject(bean.isOk(), bean.getDesc());
        }
    }

    public ResultBean store_status_provide_req(int req_id, int fromStatus, int toStatus) {
        try {
            String path = String.format("/store_status_provide_req/%d/%d/%d", req_id, fromStatus, toStatus);
            return actionWithResult(path, new HashMap<String, String>());
        } catch (ServiceException e) {
            AppLogger.e("store_status_provide_req req_id="+ req_id + ", fromStatus=" + fromStatus + ", " + toStatus, e);
            return ResultBean.readingFailed();
        }
    }

    public ResultBean chg_item_when_on_sale_again(int id, int option) {
        try {
            String path = String.format("/chg_item_when_on_sale/%d/%d", id, option);
            return actionWithResult(path, new HashMap<String, String>());
        } catch (ServiceException e) {
            AppLogger.e("chg_item_when_on_sale_again store_product_id="+ id + ", option=" + option, e);
            return ResultBean.readingFailed();
        }
    }

    public ResultObject store_provide_estimate(int store_id, String day) {
        try {
            String path = String.format("/provide_estimate/%d/%s", store_id, day);
            HashMap<String, String> params = new HashMap<>();
            String json = getJson(path, params);

            try {
                Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
                return gson.fromJson(json, new TypeToken<ResultObject<ProductEstimate>>() {
                }.getType());
            } catch (JsonSyntaxException e) {
                AppLogger.e(e.getMessage(), e);
                ResultBean bean = ResultBean.readingFailed();
                return new ResultObject(bean.isOk(), bean.getDesc());
            }
        } catch (ServiceException e) {
            AppLogger.e("provide_estimate store_id="+ store_id + ", day=" + day, e);
            return ResultObject.readingFailed();
        }
    }

    public Pair<ArrayList<StorageItem>, StoreStatusStat> getStorageItems(Store store, int filter,
                                                                         Tag tag) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        ArrayList<StorageItem> storageItems = new ArrayList<>();
        try {
            if (tag != null) {
                params.put("tag_id", String.valueOf(tag.getId()));
            }
            String json = getJson("/list_store_storage_status/0/" + store.getId() + "/" + filter, params);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            StorageStatusResults storagesMap = gson.fromJson(json, new TypeToken<StorageStatusResults>() {
            }.getType());

            if (!storagesMap.isSuccess()) {
                throw new ServiceException(storagesMap.getErrorAlert());
            }

            if (storagesMap.getStore_products() != null) {
                for (StoreProduct sp : storagesMap.getStore_products()) {
                    StorageItem si = new StorageItem();
                    si.setId(sp.getId());
                    si.setLeft_since_last_stat(sp.getLeft_since_last_stat());
                    si.setTotal_last_stat(sp.getTotal_last_stat());
                    si.setTotal_sold(sp.getSold_from_last_stat());
                    si.setProduct_id(sp.getProduct_id());
                    si.setStatus(sp.getStatus());
                    si.setProduct_id(sp.getProduct_id());
                    si.setPrice(sp.getPrice());
                    si.setSelf_provided(sp.getSelf_provided());
                    si.setRisk_min_stat(sp.getRisk_min_stat());
                    si.setSold_5day(sp.getSold_7day() - sp.getSold_weekend());
                    si.setSold_weekend(sp.getSold_weekend());
                    si.setTotalInReq(sp.getReq_total());
                    si.setReqMark(sp.getReq_mark());
                    si.setWhen_sale_again(sp.getRe_on_sale_time());
                    si.setStore_id(sp.getStore_id());
                    HashMap<Integer, Product> products = storagesMap.getProducts();
                    Product pd = products.get(sp.getProduct_id());
                    if (pd != null) {
                        si.setName(pd.getName());
                        si.setTag_code(pd.getTag_code());
                    }
                    storageItems.add(si);
                }
            }
            StoreStatusStat stats = storagesMap.stats;
            if (stats != null) {
                stats.setTotal_req_cnt(storagesMap.getTotal_req_cnt());
            }
            Pair<ArrayList<StorageItem>, StoreStatusStat> result = new Pair<>(storageItems, stats);
            return result;
        } catch (JsonSyntaxException e) {
            AppLogger.e("[getStorageItems] json syntax error:" + e.getMessage(), e);
            return new Pair<>(storageItems, new StoreStatusStat());
        }
    }

    private String getJson(String pathSuffix, HashMap<String, String> params) throws ServiceException {
        String url = URLHelper.API_ROOT() + pathSuffix + ".json" ;

        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);
        map.putAll(params);
        String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
        AppLogger.v("action" + pathSuffix + ":" + json);
        return json;
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

    @Nullable
    private ResultEditReq actionEditReq(String path, HashMap<String, String> params) throws ServiceException {
        if (params == null) {
            params = new HashMap<>();
        }
        String json = getJson(path, params);

        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ResultEditReq>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
            ResultBean bean = ResultBean.readingFailed();
            return new ResultEditReq(bean.isOk(), bean.getDesc());
        }
    }

    private String access_token;
    public StorageActionDao(String access_token) {
        this.access_token = access_token;
    }
}
