package cn.customer_serv.core;

import android.content.Context;

import cn.customer_serv.core.bean.MQAgent;
import cn.customer_serv.core.bean.MQMessage;

/**
 * Created by liuzhr on 9/29/16.
 */
public class MQMessageManager {
    public static final String ACTION_NEW_MESSAGE_RECEIVED = "new_message";
    public static final String ACTION_AGENT_INPUTTING = "agent_inputting";
    public static final String ACTION_AGENT_CHANGE_EVENT = "agent_changed";
    public static final String ACTION_INVITE_EVALUATION = "invite_evaluation";
    public static final String ACTION_AGENT_STATUS_UPDATE_EVENT = "update_event";
    public static final String ACTION_BLACK_ADD = "black_add";
    public static final String ACTION_BLACK_DEL = "black_del";
    public static final String ACTION_QUEUEING_REMOVE = "queue_remove";
    public static final String ACTION_QUEUEING_INIT_CONV = "queue_init_conv";
    private MQAgent currentAgent;

    public static MQMessageManager getInstance(Context context) {
        return null;
    }

    public MQMessage getMQMessage(String msgId) {
        return null;
    }

    public MQAgent getCurrentAgent() {
        return currentAgent;
    }
}
