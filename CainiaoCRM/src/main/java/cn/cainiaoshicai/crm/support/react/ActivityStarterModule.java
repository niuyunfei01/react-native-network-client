package cn.cainiaoshicai.crm.support.react;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeArray;

import java.io.IOException;

import javax.annotation.Nonnull;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.ui.activity.LoginActivity;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageActivity;

/**
 * Expose Java to JavaScript.
 */
class ActivityStarterModule extends ReactContextBaseJavaModule {

    ActivityStarterModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    /**
     * @return the name of this module. This will be the name used to {@code require()} this module
     * from JavaScript.
     */
    @Override
    public String getName() {
        return "ActivityStarter";
    }

    @ReactMethod
    void navigateToGoods() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, StoreStorageActivity.class);
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void logout() {
        SettingUtility.setDefaultAccountId("");
        GlobalCtx.app().setAccountBean(null);
    }

    @ReactMethod
    void updateAfterTokenGot(@Nonnull String token, int expiresInSeconds, @Nonnull Callback callback){
        try {
            LoginActivity.DBResult r = GlobalCtx.app().afterTokenUpdated(token, expiresInSeconds);
            AccountBean ab = GlobalCtx.app().getAccountBean();
            if (ab != null) {
                callback.invoke(true, "ok", ab.getInfo());
            } else {
                callback.invoke(false, "Account is null", null);
            }
        } catch (IOException | ServiceException e) {
            e.printStackTrace();
            callback.invoke(false, "exception:" + e.getMessage(), null);
        }
    }

    @ReactMethod
    void setCurrStoreId(@Nonnull String currId, @Nonnull Callback callback){
        try {
            long selectedStoreId = Long.parseLong(currId);
            if (selectedStoreId > 0) {
                SettingUtility.setListenerStores(selectedStoreId);
                callback.invoke(true, "ok", null);
            } else {
                callback.invoke(false, "Account is null", null);
            }
        } catch (Exception e) {
            e.printStackTrace();
            callback.invoke(false, "exception:" + e.getMessage(), null);
        }
    }

    @ReactMethod
    void navigateToOrders() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, MainActivity.class);
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void dialNumber(@Nonnull String number) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + number));
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void getActivityName(@Nonnull Callback callback) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            callback.invoke(activity.getClass().getSimpleName());
        }
    }

    @ReactMethod
    void getActivityNameAsPromise(@Nonnull Promise promise) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            promise.resolve(activity.getClass().getSimpleName());
        }
    }

    @ReactMethod
    void callJavaScript() {
//        Activity activity = getCurrentActivity();
//        if (activity != null) {
//            MainApplication application = (MainApplication) activity.getApplication();
//            ReactNativeHost reactNativeHost = application.getReactNativeHost();
//            ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
//            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
//
//            if (reactContext != null) {
//                CatalystInstance catalystInstance = reactContext.getCatalystInstance();
//                WritableNativeArray params = new WritableNativeArray();
//                params.pushString("Hello, JavaScript!");
//                catalystInstance.callFunction("JavaScriptVisibleToJava", "alert", params);
//            }
//        }
    }
}
