package cn.cainiaoshicai.crm.notify.service;

import android.content.Context;
import android.content.Intent;
import android.os.Message;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.google.gson.Gson;

import cn.cainiaoshicai.crm.AppCache;
import cn.jiguang.plugins.push.JPushModule;
import cn.jiguang.plugins.push.common.JConstants;
import cn.jiguang.plugins.push.common.JLogger;
import cn.jiguang.plugins.push.helper.JPushHelper;
import cn.jpush.android.api.CmdMessage;
import cn.jpush.android.api.CustomMessage;
import cn.jpush.android.api.JPushMessage;
import cn.jpush.android.api.NotificationMessage;
import cn.jpush.android.service.JPushMessageReceiver;

public class PushMessageReceiver extends JPushMessageReceiver {
    private final String TAG = "PushMessageReceiver";
    private final Gson gson = new Gson();

    @Override
    public void onMessage(Context context, CustomMessage customMessage) {
//        Log.e(TAG, "[onMessage] " + customMessage);
        super.onMessage(context, customMessage);
        WritableMap writableMap = JPushHelper.convertCustomMessage(customMessage);
        JPushHelper.sendEvent(JConstants.CUSTOM_MESSAGE_EVENT, writableMap);
    }

    @Override
    public void onNotifyMessageOpened(Context context, NotificationMessage message) {
        if (JPushModule.reactContext != null) {
            if (!JPushModule.isAppForeground) JPushHelper.launchApp(context);
            WritableMap writableMap = JPushHelper.convertNotificationToMap(JConstants.NOTIFICATION_OPENED, message);
            JPushHelper.sendEvent(JConstants.NOTIFICATION_EVENT, writableMap);
            cn.cainiaoshicai.crm.entity.JPushMessage jPushMessage = gson.fromJson(message.notificationExtras, cn.cainiaoshicai.crm.entity.JPushMessage.class);
//            Log.e(TAG, "[onNotifyMessageOpened] " + jPushMessage.getSpeak_word());
            if (jPushMessage.getSpeak_word() != null) {
                Message msg = Message.obtain();
                msg.what = 1;
                msg.obj = jPushMessage.getSpeak_word();
                AppCache.getHandler().sendMessage(msg);
            }
        } else {
            super.onNotifyMessageOpened(context, message);
        }
    }

    @Override
    public void onMultiActionClicked(Context context, Intent intent) {
        Log.e(TAG, "[onMultiActionClicked] 用户点击了通知栏按钮");
        super.onMultiActionClicked(context, intent);
    }

    @Override
    public void onNotifyMessageArrived(Context context, NotificationMessage message) {

        super.onNotifyMessageArrived(context, message);
        WritableMap writableMap = JPushHelper.convertNotificationToMap(JConstants.NOTIFICATION_ARRIVED, message);
        if (message.notificationType != 1) {
            JPushHelper.sendEvent(JConstants.NOTIFICATION_EVENT, writableMap);
        } else {
            JPushHelper.sendEvent(JConstants.LOCAL_NOTIFICATION_EVENT, writableMap);
        }

        cn.cainiaoshicai.crm.entity.JPushMessage jPushMessage = gson.fromJson(message.notificationExtras, cn.cainiaoshicai.crm.entity.JPushMessage.class);
//        Log.e(TAG, "[onNotifyMessageArrived] " + jPushMessage.getSpeak_word());
        if (jPushMessage.getSpeak_word() != null) {
            Message msg = Message.obtain();
            msg.what = 1;
            msg.obj = jPushMessage.getSpeak_word();
            AppCache.getHandler().sendMessage(msg);
        }
    }

    @Override
    public void onNotifyMessageDismiss(Context context, NotificationMessage message) {
//        Log.e(TAG, "[onNotifyMessageDismiss] " + message);
        super.onNotifyMessageDismiss(context, message);
//        WritableMap writableMap = JPushHelper.convertNotificationToMap(JConstants.NOTIFICATION_DISMISSED, message);
//        JPushHelper.sendEvent(JConstants.NOTIFICATION_EVENT, writableMap);
    }

    @Override
    public void onRegister(Context context, String registrationId) {
        Log.e(TAG, "[onRegister] " + registrationId);
        super.onRegister(context, registrationId);
    }

    @Override
    public void onConnected(Context context, boolean isConnected) {
        Log.e(TAG, "[onConnected] " + isConnected);
        super.onConnected(context, isConnected);
        WritableMap writableMap = Arguments.createMap();
        writableMap.putBoolean(JConstants.CONNECT_ENABLE, isConnected);
        JPushHelper.sendEvent(JConstants.CONNECT_EVENT, writableMap);
    }

    @Override
    public void onCommandResult(Context context, CmdMessage cmdMessage) {
        Log.e(TAG, "[onCommandResult] " + cmdMessage);
//        WritableMap writableMap = Arguments.createMap();
//        writableMap.putInt(JConstants.COMMAND, cmdMessage.cmd);
//        writableMap.putString(JConstants.COMMAND_EXTRA, cmdMessage.extra.toString());
//        writableMap.putString(JConstants.COMMAND_MESSAGE, cmdMessage.msg);
//        writableMap.putInt(JConstants.COMMAND_RESULT, cmdMessage.errorCode);
//        JPushHelper.sendEvent(JConstants.COMMAND_EVENT, writableMap);
    }

    @Override
    public void onTagOperatorResult(Context context, JPushMessage jPushMessage) {
        Log.e(TAG, "[onTagOperatorResult] " + jPushMessage);
        super.onTagOperatorResult(context, jPushMessage);
        WritableMap writableMap = JPushHelper.convertJPushMessageToMap(1, jPushMessage);
        JPushHelper.sendEvent(JConstants.TAG_ALIAS_EVENT, writableMap);
    }

    @Override
    public void onCheckTagOperatorResult(Context context, JPushMessage jPushMessage) {
        super.onCheckTagOperatorResult(context, jPushMessage);

    }

    @Override
    public void onAliasOperatorResult(Context context, JPushMessage jPushMessage) {
        super.onAliasOperatorResult(context, jPushMessage);
        WritableMap writableMap = JPushHelper.convertJPushMessageToMap(3, jPushMessage);
        JPushHelper.sendEvent(JConstants.TAG_ALIAS_EVENT, writableMap);
    }

    @Override
    public void onMobileNumberOperatorResult(Context context, JPushMessage jPushMessage) {
        super.onMobileNumberOperatorResult(context, jPushMessage);
    }

    @Override
    public void onNotificationSettingsCheck(Context context, boolean isOn, int source) {
        super.onNotificationSettingsCheck(context, isOn, source);
        Log.e(TAG, "[onNotificationSettingsCheck] isOn:" + isOn + ",source:" + source);
    }

}
