package cn.cainiaoshicai.crm.ui.scanner;

import android.os.Bundle;

import cn.cainiaoshicai.crm.R;

public class FullScannerFragmentActivity extends BaseScannerActivity {
    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_full_scanner_fragment);
        setupToolbar();
    }
}