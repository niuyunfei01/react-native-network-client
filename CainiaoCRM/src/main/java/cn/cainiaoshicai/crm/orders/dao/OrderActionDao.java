package cn.cainiaoshicai.crm.orders.dao;

import android.support.annotation.Nullable;
import android.text.TextUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.orders.domain.DadaCancelReason;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Date: 13-2-14
 */
public class OrderActionDao {

    private String getJson(String pathSuffix, HashMap<String, String> params) throws ServiceException {
        String url = URLHelper.API_ROOT() + pathSuffix + ".json" ;

        Map<String, String> map = new HashMap<String, String>();
        map.put("access_token", access_token);
        map.putAll(params);
        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
    }

    public ResultBean startShip(Cts.Platform platform, String platformId, int ship_worker_id) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("worker_id", String.valueOf(ship_worker_id));
        return actionWithResult(platform, platformId, "/order_start_ship", params);
    }

    public ResultBean setArrived(Cts.Platform platform, String platform_oid) throws ServiceException {
        return actionWithResult(platform, platform_oid, "/order_set_arrived", new HashMap<String, String>());
    }

    public ResultBean setReady(Cts.Platform platform, String platform_oid, List<Integer> workerIds) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("worker_id", TextUtils.join(",", workerIds));
        return actionWithResult(platform, platform_oid, "/order_set_ready", params);
    }

    @Nullable
    private ResultBean actionWithResult(Cts.Platform platform, String platformId, String pathSuffix,
                                        HashMap<String, String> params) throws ServiceException {
        String path = pathSuffix + "/" + platform.id + "/" + platformId;
        return actionWithResult(path, params);
    }

    @Nullable
    private ResultBean actionWithResult(String path) throws ServiceException {

        return  actionWithResult(path, new HashMap<String, String>());

    }

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
    public OrderActionDao(String access_token) {
        this.access_token = access_token;
    }

    public ResultBean confirmAccepted(Cts.Platform platform, String platformOid) throws ServiceException {
        return actionWithResult(platform, platformOid, "/order_confirm_accepted", null);
    }

    public ResultBean saveDelayReason(Cts.Platform platform, String platformOid, HashMap<String, String> params) throws ServiceException {
        return actionWithResult(platform, platformOid, "/save_order_delay_reason", params);
    }

    public Order getOrder(int platform, String platformOid) {
        return _order("/order/" + platform + "/" + platformOid);
    }

    public Order getOrder(int orderId) {
        return _order("/order_by_id/" + orderId);
    }

    private Order _order(String path) {
        try {
            String json = getJson(path, new HashMap<String, String>());
            AppLogger.v("action: order " + json);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<Order>() {}.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
        } catch (ServiceException e) {
            AppLogger.e("exception to userTalkStatus order:" + e.getMessage(), e);
        }

        return null;
    }

    public List<DadaCancelReason> getDadaCancelReasons(int orderId) {
        try {
            String json = getJson("/order_dada_cancel_reasons/" + orderId, new HashMap<String, String>());
            AppLogger.v("action: getDadaCancelReasons " + json);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<List<DadaCancelReason>>() {}.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
        } catch (ServiceException e) {
            AppLogger.e("exception to userTalkStatus getDadaCancelReasons:" + e.getMessage(), e);
        }

        return null;
    }

    public ResultBean setOrderInvalid(int orderId) throws ServiceException {
        return actionWithResult("/order_set_invalid/"+orderId, new HashMap<String, String>());
    }

    public ResultBean logOrderPrinted(int orderId) throws ServiceException {
        return actionWithResult("/order_log_print/"+orderId, new HashMap<String, String>());
    }

    public ResultBean chg_ship_worker(int orderId, int oldWorker, List<Integer> newWorker) throws ServiceException {
        return actionWithResult("/order_chg_ship_worker/" + orderId + "/" + oldWorker + "/" + TextUtils.join(",", newWorker), new HashMap<String, String>());
    }

    public ResultBean order_chg_pack_worker(int orderId, int oldWorker, List<Integer> newWorker) throws ServiceException {
        return actionWithResult("/order_chg_pack_worker/" + orderId + "/" + oldWorker + "/" + TextUtils.join(",", newWorker), new HashMap<String, String>());
    }

    public ResultBean genCoupon(int type, int orderId) throws ServiceException {
//        gen_coupon($type, $bind_mobile, $wm_order_id = 0, $to_uid = 0)
        return actionWithResult("/gen_coupon_wm/" + type + "/" + orderId, new HashMap<String, String>());
    }

    public ResultBean coupon_by_kf(int to_uid, int orderId, String message, int reduce, int least) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("kf_message", message);
        params.put("reduce_price", String.valueOf(reduce));
        params.put("least_price", String.valueOf(least));
        return actionWithResult("/coupon_by_kf/" + to_uid + "/" + orderId, params);
    }

    public ResultBean order_dada_start(int orderId) throws ServiceException {
        return actionWithResult("/order_dada_start/" + orderId, new HashMap<String, String>());
    }
    public ResultBean order_dada_restart(int orderId) throws ServiceException {
        return actionWithResult("/order_dada_restart/" + orderId, new HashMap<String, String>());
    }

    public ResultBean order_dada_cancel(int orderId, int cancelReason, String reasonTxt) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("cancel_reason", reasonTxt);
        return actionWithResult("/order_dada_cancel/" + orderId + "/" + cancelReason , params);
    }

    public ResultBean orderDadaQuery(int orderId) throws ServiceException {
        return actionWithResult("/order_dada_query/" + orderId, new HashMap<String, String>());
    }

    public ResultBean orderChgStore(int orderId, int storeId, int oldStoreId) throws ServiceException {
        return actionWithResult(String.format("/order_chg_store/%d/%d/%d", orderId, storeId, oldStoreId), new HashMap<String, String>());
    }

    public ResultBean order_chg_arrived_time(int orderId, Date old_arrived, Date new_arrived) throws ServiceException {
        int newTimeInSec = (int) (new_arrived.getTime() / 1000);
        int oldTimeInSec = (int) (old_arrived.getTime() / 1000);
        String path = String.format("/order_chg_arrived_time/%d/%d/%d", orderId, newTimeInSec, oldTimeInSec);
        return actionWithResult(path, new HashMap<String, String>());
    }

    public ResultBean save_remark(int orderId, String remarkTxt) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("store_remark", remarkTxt);
        return actionWithResult("/order_edit_store_remark/" + orderId, params);
    }

    public ResultBean order_waiting_list(int orderId, String taskType) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("task_type", taskType);
        return actionWithResult("/order_waiting_list/" + orderId, params);
    }

    public ResultBean order_edit_group(long orderId, String shipSch, String currentSch) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("current", currentSch);
        return actionWithResult("/order_edit_group/" + orderId + "/" + shipSch, params);
    }
}
