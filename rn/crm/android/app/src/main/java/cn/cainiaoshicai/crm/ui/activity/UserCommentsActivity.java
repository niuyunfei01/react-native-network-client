package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 * Created by liuzhr on 5/20/16.
 */
public class UserCommentsActivity extends WebViewActivity {

    public UserCommentsActivity() {
        AppLogger.v("start user comments activity");
        this.contentViewRes = R.layout.quality_case_list;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        String url = GlobalCtx.app().getUrl("user_comments.list");
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }
}
