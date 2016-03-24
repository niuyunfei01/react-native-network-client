package cn.cainiaoshicai.crm.orders.service;

import android.util.Log;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.orders.dao.URLHelper;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.orders.domain.PostNew;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;

public class OrderService {

    public ArrayList<Order> getOrders() {
        final String url = URLHelper.API_ROOT + "/orders?type=0";
        return getInternalPosts(url);
    }

    public ArrayList<Order> getOrders(Date orderDay, int orderStatus) {
        final String url = URLHelper.API_ROOT + "/orders/" + DateTimeUtils.shortYmd(orderDay) + "?status=" + orderStatus;
        return getInternalPosts(url);
    }

    public ArrayList<Order> getLatestPosts(int latestId) {
        final String url = URLHelper.API_ROOT + "/orders?type=1&currentId=" + latestId;
        return getInternalPosts(url);
    }

    public ArrayList<Order> getOldestPosts(int oldestId) {
        final String url = URLHelper.API_ROOT + "/orders?type=2&currentId=" + oldestId;
        return getInternalPosts(url);
    }

    private ArrayList<Order> getInternalPosts(String url) {
        Log.v(GlobalCtx.ORDERS_TAG, "try to get posts:" + url);
        try {
            ResponseEntity<OrderContainer> responseEntity = http(url, OrderContainer.class);
            if (responseEntity == null)
                return new ArrayList<>();

            OrderContainer resp = responseEntity.getBody();
//            GlobalCtx.getInstance().addCommentUidNames(resp.getBookedUidNames());
            return resp.getOrders();
//            ArrayList<Order> orders = new ArrayList<>();
//            Order order = new Order();
//            order.setArea("回龙观店");
//            order.setDayId("1");
//            order.setExpectTime(new Date());
//            order.setMobile("18910275329");
//            order.setReceivedTime(new Date());
//            order.setOrderMoney(300.0);
//            order.setAddress("龙景苑二区 30-3-301");
//            order.setUserName("张");
//            order.setGender(0);
//            orders.add(order);
//            orders.add(order);
//            return orders;
        } catch (RestClientException e) {
            Log.e(GlobalCtx.ORDERS_TAG, "get orders failed for url " + url, e);
            return new ArrayList<>();
        } catch (ServiceException e) {
            Log.e(GlobalCtx.ORDERS_TAG, "error to post service exception", e);
            return new ArrayList<>();
        }
    }
//
//    public boolean book(Post post) {
//
//        User u = GlobalCtx.getInstance().getCurrUser();
//
//        String params = String.format("postId=%s&food_owner_id=%s&food_owner_name=%s&userId=%s&userName=%s"
//                , post.getId(), post.getUserId(), post.getUserName(), u.getId(), u.getName());
//
//        String url = GlobalCtx.API_ROOT + "/book?" + params;
//
//        try {
//            ResponseEntity<OrderContainer> responseEntity = http(url, OrderContainer.class);
//            return responseEntity != null && GlobalCtx.isSucc(responseEntity.getBody().getSuccess());
//        } catch (Exception e) {
//            Log.e(GlobalCtx.ORDERS_TAG, "post failed:" + e.getMessage(), e);
//            return false;
//        }
//    }
//    public boolean undoBook(Post post) {
//
//        User u = GlobalCtx.getInstance().getCurrUser();
//
//        String params = String.format("postId=%s&userId=%s", post.getId(), u.getId());
//
//        String url = GlobalCtx.API_ROOT + "/undo-book?" + params;
//
//        try {
//            ResponseEntity<OrderContainer> responseEntity = http(url, OrderContainer.class);
//            return responseEntity != null && GlobalCtx.isSucc(responseEntity.getBody().getSuccess());
//        } catch (Exception e) {
//            Log.e(GlobalCtx.ORDERS_TAG, "post failed:" + e.getMessage(), e);
//            return false;
//        }
//    }

