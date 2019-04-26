package cn.cainiaoshicai.crm.support.react;

import android.app.Activity;
import android.app.FragmentManager;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.CatalystInstance;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nonnull;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.util.Log;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.DaoHelper;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingHelper;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.LoginActivity;
import cn.cainiaoshicai.crm.ui.activity.OrderQueryActivity;
import cn.cainiaoshicai.crm.ui.activity.SettingsPrintActivity;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageActivity;
import cn.cainiaoshicai.crm.ui.activity.UserCommentsActivity;
import cn.cainiaoshicai.crm.utils.AidlUtil;
import cn.cainiaoshicai.crm.utils.PrintQueue;
import cn.jpush.android.api.JPushInterface;

import static android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK;
import static android.content.Intent.FLAG_ACTIVITY_NEW_TASK;

/**
 * Expose Java to JavaScript.
 */
class ActivityStarterModule extends ReactContextBaseJavaModule {

    private static DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = null;

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
        Context activity = GlobalCtx.app().getCurrentRunningActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, StoreStorageActivity.class);
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void logout() {
        SettingUtility.setDefaultAccountId("");
        GlobalCtx.app().setAccountBean(null);
        //Bootstrap.stopAlwaysOnService(GlobalCtx.app());
        JPushInterface.deleteAlias(GlobalCtx.app(), (int) (System.currentTimeMillis() / 1000L));
    }

    @ReactMethod
    void gotoPage(@Nonnull String page) {
        Context ctx = GlobalCtx.app().getCurrentRunningActivity();
        if (ctx == null) {
            ctx = GlobalCtx.app();
        }
        Intent intent = new Intent(ctx, GlobalCtx.app().pageToActivity(page).getClass());
        ctx.startActivity(intent);
    }

    @ReactMethod
    void currentVersion(@Nonnull Callback clb) {
        HashMap<String, String> m = new HashMap<>();
        Context act = getReactApplicationContext().getApplicationContext();
        if (act != null) {
            m.put("version_code", Utility.getVersionCode(act));
            m.put("version_name", Utility.getVersionName(act));
        }
        clb.invoke(DaoHelper.gson().toJson(m));
    }

    @ReactMethod
    void updateAfterTokenGot(@Nonnull String token, int expiresInSeconds, @Nonnull Callback callback) {
        try {
            LoginActivity.DBResult r = GlobalCtx.app().afterTokenUpdated(token, expiresInSeconds);
            AccountBean ab = GlobalCtx.app().getAccountBean();

            AppLogger.i("updateAfterTokenGot " + (ab == null ? "null" : ab.getInfo()));

            if (ab != null && ab.getInfo() != null) {
                callback.invoke(true, "ok", DaoHelper.gson().toJson(ab.getInfo()));
            } else {
                callback.invoke(false, "Account is null", null);
            }

            //Bootstrap.stopAlwaysOnService(GlobalCtx.app());

            long store_id = SettingUtility.getListenerStore();
            Map<String, String> serviceExtras = Maps.newHashMap();
            String accessToken = "";
            if (GlobalCtx.app().getAccountBean() != null) {
                accessToken = GlobalCtx.app().getAccountBean().getAccess_token();
            }
            serviceExtras.put("accessToken", accessToken);
            serviceExtras.put("storeId", store_id + "");
            SettingHelper.setEditor(GlobalCtx.app(), "accessToken", accessToken);
            SettingHelper.setEditor(GlobalCtx.app(), "storeId", store_id + "");
            //Bootstrap.startAlwaysOnService(GlobalCtx.app(), "Crm", serviceExtras);
        } catch (IOException | ServiceException e) {
            e.printStackTrace();
            String reason = e instanceof ServiceException ? ((ServiceException) e).getError() : "网络异常，稍后重试";
            callback.invoke(false, reason, null);
        }
    }

    @ReactMethod
    void setCurrStoreId(@Nonnull String currId, @Nonnull Callback callback) {
        try {
            long selectedStoreId = Long.parseLong(currId);
            if (selectedStoreId > 0) {
                SettingUtility.setListenerStores(selectedStoreId);
                callback.invoke(true, "ok:" + currId + "-" + System.currentTimeMillis(), null);
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
        Context ctx = GlobalCtx.app().getCurrentRunningActivity();
        if (ctx != null) {
            Intent intent = new Intent(ctx, MainActivity.class);
            ctx.startActivity(intent);
        }
    }

    @ReactMethod
    void toSettings() {
        Context activity = GlobalCtx.app().getCurrentRunningActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, SettingsPrintActivity.class);
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void toOrder(String wm_id) {
        Context activity = GlobalCtx.app().getCurrentRunningActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, OrderSingleActivity.class);
            intent.putExtra("order_id", Integer.parseInt(wm_id));
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void toUserComments() {
        Context activity = GlobalCtx.app().getCurrentRunningActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, UserCommentsActivity.class);
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void ordersByMobileTimes(@Nonnull String mobile, int times) {
        Context activity = GlobalCtx.app().getCurrentRunningActivity();
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
        Context activity = GlobalCtx.app().getCurrentRunningActivity();
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
        Context activity = GlobalCtx.app().getCurrentRunningActivity();
        if (activity != null) {
            Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + number));
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void getHost(@Nonnull Callback callback) {
        Context activity = GlobalCtx.app().getCurrentRunningActivity();
        if (activity != null) {
            callback.invoke(URLHelper.getHost());
        }
    }

    @ReactMethod
    void getActivityName(@Nonnull Callback callback) {
        Context activity = GlobalCtx.app().getCurrentRunningActivity();
        if (activity != null) {
            callback.invoke(activity.getClass().getSimpleName());
        }
    }

    @ReactMethod
    void clearScan(@Nonnull String code, @Nonnull final Callback callback) {
        GlobalCtx.ScanStatus ss = GlobalCtx.app().scanInfo();

        try {
            ss.clearCode(code);
            callback.invoke(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    void clearScanUpc(@Nonnull String code, @Nonnull final Callback callback) {
        GlobalCtx.ScanStatus ss = GlobalCtx.app().scanInfo();
        try {
            ss.clearUpc(code);
            callback.invoke(true);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @ReactMethod
    void listenScan(@Nonnull final Callback callback) {
        GlobalCtx.ScanStatus ss = GlobalCtx.app().scanInfo();
        List<Map<String, String>> results = ss.notConsumed();
        ss.markTalking();
        callback.invoke(true, DaoHelper.gson().toJson(results));
    }

    @ReactMethod
    void listScanUpc(@Nonnull final Callback callback) {
        GlobalCtx.ScanStatus ss = GlobalCtx.app().scanInfo();
        List<String> result = ss.notConsumedUpc();
        callback.invoke(true, DaoHelper.gson().toJson(result));
    }

    @ReactMethod
    void speakText(@Nonnull final String text, @Nonnull  final Callback clb) {
        GlobalCtx.app().getSoundManager().play_by_xunfei(text);
        clb.invoke(true, "");
    }

    @ReactMethod
    void printBtPrinter(@Nonnull String orderJson, @Nonnull final Callback callback) {
        Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
        final Order o = gson.fromJson(orderJson, new TypeToken<Order>() {
        }.getType());

        ReactApplicationContext ctx = this.getReactApplicationContext();

        if (!GlobalCtx.app().isConnectPrinter()) {
            Intent intent = new Intent(ctx, SettingsPrintActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(intent, new Bundle());
            callback.invoke(false, "打印机未连接");
            PrintQueue.getQueue(GlobalCtx.app()).addManual(o);
        } else {
            new MyAsyncTask<Void, Void, Void>() {
                @Override
                protected Void doInBackground(Void... params) {
                    PrintQueue.getQueue(GlobalCtx.app()).addManual(o);
                    return null;
                }
            }.executeOnNormal();
        }
    }

    @ReactMethod
    void printSmPrinter(@Nonnull String orderJson, @Nonnull final Callback callback) {
        Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
        final Order o = gson.fromJson(orderJson, new TypeToken<Order>() {
        }.getType());
        int tryTimes = 3;
        boolean success = false;
        while (tryTimes > 0) {
            AidlUtil.getInstance().connectPrinterService(this.getReactApplicationContext());
            AidlUtil.getInstance().initPrinter();
            boolean isEnable = GlobalCtx.smPrintIsEnable();
            if (isEnable) {
                AidlUtil.getInstance().initPrinter();
                OrderPrinter.smPrintOrder(o);
                success = true;
                break;
            }
            tryTimes--;
        }
        if (!success) {
            callback.invoke(false, "不支持该设备");
        }
    }

    @ReactMethod
    void getActivityNameAsPromise(@Nonnull Promise promise) {
        Context activity = GlobalCtx.app().getCurrentRunningActivity();
        if (activity != null) {
            promise.resolve(activity.getClass().getSimpleName());
        }
    }

    /**
     * @param mobile mobile could be null
     */
    @ReactMethod
    void gotoLoginWithNoHistory(String mobile) {
        Context act = GlobalCtx.app().getCurrentRunningActivity();
        if (act != null) {
            Intent intent = new Intent(act, LoginActivity.class);
            if (!TextUtils.isEmpty(mobile)) {
                intent.putExtra("mobile", mobile);
            }
            intent.addFlags(FLAG_ACTIVITY_CLEAR_TASK | FLAG_ACTIVITY_NEW_TASK);
            act.startActivity(intent);
        }
    }

    @ReactMethod
    void gotoActByUrl(@Nonnull String url) {
        Context act = GlobalCtx.app().getCurrentRunningActivity();
        if (act != null) {
            Utility.handleUrlJump(act, null, url);
        }
    }

    @ReactMethod
    void callJavaScript() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            ReactInstanceManager reactInstanceManager = GlobalCtx.app().getmReactInstanceManager();
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
            if (reactContext != null) {
                CatalystInstance catalystInstance = reactContext.getCatalystInstance();
                WritableNativeArray params = new WritableNativeArray();
                params.pushString("Hello, JavaScript!");
                catalystInstance.callFunction("JavaScriptVisibleToJava", "alert", params);
            }
        }
    }

    @ReactMethod
    void navigateToNativeActivity(String activityName, boolean putStack, String jsonData) {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            Class<?> cls = null;
            try {
                cls = Class.forName(activityName);
                Intent intent = new Intent(activity, cls);
                if (!putStack) {
                    intent.setFlags(intent.getFlags() | Intent.FLAG_ACTIVITY_NO_HISTORY);
                }
                Bundle bundle = new Bundle();
                bundle.putString("jsonData", jsonData);
                intent.putExtras(bundle);
                activity.startActivity(intent);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
        }
    }

    @ReactMethod
    void nativeBack() {
        final Activity activity = getCurrentActivity();
        if (activity != null) {
            final FragmentManager fm = activity.getFragmentManager();
            if (fm.getBackStackEntryCount() > 0) {
                activity.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Log.i("MainActivity popping backstack");
                        fm.popBackStack();
                    }
                });
            } else {
                activity.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Log.i("MainActivity nothing on backstack, calling super");
                        activity.onBackPressed();
                    }
                });
            }
        }
    }

    /**
     * To pass an object instead of a simple string, create a {@link WritableNativeMap} and populate it.
     */
    static void triggerAlert(@Nonnull String message) {
        eventEmitter.emit("MyReactEventValue", message);
    }
}
