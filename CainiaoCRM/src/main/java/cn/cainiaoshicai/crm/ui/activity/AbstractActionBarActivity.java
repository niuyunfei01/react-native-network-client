package cn.cainiaoshicai.crm.ui.activity;

import android.support.v7.app.ActionBarActivity;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;

/**
 * Created by liuzhr on 6/1/16.
 */
public class AbstractActionBarActivity extends ActionBarActivity {

    @Override
    protected void onResume() {
        super.onResume();
        GlobalCtx.getInstance().setCurrentRunningActivity(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (GlobalCtx.getInstance().getCurrentRunningActivity() == this) {
            GlobalCtx.getInstance().setCurrentRunningActivity(null);
        }
    }
}
