package cn.cainiaoshicai.crm.notify.service;


import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.google.common.collect.Maps;

import java.util.Map;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;

public class AlarmBroadcastReceiver extends BroadcastReceiver {
	private static final String LOG_TAG = AlarmBroadcastReceiver.class.getSimpleName();
	public static final String ACTION_CUSTOM_ALARM = "wsb.alarm.action";
	
	@Override
	public void onReceive(Context context, Intent intent) {
		if (intent.getAction().equals(AlarmBroadcastReceiver.ACTION_CUSTOM_ALARM)) {
			String previousAction = intent
					.getStringExtra(Constants.STARTUP_ACTION_NAME);
			if (previousAction == null || previousAction.length() == 0) {
				previousAction = intent.getAction();
			}
			long store_id = SettingUtility.getListenerStore();
			Map<String, String> serviceExtras = Maps.newHashMap();
			String accessToken = "";
			if (GlobalCtx.app().getAccountBean() != null) {
				accessToken = GlobalCtx.app().getAccountBean().getAccess_token();
			}
			serviceExtras.put("accessToken", accessToken);
			serviceExtras.put("storeId", store_id + "");
			//Bootstrap.startAlwaysOnService(context, "Crm", serviceExtras);
		}
	}
}
