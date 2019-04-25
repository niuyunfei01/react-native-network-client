package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;
import android.os.PersistableBundle;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.view.KeyEvent;

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
            Map<String, String> result = BarCodeUtil.extractCode(barcode);
            GlobalCtx.app().scanInfo().add(result);
            long lastTalking = GlobalCtx.app().scanInfo().getLastTalking();
            if(lastTalking - System.currentTimeMillis() > 1000){
                GlobalCtx.app().toRnView(this, result.get("action"), result);
            } else {
                System.out.println("lastTalking = " + (lastTalking/1000) + ", now=" + (System.currentTimeMillis()/1000));
            }
        } catch (Exception e) {
            System.out.println("scan code exception " + e.getMessage());
        }
    }
}
