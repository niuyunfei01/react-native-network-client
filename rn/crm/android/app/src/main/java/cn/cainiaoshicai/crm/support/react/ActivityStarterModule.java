package cn.cainiaoshicai.crm.support.react;

import static android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK;
import static android.content.Intent.FLAG_ACTIVITY_NEW_TASK;

import android.app.Activity;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.inputmethod.InputMethodManager;
import android.widget.Toast;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import com.iflytek.cloud.SpeechConstant;
import com.iflytek.cloud.SpeechUtility;
import com.xdandroid.hellodaemon.IntentWrapperReImpl;

import java.util.List;

import javax.annotation.Nonnull;

import cn.cainiaoshicai.crm.AppInfo;
import cn.cainiaoshicai.crm.AudioUtils;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.SupplierOrder;
import cn.cainiaoshicai.crm.domain.SupplierSummaryOrder;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.util.Log;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.LoginActivity;
import cn.cainiaoshicai.crm.ui.activity.OrderQueryActivity;
import cn.cainiaoshicai.crm.utils.AidlUtil;
import cn.jiguang.plugins.push.JPushModule;
import retrofit2.Call;
import retrofit2.Response;

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
    void logout() {
        SettingUtility.setDefaultAccountId("");
        GlobalCtx.app().setAccountBean(null);
        //Bootstrap.stopAlwaysOnService(GlobalCtx.app());
//        JPushInterface.deleteAlias(GlobalCtx.app(), (int) (System.currentTimeMillis() / 1000L));
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
                msg = "异常:" + e.getMessage();
            }
        }

        if (callback != null) {
            callback.invoke(ok, TextUtils.isEmpty(msg) ? "请到系统设置中处理" : msg);
        }
    }

    @ReactMethod
    void xunfeiIdentily(final Callback callback) {
        Activity activity = this.getReactApplicationContext().getCurrentActivity();

        boolean ok = false;
        String msg = "";
        if (activity != null) {
            try {

                //初始化蓝牙管理
                AppInfo.init(this.getReactApplicationContext());
                JPushModule.registerActivityLifecycle(GlobalCtx.app());

                // 初始化合成对象
                SpeechUtility.createUtility(activity, SpeechConstant.APPID + "=58b571b2");
//                SpeechUtility.createUtility(getApplicationContext(), SpeechConstant.APPID + "=58b571b2");
                AudioUtils.getInstance().init(activity);
                ok = true;
            } catch (Exception e) {
                e.printStackTrace();
                msg = "异常:" + e.getMessage();
            }
        }

        if (callback != null) {
            callback.invoke(ok, TextUtils.isEmpty(msg) ? "科大讯飞注册失败" : msg);
        }
    }

    @ReactMethod
    void getStartAppTime(final Callback callback) {
        try {
            callback.invoke(true, GlobalCtx.startAppTime + "", "成功获取启动时间");
        } catch (Exception e) {
            e.printStackTrace();
            callback.invoke(false, 0, "获取启动时间失败");
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
                msg = "异常:" + e.getMessage();
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
            callback.invoke(ok, currentMusicVolume, isRinger, maxVolume, minVolume, ok ? "ok" : "无法判断");
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
    void getSettings(@Nonnull Callback callback) {
        Context activity = getCurrentActivity();
        WritableMap params = Arguments.createMap();
        if (activity != null) {

            params.putBoolean("acceptNotifyNew", GlobalCtx.app().acceptNotifyNew());
            params.putString("host", URLHelper.getHost());
            params.putBoolean("disabledSoundNotify", SettingUtility.isDisableSoundNotify());
            params.putBoolean("disableNewOrderSoundNotify", SettingUtility.isDisableNewOrderSoundNotify());
            params.putBoolean("autoPrint", SettingUtility.getAutoPrintSetting());

            AudioManager mAudioManager = (AudioManager) activity.getSystemService(Context.AUDIO_SERVICE);
            int currentMusicVolume = mAudioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
            int isRinger = Utility.isSystemRinger(activity) ? 1 : 0;
            int maxVolume = mAudioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
            int minVolume = -1;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                minVolume = mAudioManager.getStreamMinVolume(AudioManager.STREAM_MUSIC);
            }
            params.putInt("currentSoundVolume", currentMusicVolume);
            params.putInt("isRinger", isRinger);
            params.putInt("maxSoundVolume", maxVolume);
            params.putInt("minSoundVolume", minVolume);

            int isRun = 0; //未知
            PowerManager powerManager = (PowerManager) activity.getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    boolean isIgnoring = powerManager.isIgnoringBatteryOptimizations(GlobalCtx.app().getPackageName());
                    isRun = isIgnoring ? 1 : -1;
                }
            }
            params.putInt("isRunInBg", isRun);
            callback.invoke(true, params, "");
        } else {
            callback.invoke(false, params, "错误(Activity Null)");
        }
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
    void playWarningSound() {
        try {
            GlobalCtx.app().getSoundManager().play_warning_order();
        } catch (Exception e) {

        }
    }


    @ReactMethod
    void updatePidApplyPrice(int pid, int applyPrice, @Nonnull final Callback callback) {
        boolean updated = GlobalCtx.app().updatePidApplyPrice(pid, applyPrice);
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

}
