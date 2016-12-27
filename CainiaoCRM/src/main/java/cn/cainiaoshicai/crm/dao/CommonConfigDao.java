package cn.cainiaoshicai.crm.dao;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.Tag;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 * Created by liuzhr on 4/12/16.
 */
public class CommonConfigDao {

    private String access_token;

    public CommonConfigDao(String access_token) {
        this.access_token = access_token;
    }

    public Config get() throws ServiceException {
        String url = URLHelper.API_ROOT() + "/common_config.json" ;

        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);

        String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);

        AppLogger.v("userTalkStatus common config:" + json);

        Config value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<Config>() {}.getType());
        } catch (Exception e) {
            AppLogger.e(e.getMessage(), e);
        }

        return value;
    }

    public LinkedHashMap<Integer, Store> listStores() throws ServiceException {
        String url = URLHelper.API_ROOT() + "/list_store.json" ;

        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);

        String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);

        AppLogger.v("list stores:" + json);

        LinkedHashMap<Integer, Store> value = null;
        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            value = gson.fromJson(json, new TypeToken<LinkedHashMap<Integer, Store>>() {}.getType());
        } catch (Exception e) {
            AppLogger.e(e.getMessage(), e);
        }

        return value;
    }

    public ArrayList<Tag> getTags() throws ServiceException {
        Map<String, String> map = new HashMap<>();
        map.put("access_token", access_token);

        try {
            String url = URLHelper.API_ROOT() + "/list_tags.json";
            String json = HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            return gson.fromJson(json, new TypeToken<ArrayList<Tag>>() {
            }.getType());
        } catch (JsonSyntaxException e) {
            AppLogger.e("[getTags] json syntax error:" + e.getMessage(), e);
            return new ArrayList<>(0);
        }
    }


    static public class Config {
        private SortedMap<Integer, Worker> workers;
        private String[] delayReasons;
        private HashMap<String, String> configUrls;

        public Config(SortedMap<Integer, Worker> workers, String[] delayReasons, HashMap<String, String> configUrls) {
            this.workers = workers;
            this.delayReasons = delayReasons;
            this.configUrls = configUrls;
        }

        public SortedMap<Integer, Worker> getWorkers() {
            return workers;
        }

        public String[] getDelayReasons() {
            return delayReasons;
        }

        public HashMap<String, String> getConfigUrls() {
            return configUrls;
        }
    }

    static public class Worker {
        private String nickname;
        private String mobilephone;
        private int id;
        private int position;
        private int[] pos_list;

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

        public int getPosition() {
            return position;
        }

        public void setPosition(int position) {
            this.position = position;
        }

        public boolean isExtShipWorker() {
            return this.getPosition() == Cts.POSITION_EXT_SHIP;
        }

        public int[] getPos_list() {
            return pos_list;
        }

        public void setPos_list(int[] pos_list) {
            this.pos_list = pos_list;
        }
    }



}
