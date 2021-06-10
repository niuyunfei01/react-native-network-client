package cn.cainiaoshicai.crm.othercomp;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothProfile;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;
import android.text.TextUtils;
import android.util.Log;

import com.example.jpushdemo.ExampleUtil;
import com.example.jpushdemo.MainActivity;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.MainOrdersActivity;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.Worker;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingHelper;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.support.react.MyReactActivity;
import cn.cainiaoshicai.crm.ui.activity.GeneralWebViewActivity;
import cn.cainiaoshicai.crm.ui.activity.OrderQueryActivity;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageActivity;
import cn.cainiaoshicai.crm.ui.activity.UserCommentsActivity;
import cn.jpush.android.api.JPushInterface;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * 自定义接收器
 * <p>
 * 如果不定义这个 Receiver，则：
 * 1) 默认用户会打开主界面
 * 2) 接收不到自定义消息
 */
public class NotificationReceiver extends BroadcastReceiver {

    private static final String TAG = GlobalCtx.ORDERS_TAG;

    @Override
    public void onReceive(Context context, Intent intent) {
        Bundle bundle = intent.getExtras();
        Log.d(TAG, "[NotificationReceiver] onReceive - " + intent.getAction() + ", extras: " + printBundle(bundle));
        if (JPushInterface.ACTION_REGISTRATION_ID.equals(intent.getAction())) {
            String regId = bundle.getString(JPushInterface.EXTRA_REGISTRATION_ID);
            Log.d(TAG, "[NotificationReceiver] 接收Registration Id : " + regId);
            //send the Registration Id to your server...

        } else if (JPushInterface.ACTION_MESSAGE_RECEIVED.equals(intent.getAction())) {
            Log.d(TAG, "[NotificationReceiver] 接收到推送下来的自定义消息: " + bundle.getString(JPushInterface.EXTRA_MESSAGE));
            processCustomMessage(context, bundle);

        } else if (JPushInterface.ACTION_NOTIFICATION_RECEIVED.equals(intent.getAction())) {
            Log.d(TAG, "[NotificationReceiver] 接收到推送下来的通知");
            int notificationId = bundle.getInt(JPushInterface.EXTRA_NOTIFICATION_ID);
            Log.d(TAG, "[NotificationReceiver] 接收到推送下来的通知的ID: " + notificationId);

            final Notify notify = getNotifyFromBundle(bundle);
            if (notify != null) {

                if (Cts.PUSH_TYPE_NEW_ORDER.equals(notify.getType())) {
                    int orderId = notify.getOrder_id();
                    String msgId = bundle.getString(JPushInterface.EXTRA_MSG_ID);
                    sendPushStatus(context, orderId, msgId);
                }

                if (Cts.PUSH_TYPE_NEW_ORDER.equals(notify.getType())) {
                    GlobalCtx.newOrderNotifies.add(notificationId);
                    if (GlobalCtx.app().acceptNotifyNew()) {
                        if (!SettingUtility.isDisableNewOrderSoundNotify()) {
                            notifyOrder(notify);
                        }
                        if(SettingUtility.getAutoPrintSetting()){
                            OrderPrinter.printWhenNeverPrinted(notify.getPlatform(), notify.getPlatform_oid());
                        }
                    }
                }

                GlobalCtx.SoundManager soundManager = GlobalCtx.app().getSoundManager();

                if (!SettingUtility.isDisableSoundNotify()) {
                    if (!TextUtils.isEmpty(notify.getSpeak_word())) {
                        //TODO play new order sound
                        int repeatTimes = Math.min(Math.max(notify.getSpeak_times(), 1), 3);
                        for (int x = 0; x < repeatTimes; x++) {
                            //String repeatPrefix = x > 0 ? ("重复" + x + "次：") : "";
                            soundManager.play_by_xunfei(notify.getSpeak_word());
                        }
                    } else {

                        //仍然需要继续保留，例如取消订单，京东的取消就没有全面的speak_word
                        if (Cts.PUSH_TYPE_NEW_ORDER.equals(notify.getType())) {
                            GlobalCtx.newOrderNotifies.add(notificationId);
                            if (GlobalCtx.app().acceptNotifyNew()) {
                                soundManager.play_new_order_sound(notify.getStore_id());
                            }
                            SettingUtility.removeOrderContainerCache(ListType.WAITING_READY);
                        } else if (Cts.PUSH_TYPE_REDY_TIMEOUT.equals(notify.getType())) {
                            int totalLate = notify.getTotal_late();
                            if (totalLate > 10) {
                                totalLate = 10;
                            }
                            if (GlobalCtx.app().acceptReadyTimeoutNotify()) {
                                soundManager.play_will_ready_timeout(notify.getStore_id(), totalLate);
                            }
                        } else if (Cts.PUSH_TYPE_SYNC_BROKEN.equals(notify.getType())) {
                            if (GlobalCtx.app().acceptTechNotify()) {
                                soundManager.play_sync_not_work_sound();
                            }
                        } else if (Cts.PUSH_TYPE_SERIOUS_TIMEOUT.equals(notify.getType())) {
                            soundManager.play_serious_timeout(notify.getNotify_workers());
                        } else if (Cts.PUSH_TYPE_STORAGE_WARNING.equals(notify.getType())) {
                            int store_id = notify.getStore_id();
                            if (store_id > 0) {
                                if ("sold_out".equals(notify.getSound())) {
                                    soundManager.play_item_sold_out_sound(store_id);
                                } else if ("check_storage".equals(notify.getSound())) {
                                    soundManager.play_storage_check(store_id);
                                }
                            }
                        } else if (Cts.PUSH_TYPE_EXT_WARNING.equals(notify.getType())) {
                            String extraJson = bundle.getString(JPushInterface.EXTRA_EXTRA);
                            Gson gson = new GsonBuilder().create();
                            HashMap<String, String> params = gson.fromJson(extraJson, new TypeToken<HashMap<String, String>>() {
                            }.getType());

                            if (params != null && "eleme".equals(params.get("notify_sound"))) {
                                String storeIdS = params.get("store_id");
                                if (storeIdS != null && Integer.parseInt(storeIdS) > 0)
                                    soundManager.play_ele_status_changed(Integer.parseInt(storeIdS));
                            }
                        } else if (Cts.PUSH_TYPE_USER_TALK.equals(notify.getType())) {
                            soundManager.play_customer_new_msg();
                        } else if (Cts.PUSH_TYPE_ORDER_CANCELLED.equals(notify.getType())) {
                            soundManager.play_order_cancelled();
                        } else if (Cts.PUSH_TYPE_REMIND_DELIVER.equals(notify.getType())) {
                            soundManager.play_remind_deliver();
                        } else if (Cts.PUSH_TYPE_ASK_CANCEL.equals(notify.getType())) {
                            soundManager.play_order_ask_cancel();
                        } else if (Cts.PUSH_TYPE_MANUAL_DADA_TIMEOUT.equals(notify.getType())) {
                            soundManager.play_dada_manual_timeout();
                        } else if (Cts.PUSH_TYPE_SYS_ERROR.equals(notify.getType())) {
                        }
                    }
                }
            }
        } else if (JPushInterface.ACTION_NOTIFICATION_OPENED.equals(intent.getAction())) {
            Log.d(TAG, "[NotificationReceiver] 用户点击打开了通知");

            GlobalCtx.clearNewOrderNotifies(context);

            Intent i = null;
            Notify notify = getNotifyFromBundle(bundle);

            AppLogger.w("open notify:" + notify);

            if (notify != null) {
                if (Cts.PUSH_TYPE_NEW_COMMENT.equals(notify.getType())) {
                    if (TextUtils.isEmpty(notify.getUrl())) {
                        i = new Intent(context, UserCommentsActivity.class);
                    } else {
                        i = new Intent(context, GeneralWebViewActivity.class);
                        i.putExtra("url", notify.getUrl());
                    }
                } else if (!TextUtils.isEmpty(notify.getQuery_term())) {
                    i = new Intent(context, OrderQueryActivity.class);
                    i.putExtra("query", notify.getQuery_term());
                } else if (Cts.PUSH_TYPE_SYNC_BROKEN.equals(notify.getType())) {
                    i = new Intent(context, MainOrdersActivity.class);
                } else if (Cts.PUSH_TYPE_NEW_ORDER.equals(notify.getType())) {
                    i = new Intent(context, MainOrdersActivity.class);
                } else if (Cts.PUSH_TYPE_BECOME_OFF_SALE.equals(notify.getType())
                        || Cts.PUSH_TYPE_STORAGE_WARNING.equals(notify.getType())
                        || Cts.PUSH_TYPE_EXT_WARNING.equals(notify.getType())) {

                    i = new Intent(context, StoreStorageActivity.class);

                } else if (Cts.PUSH_TYPE_ORDER_CANCELLED.equals(notify.getType())
                        || Cts.PUSH_TYPE_REMIND_DELIVER.equals(notify.getType())
                        || Cts.PUSH_TYPE_ASK_CANCEL.equals(notify.getType())
                        || Cts.PUSH_TYPE_ORDER_UPDATE.equals(notify.getType())
                        || Cts.PUSH_TYPE_MANUAL_DADA_TIMEOUT.equals(notify.getType())
                        ) {

                    if (notify.getOrder_id() > 0) {
                        i = new Intent(context, MyReactActivity.class);
                        i.putExtra("order_id", Long.valueOf(notify.getOrder_id()));
                    } else if (!TextUtils.isEmpty(notify.getUrl())) {
                        i = new Intent(context, GeneralWebViewActivity.class);
                        i.putExtra("url", notify.getUrl());
                    } else {
                        i = new Intent(context, MyReactActivity.class);
                        i.putExtra("order_id", Long.valueOf(notify.getOrder_id()));
                    }

                } else if (Cts.PUSH_TYPE_TODO_COMPLAIN.equals(notify.getType())) {
                    i = new Intent(context, GeneralWebViewActivity.class);
                    i.putExtra("url", URLHelper.WEB_URL_ROOT + "/market_tools/user_feedback.html?fb_id=" + notify.getFb_id());
                } else if (Cts.PUSH_TYPE_TASK_REMIND.equals(notify.getType())) {
                    i = GlobalCtx.app().toTaskListIntent(context);
                } else if (Cts.PUSH_TYPE_PRODUCT_ADJUST.equals(notify.getType())) {
                    GlobalCtx.app().toProductAdjust(context);
                    return;
                } else {
                    i = new Intent(context, MainOrdersActivity.class);
                }
                if (notify.getStore_id() > 0) {
                    i.putExtra("store_id", notify.getStore_id());
                    if ("sold_out".equals(notify.getSound())) {
                        i.putExtra("filter", StoreStorageActivity.FILTER_SOLD_OUT);
                    } else if ("check_storage".equals(notify.getSound())) {
                        i.putExtra("filter", StoreStorageActivity.FILTER_SOLD_EMPTY);
                    }
                }
                if (bundle != null) {
                    i.putExtras(bundle);
                }
                i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                context.startActivity(i);
            } else {
                AppLogger.e("error to notify from bundle!");
            }
        } else if (JPushInterface.ACTION_RICHPUSH_CALLBACK.equals(intent.getAction())) {
            Log.d(TAG, "[NotificationReceiver] 用户收到到RICH PUSH CALLBACK: " + bundle.getString(JPushInterface.EXTRA_EXTRA));
            //在这里根据 JPushInterface.EXTRA_EXTRA 的内容处理代码，比如打开新的Activity， 打开一个网页等..

        } else if (JPushInterface.ACTION_CONNECTION_CHANGE.equals(intent.getAction())) {
            boolean connected = intent.getBooleanExtra(JPushInterface.EXTRA_CONNECTION_CHANGE, false);
            Log.w(TAG, "[NotificationReceiver]" + intent.getAction() + " connected state change to " + connected);
        } else {
            Log.d(TAG, "[NotificationReceiver] Unhandled intent - " + intent.getAction());
        }
    }

