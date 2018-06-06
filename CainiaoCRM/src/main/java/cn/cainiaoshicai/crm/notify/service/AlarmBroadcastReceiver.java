package cn.cainiaoshicai.crm.notify.service;


import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import cn.cainiaoshicai.crm.Constants;

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
			Bootstrap.startAlwaysOnService(context, previousAction);
		}
	}
}
