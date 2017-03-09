package cn.cainiaoshicai.crm.othercomp;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.text.TextUtils;
import android.util.Log;

import com.example.jpushdemo.ExampleUtil;
import com.example.jpushdemo.MainActivity;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.ui.activity.GeneralWebViewActivity;
import cn.cainiaoshicai.crm.ui.activity.StoreSelfStorageActivity;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageActivity;
import cn.cainiaoshicai.crm.ui.activity.UserCommentsActivity;
import cn.jpush.android.api.JPushInterface;

/**
 * 自定义接收器
 * 
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

				GlobalCtx.SoundManager soundManager = GlobalCtx.getInstance().getSoundManager();
				if (Cts.PUSH_TYPE_NEW_ORDER.equals(notify.getType())) {
					GlobalCtx.newOrderNotifies.add(notificationId);
					if (GlobalCtx.getInstance().acceptNotifyNew()) {
						soundManager.play_new_order_sound(notify.getStore_id());
						OrderPrinter.printWhenNeverPrinted(notify.getPlatform(), notify.getPlatform_oid());
					}
				} else if (Cts.PUSH_TYPE_REDY_TIMEOUT.equals(notify.getType())) {
					int totalLate = notify.getTotal_late();
					if (totalLate > 10) {
						totalLate = 10;
					}
					if (GlobalCtx.getInstance().acceptReadyTimeoutNotify()) {
						soundManager.play_will_ready_timeout(notify.getStore_id(), totalLate);
					}
				} else if (Cts.PUSH_TYPE_SYNC_BROKEN.equals(notify.getType())) {
					if (GlobalCtx.getInstance().acceptTechNotify()) {
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
				} else if (Cts.PUSH_TYPE_TODO_COMPLAIN.equals(notify.getType())) {
					soundManager.play_todo_complain();
				}
			}

		} else if (JPushInterface.ACTION_NOTIFICATION_OPENED.equals(intent.getAction())) {
			Log.d(TAG, "[NotificationReceiver] 用户点击打开了通知");

			GlobalCtx.clearNewOrderNotifies(context);

			final Intent i;
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
				} else if (Cts.PUSH_TYPE_REDY_TIMEOUT.equals(notify.getType())) {
					i = new Intent(context, cn.cainiaoshicai.crm.MainActivity.class);
//					i.setAction(Intent.ACTION_SEARCH);
//					i.putExtra(SearchManager.QUERY, "ready_delayed:");
				} else if (Cts.PUSH_TYPE_SYNC_BROKEN.equals(notify.getType())) {
					i = new Intent(context, cn.cainiaoshicai.crm.MainActivity.class);
				} else if (Cts.PUSH_TYPE_NEW_ORDER.equals(notify.getType())) {
					i = new Intent(context, cn.cainiaoshicai.crm.MainActivity.class);
				} else if (Cts.PUSH_TYPE_BECOME_OFF_SALE.equals(notify.getType())
						|| Cts.PUSH_TYPE_STORAGE_WARNING.equals(notify.getType())
						|| Cts.PUSH_TYPE_EXT_WARNING.equals(notify.getType())) {

					Class targetClazz = notify.isStorage_provided_self() ?
							StoreSelfStorageActivity.class :
							StoreStorageActivity.class;
					i = new Intent(context, targetClazz);

				}  else if (Cts.PUSH_TYPE_ORDER_CANCELLED.equals(notify.getType())
						|| Cts.PUSH_TYPE_REMIND_DELIVER.equals(notify.getType())
						|| Cts.PUSH_TYPE_ASK_CANCEL.equals(notify.getType())
						|| Cts.PUSH_TYPE_MANUAL_DADA_TIMEOUT.equals(notify.getType())
						|| Cts.PUSH_TYPE_TODO_COMPLAIN.equals(notify.getType())) {
					i = new Intent(context, OrderSingleActivity.class);
					i.putExtra("order_id", notify.getOrder_id());
				} else {
					i = new Intent(context, cn.cainiaoshicai.crm.MainActivity.class);
				}

				if (notify.getStore_id() > 0) {
					i.putExtra("store_id", notify.getStore_id());
					if ("sold_out".equals(notify.getSound())) {
						i.putExtra("filter", StoreStorageActivity.FILTER_SOLD_OUT);
					} else if ("check_storage".equals(notify.getSound())) {
						i.putExtra("filter", StoreStorageActivity.FILTER_SOLD_EMPTY);
					}
				}

				i.putExtras(bundle);
				i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
				context.startActivity(i);
			} else {
				AppLogger.e("error to userTalkStatus notify from bundle!");
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
        return gson.fromJson(extraJson, new TypeToken<Notify>() {}.getType());
    }

    // 打印所有的 intent extra 数据
	private static String printBundle(Bundle bundle) {
		StringBuilder sb = new StringBuilder();
		for (String key : bundle.keySet()) {
			if (key.equals(JPushInterface.EXTRA_NOTIFICATION_ID)) {
				sb.append("\nkey:").append(key).append(", value:").append(bundle.getInt(key));
			}else if(key.equals(JPushInterface.EXTRA_CONNECTION_CHANGE)){
				sb.append("\nkey:").append(key).append(", value:").append(bundle.getBoolean(key));
			} else if (key.equals(JPushInterface.EXTRA_EXTRA)) {
				if (TextUtils.isEmpty(bundle.getString(JPushInterface.EXTRA_EXTRA))) {
					Log.i(TAG, "This message has no Extra data");
					continue;
				}

				try {
					JSONObject json = new JSONObject(bundle.getString(JPushInterface.EXTRA_EXTRA));
					Iterator<String> it =  json.keys();

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
	private Set<Integer> notify_workers;

	private boolean storage_provided_self;
	private String sound;

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
}
