package cn.cainiaoshicai.crm.notify.service;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.MediaPlayer;
import android.net.Uri;
import android.util.Log;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StoreDao;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

public class AlwaysOnService extends BaseService {
    private static String LOG_TAG = AlwaysOnService.class.getSimpleName();
    public static boolean isRunning = false;
    private ScheduledExecutorService backgroundService;
    private MediaPlayer mediaPlayer;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (isRunning == false) {
            // run something
            backgroundService = Executors.newSingleThreadScheduledExecutor();
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setVolume(100, 100);
            Uri setDataSourceUri = Uri.parse("android.resource://com.android.sim/" + R.raw.bell_new_order);
            boolean mediaInitFlag = true;
            try {
                mediaPlayer.setDataSource(this, setDataSourceUri);
                mediaInitFlag = false;
            } catch (IOException e) {
                e.printStackTrace();
            }
            String accessToken = intent.getStringExtra("accessToken");
            String storeId = intent.getStringExtra("storeId");
            backgroundService.scheduleAtFixedRate(new TimerIncreasedRunnable(this), 0, 1000, TimeUnit.MILLISECONDS);
            backgroundService.scheduleAtFixedRate(new NotifyNewOrderRunnable(mediaPlayer, mediaInitFlag, accessToken, storeId), 0, 3, TimeUnit.MINUTES);
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

        private MediaPlayer mediaPlayer;
        private boolean mediaInitFlag;
        private String accessToken;
        private String storeId;

        public NotifyNewOrderRunnable(MediaPlayer mediaPlayer, boolean mediaInitFlag, String accessToken, String storeId) {
            this.mediaPlayer = mediaPlayer;
            this.mediaInitFlag = mediaInitFlag;
            this.accessToken = accessToken;
            this.storeId = storeId;
        }

        @Override
        public void run() {
            StoreDao dao = new StoreDao();
            try {
                ResultBean<Map<String, String>> r = dao.getNewOrderCnt(accessToken, storeId);
                Map<String, String> result = r.getObj();
                int count = Integer.parseInt(result.get("cnt"));
                if (count > 0) {
                    play();
                }
            } catch (Exception e) {
                AppLogger.e(e.getMessage(), e);
            }
        }

        private void play() {
            if (!mediaInitFlag) {
                return;
            }
            if (mediaPlayer.isPlaying()) {
                mediaPlayer.reset();
            }
            mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
                int maxCount = 3;
                int count = 0;

                @Override
                public void onCompletion(MediaPlayer mediaPlayer) {
                    if (count < maxCount) {
                        count++;
                        mediaPlayer.seekTo(0);
                        mediaPlayer.start();
                    }
                }
            });
            mediaPlayer.start();
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
