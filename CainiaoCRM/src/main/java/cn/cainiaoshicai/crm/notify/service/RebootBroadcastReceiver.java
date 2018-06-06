package cn.cainiaoshicai.crm.notify.service;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.google.common.collect.Maps;

import java.util.Map;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;

public class RebootBroadcastReceiver extends BroadcastReceiver {
	private static final String LOG_TAG = RebootBroadcastReceiver.class.getSimpleName();

	@Override
	public void onReceive(Context context, Intent intent) {
		Log.v(LOG_TAG, "onReceive");

		if ((intent.getAction().equals(Intent.ACTION_USER_PRESENT))
				|| (intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED))) {
			long store_id = SettingUtility.getListenerStore();
			Map<String, String> serviceExtras = Maps.newHashMap();
			serviceExtras.put("accessToken", GlobalCtx.app().getAccountBean().getAccess_token());
			serviceExtras.put("storeId", store_id + "");
			Bootstrap.startAlwaysOnService(context, "Crm", serviceExtras);
		}
	}
}
