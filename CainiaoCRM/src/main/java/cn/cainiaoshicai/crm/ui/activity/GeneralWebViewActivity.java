package cn.cainiaoshicai.crm.ui.activity;

import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 * Created by liuzhr on 5/20/16.
 */
public class GeneralWebViewActivity extends WebViewActivity {

    public GeneralWebViewActivity() {
        AppLogger.v("start general web view activity");
        this.contentViewRes = R.layout.quality_case_list;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        String url = this.getIntent().getStringExtra("url");
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }

    private class WeiboWebViewClient extends WebViewClient {

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            view.loadUrl(url);
            return true;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            if (url.startsWith(URLHelper.DIRECT_URL)) {
                handleRedirectUrl(view, url);
                view.stopLoading();
                return;
            }
            super.onPageStarted(view, url, favicon);
        }

        @Override
        public void onReceivedError(WebView view, int errorCode, String description,
                                    String failingUrl) {
            super.onReceivedError(view, errorCode, description, failingUrl);
//            new SinaWeiboErrorDialog().show(getSupportFragmentManager(), "");
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            if (!url.equals("about:blank")) {
                completeRefresh();
            }
        }
    }

    private void completeRefresh() {
//        if (refreshItem.getActionView() != null) {
//            refreshItem.getActionView().clearAnimation();
//            refreshItem.setActionView(null);
//        }
    }

    private void handleRedirectUrl(WebView view, String url) {
        Bundle values = Utility.parseUrl(url);
        String error = values.getString("error");
        String error_code = values.getString("error_code");

        Intent intent = new Intent();
        intent.putExtras(values);

        if (error == null && error_code == null) {

            String access_token = values.getString("access_token");
            String expires_time = values.getString("expires_in");
            setResult(RESULT_OK, intent);
//            new OAuthTask(this).execute(access_token, expires_time);
        } else {
            Toast.makeText(GeneralWebViewActivity.this, getString(R.string.you_cancel_login),
                    Toast.LENGTH_SHORT).show();
            finish();
        }
    }
}
