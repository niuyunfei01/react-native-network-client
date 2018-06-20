package cn.cainiaoshicai.crm.notify.service;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.dao.StoreDao;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

public class AlwaysOnService extends BaseService {
    private static String LOG_TAG = AlwaysOnService.class.getSimpleName();
    public static boolean isRunning = false;
    private ScheduledExecutorService backgroundService;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (!isRunning) {
            // run something
            backgroundService = Executors.newSingleThreadScheduledExecutor();
            if (intent != null) {
                String accessToken = intent.getStringExtra("accessToken");
                String storeId = intent.getStringExtra("storeId");
                if (accessToken != null && storeId != null) {
                    backgroundService.scheduleAtFixedRate(new NotifyNewOrderRunnable(accessToken, storeId), 0, 3, TimeUnit.MINUTES);
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
        backgroundService.shutdownNow();
        super.onDestroy();
    }

    public class NotifyNewOrderRunnable implements Runnable {

        private String accessToken;
        private String storeId;
        GlobalCtx.SoundManager soundManager = GlobalCtx.app().getSoundManager();

        public NotifyNewOrderRunnable(String accessToken, String storeId) {
            this.accessToken = accessToken;
            this.storeId = storeId;
        }

        @Override
        public void run() {
            StoreDao dao = new StoreDao();
            try {
                ResultBean<List<Map<String, String>>> r = dao.getNewOrderCnt(accessToken, storeId);
                List<Map<String, String>> result = r.getObj();
                if (result != null && result.size() > 0) {
                    for (Map<String, String> item : result) {
                        String alert = item.get("alert");
                        String plat = item.get("plat");
                        if (null != alert && !"".equals(alert)) {
                            play(alert, plat);
                        }
                    }
                }
            } catch (Exception e) {
                AppLogger.e(e.getMessage(), e);
            }
        }

        private void play(String text, String plat) {
            for (int i = 0; i < 3; i++) {
                if (plat.equals("6")) {
                    GlobalCtx.app().getSoundManager().play_new_jd_order_sound();
                } else if (plat.equals("4")) {
                    GlobalCtx.app().getSoundManager().play_new_ele_order_sound();
                } else {
                    GlobalCtx.app().getSoundManager().play_new_mt_order_sound();
                }
                try {
                    Thread.sleep(8000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
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
