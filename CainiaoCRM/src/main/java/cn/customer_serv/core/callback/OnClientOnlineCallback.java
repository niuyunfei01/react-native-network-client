package cn.customer_serv.core.callback;

import java.util.List;

import cn.customer_serv.core.bean.MQAgent;
import cn.customer_serv.core.bean.MQMessage;

/**
 * Created by liuzhr on 9/29/16.
 */
public interface OnClientOnlineCallback {
    void onSuccess(MQAgent mqAgent, String conversationId, List<MQMessage> conversationMessageList);

    void onFailure(int code, String message);
}
