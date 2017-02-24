package cn.cainiaoshicai.crm.dao;

import android.support.annotation.Nullable;
import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.domain.ResultObject;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Created by liuzhr on 9/30/16.
 */
public class StaffDao {

    private String post(String method) throws ServiceException {
        return post(method, new HashMap<String, String>());
    }

    private String post(String method, Map<String, String> params) throws ServiceException {
        String url = URLHelper.API_ROOT() + "/" + method + ".json";
        params.put("access_token", access_token);
        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, params);
    }

    public ResultObject<HashMap<String, String>> sign_in(int storeId, HashMap<String, String> extraParams) throws ServiceException {
        return convert(post("sign_in/" + storeId, extraParams));
    }

    public ResultObject<HashMap<String, String>> sign_off(int storeId, HashMap<String, String> extraParams) throws ServiceException {
        return convert(post("sign_off/" + storeId, extraParams));
    }

    @Nullable
    private ResultObject<HashMap<String, String>> convert(String json) {

        ResultObject<HashMap<String, String>> value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<ResultObject<HashMap<String, String>>>() {}.getType());
        } catch (Exception e) {
            Log.e("crm", e.getMessage(), e);

            if (e instanceof JsonSyntaxException) {
                Log.e("crm", "json:" + json);
            }
        }

        return value;
    }

    @Nullable
    private ResultObject<HashMap<Integer, CommonConfigDao.Worker>> convertWorkers(String json) {

        ResultObject<HashMap<Integer, CommonConfigDao.Worker>> value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<ResultObject<HashMap<Integer, CommonConfigDao.Worker>>>() {}.getType());
        } catch (Exception e) {
            Log.e("crm", e.getMessage(), e);

            if (e instanceof JsonSyntaxException) {
                Log.e("crm", "json:" + json);
            }
        }

        return value;
    }

    private String access_token;

    public StaffDao(String access_token) {
        this.access_token = access_token;
    }

    public SortedMap<Integer,CommonConfigDao.Worker> getStoreTodayWorkers(int storeId) throws ServiceException {
        ResultObject<HashMap<Integer, CommonConfigDao.Worker>> workers = convertWorkers(post("store_day_workers/" + storeId));
        TreeMap<Integer, CommonConfigDao.Worker> rtn = new TreeMap<>();
        if (workers != null && workers.isOk() && workers.getObj() != null) {
            for(CommonConfigDao.Worker worker : workers.getObj().values()) {
                rtn.put(worker.getId(), worker);
            }
        }
        return rtn;
    }

    public int getTaskCount() throws ServiceException {
        String json = post("total_mine_task");
        ResultObject<HashMap<String, Integer>> value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<ResultObject<HashMap<String, Integer>>>() {}.getType());
        } catch (Exception e) {
            Log.e("crm", e.getMessage(), e);

            if (e instanceof JsonSyntaxException) {
                Log.e("crm", "json:" + json);
            }
        }

        boolean invalid = value == null || value.getObj() == null || value.getObj().get("total_mine_task") == null;
        return invalid ? 0 : value.getObj().get("total_mine_task");
    }
}
