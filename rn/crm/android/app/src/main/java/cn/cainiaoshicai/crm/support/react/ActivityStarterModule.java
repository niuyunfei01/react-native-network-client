package cn.cainiaoshicai.crm.support.react;

import android.app.Activity;
import android.app.FragmentManager;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.inputmethod.InputMethodManager;
import android.widget.Toast;

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
import com.xdandroid.hellodaemon.IntentWrapper;
import com.xdandroid.hellodaemon.IntentWrapperReImpl;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nonnull;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.MainOrdersActivity;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.SupplierOrder;
import cn.cainiaoshicai.crm.domain.SupplierSummaryOrder;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
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
import retrofit2.Call;
import retrofit2.Response;

import static android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK;
import static android.content.Intent.FLAG_ACTIVITY_NEW_TASK;

import androidx.annotation.RequiresApi;

/**
 * Expose Java to JavaScript.
 */
class ActivityStarterModule extends ReactContextBaseJavaModule {

    private static DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = null;


    private long mLastClickTime = 0;
    public static final long TIME_INTERVAL = 5000L;

    ActivityStarterModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    /**
     * @return the name of this module. This will be the name used to {@code require()} this module
     * from JavaScript.
     */
    @Override
    @Nonnull
    public String getName() {
        return "ActivityStarter";
    }

    @ReactMethod
    void navigateToGoods() {
        Context activity = getCurrentActivity();
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
        Context ctx = getCurrentActivity();
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
        Context ctx = getCurrentActivity();
        if (ctx != null) {
            Intent intent = new Intent(ctx, MainOrdersActivity.class);
            ctx.startActivity(intent);
        }
    }

