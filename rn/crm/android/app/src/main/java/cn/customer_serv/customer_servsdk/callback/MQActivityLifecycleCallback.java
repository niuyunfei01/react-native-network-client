package cn.customer_serv.customer_servsdk.callback;

import android.os.Bundle;

import cn.customer_serv.customer_servsdk.activity.MQConversationActivity;

/**
 * OnePiece
 * Created by xukq on 7/13/16.
 */
public interface MQActivityLifecycleCallback {

    void onActivityCreated(MQConversationActivity activity, Bundle savedInstanceState);

    void onActivityStarted(MQConversationActivity activity);

    void onActivityResumed(MQConversationActivity activity);

    void onActivityPaused(MQConversationActivity activity);

    void onActivityStopped(MQConversationActivity activity);

    void onActivitySaveInstanceState(MQConversationActivity activity, Bundle outState);

    void onActivityDestroyed(MQConversationActivity activity);

}
