package cn.cainiaoshicai.crm.orders.view;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.WebSettings;
import android.webkit.WebView;

import cn.cainiaoshicai.crm.R;

/**
 */
public class OrderSingleActivity extends Activity {
    private static final String HTTP_MOBILE_STORES = "http://www.cainiaoshicai.cn/stores";
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.order_single);

        mWebView = (WebView) findViewById(R.id.activity_main_webview);
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        mWebView.setWebViewClient(new MyAppWebViewClient());

        mWebView.addJavascriptInterface(new WebAppInterface(this), "crm_andorid");

        Intent intent = getIntent();
        String oid = intent.getStringExtra("order_id");
        String source = intent.getStringExtra("order_source");
        mWebView.loadUrl(String.format("%s/single_order/android/%s/%s.html", HTTP_MOBILE_STORES, source, oid));
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
