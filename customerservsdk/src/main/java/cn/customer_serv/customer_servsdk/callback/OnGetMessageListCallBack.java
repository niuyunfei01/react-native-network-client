package cn.customer_serv.customer_servsdk.callback;


import cn.customer_serv.customer_servsdk.model.BaseMessage;

import java.util.List;

public interface OnGetMessageListCallBack extends OnFailureCallBack {

    void onSuccess(List<BaseMessage> messageList);

}
