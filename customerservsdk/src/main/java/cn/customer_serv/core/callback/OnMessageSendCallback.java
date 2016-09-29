package cn.customer_serv.core.callback;

import cn.customer_serv.core.bean.MQMessage;

/**
 * Created by liuzhr on 9/29/16.
 */
public interface OnMessageSendCallback {
    abstract void onSuccess(MQMessage mcMessage, int state);

    abstract void onFailure(MQMessage failureMessage, int code, String response);
}
