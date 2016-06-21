package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

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
}
