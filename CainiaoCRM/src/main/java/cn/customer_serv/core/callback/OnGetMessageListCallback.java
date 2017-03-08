package cn.customer_serv.core.callback;

import java.util.List;

import cn.customer_serv.core.bean.MQMessage;

/**
 * Created by liuzhr on 9/29/16.
 */
public interface OnGetMessageListCallback {
    void onSuccess(List<MQMessage> mqMessageList);

    void onFailure(int code, String message);
}
