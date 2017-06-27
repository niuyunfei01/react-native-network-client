package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 * Created by liuzhr on 6/1/16.
 */
public class MonthPerfActivity extends WebViewActivity {

    public MonthPerfActivity() {
        this.contentViewRes = R.layout.quality_case_list;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        String url = GlobalCtx.app().getUrl("me.monthly_performance");
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }
}