    @Nullable
    private Notify getNotifyFromBundle(Bundle bundle) {
        String extraJson = bundle.getString(JPushInterface.EXTRA_EXTRA);
        Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
        return gson.fromJson(extraJson, new TypeToken<Notify>() {
        }.getType());
    }

    // 打印所有的 intent extra 数据
    private static String printBundle(Bundle bundle) {
        StringBuilder sb = new StringBuilder();
        for (String key : bundle.keySet()) {
            if (key.equals(JPushInterface.EXTRA_NOTIFICATION_ID)) {
                sb.append("\nkey:").append(key).append(", value:").append(bundle.getInt(key));
            } else if (key.equals(JPushInterface.EXTRA_CONNECTION_CHANGE)) {
                sb.append("\nkey:").append(key).append(", value:").append(bundle.getBoolean(key));
            } else if (key.equals(JPushInterface.EXTRA_EXTRA)) {
                if (TextUtils.isEmpty(bundle.getString(JPushInterface.EXTRA_EXTRA))) {
                    Log.i(TAG, "This message has no Extra data");
                    continue;
                }

                try {
                    JSONObject json = new JSONObject(bundle.getString(JPushInterface.EXTRA_EXTRA));
                    Iterator<String> it = json.keys();

                    while (it.hasNext()) {
                        String myKey = it.next();
                        sb.append("\nkey:").append(key).append(", value: [").append(myKey).append(" - ").append(json.optString(myKey)).append("]");
                    }
                } catch (JSONException e) {
                    Log.e(TAG, "Get message extra JSON error!");
                }

            } else {
                sb.append("\nkey:").append(key).append(", value:").append(bundle.getString(key));
            }
        }
        return sb.toString();
    }

