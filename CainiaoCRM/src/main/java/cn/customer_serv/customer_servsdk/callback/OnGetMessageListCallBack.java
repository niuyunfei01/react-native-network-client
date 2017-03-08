package cn.customer_serv.customer_servsdk.callback;


import java.util.List;

import cn.customer_serv.customer_servsdk.model.BaseMessage;

public interface OnGetMessageListCallBack extends OnFailureCallBack {

    void onSuccess(List<BaseMessage> messageList);

}
