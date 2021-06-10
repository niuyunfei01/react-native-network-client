package cn.cainiaoshicai.crm.wxapi;

import android.content.Intent;
import android.os.Bundle;

import cn.cainiaoshicai.crm.MainOrdersActivity;
import cn.cainiaoshicai.crm.ui.activity.AbstractActionBarActivity;

public class WXEntryActivity extends AbstractActionBarActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent intent = new Intent(getApplicationContext(), MainOrdersActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
    }
}