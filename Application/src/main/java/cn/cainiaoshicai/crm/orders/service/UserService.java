package cn.cainiaoshicai.crm.orders.service;

import android.content.Context;
import android.util.Log;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.orders.dao.URLHelper;
import cn.cainiaoshicai.crm.orders.dao.UserDao;
import cn.cainiaoshicai.crm.orders.domain.ApiInvokeResult;
import cn.cainiaoshicai.crm.orders.domain.LoginResult;
import cn.cainiaoshicai.crm.orders.domain.User;

/**
 */
public class UserService {

    public static final String TAG = UserService.class.getSimpleName();

    private UserDao userDao;

    public UserService(Context context) {
        userDao = new UserDao(context);
    }

    public User getCurrUser() {
        if (isLoggedIn()) {
            User u = userDao.getUser();
            if (u.getId() != null && !u.getId().equals(""))
                return u;
        }

        return null;
    }

    public User login(String email, String password) {
        final String url = String.format(URLHelper.API_ROOT + "/login?email=%s&password=%s&ver=1", email.trim(), password);
        HttpHeaders requestHeaders = getHttpHeaders();

        HttpEntity<?> requestEntity = new HttpEntity<Object>(requestHeaders);
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(new MappingJackson2HttpMessageConverter2());

        ResponseEntity<LoginResult> responseEntity = null;
        try {
            responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity,
                    LoginResult.class);

            Log.d(GlobalCtx.ORDERS_TAG, "LoginResult:" + responseEntity.getBody());

            User u = responseEntity.getBody().getUser();
            if (responseEntity.getBody().getSuccess() == 1
                    && u != null
                    && email.trim().equals(u.getEmail())) {
                userDao.addUser(u);
                return u;
            }
        } catch (RestClientException e) {
            Log.e(GlobalCtx.ORDERS_TAG, "failed to post login ", e);
        }

        return null;
    }

    public User register(String name, String email, String password) {
        final String url = String.format(URLHelper.API_ROOT + "/register?name=%s&email=%s&password=%s",
                name.trim(), email.trim(), password);
        HttpHeaders requestHeaders = getHttpHeaders();

        HttpEntity<?> requestEntity = new HttpEntity<Object>(requestHeaders);
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(new MappingJackson2HttpMessageConverter2());

        ResponseEntity<LoginResult> responseEntity = null;
        try {
            responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity,
                    LoginResult.class);

            Log.d(TAG, "RegisterResult:" + responseEntity.getBody());

            User u = responseEntity.getBody().getUser();
            if (responseEntity.getBody().getSuccess() == 1
                    && u != null
                    && email.trim().equals(u.getEmail())) {
                userDao.addUser(u);
                return u;
            }
        } catch (RestClientException e) {
            Log.e(TAG, "failed to post register ", e);
        }

        return null;
    }

    public void pushRegister(String pushUserId, String pushChannelId) {
        User user = userDao.getUser();
        String userId = user.getId();

        final String url = String.format(URLHelper.API_ROOT + "/push_register?userId=%s&pushUserId=%s&pushChannelId=%s",
                userId, pushUserId.trim(), pushChannelId.trim());
        HttpHeaders requestHeaders = getHttpHeaders();

        HttpEntity<?> requestEntity = new HttpEntity<Object>(requestHeaders);
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(new MappingJackson2HttpMessageConverter2());

        ResponseEntity<ApiInvokeResult> responseEntity = null;
        try {
            responseEntity = restTemplate.exchange(url, HttpMethod.POST, requestEntity,
                    ApiInvokeResult.class);

            Log.d(TAG, "ApiInvokeResult:" + responseEntity.getBody());
        } catch (RestClientException e) {
            Log.e(TAG, "failed to post push register ", e);
        }
    }

    private HttpHeaders getHttpHeaders() {
        HttpHeaders requestHeaders = new HttpHeaders();
        List<MediaType> acceptableMediaTypes = new ArrayList<MediaType>();
        acceptableMediaTypes.add(MediaType.APPLICATION_JSON);
        requestHeaders.setAccept(acceptableMediaTypes);
        return requestHeaders;
    }

    public boolean isLoggedIn() {
        int count = userDao.getRowCount();
        return count > 0;
    }

    public boolean logout() {
        userDao.resetTables();
        return true;
    }
}
