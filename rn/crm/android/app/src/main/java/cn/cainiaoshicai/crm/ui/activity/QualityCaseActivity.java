package cn.cainiaoshicai.crm.ui.activity;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainOrdersActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 */
public class QualityCaseActivity  extends WebViewActivity   {

    public QualityCaseActivity() {
        this.contentViewRes = R.layout.quality_case_list;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.quality_case_list);
        String url = GlobalCtx.app().getUrl("quality_case.list");
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }

    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.menu_process:
                startActivity(new Intent(getApplicationContext(), MainOrdersActivity.class));
                return true;
            case R.id.menu_accept:
                GlobalCtx.app().toTaskListActivity(this);
                return true;
//            case R.id.menu_manage:
//                return true;
//            case R.id.menu_settings:
//                showHelp();
//                startActivity(new Intent(getApplicationContext(), SettingsPrintActivity.class));
//                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }


}
