package cn.cainiaoshicai.crm.ui.splash;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Handler;

import com.iflytek.cloud.SpeechUtility;

import cn.cainiaoshicai.crm.AudioUtils;
import cn.cainiaoshicai.crm.R;

public class BackgroundTask extends AsyncTask {
    private static final int SPLASH_TIME = 2000;
    private Intent intent;
    private Context context;
    private String className;

    public BackgroundTask(Context context, String className) {
        this.context = context;
        this.className = className;
    }

    @Override
    protected void onPreExecute() {
        super.onPreExecute();
        Class<?> classItem = null;
        if (className != null) {
            try {
                classItem = Class.forName(className);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
        }
        intent = new Intent(context, classItem);
    }

    @Override
    protected Object doInBackground(Object[] params) {
            /*  Use this method to load background
            * data that your app needs. */
        // 初始化合成对象
        SpeechUtility.createUtility(context, "appid=" + R.string.app_id);
        AudioUtils.getInstance().init(context);
        return null;
    }

    @Override
    protected void onPostExecute(Object o) {

        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                //Create an intent that will start the main activity.
                intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                context.startActivity(intent);
                // finish
                ((Activity) context).finish();
                //Apply splash exit (fade out) and main entry (fade in) animation transitions.
                ((Activity) context).overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
            }
        }, 1000);

    }
}
