package cn.cainiaoshicai.crm.ui.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.view.KeyEvent;
import android.view.MenuItem;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.Toast;

import com.example.BlueToothPrinterApp.BlueToothPrinterApp;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.view.MyAppWebViewClient;
import cn.cainiaoshicai.crm.orders.view.WebAppInterface;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 */
public class StorePerformActivity extends ActionBarActivity {
    private static final String HTTP_MOBILE_STORES = "http://www.cainiaoshicai.cn/stores";
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.store_perform);

        ActionBar ab = getSupportActionBar();
        ab.setHomeButtonEnabled(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        mWebView = (WebView) findViewById(R.id.activity_main_webview);
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        mWebView.setWebViewClient(new MyAppWebViewClient());

        mWebView.addJavascriptInterface(new WebAppInterface(this), "crm_andorid");

        String url = String.format("%s/store_perform.html", HTTP_MOBILE_STORES);
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
            case R.id.menu_manage:
                return true;
//            case R.id.menu_settings:
//                showHelp();
//                startActivity(new Intent(getApplicationContext(), BTDeviceListActivity.class));
//                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    @Override
    public void onBackPressed() {
        if(mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }


    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Check if the key event was the Back button and if there's history
        if ((keyCode == KeyEvent.KEYCODE_BACK) && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        // If it wasn't the Back key or there's no web page history, bubble up to the default
        // system behavior (probably exit the activity)
        return super.onKeyDown(keyCode, event);
    }
}
