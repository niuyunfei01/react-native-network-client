package cn.cainiaoshicai.crm.support.react;

import android.app.Activity;
import android.app.SearchManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.telecom.Call;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.util.HashMap;

import javax.annotation.Nonnull;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.DaoHelper;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.BasePrinter;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.LoginActivity;
import cn.cainiaoshicai.crm.ui.activity.OrderQueryActivity;
import cn.cainiaoshicai.crm.ui.activity.SettingsPrintActivity;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageActivity;
import cn.cainiaoshicai.crm.ui.activity.UserCommentsActivity;

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

    void currentVersion(@Nonnull Callback clb) {
        HashMap<String, String> m = new HashMap<>();
        Activity act = this.getCurrentActivity();
        if (act != null) {
            m.put("version_code", Utility.getVersionCode(act));
            m.put("version_name", Utility.getVersionName(act));
        }
        clb.invoke(DaoHelper.gson().toJson(m));
    }

    @ReactMethod
    void updateAfterTokenGot(@Nonnull String token, int expiresInSeconds, @Nonnull Callback callback){
        try {
            LoginActivity.DBResult r = GlobalCtx.app().afterTokenUpdated(token, expiresInSeconds);
            AccountBean ab = GlobalCtx.app().getAccountBean();

            AppLogger.i("updateAfterTokenGot " + (ab == null ? "null" : ab.getInfo()));

            if (ab != null && ab.getInfo() != null) {
                callback.invoke(true, "ok", DaoHelper.gson().toJson(ab.getInfo()));
            } else {
                callback.invoke(false, "Account is null", null);
            }
        } catch (IOException | ServiceException e) {
            e.printStackTrace();
            String reason = e instanceof ServiceException ? ((ServiceException) e).getError() : "网络异常，稍后重试";
            callback.invoke(false, reason, null);
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
    void toSettings() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, SettingsPrintActivity.class);
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void toUserComments() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, UserCommentsActivity.class);
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void ordersByMobileTimes(@Nonnull String mobile, int times) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, OrderQueryActivity.class);
            intent.setAction(Intent.ACTION_SEARCH);
            intent.putExtra(SearchManager.QUERY, mobile);
            intent.putExtra("times", times);
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void searchOrders(@Nonnull String term) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, OrderQueryActivity.class);
            intent.setAction(Intent.ACTION_SEARCH);

            if ("invalid:".equals(term)) {
                intent.putExtra("list_type", ListType.INVALID.getValue());
            } else {
                intent.putExtra(SearchManager.QUERY, term);
            }

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
    void printBtPrinter(@Nonnull String orderJson, @Nonnull final Callback callback) {
        Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
        final Order o = gson.fromJson(orderJson, new TypeToken<Order>() {
        }.getType());

        ReactApplicationContext ctx = this.getReactApplicationContext();

        final BluetoothPrinters.DeviceStatus ds = BluetoothPrinters.INS.getCurrentPrinter();
        if (ds == null || ds.getSocket() == null || !ds.isConnected()) {
            Intent intent = new Intent(ctx, SettingsPrintActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(intent, new Bundle());
            callback.invoke(false, "打印机未连接");
        } else {
            new MyAsyncTask<Void, Void, Void>() {

                @Override
                protected Void doInBackground(Void... params) {
                    OrderPrinter._print(o, false, new BasePrinter.PrintCallback() {
                        @Override
                        public void run(boolean result, String desc) {
                            callback.invoke(result, desc);
                        }
                    });
                    return null;
                }
            }.executeOnNormal();
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