    public boolean postNew(String countStr, String eatDateStr, String nameStr, String descStr, String currUid, List<String> imgs) throws ServiceException {
        Log.d(GlobalCtx.ORDERS_TAG, String.format("postNew count=%s, eatDate=%s, name=%s, desc=%s, uid=%s"
                , countStr, eatDateStr, nameStr, descStr, currUid));

        String params = String.format("count=%s&eatDate=%s&name=%s&desc=%s&uid=%s", countStr, eatDateStr, nameStr, descStr, currUid);
        String url = URLHelper.API_ROOT + "/post?" + params;

        MultiValueMap<String, String> imgMap = new LinkedMultiValueMap<String, String>();;

        if (imgs != null && imgs.size()>0) {
            for(String img : imgs)
                imgMap.add("img[]", img);
        }

        ResponseEntity<PostNew> responseEntity = http(url, PostNew.class, imgMap);

        return responseEntity != null
                && GlobalCtx.isSucc(responseEntity.getBody().getSuccess())
                && responseEntity.getBody().getNewPostId()>0;
    }

    private <T> ResponseEntity<T> http(String url, Class<T> responseType) throws ServiceException {
        return this.http(url, responseType, null);
    }
    /**
     *
     * @param url
     * @param responseType
     * @param <T>
     * @return null if exception
     */
    private <T> ResponseEntity<T> http(String url, Class<T> responseType, MultiValueMap posts)
            throws ServiceException {

        Log.d(GlobalCtx.ORDERS_TAG, url);

        //TODO: url encoding for names
        HttpHeaders reqHead = new HttpHeaders();
        List<MediaType> acceptableMediaTypes = new ArrayList<MediaType>();
        acceptableMediaTypes.add(MediaType.APPLICATION_JSON);
        reqHead.setAccept(acceptableMediaTypes);

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory());
        restTemplate.getMessageConverters().add(new MappingJackson2HttpMessageConverter2());

        try {
            ResponseEntity<T> rtn;
            if (posts != null)  {
                reqHead.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
                restTemplate.getMessageConverters().add(new FormHttpMessageConverter());
                rtn = restTemplate.postForEntity(url, new HttpEntity<Object>(posts, reqHead), responseType);
            } else {
                HttpEntity<?> requestEntity = new HttpEntity<Object>(reqHead);
                rtn = restTemplate.exchange(url, HttpMethod.GET, requestEntity, responseType);
            }

            Log.d(GlobalCtx.ORDERS_TAG, "response:" + rtn);
            return rtn;
        }catch (HttpMessageNotReadableException e){
            Log.e(GlobalCtx.ORDERS_TAG, "Post service reading message exception", e);
            return null;
        } catch(Exception ex) {
            Log.e(GlobalCtx.ORDERS_TAG, "error to execute http request:" + ex.getMessage(), ex);
            throw new ServiceException(ex);
        }
    }

//    public Comment postComment(Post post, int currUid, String comment) {
//
//        Log.d(GlobalCtx.ORDERS_TAG, "postComment to post " + post.getId() + " from uid " + currUid);
//        GlobalCtx.getInstance().addCommentUidNames(GlobalCtx.getInstance().getCurrUser());
//
//        //TODO: could run in background
//        //TODO: replace uid with uid in session!
//        String url = null;
//        try {
//            url = new StringBuffer().append(GlobalCtx.API_ROOT).append("/comment?")
//                    .append("userId=").append(currUid)
//                    .append("&postId=").append(post.getId())
//                    .append("&comment=").append(URLEncoder.encode(comment, "UTF-8"))
//                    .toString();
//        } catch (UnsupportedEncodingException e) {
//            throw new RuntimeException(e);
//        }
//
//        boolean ok = false;
//        try {
//            ResponseEntity<OrderContainer> rtnEntity = this.http(url, OrderContainer.class);
//            ok = rtnEntity != null && GlobalCtx.isSucc(rtnEntity.getBody().getSuccess());
//        } catch (Exception e) {
//           Log.e(GlobalCtx.ORDERS_TAG, "error when post comment", e);
//        }
//        Log.d(GlobalCtx.ORDERS_TAG, "postComment " + comment + " result: " + ok);
//
//        return post.addComment(currUid, comment);
//    }
}