    //send msg to DatepickerActivity
    private void processCustomMessage(Context context, Bundle bundle) {
        if (MainActivity.isForeground) {
            String message = bundle.getString(JPushInterface.EXTRA_MESSAGE);
            String extras = bundle.getString(JPushInterface.EXTRA_EXTRA);
            Intent msgIntent = new Intent(MainActivity.MESSAGE_RECEIVED_ACTION);
            msgIntent.putExtra(MainActivity.KEY_MESSAGE, message);
            if (!ExampleUtil.isEmpty(extras)) {
                try {
                    JSONObject extraJson = new JSONObject(extras);
                    if (extraJson.length() > 0) {
                        msgIntent.putExtra(MainActivity.KEY_EXTRAS, extras);
                    }
                } catch (JSONException e) {
                    AppLogger.e("[processCustomMessage] json error:", e);
                }

            }
            context.sendBroadcast(msgIntent);
        }
    }

    /**
     * @param context
     * @param orderId
     * @param msgId
     */
    private void sendPushStatus(Context context, int orderId, String msgId) {
        try {
            Map<String, ?> allConfig = SettingHelper.getAllConfigs(context);
            boolean bluetoothIsConnected = isBluetoothConnected();
            boolean acceptNotifyNew = GlobalCtx.app().acceptNotifyNew();
            Worker currentWorker = GlobalCtx.app().getCurrentWorker();
            Map<String, Object> deviceStatus = Maps.newHashMap();
            deviceStatus.put("bluetoothIsConnected", bluetoothIsConnected);
            deviceStatus.put("acceptNotifyNew", acceptNotifyNew);
            deviceStatus.put("currentWorker", currentWorker);
            deviceStatus.put("orderId", orderId);
            deviceStatus.put("msgId", msgId);
            deviceStatus.put("disable_new_order_sound_notify", allConfig.get("disable_new_order_sound_notify"));
            deviceStatus.put("disable_sound_notify", allConfig.get("disable_sound_notify"));
            deviceStatus.put("last_printer_address", allConfig.get("last_printer_address"));
            deviceStatus.put("listener_stores", allConfig.get("listener_stores"));
            Call<ResultBean<String>> rbCall = GlobalCtx.app().dao.logPushStatus(deviceStatus);
            rbCall.enqueue(new Callback<ResultBean<String>>() {
                @Override
                public void onResponse(Call<ResultBean<String>> call, Response<ResultBean<String>> response) {
                    Log.d("send push status succ", response.message());
                }

                @Override
                public void onFailure(Call<ResultBean<String>> call, Throwable t) {
                    Log.d("send push status fail", t.getMessage());
                }
            });
        } catch (Exception e) {
            Log.e("send push status", e.getMessage());
        }
    }

