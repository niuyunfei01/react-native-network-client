package cn.cainiaoshicai.crm.dao;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

import java.util.HashMap;
import java.util.Map;

import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.http.HttpMethod;
import cn.cainiaoshicai.crm.support.http.HttpUtility;

/**
 */
public class OauthTokenDao {

    private String getJson(String username, String password) throws ServiceException {
        String url = URLHelper.OAUTH2_TOKEN;

        Map<String, String> map = new HashMap<String, String>();
        map.put("grant_type", "password");
        map.put("client_id", "NTQ5NTE5MGViMTgzMDUw");
        map.put("username", username);
        map.put("password", password);

        return HttpUtility.getInstance().executeNormalTask(HttpMethod.Get, url, map);
    }

    public LoginResult login(String username, String password) throws ServiceException {
        String json = getJson(username, password);
        AppLogger.v("login:" + json);

        try {
            Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
            //password error
//            {
//                "error": "invalid_grant"
//            }
            //client id invalid
//            {
//                "error":"invalid_client",
//                    "error_description":"The client credentials are invalid"
//            }
//          ok
//            {
//                "access_token": "781936e0ca4e3ce6fdb82818b3f430f0bbb50997",
//                    "expires_in": 1209600,
//                    "token_type": "bearer",
//                    "scope": null,
//                    "refresh_token": "3a6971e0e5fdb48790e6414d0f3f916449d011ce"
//            }

            return gson.fromJson(json, new TypeToken<LoginResult>() {}.getType());

        } catch (JsonSyntaxException e) {
            AppLogger.e(e.getMessage());
            return null;
        }
    }

    public OauthTokenDao() {
    }

    public static class LoginResult {
        private String error;
        private String access_token;
        private int expires_in;
        private String refresh_token;
        private String error_description;

        public String getError() {
            return error;
        }

        public String getAccess_token() {
            return access_token;
        }

        public int getExpires_in() {
            return expires_in;
        }

        public String getRefresh_token() {
            return refresh_token;
        }

        public String getError_description() {
            return error_description;
        }

        public boolean shouldRetry() {
            return "invalid_grant".equals(error);
        }

        public boolean loginOk(){
            return "".equals(error) || null == error;
        }
    }
}
