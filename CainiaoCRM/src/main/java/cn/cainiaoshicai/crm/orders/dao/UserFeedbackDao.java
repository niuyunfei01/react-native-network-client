package cn.cainiaoshicai.crm.orders.dao;

import android.support.annotation.Nullable;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.orders.domain.DadaCancelReason;
import cn.cainiaoshicai.crm.orders.domain.Feedback;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.domain.ResultList;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Date: 13-2-14
 */
public class UserFeedbackDao {

    private String getJson(String pathSuffix, HashMap<String, String> params) throws ServiceException {
        String url = URLHelper.API_ROOT + pathSuffix + ".json" ;

        Map<String, String> map = new HashMap<String, String>();
        map.put("access_token", access_token);
        map.putAll(params);
        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
    }

    @Nullable
    private ResultBean actionWithResult(Cts.Platform platform, String platformId, String pathSuffix,
                                        HashMap<String, String> params) throws ServiceException {
        String path = pathSuffix + "/" + platform.id + "/" + platformId;
        return actionWithResult(path, params);
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
    public UserFeedbackDao(String access_token) {
        this.access_token = access_token;
    }

    public ResultList<Feedback> getFeedbackList(int startId) {
        try {
            String json = getJson("/fb_list/" + startId, new HashMap<String, String>());
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ResultList<Feedback>>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage(), e);
        } catch (Exception e) {
            AppLogger.e("exception to get getDadaCancelReasons:" + e.getMessage(), e);
        }

        return null;
    }

    public ResultBean saveFeedbackForOrder(int orderId, String feedback_source, String content) throws ServiceException {
        HashMap<String, String> params = new HashMap<>();
        params.put("fb_source", feedback_source);
        params.put("fb_c", content);
        return actionWithResult("/fb_new_by_order/" + orderId, params);
    }

    public Feedback getFeedback(Integer feedbackId) {
        return null;
    }
}
