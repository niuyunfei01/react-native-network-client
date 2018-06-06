package cn.cainiaoshicai.crm.dao;

import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.Map;

import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

public class StoreDao<T> {

    public ResultBean<T> getNewOrderCnt(String accessToken, String storeId) throws ServiceException {
        Map<String, String> params = Maps.newHashMap();
        params.put("access_token", accessToken);
        String url = URLHelper.API_ROOT() + "/store_to_ready_order_cnt/" + storeId + ".json";
        String result = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, params);
        Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
        Type t = new TypeToken<ResultBean<Map<String, String>>>() {
        }.getType();
        try {
            return gson.fromJson(result, t);
        } catch (Exception e) {
            AppLogger.e(e.getMessage(), e);
            return ResultBean.readingFailed();
        }
    }
}
