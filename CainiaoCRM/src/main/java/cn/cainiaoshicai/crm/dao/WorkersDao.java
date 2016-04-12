package cn.cainiaoshicai.crm.dao;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.util.HashMap;
import java.util.Map;

import cn.cainiaoshicai.crm.orders.dao.URLHelper;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Created by liuzhr on 4/12/16.
 */
public class WorkersDao {

    private String access_token;

    public WorkersDao(String access_token) {
        this.access_token = access_token;
    }

    public HashMap<Integer, Worker> get() throws ServiceException {
        String url = URLHelper.API_ROOT + "/get_workers.json" ;

        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);

        String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);

        AppLogger.v("get wokers:" + json);

        HashMap<Integer, Worker> value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<HashMap<Integer, Worker>>() {}.getType());
        } catch (Exception e) {
            AppLogger.e(e.getMessage(), e);
        }

        return value;
    }

    static public class Worker {
        private String nickname;
        private String mobilephone;
        private int id;

        public Worker(String nickname, String mobilephone, int userId) {
            this.nickname = nickname;
            this.mobilephone = mobilephone;
            this.id = userId;
        }

        public String getNickname() {
            return nickname;
        }

        public void setNickname(String nickname) {
            this.nickname = nickname;
        }

        public String getMobilephone() {
            return mobilephone;
        }

        public void setMobilephone(String mobilephone) {
            this.mobilephone = mobilephone;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }
    }



}
