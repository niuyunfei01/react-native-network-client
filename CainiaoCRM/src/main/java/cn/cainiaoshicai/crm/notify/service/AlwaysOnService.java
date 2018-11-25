package cn.cainiaoshicai.crm.notify.service;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.os.Build;
import android.util.Log;

import com.google.common.base.Strings;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.dao.StoreDao;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;

public class AlwaysOnService extends BaseService {
    private static String LOG_TAG = AlwaysOnService.class.getSimpleName();
    public static boolean isRunning = false;
    private ScheduledExecutorService backgroundService;

    private static final String CHANNEL_ID = "44944";
    private static final String CHANNEL_NAME = "AlwaysOnServiceChannel";

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_HIGH);
            NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            manager.createNotificationChannel(channel);
            Notification notification = new Notification.Builder(getApplicationContext(), CHANNEL_ID).build();
            startForeground(1, notification);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (!isRunning) {
            // run something
            backgroundService = Executors.newSingleThreadScheduledExecutor();
            if (intent != null) {
                String accessToken = intent.getStringExtra("accessToken");
                String storeId = intent.getStringExtra("storeId");
                if (accessToken != null && storeId != null) {
                    backgroundService.scheduleAtFixedRate(new NotifyNewOrderRunnable(accessToken, storeId), 0, 2, TimeUnit.MINUTES);
                }
            }
            backgroundService.scheduleAtFixedRate(new TimerIncreasedRunnable(this), 0, 1000, TimeUnit.MILLISECONDS);
            isRunning = true;
        }
        // the following will return START_STICKY
        return super.onStartCommand(intent, flags, startId);
    }

    @Override
    public void onDestroy() {
        // stop running
        isRunning = false;
        if (backgroundService != null) {
            backgroundService.shutdownNow();
        }
        super.onDestroy();
    }

    public class NotifyNewOrderRunnable implements Runnable {

        private String accessToken;
        private String storeId;

        public NotifyNewOrderRunnable(String accessToken, String storeId) {
            this.accessToken = accessToken;
            this.storeId = storeId;
        }

        @Override
        public void run() {
            if (SettingUtility.isDisableNewOrderSoundNotify()) {
                return;
            }
            StoreDao dao = new StoreDao();
            try {
                ResultBean<List<Map<String, String>>> r = dao.getNewOrderCnt(accessToken, storeId);
                List<Map<String, String>> result = r.getObj();
                if (result != null && result.size() > 0) {
                    for (Map<String, String> item : result) {
                        String alert = item.get("alert");
                        String plat = item.get("plat");
                        String storeName = item.get("store_name");
                        int notifyTimes = 1;
                        if (item.get("notify_times") != null) {
                            try {
                                notifyTimes = Integer.parseInt(item.get("notify_times"));
                            } catch (Exception e) {
                                notifyTimes = 1;
                            }
                        }
                        if (null != alert && !"".equals(alert)) {
                            play(alert, plat, storeName, notifyTimes);
                        }
                    }
                }
            } catch (Exception e) {
                AppLogger.e(e.getMessage(), e);
            }
        }

        private void play(String text, String plat, String storeName, int notifyTimes) {
            if (SettingUtility.isDisableNewOrderSoundNotify()) {
                return;
            }
            GlobalCtx.app().getSoundManager().notifyNewOrder(text, plat, storeName, notifyTimes);
        }
    }


    public class TimerIncreasedRunnable implements Runnable {
        private SharedPreferences currentSharedPreferences;

        public TimerIncreasedRunnable(Context context) {
            this.currentSharedPreferences = context.getSharedPreferences(
                    Constants.SHAREDPREF_APP_STRING, MODE_PRIVATE);
        }

        @Override
        public void run() {
            int timeCount = this.readTimeCount() + 1;
            this.writeTimeCount(timeCount);
            int currentEpochTimeInSeconds = (int) (System.currentTimeMillis() / 1000L);
            Log.v(LOG_TAG, "Count:" + timeCount + " at time:"
                    + currentEpochTimeInSeconds);
        }

        private int readTimeCount() {
            return this.currentSharedPreferences.getInt(
                    Constants.SHAREDPREF_RUNNINGTIMECOUNT_STRING, 0);
        }

        private void writeTimeCount(int timeCount) {
            this.currentSharedPreferences.edit().putInt(
                    Constants.SHAREDPREF_RUNNINGTIMECOUNT_STRING,
                    timeCount).commit();
        }
    }
}
