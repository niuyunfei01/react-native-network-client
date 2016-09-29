package cn.customer_serv.customer_servsdk.callback;


import cn.customer_serv.customer_servsdk.model.Agent;
import cn.customer_serv.customer_servsdk.model.BaseMessage;

import java.util.List;

public interface OnClientOnlineCallback extends OnFailureCallBack {
    void onSuccess(Agent agent,String conversationId, List<BaseMessage> messageList);
}
