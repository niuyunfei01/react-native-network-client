package cn.cainiaoshicai.crm.support.react;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;


public class ActivityBleManager extends ReactContextBaseJavaModule {

    public ActivityBleManager(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "ActivityBleManager";
    }
    
    void getDeviceList(){

    }
}
