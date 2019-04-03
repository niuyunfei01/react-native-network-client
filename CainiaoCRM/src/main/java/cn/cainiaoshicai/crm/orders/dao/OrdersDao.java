package cn.cainiaoshicai.crm.orders.dao;

import android.support.annotation.Nullable;
import android.text.TextUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;


import java.util.HashMap;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.orders.util.TextUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 */
public class OrdersDao {

    private long[] storeIds;

    public static void main(String[] args) {
        String json = "{\"orders\":[" +
                "{\"id\":\"574784\",\"dayId\":\"0\",\"platform_oid\":\"700267896000021\",\"orderTime\":\"2017-01-04 02:24:56\",\"platform\":\"6\"," +
                "\"expectTime\":\"2017-01-04 15:30:00\",\"orderStatus\":\"1\",\"orderMoney\":\"50.3\",\"mobile\":\"15911132211\"," +
                "\"userName\":\"\\u738b\\u4f0a\\u5b81\",\"address\":\"\\u5317\\u4eac\\u5e02\\u671d\\u9633\\u533a\\u4e3d\\u90fd\\u58f9\\u53f73\\u53f7\\u697c5\\u5355\\u51431902\"," +
                "\"remark\":\"\\u6240\\u8d2d\\u5546\\u54c1\\u5982\\u9047\\u7f3a\\u8d27\\uff0c\\u60a8\\u9700\\u8981\\uff1a\\u5176\\u5b83\\u5546\\u54c1\\u7ee7\\u7eed\\u914d\\u9001\\uff08\\u7f3a\\u8d27\\u5546\\u54c1\\u9000\\u6b3e\\uff09\"," +
                "\"platform_dayId\":\"0\",\"last_sync\":\"2017-01-04 07:00:01\",\"last_sync_by\":\"jd_client\",\"time_ready\":\"2017-01-04 09:02:19\"," +
                "\"time_start_ship\":\"2017-01-04 09:19:06\",\"time_arrived\":null,\"store_remark\":\"\",\"ship_worker_id\":null,\"pack_done_logger\":\"0\"," +
                "\"ship_start_logger\":\"0\",\"pack_operator\":null,\"delay_reason\":null,\"ship_arrived_logger\":\"0\",\"deleted\":\"0\",\"store_id\":\"3\"," +
                "\"invalid_reason\":\"\",\"set_invalid_operator\":\"0\",\"order_times\":\"1\",\"paid_done\":\"1\",\"street_block\":\"\\u4e3d\\u90fd\\u58f9\\u53f7\"," +
                "\"is_right_once\":\"0\",\"review_deliver\":\"0\",\"review_quality\":\"0\",\"print_times\":\"1\",\"created\":\"2017-01-04 07:00:01\"," +
                "\"modified\":\"2017-01-04 09:20:02\",\"ship_money\":\"0\",\"ship_score\":\"0\",\"ship_spent_min\":\"0\",\"ship_review\":\"0\"," +
                "\"should_re_update\":\"0\",\"dada_status\":\"0\",\"dada_call_at\":\"1970-01-01 00:00:00\",\"dada_distance\":\"0\",\"dada_order_id\":\"0\"," +
                "\"dada_fee\":\"0\",\"dada_id\":\"0\",\"dada_mobile\":\"\",\"dada_dm_name\":\"\",\"dada_update_time\":\"0\",\"user_id\":\"825104\"," +
                "\"paid_by_user\":\"50.3\",\"final_price\":\"0\",\"invoice\":\"\",\"invoice_amount\":\"0\",\"fee_data\":\"[]\",\"ext_store_id\":\"15\"," +
                "\"score_talk\":\"-1\",\"jd_ship_worker_name\":\"\\u674e\\u6b22\\u6b22\",\"jd_ship_worker_mobile\":\"15011216760\",\"expectTimeStr\":\"01\\u670804\\u65e5 15:30\"," +
                "\"ship_worker_name\":null,\"showReadyDelay\":false,\"readyLeftMin\":124,\"direction\":\"\\u672a\\u77e5\"}]," +
                "\"params\":{\"status\":1}," +
                "\"totals\":[\"1\",\"1\",\"1\",\"1\",\"594\",\"18\"]}";

        new OrdersDao("").convert(json);
    }

    private String getJson(HashMap<String, String> params) throws ServiceException {
        String url = URLHelper.API_ROOT() + "/orders.json" ;
        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, params);
    }

    public OrderContainer get(int listType, long[] storeIds) throws ServiceException {
        return this.get(listType, storeIds, true, 0, 0, 0);
    }

    public OrderContainer get(int listType, long[] storeIds, boolean useCache, int limit, int offset, int maxPastDays) throws ServiceException {
        this.listType = listType;
        this.storeIds = storeIds;

        boolean hasStores = this.storeIds != null && this.storeIds.length > 0;
        String cacheKey = null;
        if (useCache && hasStores) {
            cacheKey = SettingUtility.key_order_list(listType, storeIds);
            OrderContainer value = SettingUtility.getSR(cacheKey, new TypeToken<OrderContainer>(){}.getType());
            if (value != null) {
                return value;
            }
        }

        HashMap<String, String> map = new HashMap<>();
        map.put("access_token", access_token);
        map.put("limit", String.valueOf(limit));
        map.put("offset", String.valueOf(offset));
        map.put("status", String.valueOf(this.listType));
        map.put("max_past_day", String.valueOf(maxPastDays));

        String store_id_str = TextUtil.join(",", storeIds);
        if (hasStores) {
            map.put("search", "store:" + store_id_str);
        }

        OrderContainer oc = convert(getJson(map));
        if (useCache && hasStores && oc != null && listType != ListType.DONE.getValue()) {
            SettingUtility.putOrderContainerCache(cacheKey, oc);
        }
        return oc;
    }

    @Nullable
    private OrderContainer convert(String json) {
        OrderContainer value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<OrderContainer>() {}.getType());

            if (value != null) {
                GlobalCtx.app().setTaskCount(value.getTotal_task_mine());
            }
        } catch (Exception e) {
            AppLogger.e(e.getMessage(), e);

            if (e instanceof JsonSyntaxException) {
                AppLogger.e("json:" + json);
            }
        }

        return value;
    }

    private String access_token;
    private int listType;

    public OrdersDao(String access_token) {
        this.access_token = access_token;
    }

    public OrderContainer search(String searchTerm, int listType, long[] storeIds, int limit, int offset)
            throws ServiceException{
        return this.search(searchTerm, listType, storeIds, limit, offset, 0);
    }

    public OrderContainer search(String searchTerm, int listType, long[] storeIds, int limit, int offset, int maxPastDays)
            throws ServiceException {
        this.listType = listType;
        this.storeIds = storeIds;

        HashMap<String, String> map = new HashMap<String, String>();
        map.put("access_token", access_token);
        map.put("status", String.valueOf(this.listType));
        map.put("limit", String.valueOf(limit));
        map.put("offset", String.valueOf(offset));
        map.put("max_past_day", String.valueOf(maxPastDays));

        String store_id_str = TextUtil.join(",", storeIds);
        if (storeIds != null && storeIds.length > 0 ) {
            if (!TextUtils.isEmpty(searchTerm)) {
                searchTerm += "|||store:" + store_id_str;
            } else {
                searchTerm = store_id_str;
            }
        }

        if (!TextUtils.isEmpty(searchTerm)) {
            map.put("search", searchTerm);
        }

        return convert(getJson(map));
    }
}
