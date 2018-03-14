package cn.cainiaoshicai.crm.ui.scanner;

import android.os.Bundle;
import cn.cainiaoshicai.crm.R;

public class SimpleScannerFragmentActivity extends BaseScannerActivity {
    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_simple_scanner_fragment);
        setupToolbar();
    }
}