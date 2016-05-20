package cn.cainiaoshicai.crm.ui.activity;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.view.KeyEvent;
import android.view.MenuItem;
import android.webkit.WebSettings;
import android.webkit.WebView;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.view.MyAppWebViewClient;
import cn.cainiaoshicai.crm.orders.view.WebAppInterface;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 */
public class QualityCaseActivity  extends WebViewActivity   {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.quality_case_list);
        String url = GlobalCtx.getInstance().getUrl("quality_case.list");
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }

    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.menu_process:
                startActivity(new Intent(getApplicationContext(), MainActivity.class));
                return true;
            case R.id.menu_accept:
                startActivity(new Intent(getApplicationContext(), RemindersActivity.class));
                return true;
//            case R.id.menu_manage:
//                return true;
//            case R.id.menu_settings:
//                showHelp();
//                startActivity(new Intent(getApplicationContext(), BTDeviceListActivity.class));
//                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }


}
