package cn.customer_serv.customer_servsdk.callback;

import android.content.Intent;

import cn.customer_serv.customer_servsdk.activity.MQConversationActivity;

/**
 * OnePiece
 * Created by xukq on 9/7/16.
 */
public interface OnLinkClickCallback {

    void onClick(MQConversationActivity conversationActivity, Intent intent, String url);

}
