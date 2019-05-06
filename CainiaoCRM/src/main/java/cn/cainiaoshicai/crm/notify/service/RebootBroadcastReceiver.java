package cn.cainiaoshicai.crm.notify.service;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.text.TextUtils;
import android.util.Log;

import com.google.common.collect.Maps;

import java.util.Map;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.jpush.android.api.JPushInterface;

public class RebootBroadcastReceiver extends BroadcastReceiver {
	private static final String LOG_TAG = RebootBroadcastReceiver.class.getSimpleName();

	@Override
	public void onReceive(Context context, Intent intent) {
		Log.v(LOG_TAG, "onReceive");

		if ((intent.getAction().equals(Intent.ACTION_USER_PRESENT))
				|| (intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED))) {
			long store_id = SettingUtility.getListenerStore();
			Map<String, String> serviceExtras = Maps.newHashMap();
			String accessToken = "";
			if (GlobalCtx.app().getAccountBean() != null) {
				accessToken = GlobalCtx.app().getAccountBean().getAccess_token();
			}
			serviceExtras.put("accessToken", accessToken);
			serviceExtras.put("storeId", store_id + "");
			//Bootstrap.startAlwaysOnService(context, "Crm", serviceExtras);
			if (JPushInterface.isPushStopped(GlobalCtx.app())) {
				String uid = GlobalCtx.app().getCurrentAccountId();
				if (!TextUtils.isEmpty(uid)) {
					JPushInterface.setAlias(GlobalCtx.app(), (int) (System.currentTimeMillis() / 1000L), "uid_" + uid);
					JPushInterface.resumePush(GlobalCtx.app());
				}
			}
		}
	}
}
