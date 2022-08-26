package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;
import android.os.PersistableBundle;
import android.view.KeyEvent;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;

import java.util.Map;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.scan.BluetoothScanGunKeyEventHelper;
import cn.cainiaoshicai.crm.utils.BarCodeUtil;

/**
 * Created by liuzhr on 6/1/16.
 */
public class AbstractActionBarActivity extends AppCompatActivity implements BluetoothScanGunKeyEventHelper.OnScanSuccessListener {

    private BluetoothScanGunKeyEventHelper mScanGunKeyEventHelper;

    @Override
    protected void onResume() {
        super.onResume();
        GlobalCtx.app().setCurrentRunningActivity(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (GlobalCtx.app().getCurrentRunningActivity() == this) {
            GlobalCtx.app().setCurrentRunningActivity(null);
        }
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState, @Nullable PersistableBundle persistentState) {
        super.onCreate(savedInstanceState, persistentState);
        mScanGunKeyEventHelper = new BluetoothScanGunKeyEventHelper(this);
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mScanGunKeyEventHelper = new BluetoothScanGunKeyEventHelper(this);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (mScanGunKeyEventHelper.isScanGunEvent(event)) {
            mScanGunKeyEventHelper.analysisKeyEvent(event);
            return true;
        }
        return super.dispatchKeyEvent(event);
//        mScanGunKeyEventHelper.analysisKeyEvent(event);
//        return true;
    }


    @Override
    public void onScanSuccess(String barcode) {
        try {
            ReactContext reactContext = GlobalCtx.app().getReactContext();
            System.out.println("barcode => " + barcode);

            barcode = barcode.replaceAll("\\s+", "");
            if (barcode.startsWith("IR")) {
                Map<String, String> result = BarCodeUtil.extractCode(barcode);
                WritableMap params = Arguments.createMap();
                for (Map.Entry<String, String> entry : result.entrySet()) {
                    params.putString(entry.getKey(), entry.getValue());
                }
                GlobalCtx.app().sendRNEvent(reactContext, "listenScanIrCode", params);
            } else if (barcode.startsWith("PROD")) {
                Map<String, String> result = BarCodeUtil.extractCode(barcode);
                WritableMap params = Arguments.createMap();
                for (Map.Entry<String, String> entry : result.entrySet()) {
                    params.putString(entry.getKey(), entry.getValue());
                }
                GlobalCtx.app().sendRNEvent(reactContext, "listenScanProductCode", params);
            } else if (barcode.startsWith("WO")) {
                WritableMap params = Arguments.createMap();
                params.putString("orderId", barcode.replace("WO", ""));
                GlobalCtx.app().sendRNEvent(reactContext, "listenScanBarCode", params);
            } else {
                //标品处理
                if (barcode.startsWith("JBBUPC") || BarCodeUtil.checkGTIN(barcode, true)) {
                    WritableMap params = Arguments.createMap();
                    params.putString("barCode", barcode);
                    GlobalCtx.app().sendRNEvent(reactContext, "listenScanStandardProdBarCode", params);
                }
            }
        } catch (Exception e) {
            System.out.println("scan code exception " + e.getMessage());
        }
    }
}
