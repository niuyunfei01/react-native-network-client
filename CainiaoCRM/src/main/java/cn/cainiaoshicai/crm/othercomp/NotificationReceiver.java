package cn.cainiaoshicai.crm.othercomp;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.media.SoundPool;
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

import java.util.Iterator;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.ui.activity.RemindersActivity;
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
	public static SoundPool soundPool;
	public static int newOrderSound;
	public static int readyDelayWarnSound;
	public static int storeSoundUnknown;
	public static int storeSoundhlg;
	public static int storeSoundYyc;
	public static int notPrintSound;
	public static int syncNotWorkSound;
	public static int shipDelayWarn;
	public static int number1Sound;
	public static int number2Sound;
	public static int number3Sound;
	public static int number4Sound;
	public static int number5Sound;
	public static int number6Sound;
	public static int number7Sound;
	public static int number8Sound;
	public static int number9Sound;

	private static volatile boolean soundLoaded = false;

	private static final String TAG = GlobalCtx.ORDERS_TAG;

	public NotificationReceiver() {
		soundPool = new SoundPool(3, AudioManager.STREAM_MUSIC, 0);
		newOrderSound = soundPool.load(GlobalCtx.getApplication().getApplicationContext(), R.raw.new_order_sound, 1);
		readyDelayWarnSound = soundPool.load(GlobalCtx.getApplication().getApplicationContext(), R.raw.order_not_leave_off_more, 1);
		storeSoundUnknown = soundPool.load(GlobalCtx.getApplication().getApplicationContext(), R.raw.store_unknown, 1);
		storeSoundYyc = soundPool.load(GlobalCtx.getApplication().getApplicationContext(), R.raw.store_yyc, 1);
		storeSoundhlg = soundPool.load(GlobalCtx.getApplication().getApplicationContext(), R.raw.store_hlg, 1);
		notPrintSound = soundPool.load(GlobalCtx.getApplication().getApplicationContext(), R.raw.new_order_not_print, 1);
		syncNotWorkSound = soundPool.load(GlobalCtx.getApplication().getApplicationContext(), R.raw.sync_not_work, 1);
		soundPool.setOnLoadCompleteListener(new SoundPool.OnLoadCompleteListener() {
			@Override
			public void onLoadComplete(SoundPool soundPool, int sampleId, int status) {
				soundLoaded = true;
			}
		});
	}

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
            int notifactionId = bundle.getInt(JPushInterface.EXTRA_NOTIFICATION_ID);
            Log.d(TAG, "[NotificationReceiver] 接收到推送下来的通知的ID: " + notifactionId);

            final Notify notify = getNotifyFromBundle(bundle);
			if (notify != null) {
				if (Constants.PUSH_TYPE_NEW_ORDER.equals(notify.getType())) {
					GlobalCtx.newOrderNotifies.add(notifactionId);
					play_double_sound(getStoreSound(notify.getStore_id()), newOrderSound);
					OrderPrinter.printWhenNeverPrinted(notify.getPlatform(), notify.getPlatform_oid());
				} else if (Constants.PUSH_TYPE_REDY_TIMEOUT.equals(notify.getType())) {
					play_double_sound(getStoreSound(notify.getStore_id()), readyDelayWarnSound);
				} else if (Constants.PUSH_TYPE_SYNC_BROKEN.equals(notify.getType())) {
					soundPool.play(syncNotWorkSound, 1.0f, 1.0f, 1, 0, 1.0f);
				}
			}

        } else if (JPushInterface.ACTION_NOTIFICATION_OPENED.equals(intent.getAction())) {
            Log.d(TAG, "[NotificationReceiver] 用户点击打开了通知");

            GlobalCtx.clearNewOrderNotifies(context);

        	final Intent i;
			Notify notify = getNotifyFromBundle(bundle);

			AppLogger.w("open notify:" + notify);

			if (notify != null) {
				if (Constants.PUSH_TYPE_NEW_COMMENT.equals(notify.getType())) {
					i = new Intent(context, UserCommentsActivity.class);
				} else if (Constants.PUSH_TYPE_REDY_TIMEOUT.equals(notify.getType())) {
					i = new Intent(context, cn.cainiaoshicai.crm.MainActivity.class);
//					i.setAction(Intent.ACTION_SEARCH);
//					i.putExtra(SearchManager.QUERY, "ready_delayed:");
				} else if(Constants.PUSH_TYPE_SYNC_BROKEN.equals(notify.getType())){
					i = new Intent(context, cn.cainiaoshicai.crm.MainActivity.class);
				}else {
					i = new Intent(context, RemindersActivity.class);
				}
				i.putExtras(bundle);
				i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP );
				context.startActivity(i);
			} else {
				AppLogger.e("error to get notify from bundle!");
			}
        } else if (JPushInterface.ACTION_RICHPUSH_CALLBACK.equals(intent.getAction())) {
            Log.d(TAG, "[NotificationReceiver] 用户收到到RICH PUSH CALLBACK: " + bundle.getString(JPushInterface.EXTRA_EXTRA));
            //在这里根据 JPushInterface.EXTRA_EXTRA 的内容处理代码，比如打开新的Activity， 打开一个网页等..
        	
        } else if(JPushInterface.ACTION_CONNECTION_CHANGE.equals(intent.getAction())) {
        	boolean connected = intent.getBooleanExtra(JPushInterface.EXTRA_CONNECTION_CHANGE, false);
        	Log.w(TAG, "[NotificationReceiver]" + intent.getAction() +" connected state change to "+connected);
        } else {
        	Log.d(TAG, "[NotificationReceiver] Unhandled intent - " + intent.getAction());
        }
	}

	private void play_double_sound(int storeSound, int sufffixSound) {
		if (soundLoaded) {
            soundPool.play(storeSound, 100.0f, 100.0f, 1, 0, 1.0f);
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            soundPool.play(sufffixSound, 100.0f, 100.0f, 1, 0, 1.0f);
        } else {
			AppLogger.e("no sound");
		}
	}

	private int getStoreSound(int store_id) {
		if (store_id == Constants.STORE_HLG) {
			return storeSoundhlg;
		} else if (store_id == Constants.STORE_YYC) {
			return storeSoundYyc;
		} else {
			return storeSoundUnknown;
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

	public void setStore_id(int store_id) {
		this.store_id = store_id;
	}
}