    private boolean isBluetoothConnected() {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        //adapter也有getState(), 可获取ON/OFF...其它状态
        int a2dp = bluetoothAdapter.getProfileConnectionState(BluetoothProfile.A2DP);              //可操控蓝牙设备，如带播放暂停功能的蓝牙耳机
        int headset = bluetoothAdapter.getProfileConnectionState(BluetoothProfile.HEADSET);        //蓝牙头戴式耳机，支持语音输入输出
        int health = bluetoothAdapter.getProfileConnectionState(BluetoothProfile.HEALTH);
        return bluetoothAdapter != null && (a2dp == BluetoothAdapter.STATE_CONNECTED ||
                headset == BluetoothAdapter.STATE_CONNECTED ||
                health == BluetoothAdapter.STATE_CONNECTED);
    }

    private void notifyOrder(Notify notify) {
        new MyAsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                try {
                    int platform = notify.getPlatform();
                    final String access_token = GlobalCtx.app().getAccountBean().getAccess_token();
                    final String platformOid = notify.getPlatform_oid();
                    final Order order = new OrderActionDao(access_token).getOrder(platform, platformOid);
                    if (order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_READY || order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_SHIP) {
                        GlobalCtx.app().getSoundManager().notifyNewOrder("", platform + "", "", 3);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "notifyOrder error", e);
                }
                return null;
            }
        }.executeOnNormal();
    }
}