    @ReactMethod
    void toSettings() {
        Context activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, SettingsPrintActivity.class);
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void toOrder(String wm_id) {
        Context activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, OrderSingleActivity.class);
            intent.putExtra("order_id", Integer.parseInt(wm_id));
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void toUserComments() {
        Context activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, UserCommentsActivity.class);
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void toOpenNotifySettings(final Callback callback) {
        Context activity = this.getReactApplicationContext().getCurrentActivity();
        String packageName = GlobalCtx.app().getPackageName();

        boolean ok = false;
        if (activity != null) {
            Intent intent = null;
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    ApplicationInfo applicationInfo = activity.getApplicationInfo();
                    intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);

                    //8.0及以后版本使用这两个extra.  >=API 26
                    intent.putExtra(Settings.EXTRA_APP_PACKAGE, packageName);
                    intent.putExtra(Settings.EXTRA_CHANNEL_ID, applicationInfo.uid);

                    //5.0-7.1 使用这两个extra.  <= API 25, >=API 21
                    intent.putExtra("app_package", packageName);
                    intent.putExtra("app_uid", applicationInfo.uid);
                }

            } catch (Exception e) {
                e.printStackTrace();
                //其他低版本或者异常情况，走该节点。进入APP设置界面
                intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.putExtra("package", packageName);
            }
            if (intent != null) {
                ok = true;
                activity.startActivity(intent);
            }
        }

        if (callback != null) {
            callback.invoke(ok, "请到系统设置中处理:" + (activity == null) + ", packageName:" + (packageName));
        }
    }

    @ReactMethod
    void toRunInBg(final Callback callback) {
        Activity activity = this.getReactApplicationContext().getCurrentActivity();
        boolean ok = false;
        String msg = "";
        if (activity != null) {
            try {
                IntentWrapperReImpl.whiteListMatters(activity, "外送帮后台运行");
                ok = true;
            } catch (Exception e) {
                e.printStackTrace();
                msg = "异常:"+e.getMessage();
            }
        }

        if (callback != null) {
            callback.invoke(ok, TextUtils.isEmpty(msg) ? "请到系统设置中处理" : msg);
        }
    }

    @ReactMethod
    void isRunInBg(final Callback callback) {
        Activity activity = getCurrentActivity();
        int isRun = 0;
        String msg = "";
        if (activity != null) {
            try {
                PowerManager powerManager = (PowerManager) activity.getSystemService(Context.POWER_SERVICE);
                if (powerManager != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        boolean isIgnoring = powerManager.isIgnoringBatteryOptimizations(GlobalCtx.app().getPackageName());
                        isRun = isIgnoring ? 1 : -1;
                        msg = "ok";
                    } else {
                        msg = "版本过低不支持";
                    }
                } else {
                    msg = "无法获得后台运行信息";
                }
            } catch (Exception e) {
                e.printStackTrace();
                msg = "异常:"+e.getMessage();
            }
        }

        if (callback != null) {
            callback.invoke(isRun, TextUtils.isEmpty(msg) ? "无法判断" : msg);
        }
    }

    @ReactMethod
    void getSoundVolume(final Callback callback) {
        Activity activity = getCurrentActivity();
        boolean ok = false;
        if (callback != null) {
            int currentMusicVolume = -1;
            int isRinger = -1;
            int minVolume = -1;
            int maxVolume = -1;
            if (activity != null) {
                AudioManager mAudioManager = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
                currentMusicVolume = mAudioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
                isRinger = Utility.isSystemRinger(activity) ? 1 : 0;

                maxVolume = mAudioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    minVolume = mAudioManager.getStreamMinVolume(AudioManager.STREAM_MUSIC);
                }

                ok = true;
            }
            callback.invoke(ok, currentMusicVolume, isRinger , maxVolume, minVolume, ok ? "ok" : "无法判断");
        }
    }


    @ReactMethod
    void setSoundVolume(int volume, final Callback callback) {

        Activity activity = getCurrentActivity();
        boolean ok = false;
        if (callback != null) {
            int currentMusicVolume = -1;
            if (activity != null) {
                AudioManager mAudioManager = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
                mAudioManager.setStreamVolume(AudioManager.STREAM_MUSIC, volume, 0);
                ok = true;
            }
            callback.invoke(ok, currentMusicVolume, ok ? "ok" : "设置错误");
        }
    }

    @ReactMethod
    void ordersByMobileTimes(@Nonnull String mobile, int times) {
        Context activity = getCurrentActivity();
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
        Context activity = getCurrentActivity();
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
        Context activity = getCurrentActivity();
        //商米设备不支持拨打电话
        boolean supportSunMi = OrderPrinter.supportSunMiPrinter();
        if (activity != null && !supportSunMi) {
            Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + number));
            activity.startActivity(intent);
        }
    }

    @ReactMethod
    void getHost(@Nonnull Callback callback) {
        Context activity = getCurrentActivity();
        if (activity != null) {
            callback.invoke(URLHelper.getHost());
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
    void listenScan(@Nonnull final Callback callback) {
        GlobalCtx.ScanStatus ss = GlobalCtx.app().scanInfo();
        List<Map<String, String>> results = ss.notConsumed();
        ss.markTalking();
        callback.invoke(true, DaoHelper.gson().toJson(results));
    }

    @ReactMethod
    void speakText(@Nonnull final String text, @Nonnull final Callback clb) {
        GlobalCtx.app().getSoundManager().play_by_xunfei(text);
        clb.invoke(true, "");
    }

    @ReactMethod
    void reportRoute(@Nonnull final String routeName) {
        GlobalCtx.app().logRouteTrace(routeName);
    }

    @ReactMethod
    void reportException(@Nonnull final String msg) {
        GlobalCtx.app().handleUncaughtException(Thread.currentThread(), new Exception(msg));
    }

    @ReactMethod
    void playWarningSound() {
        try{
            GlobalCtx.app().getSoundManager().play_warning_order();
        }catch (Exception e){

        }
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
    void updatePidApplyPrice(int pid, int applyPrice, @Nonnull final Callback callback)  {
        boolean updated = GlobalCtx.app().updatePidApplyPrice(pid, applyPrice);
        callback.invoke(updated, "");
    }

    @ReactMethod
    void updatePidStorage(int pid, float storage, @Nonnull final Callback callback) {
        boolean updated = GlobalCtx.app().updatePidStorage(pid, storage);
        callback.invoke(updated, "");
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
    void printInventoryOrder(@Nonnull String orderJson, @Nonnull final Callback callback) {
        Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss").create();
        final SupplierOrder order = gson.fromJson(orderJson, new TypeToken<SupplierOrder>() {
        }.getType());
        int tryTimes = 3;
        boolean success = false;

        while (tryTimes > 0) {
            AidlUtil.getInstance().connectPrinterService(this.getReactApplicationContext());
            AidlUtil.getInstance().initPrinter();
            boolean isEnable = GlobalCtx.smPrintIsEnable();
            if (isEnable) {
                AidlUtil.getInstance().initPrinter();
                OrderPrinter.smPrintSupplierOrder(order);
                success = true;
                break;
            }
            tryTimes--;
        }
        if (!success) {
            callback.invoke(false, "打印失败！");
        }
    }

    @ReactMethod
    void printSupplierSummaryOrder(@Nonnull final Callback callback) {
        long nowTime = System.currentTimeMillis();
        if (nowTime - mLastClickTime > TIME_INTERVAL) {
            mLastClickTime = nowTime;
            try {
                int tryTimes = 3;
                while (tryTimes > 0) {
                    AidlUtil.getInstance().connectPrinterService(this.getReactApplicationContext());
                    AidlUtil.getInstance().initPrinter();
                    boolean isEnable = GlobalCtx.smPrintIsEnable();
                    if (isEnable) {
                        AidlUtil.getInstance().initPrinter();
                    }
                    tryTimes--;
                }
                Call<ResultBean<List<SupplierSummaryOrder>>> rbCall = GlobalCtx.app().dao.getSupplierOrderSummary();
                rbCall.enqueue(new retrofit2.Callback<ResultBean<List<SupplierSummaryOrder>>>() {
                    @Override
                    public void onResponse(Call<ResultBean<List<SupplierSummaryOrder>>> call, Response<ResultBean<List<SupplierSummaryOrder>>> response) {
                        ResultBean<List<SupplierSummaryOrder>> data = response.body();
                        List<SupplierSummaryOrder> orders = data.getObj();
                        for (SupplierSummaryOrder order : orders) {
                            OrderPrinter.smPrintSupplierSummaryOrder(order);
                        }
                    }

                    @Override
                    public void onFailure(Call<ResultBean<List<SupplierSummaryOrder>>> call, Throwable t) {
                    }
                });
            } catch (Exception e) {
                android.util.Log.e("Error", e.getMessage());
            }
        } else {
            try {
                Toast.makeText(getReactApplicationContext(), "稍后重试", Toast.LENGTH_SHORT).show();
            } catch (Exception e) {
            }
        }
    }

    @ReactMethod
    void getActivityNameAsPromise(@Nonnull Promise promise) {
        Context activity = getCurrentActivity();
        if (activity != null) {
            promise.resolve(activity.getClass().getSimpleName());
        }
    }

    /**
     * @param mobile mobile could be null
     */
    @ReactMethod
    void gotoLoginWithNoHistory(String mobile) {
        Context act = this.getReactApplicationContext().getCurrentActivity();
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
        Context act = this.getReactApplicationContext().getCurrentActivity();
        if (act != null) {
            Utility.handleUrlJump(act, null, url);
        }
    }

    @ReactMethod
    void callJavaScript() {
        Activity activity = getCurrentActivity();
        if (activity != null) {
            ReactInstanceManager reactInstanceManager = GlobalCtx.app().getReactNativeHost().getReactInstanceManager();
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
                activity.runOnUiThread(() -> {
                    Log.i("MainActivity popping backstack");
                    fm.popBackStack();
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

    @ReactMethod
    void navigateToRnView(String action, String params) {
        final Activity activity = getCurrentActivity();
        if (activity != null) {
            Gson gson = new Gson();
            Map<String, String> p = gson.fromJson(params, Map.class);
            GlobalCtx.app().toRnView(activity, action, p);
        }
    }

    @ReactMethod
    public void setDisableSoundNotify(boolean disabled, @Nonnull final Callback callback) {
        Log.i("setDisableSoundNotify:" + disabled);
        SettingUtility.setDisableSoundNotify(disabled);
    }

    @ReactMethod
    public void getDisableSoundNotify(@Nonnull final Callback callback) {
        boolean disabled = SettingUtility.isDisableSoundNotify();
        Log.i("getDisableSoundNotify:" + disabled);
        callback.invoke(disabled, "");
    }

    @ReactMethod
    public void setDisabledNewOrderNotify(boolean disabled, @Nonnull final Callback callback) {
        Log.i("setNewOrderNotifyDisabled:" + disabled);
        SettingUtility.setDisableNewOrderSoundNotify(disabled);
    }

    @ReactMethod
    public void getNewOrderNotifyDisabled(@Nonnull final Callback callback) {
        boolean disabled = SettingUtility.isDisableNewOrderSoundNotify();
        Log.i("getNewOrderNotifyDisabled:" + disabled);
        callback.invoke(disabled, "");
    }

    @ReactMethod
    public void setAutoBluePrint(boolean autoPrint, @Nonnull final Callback callback) {
        Log.i("setAutoBluePrint:" + autoPrint);
        SettingUtility.setAutoPrint(autoPrint);
    }

    @ReactMethod
    public void getAutoBluePrint(@Nonnull final Callback callback) {
        boolean auto = SettingUtility.getAutoPrintSetting();
        Log.i("getAutoBluePrint:" + auto);
        callback.invoke(auto, "");
    }

    @ReactMethod
    public void showInputMethod() {
        final Activity activity = getCurrentActivity();
        InputMethodManager imm = (InputMethodManager) activity.getSystemService(Context.INPUT_METHOD_SERVICE);
        imm.toggleSoftInput(InputMethodManager.SHOW_FORCED, 0);
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    public void checkCanRunInBg(final Callback callback) {
        if (callback != null) {
            final Activity activity = getCurrentActivity();
            boolean isIgnoring = false;
            PowerManager powerManager = (PowerManager) activity.getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                isIgnoring = powerManager.isIgnoringBatteryOptimizations(activity.getPackageName());
            }
            callback.invoke(isIgnoring, "");
        }
    }

    /**
     * To pass an object instead of a simple string, create a {@link WritableNativeMap} and populate it.
     */
    static void triggerAlert(@Nonnull String message) {
        eventEmitter.emit("MyReactEventValue", message);
    }
}
