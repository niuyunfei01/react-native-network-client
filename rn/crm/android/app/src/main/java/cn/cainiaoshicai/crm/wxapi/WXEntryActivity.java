package cn.cainiaoshicai.crm.wxapi;

import android.os.Bundle;

import com.theweflex.react.WeChatModule;
import cn.cainiaoshicai.crm.ui.activity.AbstractActionBarActivity;

public class WXEntryActivity extends AbstractActionBarActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WeChatModule.handleIntent(getIntent());
        finish();
    }
}