class Notify {
    private String type;
    private int platform;
    private String platform_oid;
    private int store_id;
    private int total_late;
    private int filter;
    private int order_id;
    private String url;
    private String speak_word;
    private int speak_times = 1;
    private String query_term = "";
    private Set<Integer> notify_workers;

    private boolean storage_provided_self;
    private String sound;
    private String fb_id;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getPlatform() {
        return platform;
    }

    public void setPlatform(int platform) {
        this.platform = platform;
    }

    public String getPlatform_oid() {
        return platform_oid;
    }

    public void setPlatform_oid(String platform_oid) {
        this.platform_oid = platform_oid;
    }

    @Override
    public String toString() {
        return "Notify{" +
                "type='" + type + '\'' +
                ", platform=" + platform +
                ", platform_oid='" + platform_oid + '\'' +
                ", store_id='" + store_id + '\'' +
                '}';
    }

    public int getStore_id() {
        return store_id;
    }

    public int getFilter() {
        return filter;
    }

    public void setFilter(int filter) {
        this.filter = filter;
    }

    public void setStore_id(int store_id) {
        this.store_id = store_id;
    }

    public int getTotal_late() {
        return total_late;
    }

    public void setTotal_late(int total_late) {
        this.total_late = total_late;
    }

    public Set<Integer> getNotify_workers() {
        return notify_workers;
    }

    public void setNotify_workers(Set<Integer> notify_workers) {
        this.notify_workers = notify_workers;
    }

    public boolean isStorage_provided_self() {
        return storage_provided_self;
    }

    public void setStorage_provided_self(boolean storage_provided_self) {
        this.storage_provided_self = storage_provided_self;
    }

    public String getSound() {
        return sound;
    }

    public void setSound(String sound) {
        this.sound = sound;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getOrder_id() {
        return order_id;
    }

    public void setOrder_id(int order_id) {
        this.order_id = order_id;
    }

    public String getSpeak_word() {
        return speak_word;
    }

    public int getSpeak_times() {
        return speak_times;
    }

    public void setSpeak_times(int speak_times) {
        this.speak_times = speak_times;
    }

    public void setSpeak_word(String speak_word) {
        this.speak_word = speak_word;
    }

    public String getFb_id() {
        return fb_id;
    }

    public void setFb_id(String fb_id) {
        this.fb_id = fb_id;
    }

    public String getQuery_term() {
        return query_term;
    }

    public void setQuery_term(String query_term) {
        this.query_term = query_term;
    }
}
