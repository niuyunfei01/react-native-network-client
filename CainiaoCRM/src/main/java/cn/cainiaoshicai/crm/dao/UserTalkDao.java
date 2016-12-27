package cn.cainiaoshicai.crm.dao;

import android.support.annotation.Nullable;
import android.util.Log;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.HashMap;
import java.util.Map;

import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Created by liuzhr on 9/30/16.
 */
public class UserTalkDao implements IUserTalkDao {

    private String post(String method, Map<String, String> params) throws ServiceException {
        String url = URLHelper.API_ROOT() + "/" + method + ".json";
        params.put("access_token", access_token);
        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, params);
    }

    @Override
    public UserTalk userTalkStatus(String openid, int uid, long latestTime, int limit) throws ServiceException {
        String method = "weixin_talks";

        Map<String, String> params = new HashMap<>();
        params.put("openid", openid);
        params.put("uid", String.valueOf(uid));
        params.put("endtime", String.valueOf(latestTime));
        params.put("limit", String.valueOf(limit));
        return convert(post(String.format("%s/%s/%d/%d/%d", method, openid, uid, latestTime, limit), params));
    }

    @Override
    public void talk_reply_text(String id, String currentClientId, String content) {

    }

    @Nullable
    private UserTalk convert(String json) {

        UserTalkBean value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<UserTalkBean>() {}.getType());
        } catch (Exception e) {
            Log.e("crm", e.getMessage(), e);

            if (e instanceof JsonSyntaxException) {
                Log.e("crm", "json:" + json);
            }
        }

        return value != null ? value.talk : null;
    }

    private String access_token;

    public UserTalkDao(String access_token) {
        this.access_token = access_token;
    }

    class UserTalkBean extends ResultBean {

        private UserTalk talk;

        public UserTalkBean(boolean b, String desc) {
            super(b, desc);
        }
    }
}
