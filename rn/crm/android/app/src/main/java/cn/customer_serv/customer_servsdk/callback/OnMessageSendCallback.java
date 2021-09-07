package cn.customer_serv.customer_servsdk.callback;


import cn.customer_serv.customer_servsdk.model.BaseMessage;

public interface OnMessageSendCallback {
    void onSuccess(BaseMessage message, int state);

    void onFailure(BaseMessage failureMessage, int code, String failureInfo);
}
