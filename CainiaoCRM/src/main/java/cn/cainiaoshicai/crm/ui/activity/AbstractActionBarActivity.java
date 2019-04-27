package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;
import android.os.PersistableBundle;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.view.KeyEvent;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.google.common.collect.Maps;

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
            System.out.println("barcode => " + barcode);
            barcode = barcode.replaceAll("\\s+", "");
            if (barcode.startsWith("IR")) {
                Map<String, String> result = BarCodeUtil.extractCode(barcode);
                GlobalCtx.app().scanInfo().add(result);
                long lastTalking = GlobalCtx.app().scanInfo().getLastTalking();
                if (lastTalking - System.currentTimeMillis() > 1000) {
                    GlobalCtx.app().toRnView(this, result.get("action"), result);
                } else {
                    System.out.println("lastTalking = " + (lastTalking / 1000) + ", now=" + (System.currentTimeMillis() / 1000));
                }
            } else if (barcode.startsWith("PROD")) {
                Map<String, String> result = BarCodeUtil.extractCode(barcode);
                WritableMap params = Arguments.createMap();
                for (Map.Entry<String, String> entry : result.entrySet()) {
                    params.putString(entry.getKey(), entry.getValue());
                }
                ReactContext reactContext = GlobalCtx.app().getReactContext();
                GlobalCtx.app().sendRNEvent(reactContext, "listenScanProductCode", params);
            } else if (barcode.startsWith("WO")) {
                ReactContext reactContext = GlobalCtx.app().getReactContext();
                WritableMap params = Arguments.createMap();
                params.putString("orderId", barcode.replace("WO", ""));
                GlobalCtx.app().sendRNEvent(reactContext, "listenScanBarCode", params);
            } else {
                if (BarCodeUtil.checkGTIN(barcode, true)) {
                    GlobalCtx.app().scanInfo().addUpc(barcode);
                }
            }
        } catch (Exception e) {
            System.out.println("scan code exception " + e.getMessage());
        }
    }
}
