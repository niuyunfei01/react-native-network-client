package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 * Created by liuzhr on 5/20/16.
 */
public class UserCommentsActivity extends WebViewActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.quality_case_list);
        String url = GlobalCtx.getInstance().getUrl("user_comments.list");
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }
}
