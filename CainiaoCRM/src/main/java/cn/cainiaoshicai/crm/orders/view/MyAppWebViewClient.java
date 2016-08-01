package cn.cainiaoshicai.crm.orders.view;

import android.content.Intent;
import android.net.Uri;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MyAppWebViewClient extends WebViewClient {

    static public interface PageCallback {
        public void execute(WebView view, String url);
    }

    PageCallback finishCallback;

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (Uri.parse(url).getHost().endsWith("cainiaoshicai.cn")) {
            return false;
        }

        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        view.getContext().startActivity(intent);
        return true;
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        if (this.finishCallback != null) {
            finishCallback.execute(view, url);
        }
    }

    public void setFinishCallback(PageCallback finishCallback) {
        this.finishCallback = finishCallback;
    }
}