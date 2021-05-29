package cn.cainiaoshicai.crm.ui.activity;

import android.app.Activity;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import android.view.KeyEvent;
import android.view.Menu;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.view.MyAppWebViewClient;
import cn.cainiaoshicai.crm.orders.view.WebAppInterface;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 * Created by liuzhr on 5/20/16.
 */
public class GeneralWebViewActivity extends AppCompatActivity {

    private final int contentViewRes;
    private WebView mWebView;
    private long mExitTime = 0;
    public GeneralWebViewActivity() {
        AppLogger.v("start general web view activity");
        this.contentViewRes = R.layout.quality_case_list;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(this.contentViewRes);

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
                Toast.makeText(GeneralWebViewActivity.this, "发生错误" + error, Toast.LENGTH_LONG).show();
                AppLogger.e("web view error:" + error);
            }

            public void handleRedirectUrl(WebView view, String url) {
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return Utility.handleUrlJump(GeneralWebViewActivity.this, view, url);
            }

        });
        mWebView.setWebViewClient(client);
        mWebView.addJavascriptInterface(new WebAppInterface(this), "crm_andorid");

        String url = this.getIntent().getStringExtra("url");
        String token = GlobalCtx.app().getAccountBean().getAccess_token();
        if (url.indexOf("?") >= 0) {
            url = url + "&access_token=" + token;
        } else {
            url = url + "?access_token=" + token;
        }
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }

    private void completeRefresh() {

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        return false;
    }

    @Override
    public void onBackPressed() {
        if (System.currentTimeMillis() - mExitTime > 2000) {
            mExitTime = System.currentTimeMillis();
            if (mWebView.canGoBack()) {
                mWebView.goBack();
            } else {
                super.onBackPressed();
            }
        } else {
            startActivity(MainActivity.newIntent());
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

    public static void gotoWeb(Activity ctx, String url) {
        Intent intent = new Intent(ctx, GeneralWebViewActivity.class);
        intent.putExtra("url", url);
        ctx.startActivity(intent);
    }
}
