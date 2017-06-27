package cn.cainiaoshicai.crm.ui.activity;

import android.support.v7.app.AppCompatActivity;

import cn.cainiaoshicai.crm.GlobalCtx;

/**
 * Created by liuzhr on 6/1/16.
 */
public class AbstractActionBarActivity extends AppCompatActivity {

    @Override
    protected void onResume() {
        super.onResume();
        GlobalCtx.app().setCurrentRunningActivity(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (GlobalCtx.app().getCurrentRunningActivity() == this) {
            GlobalCtx.app().setCurrentRunningActivity(null);
        }
    }
}
