package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;
import android.support.v7.app.ActionBar;
import android.view.Menu;

import cn.cainiaoshicai.crm.R;

/**
 * Created by liuzhr on 5/29/17.
 */

public class TowerActivity extends GeneralWebViewActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ActionBar ab = this.getSupportActionBar();
        if (ab != null) {
            ab.setTitle("项目追踪");
            ab.setDisplayOptions(ActionBar.DISPLAY_USE_LOGO | ActionBar.DISPLAY_SHOW_HOME);
            ab.setDisplayHomeAsUpEnabled(true);
        }

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.tower_menu, menu);
        return true;
    }
}
