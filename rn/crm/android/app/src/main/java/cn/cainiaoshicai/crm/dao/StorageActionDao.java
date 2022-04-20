package cn.cainiaoshicai.crm.dao;

import androidx.annotation.Nullable;
import android.text.TextUtils;
import android.util.Pair;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.CrashReportHelper;
import cn.cainiaoshicai.crm.domain.Product;
import cn.cainiaoshicai.crm.domain.ProductEstimate;
import cn.cainiaoshicai.crm.domain.ProductProvideList;
import cn.cainiaoshicai.crm.domain.ProvideReq;
import cn.cainiaoshicai.crm.domain.ResultEditReq;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.StorageStatusResults;
import cn.cainiaoshicai.crm.domain.StoreProduct;
import cn.cainiaoshicai.crm.domain.StoreStatusStat;
import cn.cainiaoshicai.crm.domain.Tag;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Date: 13-2-14
 */
public class StorageActionDao {

    public ResultBean store_status_reset_stat_num(int storeId, int product_id, float lastStat) throws ServiceException {
        return actionWithResult(String.format("/store_status_reset_stat_num/%d/%d/%d", storeId, product_id, lastStat), null);
    }

    public ResultBean chg_item_status(long storeId, int product_id, int status, int destStatus) throws ServiceException {

        return actionWithResult(String.format("/store_chg_status/%d/%d/%d/%d", storeId, product_id, status, destStatus), null);
    }

    public ResultEditReq store_edit_provide_req(int pid, int store_id, int total_req, float total_amount, String remark, int lastStat, int unitType) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("remark", remark);
        params.put("last_stat", String.valueOf(lastStat));
        params.put("day", DateTimeUtils.shortYmd(new Date()));
        return actionEditReq(String.format("/store_edit_provide_req/%d/%d/%d/%.2f/%d", pid, store_id, total_req, total_amount, unitType), params);
    }

    public ResultBean store_provide_req(Long storeId, int reqId) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        String json = getJson("/store_curr_provide_req/" + storeId +"/" + reqId, params);

        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ResultBean<ProvideReq>>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
            ResultBean bean = ResultBean.readingFailed();
            return new ResultBean(bean.isOk(), bean.getDesc());
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

    public <T> ResultBean<T> provide_list_to_print(int provideReqId, int supplierId) {
        try {
            String path = String.format("/provide_list_print/%d/%d", provideReqId, supplierId);

            HashMap<String, String> params = new HashMap<>();
            String json = getJson(path, params);

            try {
                Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
                return gson.fromJson(json, new TypeToken<ResultBean<ProductProvideList>>() {
                }.getType());
            } catch (JsonSyntaxException e) {
                AppLogger.e(e.getMessage(), e);
                ResultBean bean = ResultBean.readingFailed();
                return new ResultBean<T>(bean.isOk(), bean.getDesc());
            }
        } catch (ServiceException e) {
            AppLogger.e("provide_list_to_print provideReqId="+ provideReqId + ", supplierId=" + supplierId, e);
            return ResultBean.readingFailed();
        }
    }

    public ResultBean store_provide_estimate(long store_id, String day) {
        try {
            String path;
            try {
                path = String.format("/provide_estimate/%d/%s", store_id, URLEncoder.encode(day, "UTF-8"));
            } catch (UnsupportedEncodingException e) {
                return new ResultBean(false, "unsupported-encoding");
            }

            HashMap<String, String> params = new HashMap<>();
            String json = getJson(path, params);

            try {
                Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
                return gson.fromJson(json, new TypeToken<ResultBean<ProductEstimate>>() {
                }.getType());
            } catch (JsonSyntaxException e) {
                AppLogger.e(e.getMessage(), e);
                ResultBean bean = ResultBean.readingFailed();
                return new ResultBean(bean.isOk(), bean.getDesc());
            }
        } catch (ServiceException e) {
            AppLogger.e("provide_estimate store_id="+ store_id + ", day=" + day, e);
            return ResultBean.readingFailed();
        }
    }

    public Pair<ArrayList<StorageItem>, StoreStatusStat> getStorageItems(Long storeId, int filter,
                                                                         Tag tag, String sortBy, String term) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        ArrayList<StorageItem> storageItems = new ArrayList<>();
        try {
            if (tag != null) {
                params.put("tag_id", String.valueOf(tag.getId()));
            }
            if (!TextUtils.isEmpty(sortBy)) {
                params.put("sort_by", sortBy);
            }
            params.put("sale_price", "1");
            params.put("search_word", term);
            String url = String.format("/list_store_storage_status/0/%d/%d", storeId, filter);
            String json = getJson(url, params);
            AppLogger.i(url + " list_store_storage_status json result " + json);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();

            StorageStatusResults storagesMap;
            try {
                storagesMap = gson.fromJson(json, new TypeToken<StorageStatusResults>() {
                }.getType());
            } catch (JsonSyntaxException e) {
                throw new ServiceException(e.getMessage());
            }

            if (storagesMap == null || !storagesMap.isSuccess()) {
                String msg = storagesMap == null ? "请求失败" : storagesMap.getErrorAlert();
                throw new ServiceException(msg);
            }

            if (storagesMap.getStore_products() != null) {

                StorageStatusResults.ExtPrice ep = storagesMap.getExt_price();
                HashMap<Integer, Integer> plOfExt = ep == null ? null : ep.getExt_store();
                HashMap<Integer, List<StorageStatusResults.WMPrice>> mapOfPids = ep == null ? null : ep.getWmPricesOfPid();

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
                    si.setSupplyPrice(sp.getSupply_price());
                    si.setShelfNo(sp.getShelf_no());
                    si.setExpect_check_time(sp.getExpect_check_time());
                    si.setApplyingPrice(sp.getApplying_price());
                    si.setSold_latest(sp.getSold_latest());
                    si.setRefer_prod_id(sp.getRefer_prod_id());
                    si.setOccupy(sp.getOccupy());
                    HashMap<Integer, Product> products = storagesMap.getProducts();
                    Product pd = products.get(sp.getProduct_id());
                    if (pd != null) {
                        si.setName(pd.getName());
                        si.setTag_code(pd.getTag_code());
                        si.setThumbPicUrl(to_full_path(pd.getCoverimg()));
                        si.setSkuUnit(pd.getSku_unit());
                        si.setWeight(pd.getWeight());
                    }

                    if (mapOfPids != null && plOfExt != null) {
                        List<StorageStatusResults.WMPrice> prices = mapOfPids.get(sp.getProduct_id());
                        if (prices != null) {
                            for (StorageStatusResults.WMPrice p : prices) {
                                Integer pl = plOfExt.get(p.getExt_store_id());
                                if (!si.getWm().containsKey(pl)) {
                                    si.getWm().put(pl, p);
                                }
                            }
                        }
                    }
                    storageItems.add(si);
                }
            }
            StoreStatusStat stats = storagesMap.stats;
            if (stats != null) {
                stats.setTotal_req_cnt(storagesMap.getTotal_req_cnt());
            }

            return new Pair<>(storageItems, stats);
        } catch (JsonSyntaxException e) {
            AppLogger.e("[getStorageItems] json syntax error:" + e.getMessage(), e);
            CrashReportHelper.handleUncaughtException(Thread.currentThread(), e);
            return new Pair<>(storageItems, new StoreStatusStat());
        }
    }

    private String to_full_path(String coverImg) {
        if (coverImg != null && coverImg.startsWith("//")) {
            return "https:" + coverImg;
        } else {
            return coverImg;
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