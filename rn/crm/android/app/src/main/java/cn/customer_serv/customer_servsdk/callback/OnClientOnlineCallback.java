package cn.customer_serv.customer_servsdk.callback;


import java.util.List;

import cn.customer_serv.customer_servsdk.model.Agent;
import cn.customer_serv.customer_servsdk.model.BaseMessage;

public interface OnClientOnlineCallback extends OnFailureCallBack {
    void onSuccess(Agent agent, String conversationId, List<BaseMessage> messageList);
}
