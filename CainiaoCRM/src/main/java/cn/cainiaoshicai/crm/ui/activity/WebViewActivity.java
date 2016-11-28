package cn.cainiaoshicai.crm.ui.activity;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.util.Util;
import cn.cainiaoshicai.crm.orders.view.MyAppWebViewClient;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.orders.view.WebAppInterface;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 * Created by liuzhr on 5/17/16.
 */
public class WebViewActivity extends AbstractActionBarActivity {

    public static final int FROM_MINE = 1;
    public static final int FROM_HOME = 2;

    protected WebView mWebView;
    protected int contentViewRes;
    private MenuItem refreshItem;

    protected int from;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(this.contentViewRes);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        mWebView = (WebView) findViewById(R.id.activity_main_webview);
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        MyAppWebViewClient client = new MyAppWebViewClient();
        client.setCallback(new MyAppWebViewClient.PageCallback() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (!url.equals("about:blank")) {
                    completeRefresh();
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                Toast.makeText(WebViewActivity.this, "发生错误" + error, Toast.LENGTH_LONG).show();
                AppLogger.e("web view error:" + error);
            }

            public void handleRedirectUrl(WebView view, String url) {
                Bundle values = Utility.parseUrl(url);
                String error = values.getString("error");
                String error_code = values.getString("error_code");

                Intent intent = new Intent();
                intent.putExtras(values);

                if (error == null && error_code == null) {
                    String access_token = values.getString("access_token");
                    String expires_time = values.getString("expires_in");
                    WebViewActivity.this.setResult(RESULT_OK, intent);
        //            new OAuthTask(this).onPageFinished(access_token, expires_time);
                } else {
                    Toast.makeText(WebViewActivity.this, getString(R.string.you_cancel_login),
                            Toast.LENGTH_SHORT).show();
                    finish();
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return Utility.handleUrlJump(WebViewActivity.this, view, url);
            }

        });
        mWebView.setWebViewClient(client);
        mWebView.addJavascriptInterface(new WebAppInterface(this), "crm_andorid");
    }

    private void completeRefresh() {
        if (refreshItem != null && refreshItem.getActionView() != null) {
            refreshItem.getActionView().clearAnimation();
            refreshItem.setActionView(null);
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.webview_menu, menu);
        refreshItem = menu.findItem(R.id.menu_refresh);
        return true;
    }

    @Override
    public boolean onSupportNavigateUp(){
        finish();
        // or call onBackPressed()
        return true;
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
