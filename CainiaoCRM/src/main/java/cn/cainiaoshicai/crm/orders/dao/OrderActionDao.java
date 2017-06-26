package cn.cainiaoshicai.crm.orders.dao;

import android.support.annotation.Nullable;
import android.text.TextUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.orders.domain.DadaCancelReason;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

import static cn.cainiaoshicai.crm.ListType.ARRIVED;
import static cn.cainiaoshicai.crm.ListType.WAITING_ARRIVE;
import static cn.cainiaoshicai.crm.ListType.WAITING_READY;
import static cn.cainiaoshicai.crm.ListType.WAITING_SENT;

/**
 * Date: 13-2-14
 */
public class OrderActionDao<T extends Order> {

    private String getJson(String pathSuffix, HashMap<String, String> params) throws ServiceException {
        String url = URLHelper.API_ROOT() + pathSuffix + ".json" ;

        Map<String, String> map = new HashMap<String, String>();
        map.put("access_token", access_token);
        map.putAll(params);
        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
    }

    public ResultBean<T> startShip(long orderId, int ship_worker_id) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("worker_id", String.valueOf(ship_worker_id));
        return invalidListRequired(actionWithResult("/order_start_ship_by_id/" + orderId, params),
                new ListType[]{WAITING_SENT, WAITING_ARRIVE});
    }

    public ResultBean<T> setArrived(long orderId) throws ServiceException {
        return invalidListRequired(actionWithResult("/order_set_arrived_by_id/" + orderId),
                new ListType[]{WAITING_ARRIVE, ARRIVED});
    }

    public ResultBean<T> setReady(long orderId, List<Integer> workerIds) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("worker_id", TextUtils.join(",", workerIds));
        return invalidListRequired(actionWithResult("/order_set_ready_by_id/" + orderId, params),
                new ListType[]{WAITING_READY, WAITING_SENT});
    }

    @Nullable
    private ResultBean actionWithResult(Cts.Platform platform, String platformId, String pathSuffix,
                                        HashMap<String, String> params) throws ServiceException {
        String path = pathSuffix + "/" + platform.id + "/" + platformId;
        return actionWithResult(path, params);
    }

    @Nullable
    private ResultBean<T> actionWithResult(String path) throws ServiceException {
        return actionWithResult(path, new HashMap<String, String>());
    }

    private ResultBean<T> actionWithResult(String path, HashMap<String, String> params) throws ServiceException {
        if (params == null) {
            params = new HashMap<>();
        }

        String json = getJson(path, params);

        AppLogger.v("action" + path + ":" + json);

        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            Type type2 = new TypeToken<ResultBean<Order>>(){}.getType();
            return gson.fromJson(json, type2);
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

    public ResultBean setOrderInvalid(int orderId, int currStatus) throws ServiceException {
        return invalidListRequired(actionWithResult("/order_set_invalid/"+orderId),
                new ListType[]{ListType.findByType(currStatus), ListType.INVALID});
    }

    private ResultBean<T> invalidListRequired(ResultBean<T> resultBean, ListType[] affected) {
        if (resultBean.isOk() && affected != null && affected.length > 0) {
            for(ListType type : affected) {
                SettingUtility.removeOrderContainerCache(type);
            }
        }

        return resultBean;
    }

    private ResultBean<T> wrapUpdateOrder(ResultBean<T> resultBean, long orderId) {
        if (resultBean.isOk() && resultBean.getObj() != null) {
            SettingUtility.updateOCCache(orderId, resultBean.getObj());
        }

        return resultBean;
    }

    public ResultBean logOrderPrinted(int orderId) throws ServiceException {
        return actionWithResult("/order_log_print/"+orderId, new HashMap<String, String>());
    }

    public ResultBean chg_ship_worker(int orderId, int oldWorker, List<Integer> newWorker) throws ServiceException {
        return actionWithResult("/order_chg_ship_worker/" + orderId + "/" + oldWorker + "/" + TextUtils.join(",", newWorker));
    }

    public ResultBean order_chg_pack_worker(int orderId, int oldWorker, List<Integer> newWorker) throws ServiceException {
        return actionWithResult("/order_chg_pack_worker/" + orderId + "/" + oldWorker + "/" + TextUtils.join(",", newWorker));
    }

    public ResultBean genCoupon(int type, int orderId) throws ServiceException {
//        gen_coupon($type, $bind_mobile, $wm_order_id = 0, $to_uid = 0)
        return actionWithResult("/gen_coupon_wm/" + type + "/" + orderId);
    }

    public ResultBean coupon_by_kf(int to_uid, int orderId, String message, int reduce, int least) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("kf_message", message);
        params.put("reduce_price", String.valueOf(reduce));
        params.put("least_price", String.valueOf(least));
        return actionWithResult("/coupon_by_kf/" + to_uid + "/" + orderId, params);
    }

    public ResultBean order_dada_start(int orderId) throws ServiceException {
        return wrapUpdateOrder(actionWithResult("/order_dada_start/" + orderId), orderId);
    }
    public ResultBean order_dada_restart(int orderId) throws ServiceException {
        return actionWithResult("/order_dada_restart/" + orderId);
    }

    public ResultBean order_dada_cancel(int orderId, int cancelReason, String reasonTxt) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("cancel_reason", reasonTxt);
        return actionWithResult("/order_dada_cancel/" + orderId + "/" + cancelReason , params);
    }

    public ResultBean orderDadaQuery(int orderId) throws ServiceException {
        return actionWithResult("/order_dada_query/" + orderId);
    }

    public ResultBean orderChgStore(int orderId, long storeId, long oldStoreId, int status) throws ServiceException {
        String path = String.format("/order_chg_store/%d/%d/%d", orderId, storeId, oldStoreId);
        return invalidListRequired(actionWithResult(path), new ListType[]{ListType.findByType(status)});
    }

    public ResultBean order_chg_arrived_time(int orderId, Date old_arrived, Date new_arrived) throws ServiceException {
        int newTimeInSec = (int) (new_arrived.getTime() / 1000);
        int oldTimeInSec = (int) (old_arrived.getTime() / 1000);
        String path = String.format("/order_chg_arrived_time/%d/%d/%d", orderId, newTimeInSec, oldTimeInSec);
        return actionWithResult(path);
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
        return wrapUpdateOrder(actionWithResult("/order_edit_group/" + orderId + "/" + shipSch, params), orderId);
    }
}
