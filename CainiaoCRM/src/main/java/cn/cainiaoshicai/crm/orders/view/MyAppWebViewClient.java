package cn.cainiaoshicai.crm.orders.view;

import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import cn.cainiaoshicai.crm.dao.URLHelper;

public class MyAppWebViewClient extends WebViewClient {

    private PageCallback callback;

    static public interface PageCallback {
        public void onPageFinished(WebView view, String url);
        void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error);

        void handleRedirectUrl(WebView view, String url);

        boolean shouldOverrideUrlLoading(WebView view, String url);
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (this.callback != null) {
            return this.callback.shouldOverrideUrlLoading(view, url);
        } else {
            return super.shouldOverrideUrlLoading(view, url);
        }
    }

    @Override
    public void onPageStarted(WebView view, String url, Bitmap favicon) {
        if (url.startsWith(URLHelper.DIRECT_URL)) {

            if (this.callback != null) {
                this.callback.handleRedirectUrl(view, url);
            }

            view.stopLoading();
            return;
        }
        super.onPageStarted(view, url, favicon);
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        super.onReceivedError(view, request, error);
        if (this.callback != null) {
            this.callback.onReceivedError(view, request, error);
        }
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        if (this.callback != null) {
            callback.onPageFinished(view, url);
        }
    }

    public void setCallback(PageCallback callback) {
        this.callback = callback;
    }
}