package cn.cainiaoshicai.crm;

import static android.telephony.TelephonyManager.CALL_STATE_IDLE;
import static cn.cainiaoshicai.crm.Cts.STORE_YYC;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.database.CursorWindow;
import android.graphics.Bitmap;
import android.media.AudioManager;
import android.media.SoundPool;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.telephony.TelephonyManager;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.util.LongSparseArray;
import android.util.LruCache;
import android.view.Display;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.multidex.BuildConfig;
import androidx.multidex.MultiDex;

import com.BV.LinearGradient.LinearGradientPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.dylanvann.fastimage.FastImageViewPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.fanjun.keeplive.KeepLive;
import com.fanjun.keeplive.config.ForegroundNotification;
import com.fanjun.keeplive.config.ForegroundNotificationClickListener;
import com.fanjun.keeplive.config.KeepLiveService;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.gusparis.monthpicker.RNMonthPickerPackage;
import com.horcrux.svg.SvgPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.llew.huawei.verifier.LoadedApkHuaWei;
import com.newrelic.agent.android.NewRelic;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.reactnativecommunity.cameraroll.CameraRollPackage;
import com.reactnativecommunity.clipboard.ClipboardPackage;
import com.reactnativecommunity.geolocation.GeolocationPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.reactnativecommunity.picker.RNCPickerPackage;
import com.reactnativecommunity.slider.ReactSliderPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.reactnativepagerview.PagerViewPackage;
import com.reactnativerestart.RestartPackage;
import com.reactnativevolumemanager.VolumeManagerPackage;
import com.rnnewrelic.NewRelicPackage;
import com.rnziparchive.RNZipArchivePackage;
import com.songlcy.rnupgrade.UpgradePackage;
import com.sunmi.peripheral.printer.InnerPrinterCallback;
import com.sunmi.peripheral.printer.InnerPrinterException;
import com.sunmi.peripheral.printer.InnerPrinterManager;
import com.sunmi.peripheral.printer.SunmiPrinterService;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.theweflex.react.WeChatPackage;
import com.uiwjs.alipay.RNAlipayPackage;
import com.waisongbang.qiniu.QiniuPackage;
import com.xdandroid.hellodaemon.DaemonEnv;
import com.zmxv.RNSound.RNSoundPackage;
import com.henninghall.date_picker.DatePickerPackage;

import org.devio.rn.splashscreen.SplashScreenReactPackage;
import org.linusu.RNGetRandomValuesPackage;
import org.reactnative.camera.RNCameraPackage;
import org.xutils.common.util.MD5;
import org.reactnative.maskedview.RNCMaskedViewPackage;

import java.io.File;
import java.io.IOException;
import java.lang.ref.WeakReference;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.Stack;
import java.util.TreeMap;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

import cn.cainiaoshicai.crm.bt.BtService;
import cn.cainiaoshicai.crm.dao.CRMService;
import cn.cainiaoshicai.crm.dao.CommonConfigDao;
import cn.cainiaoshicai.crm.dao.StaffDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.Config;
import cn.cainiaoshicai.crm.domain.ShipAcceptStatus;
import cn.cainiaoshicai.crm.domain.ShipOptions;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.Tag;
import cn.cainiaoshicai.crm.domain.Vendor;
import cn.cainiaoshicai.crm.domain.Worker;
import cn.cainiaoshicai.crm.notify.service.KeepAliveService;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.domain.UserBean;
import cn.cainiaoshicai.crm.orders.service.FileCache;
import cn.cainiaoshicai.crm.orders.util.TextUtil;
import cn.cainiaoshicai.crm.print.PrintUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.DaoHelper;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.database.AccountDBTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.error.ErrorCode;
import cn.cainiaoshicai.crm.support.error.TopExceptionHandler;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.react.ActivityStarterReactPackage;
import cn.cainiaoshicai.crm.support.react.MyReactActivity;
import cn.cainiaoshicai.crm.support.react_native_iflytek.SpeechPackage;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.GeneralWebViewActivity;
import cn.cainiaoshicai.crm.ui.activity.LoginActivity;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageActivity;
import cn.cainiaoshicai.crm.ui.adapter.StorageItemAdapter;
import cn.jiguang.plugins.push.JPushPackage;
import cn.jpush.android.api.JPushInterface;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import it.innove.BleManagerPackage;
import qiuxiang.amap3d.AMap3DPackage;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class GlobalCtx extends Application implements ReactApplication {


    public static final String ORDERS_TAG = "cn.cainiaoshicai.crm";
    public static final int INT_SUCESS_API = 1;

    public static final CopyOnWriteArrayList<Integer> newOrderNotifies = new CopyOnWriteArrayList<>();

    private static GlobalCtx application;

    private Activity activity = null;
    private Activity currentRunningActivity = null;
    private Handler handler = new Handler();

    private AtomicReference<LinkedHashMap<Long, Store>> storesRef = new AtomicReference<>(null);
    private ConcurrentHashMap<Long, Config> serverCfg = new ConcurrentHashMap<>();
    private ConcurrentHashMap<Long, ArrayList<Tag>> tagsRef = new ConcurrentHashMap<>();
    private SortedMap<Integer, Worker> ship_workers = new TreeMap<>();
    private AtomicReference<String[]> delayReasons = new AtomicReference<>(new String[0]);
    private ConcurrentHashMap<String, String> configUrls = new ConcurrentHashMap<>();

    private Stack<String> rnRouteTrace = new Stack<String>();

    private SortedMap<Integer, Worker> storeWorkers = new TreeMap<>();
    private long storeWorkersTs = 0;

    private DisplayMetrics displayMetrics = null;

    //private ImageLoader imageLoader;

    //image memory cache
    private LruCache<String, Bitmap> appBitmapCache = null;
    public boolean tokenExpiredDialogIsShowing = false;
    private AccountBean accountBean;
    private SoundManager soundManager;
    private String[] coupons;
    private final LoadingCache<String, HashMap<String, String>> timedCache;
    private String agent;
    public CRMService dao;
    private String supportTel;
    private boolean printerConnected;

    //private SpeechSynthesizer mTts;

    private Config configByServer;

    public AtomicReference<WeakReference<StorageItemAdapter>> storageItemAdapterRef = new AtomicReference<>();

    public GlobalCtx() {
        timedCache = CacheBuilder.newBuilder()
                .concurrencyLevel(4)
                .weakKeys()
                .maximumSize(10000)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .build(new CacheLoader<String, HashMap<String, String>>() {
                    public HashMap<String, String> load(final String key) {

                        new MyAsyncTask<Void, Void, Void>() {
                            @Override
                            protected Void doInBackground(Void... params) {
                                try {
                                    CommonConfigDao dao = new CommonConfigDao(GlobalCtx.this.token());
                                    ResultBean<HashMap<String, String>> config = dao.configItem(key);
                                    if (config.isOk()) {
                                        timedCache.put(key, config.getObj());
                                    } else {
                                        AppLogger.e("error:" + config.getDesc());
                                    }
                                } catch (ServiceException e) {
                                    e.printStackTrace();
                                }
                                return null;
                            }
                        }.executeOnNormal();

                        return new HashMap<>();
                    }
                });
    }

    @Nullable
    public LoginActivity.DBResult afterTokenUpdated(String token, long expiresInSeconds)
            throws IOException, ServiceException {
        ResultBean<UserBean> uiRb = this.dao.userInfo(token).execute().body();
        if (uiRb != null && uiRb.isOk() && !TextUtils.isEmpty(uiRb.getObj().getId())) {
            UserBean user = uiRb.getObj();
            AccountBean account = new AccountBean();
            account.setAccess_token(token);
            account.setExpires_time(System.currentTimeMillis() + expiresInSeconds * 1000);
            account.setInfo(user);
            AppLogger.e("token expires in " + Utility.calcTokenExpiresInDays(account) + " days");
            LoginActivity.DBResult dbResult = AccountDBTask.addOrUpdateAccount(account, false);
            if (TextUtils.isEmpty(SettingUtility.getDefaultAccountId())) {
                SettingUtility.setDefaultAccountId(account.getUid());
            }

            long prefer_store = user.getPrefer_store();
            if (prefer_store > 0) {
                SettingUtility.setListenerStores(prefer_store);
            } else {
                SettingUtility.removeListenerStores();
            }

            this.updateCfgInterval();
            return dbResult;
        } else {
            boolean denied = uiRb != null && String.valueOf(ErrorCode.CODE_ACCESS_DENIED).equals(uiRb.getDesc());
            String msg = denied ? "您还没有注册，请先注册" : "获取不到账户相关信息";
            throw new ServiceException(msg);
        }
    }

//    public ImageLoader getImageLoader() {
//        return imageLoader;
//    }

//    public void setImageLoader(ImageLoader imageLoader) {
//        this.imageLoader = imageLoader;
//    }

    private volatile boolean imageLoaderInited = false;

    //Should set at startup
    private static AtomicReference<FileCache> fileCache = new AtomicReference<FileCache>();

    public static FileCache getFileCache() {
        if (fileCache.get() == null) {
            fileCache.compareAndSet(null, new FileCache(GlobalCtx.app()));
        }
        return fileCache.get();
    }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return cn.cainiaoshicai.crm.BuildConfig.DEBUG;
        }

        //如果是debug模式，最优先加载getJSMainModuleName
        //如果是release模式，优先加载getJSBundleFile
        //如果getJSBundleFile为null，加载getBundleAssetName
        @Nullable
        @Override
        protected String getJSBundleFile() {
            String DocumentDir = GlobalCtx.this.getFilesDir().getAbsolutePath();
            String versionCode = Utility.getVersionCode(GlobalCtx.app());
            String jsBundleFile = DocumentDir + "/last.android/" + versionCode + ".android.bundle";
            File file = new File(jsBundleFile);
            if (file.exists() && file.isFile()) {
                return jsBundleFile;
            }
            return super.getJSBundleFile();
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.asList(
                    new MainReactPackage(),
                    new ActivityStarterReactPackage(),
                    new SplashScreenReactPackage(),
                    new RNFetchBlobPackage(),
                    new VectorIconsPackage(),
                    new AsyncStoragePackage(),
                    new GeolocationPackage(),
                    new RNGestureHandlerPackage(),
                    new RNCWebViewPackage(),
                    new PagerViewPackage(),
                    new RNScreensPackage(),
                    new RNDateTimePickerPackage(),
                    new SafeAreaContextPackage(),
                    new ReanimatedPackage(),
                    new SvgPackage(),
                    new RNCPickerPackage(),
                    new RNDeviceInfo(),
                    new PickerPackage(),
                    new WeChatPackage(),
                    new RNCameraPackage(),
                    new RNSoundPackage(),
                    new DatePickerPackage(),
                    new QiniuPackage(),
                    new UpgradePackage(),
                    new RNGetRandomValuesPackage(),
                    new BleManagerPackage(),
                    new JPushPackage(),
                    new NewRelicPackage(),
                    new LinearGradientPackage(),
                    new AMap3DPackage(),
                    new com.mixpanel.reactnative.MixpanelReactNativePackage(),
                    new RNAlipayPackage(),
                    new ClipboardPackage(),
                    new RNZipArchivePackage(),
                    new RestartPackage(),
                    new RNViewShotPackage(),
                    new FastImageViewPackage(),
                    new ReactSliderPackage(),
                    new CameraRollPackage(),
                    new RNCMaskedViewPackage(),
                    new SpeechPackage(),
                    new VolumeManagerPackage(),
                    new NetInfoPackage(),
                    new RNMonthPickerPackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    public static String getProcessName(Context ctx, int pid) {
        //获取ActivityManager对象
        ActivityManager am = (ActivityManager) ctx.getSystemService(Context.ACTIVITY_SERVICE);
        //在运行的进程的
        List<ActivityManager.RunningAppProcessInfo> runningApps = am.getRunningAppProcesses();
        if (runningApps == null) {
            return null;
        }
        for (ActivityManager.RunningAppProcessInfo procInfo : runningApps) {
            if (procInfo.pid == pid) {
                return procInfo.processName;
            }
        }
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        String processName = getProcessName(this, android.os.Process.myPid());
        if ("cn.cainiaoshicai.crm".equals(processName)) {
            startAppTime = System.currentTimeMillis();
            MultiDex.install(this);

            Thread.setDefaultUncaughtExceptionHandler(new TopExceptionHandler(this.getApplicationContext()));
            application = this;

            String myId = SettingUtility.getMyUUID();
            if ("".equals(myId)) {
                myId = MD5.md5(UUID.randomUUID().toString()).substring(0, 8);
                SettingUtility.setMyUUID(myId);
            }

            @SuppressLint("HardwareIds") String android_id = myId;
            agent = "CNCRM" + (TextUtil.isEmpty(android_id) ? "" : android_id);
            dao = DaoHelper.factory(agent, BuildConfig.DEBUG);
            updateAfterGap(24 * 60 * 60 * 1000);

            try {
                Field field = CursorWindow.class.getDeclaredField("sCursorWindowSize");
                field.setAccessible(true);
                field.set(null, 100 * 1024 * 1024); //100MB
            } catch (Exception e) {
                if (BuildConfig.DEBUG) {
                    e.printStackTrace();
                }
            }

            NewRelic.withApplicationToken("AAd59d490bf07d0a6872263cb0bca7c7dad2277240-NRMA").start(this);

//        SpeechUtility.createUtility(getApplicationContext(), SpeechConstant.APPID + "=58b571b2");
//        AudioUtils.getInstance().init(getApplicationContext());
            this.soundManager = new SoundManager();
            this.soundManager.load(this);

            startKeepAlive();

            SoLoader.init(this, /* native exopackage */ false);
            initSunmiService();

        }
    }
    private void initSunmiService() {

        try {
            InnerPrinterManager.getInstance().bindService(this, innerPrinterCallback);
        } catch (InnerPrinterException e) {

        }
    }
    InnerPrinterCallback innerPrinterCallback = new InnerPrinterCallback() {
        @Override
        protected void onConnected(SunmiPrinterService sunmiPrinterService) {

            AppCache.setIsConnectedSunmi(true);
            AppCache.setSunmiPrinterService(sunmiPrinterService);
        }

        @Override
        protected void onDisconnected() {
            AppCache.setIsConnectedSunmi(false);
            AppCache.setSunmiPrinterService(null);
        }
    };
    @Override
    public void onTerminate() {
        super.onTerminate();
        unInitSunmiService();
    }
    private void unInitSunmiService() {
        try {
            InnerPrinterManager.getInstance().unBindService(this, innerPrinterCallback);
        } catch (InnerPrinterException e) {

        }
    }
    public static long startAppTime = 0;

    public void startKeepAlive() {
        try {
            LoadedApkHuaWei.hookHuaWeiVerifier(this);
            //需要在 Application 的 onCreate() 中调用一次 DaemonEnv.initialize()
            DaemonEnv.initialize(this, KeepAliveService.class, DaemonEnv.DEFAULT_WAKE_UP_INTERVAL);
            KeepAliveService.sShouldStopService = false;
            DaemonEnv.startServiceMayBind(KeepAliveService.class);

            //定义前台服务的默认样式。即标题、描述和图标
            ForegroundNotification foregroundNotification = new ForegroundNotification("外送帮", "请保持外送帮常驻通知栏", R.drawable.ic_launcher, new ForegroundNotificationClickListener() {
                @Override
                public void foregroundNotificationClick(Context context, Intent intent) {

                }

            });

            //启动保活服务
            KeepLive.startWork(this, KeepLive.RunMode.ENERGY, foregroundNotification, new KeepLiveService() {
                @Override
                public void onWorking() {

                }

                @Override
                public void onStop() {

                }
            });
        } catch (Exception e) {

        }
    }

    public void updateAfterGap(final int gap) {
        updateCfgInterval();
        new Handler().postDelayed(() -> updateAfterGap(gap), gap);
    }

    public void updateCfgInterval() {
        if (!TextUtils.isEmpty(this.token())) {
            this.initConfigs(SettingUtility.getListenerStore());
//            this.listStores(true);
            this.listTags(SettingUtility.getListenerStore(), true);
            this.updateShipOptions();
        }
    }

    private void initConfigs(final long storeId) {
        String token = app().token();
        if (!TextUtils.isEmpty(token)) {

            final GlobalCtx ctx = GlobalCtx.this;
            try {
                String uid = ctx.getCurrentAccountId();
                if (!TextUtils.isEmpty(uid)) {
                    JPushInterface.resumePush(ctx);
                    JPushInterface.setAlias(ctx, (int) (System.currentTimeMillis() / 1000L), "uid_" + uid);
                }
            } catch (Exception e) {
                AppLogger.w("error to set jpush alias");
            }

            HashMap<String, Object> ss = new HashMap<>();
            boolean autoPrint = SettingUtility.isAutoPrint(storeId);
//                            .addQueryParameter("_auto_print", String.valueOf(autoPrint ? 1 : 0))

            ss.put("printer", SettingUtility.getLastConnectedPrinterAddress());
            ss.put("printer_auto_store", storeId);
            //ss.put("printer_connected", SettingsPrintActivity.isPrinterConnected());
            Config cfg = ctx.serverCfg.get(storeId);
            final String lastHash = cfg == null ? "" : cfg.getLastHash();
            ss.put("last_hash", lastHash);
            ss.put("disable_notify", SettingUtility.isDisableSoundNotify());

            String clientStatus = new Gson().toJson(ss);

            Call<ResultBean<Config>> rbCall = ctx.dao.commonConfig(clientStatus);
            rbCall.enqueue(new Callback<ResultBean<Config>>() {
                @Override
                public void onResponse(Call<ResultBean<Config>> call, Response<ResultBean<Config>> response) {
                    ResultBean<Config> b = response.body();
                    if (b != null && b.isOk()) {

                        Config config = b.getObj();
                        if (!TextUtils.isEmpty(config.getLastHash())
                                && lastHash.equals(b.getObj().getLastHash())) {
                            return;
                        }

                        ctx.configByServer = config;

                        if (config.getShip_workers() != null) {
                            ctx.ship_workers = config.getShip_workers();
                        }
                        ctx.delayReasons.set(config.getDelayReasons());
                        ctx.configUrls.clear();
                        HashMap<String, String> configUrls = config.getConfigUrls();
                        if (configUrls != null) {
                            ctx.configUrls.putAll(configUrls);
                        }

                        ctx.coupons = config.getCoupons();
                        ctx.serverCfg.put(storeId, config);
                    } else {
                        AppLogger.e("error to update local config:" + (b != null ? b.getDesc() : "result is null"));
                    }
                }

                @Override
                public void onFailure(Call<ResultBean<Config>> call, Throwable t) {
                    AppLogger.w("error to init config:" + t.getMessage(), t);
                }
            });
        }
    }

    public SortedMap<Integer, Worker> getWorkers() {
        Config cfg = getCfgNullCreated(SettingUtility.getListenerStore());
        return cfg == null ? new TreeMap<Integer, Worker>() : cfg.getWorkers();
    }

    public Config getCfgNullCreated(long storeId) {
        Config cfg = this.serverCfg.get(storeId);
        if (cfg == null) {
            initConfigs(storeId);
        }

        return cfg;
    }

    public HashMap<String, String> listLaterTypes() {
        try {
            return this.timedCache.get("late_task_types");
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
        return new HashMap<>();
    }

    public SortedMap<Integer, Worker> getShipWorkers() {
        if (ship_workers == null || ship_workers.isEmpty()) {
            initConfigs(SettingUtility.getListenerStore());
        }

        return this.ship_workers == null ? new TreeMap<Integer, Worker>() : this.ship_workers;
    }

    public SortedMap<Integer, Worker> getStoreWorkers(final int posType, final long storeId) {

        if (System.currentTimeMillis() - storeWorkersTs > 2 * 60 * 1000) {
            new MyAsyncTask<Void, Void, Void>() {
                @Override
                protected Void doInBackground(Void... params) {
                    try {
                        GlobalCtx.this.storeWorkers = new StaffDao(GlobalCtx.this.token()).getStoreTodayWorkers(storeId);
                        GlobalCtx.this.storeWorkersTs = System.currentTimeMillis();
                    } catch (ServiceException e) {
                        e.printStackTrace();
                    }
                    return null;
                }
            }.executeOnNormal();
        }

        return storeWorkers.isEmpty() ? getWorkers() : storeWorkers;
    }


    public String[] getDelayReasons() {
        return this.delayReasons.get();
    }

    public Handler getUIHandler() {
        return handler;
    }

    public Activity getActivity() {
        return activity;
    }

    public static GlobalCtx app() {
        return application;
    }

    public void setAccountBean(final AccountBean accountBean) {
        this.accountBean = accountBean;
    }

    public AccountBean getAccountBean() {
        if (accountBean == null) {
            String id = SettingUtility.getDefaultAccountId();
            if (!TextUtils.isEmpty(id)) {
                accountBean = AccountDBTask.getAccount(id);
            }
        }
        return accountBean;
    }


    public String getCurrentAccountId() {
        AccountBean bean = getAccountBean();
        return bean != null ? bean.getUid() : null;
    }

    public String getCurrentAccountName() {
        AccountBean bean = getAccountBean();
        return bean != null ? bean.getUsernick() : "[未登录]";
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    public Activity getCurrentRunningActivity() {
        return currentRunningActivity;
    }

    public void setCurrentRunningActivity(Activity currentRunningActivity) {
        this.currentRunningActivity = currentRunningActivity;
    }

    public String token() {
        return token(true);
    }

    public String token(boolean required) {
        String token;
        if (getAccountBean() != null) {
            token = getAccountBean().getAccess_token();
        } else {
            token = "";
        }

        if (required && TextUtils.isEmpty(token)) {
            Utility.showExpiredTokenDialogOrNotification();
        }
        return token;
    }

    public DisplayMetrics getDisplayMetrics() {
        if (displayMetrics != null) {
            return displayMetrics;
        } else {
            Activity a = getActivity();
            if (a != null) {
                Display display = getActivity().getWindowManager().getDefaultDisplay();
                DisplayMetrics metrics = new DisplayMetrics();
                display.getMetrics(metrics);
                this.displayMetrics = metrics;
                return metrics;
            } else {
                //default screen is 800x480
                DisplayMetrics metrics = new DisplayMetrics();
                metrics.widthPixels = 480;
                metrics.heightPixels = 800;
                return metrics;
            }
        }
    }

    public static void clearNewOrderNotifies(Context context) {
        for (Object notifyId : GlobalCtx.newOrderNotifies.toArray()) {
            JPushInterface.clearNotificationById(context, (Integer) notifyId);
        }
    }

    public String getUrl(String key) {
        return this.getUrl(key, false);
    }

    public String getUrl(String key, boolean appendAcess) {
        String s = URLHelper.WEB_URL_ROOT + this.configUrls.get(key);
        if (appendAcess) {
            s += "&access_token=" + this.token();
        }
        return s;
    }

    public static boolean isAutoPrint(long store_id) {
        return store_id == Cts.STORE_UNKNOWN
                || (SettingUtility.isAutoPrint(store_id));
    }

    public boolean isConnectPrinter() {
        BtService btService = new BtService(this);
        return btService.getState() == BtService.STATE_CONNECTED || !TextUtil.isEmpty(PrintUtil.getDefaultBluethoothDeviceAddress(this));
    }

    public SoundManager getSoundManager() {
        return soundManager;
    }

    public Worker getCurrentWorker() {
        String currUid = GlobalCtx.app().getCurrentAccountId();
        if (currUid != null) {
            try {
                int iUid = Integer.parseInt(currUid);
                SortedMap<Integer, Worker> workers = this.getWorkers();
                return workers != null ? workers.get(iUid) : null;
            } catch (NumberFormatException e) {
                AppLogger.e("error to parse currUid:" + currUid, e);
            }
        }
        return null;
    }

    public boolean acceptNotifyNew() {
        Worker currentWorker = this.getCurrentWorker();
        return currentWorker == null || currentWorker.getPosition() != Cts.POSITION_EXT_SHIP;
    }


    public boolean acceptTechNotify() {
        return this.acceptNotifyNew();
    }

    public Collection<Store> listStores() {
        return this.listStores(0, false);
    }


    public Collection<Store> listStores(int limitVendorId, boolean forceUpdate) {
        final long storeId = SettingUtility.getListenerStore();
        Config config = this.serverCfg.get(storeId);
        if (config != null) {
            HashMap<Long, Store> stores = config.getCan_read_stores();
            if (stores == null || limitVendorId <= 0) {
                return stores != null ? stores.values() : null;
            } else {
                ArrayList<Store> found = new ArrayList<>();
                for (Store store : stores.values()) {
                    if (store.getType() == limitVendorId) {
                        found.add(store);
                    }
                }
                return found;
            }
        } else {
            return new ArrayList<>();
        }
    }


    public ArrayList<Tag> listTags(final long currStoreId) {
        return this.listTags(currStoreId, true);
    }

    public ArrayList<Tag> listTags(final long currStoreId, boolean force) {
        ArrayList<Tag> tags = tagsRef.get(currStoreId);
        if (tags == null || tags.isEmpty() || force) {
            new MyAsyncTask<Void, Void, List<Store>>() {
                @Override
                protected List<Store> doInBackground(Void... params) {
                    CommonConfigDao cfgDao = new CommonConfigDao(app().token());
                    try {
                        ArrayList<Tag> s = cfgDao.getTags(currStoreId);
                        if (s != null) {
                            tagsRef.put(currStoreId, s);
                        }
                    } catch (ServiceException e) {
                        AppLogger.e("获取产品分类列表错误:" + e.getMessage(), e);
                    }
                    return null;
                }
            }.executeOnNormal();
        }
        return tags == null ? new ArrayList<Tag>(0) : tags;
    }

    public String getStoreName(long storeId) {
        Store s = findStore(storeId);
        if (s != null) return s.getName();
        return String.valueOf(storeId);
    }

    public Store findStore(long storeId) {
        LinkedHashMap<Long, Store> idStoreMap = this.storesRef.get();
        Store s = (idStoreMap != null) ? idStoreMap.get(storeId) : null;

        if (s == null) {
            Config cfg = this.serverCfg.get(storeId);
            if (cfg != null && cfg.getCan_read_stores() != null) {
                s = cfg.getCan_read_stores().get(storeId);
            }
        }

        return s;
    }

    public String getStoreNames(ArrayList<Long> store_id_list) {
        if (!store_id_list.isEmpty()) {
            String[] names = new String[store_id_list.size()];
            for (int i = 0; i < store_id_list.size(); i++) {
                names[i] = this.getStoreName(store_id_list.get(i));
            }
            return TextUtils.join(",", names);
        }
        return "";
    }

    public void toTaskListActivity(Activity ctx) {
        ctx.startActivity(toTaskListIntent(ctx));
    }

    public void toFeedbackActivity(Activity ctx) {
        Intent gog = new Intent(ctx, GeneralWebViewActivity.class);
        String url = String.format("%s/vm/index.html?time=%d&access_token=%s#!/home", URLHelper.WEB_URL_ROOT,
                System.currentTimeMillis(), this.token());
        gog.putExtra("url", url);
        ctx.startActivity(gog);
    }

    public void toSearchActivity(Activity ctx, String term) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "OrderSearch");
        Bundle params = new Bundle();
        if (!TextUtils.isEmpty(term)) {
            params.putString("term", term);
        }
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toProductAdjust(Context ctx) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "GoodsAdjust");
        ctx.startActivity(i);
    }

    public void toMineActivity(Activity ctx) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "Tab");
        Bundle params = new Bundle();
        params.putString("initTab", "Mine");
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toOperationActivity(Activity ctx) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "Tab");
        Bundle params = new Bundle();
        params.putString("initTab", "Operation");
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public boolean toGoodsMgrRN(Activity ctx) {
        final long storeId = SettingUtility.getListenerStore();
        Store store = GlobalCtx.app().findStore(storeId);
        if (store != null) {
            Vendor v = GlobalCtx.app().getVendor();
            boolean fnProviding = v != null && v.isFnProviding();
            if (store.getFn_price_controlled() > 0 && !fnProviding) {
                Intent i = new Intent(ctx, MyReactActivity.class);
                i.putExtra("_action", "Tab");
                Bundle params = new Bundle();
                params.putString("initTab", "Goods");
                i.putExtra("_action_params", params);
                ctx.startActivity(i);
            } else {
                ctx.startActivity(new Intent(getApplicationContext(), StoreStorageActivity.class));
            }
            return true;
        } else {
            Utility.toast("请稍后...", ctx);
            return false;
        }
    }

    public void toGoodsNew(Activity ctx, boolean isPriceControlled, long storeId) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", /*isPriceControlled ? "SearchGoods" :*/ "GoodsEdit");
        Bundle params = new Bundle();
        params.putString("type", "add");
        params.putString("store_id", String.valueOf(storeId));
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toApplyChangePriceList(Activity ctx, long storeId) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "GoodsApplyRecord");
        Bundle params = new Bundle();
        params.putString("initTab", "GoodsApplyRecord");
        params.putString("viewStoreId", String.valueOf(storeId));
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    //扫描二维码之后跳转到指定界面
    public void toGoodScanSearch(Activity ctx, Map<String, String> data, String storeId) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "SearchGoods");
        Bundle params = new Bundle();
        Gson gson = new Gson();
        String dataJson = gson.toJson(data);
        params.putString("result", dataJson);
        params.putString("store_id", storeId);
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toInventoryMaterialTaskFinish(Activity ctx, String uid, String startTime, String endTime) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "InventoryMaterialTaskFinish");
        Bundle params = new Bundle();
        Gson gson = new Gson();
        params.putString("uid", uid);
        params.putString("start_time", startTime);
        params.putString("end_time", endTime);
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    //跳转到reactnative web页面
    public void toRNWebView(Activity ctx, Map<String, String> data) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "Web");
        Bundle params = new Bundle();
        for (Map.Entry<String, String> entry : data.entrySet()) {
            params.putString(entry.getKey(), entry.getValue());
        }
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toStoreProductIndex(Activity ctx, Map<String, String> data) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "GoodsPriceIndex");
        Bundle params = new Bundle();
        for (Map.Entry<String, String> entry : data.entrySet()) {
            params.putString(entry.getKey(), entry.getValue());
        }
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toAddBuyRecordView(Activity ctx, int pid, String productName, int storeId) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "InventoryProductPutIn");
        Bundle params = new Bundle();
        params.putInt("pid", pid);
        params.putString("productName", productName);
        params.putInt("storeId", storeId);
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toWarehouseManage(Activity ctx, int pid) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "InventoryProductInfo");
        Bundle params = new Bundle();
        params.putInt("pid", pid);
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toStockCheck(Activity ctx, int pid, int storeId, String productName, String shelfNo) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "InventoryStockCheck");
        Bundle params = new Bundle();
        params.putInt("productId", pid);
        params.putInt("storeId", storeId);
        params.putString("shelfNo", shelfNo);
        params.putString("productName", productName);
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toRnView(Activity ctx, String action, Map<String, String> params) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", action);
        Bundle bundle = new Bundle();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            bundle.putString(entry.getKey(), entry.getValue());
        }
        i.putExtra("_action_params", bundle);
        ctx.startActivity(i);
    }

    public void sendRNEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        if (reactContext == null) {
            return;
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    public ReactContext getReactContext() {
        return this.getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
    }

    /**
     * 跳转到新的调价页面
     *
     * @param ctx
     * @param mod
     * @param storeId
     * @param productId
     * @param json
     */
    public void toSupplyPriceApplyView(Activity ctx, int mod, int storeId, int productId, String currentSupplyPrice, String json) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "GoodsApplyPrice");
        Bundle params = new Bundle();
        params.putInt("mode", mod);
        params.putInt("pid", productId);
        params.putInt("storeId", storeId);
        params.putString("supplyPrice", currentSupplyPrice);
        params.putString("detail", json);
        params.putString("from", "native");
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    /**
     * 跳转到开关店页面
     *
     * @param ctx
     */
    public void toSetStoreStatusView(Activity ctx) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "StoreStatus");
        Bundle params = new Bundle();
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    @NonNull
    public Intent toTaskListIntent(Context ctx) {
        return new Intent(ctx, MyReactActivity.class);
    }

    public void setTaskCount(int taskCount) {
        this.taskCount = taskCount;
        this.taskUpdateTs = System.currentTimeMillis();
    }

    public String[] getCoupons() {
        String[] must = {
                "延误补偿(6元优惠券)", //type = 1
                "严重延误补偿（满79减20）", //type = 2
                "品质补偿券(6元)", //type = 3
                "品质补偿券(10元)", //type = 4
                "品质补偿券(15元)", //type = 5
                "品质补偿券(20元)", //type = 6
                "品质补偿券(30元)", //type = 7
        };

        if (this.coupons != null) {
            String[] _coupons = new String[this.coupons.length + must.length];
            System.arraycopy(must, 0, _coupons, 0, must.length);
            System.arraycopy(this.coupons, 0, _coupons, must.length, this.coupons.length);
            return _coupons;
        } else {
            return must;
        }
    }

    public ShipOptions getShipOptions(final long storeId) {
        LongSparseArray<ShipOptions> p = shipOptions.get();
        ShipOptions ret;
        if (p == null) {
            updateShipOptions();
            ret = null;
        } else {
            ret = p.get(storeId);
        }

        AppLogger.d("get_ship_options: store_id=" + storeId + ", ret=" + ret);
        return ret;
    }

    private void updateShipOptions() {
        AppLogger.i("updateShipOptions");
        new MyAsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                CommonConfigDao oad = new CommonConfigDao(app().token());
                try {
                    ResultBean<ArrayList<ShipOptions>> options = oad.shipOptions();
                    if (options.isOk() && options.getObj() != null) {
                        LongSparseArray<ShipOptions> mm = new LongSparseArray<ShipOptions>();
                        for (ShipOptions so : options.getObj()) {
                            mm.put(so.getStore_id(), so);
                        }
                        shipOptions.set(mm);
                    }
                } catch (ServiceException e) {
                    e.printStackTrace();
                    AppLogger.e("updateShipOptions ServiceException:" + e.getMessage());
                }
                return null;
            }
        }.execute();
    }

    public ShipAcceptStatus getWorkerStatus(long storeId) {
        AccountBean accountBean = this.getAccountBean();
        if (accountBean != null) {
            return accountBean.shipAcceptStatus(storeId);
        }
        return null;
    }

    public void handleUncaughtException(Thread t, Throwable e) {
        CrashReportHelper.handleUncaughtException(t, e);
    }

    public void dial(String tel, Activity activity) {
        Intent callIntent = new Intent(Intent.ACTION_DIAL);
        callIntent.setData(Uri.fromParts("tel", tel, null));
        activity.startActivity(callIntent);
    }

    public String getSupportTel() {
        Config cfg = this.serverCfg.get(SettingUtility.getListenerStore());
        if (cfg != null) {
            return cfg.getSupportTel();
        }
        return "";
    }

    public Vendor getVendor() {
        Config cfg = this.serverCfg.get(SettingUtility.getListenerStore());
        if (cfg != null) {
            return cfg.getVendor();
        }
        return null;
    }

    public boolean fnEnabledTmpBuy() {
        return this.getVendor() != null && Cts.BLX_TYPE_DIRECT.equals(this.getVendor().getVersion());
    }

    public boolean fnEnabledLoss() {
        return this.getVendor() != null && Cts.BLX_TYPE_DIRECT.equals(this.getVendor().getVersion());
    }

    public boolean fnEnabledReqProvide() {
        return this.getVendor() != null && Cts.BLX_TYPE_DIRECT.equals(this.getVendor().getVersion());
    }

    public boolean isDirectVendor() {
        return this.getVendor() != null && this.getVendor().isDirect();
    }

    public boolean fnEnabledStoreInfoMgr() {
        if (isSuperMgr()) return true;

        try {
            long currUid = Long.parseLong(this.getCurrentAccountId());
            return this.getVendor() != null
                    && (this.getVendor().isStoreMgr(currUid) || this.getVendor().isStoreViceMgr(currUid));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isSuperMgr() {
        try {
            long currUid = Long.parseLong(this.getCurrentAccountId());
            return this.getVendor() != null
                    && (this.getVendor().getService_uid() == currUid || this.getVendor().getCreator() == currUid
                    || this.getVendor().isServiceMgr(currUid));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean is811485() {
        return "811485".equals(this.getCurrentAccountId());
    }

    public void setPrinterConnected(boolean printerConnected) {
        this.printerConnected = printerConnected;
    }

    public boolean isPrinterConnected() {
        return printerConnected;
    }

    public boolean isCloudPrint(long storeId) {
        Config storeCfg = this.serverCfg.get(storeId);
        return storeCfg != null && storeCfg.isCloudPrint();
    }

    public Activity pageToActivity(String page) {
        return new MainOrdersActivity();
    }


    public ScanStatus scanInfo() {
        ssRef.compareAndSet(null, new ScanStatus());
        return ssRef.get();
    }

    private AtomicReference<ScanStatus> ssRef = new AtomicReference<>();

    public void toReportLoss(Activity ctx, int productId, int storeId, String productName) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "InventoryReportLoss");
        Bundle params = new Bundle();
        params.putInt("productId", productId);
        params.putInt("storeId", storeId);
        params.putString("productName", productName);
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public boolean updatePidStorage(int pid, float storage) {
        WeakReference<StorageItemAdapter> ref = this.storageItemAdapterRef.get();
        StorageItemAdapter adapter = ref.get();

        boolean updated = false;
        if (adapter != null) {
            adapter.updateItemStorage(pid, storage);
            updated = true;
            if (currentRunningActivity != null) {
                currentRunningActivity.runOnUiThread(adapter::notifyDataSetChanged);
            }
        }

        AppLogger.e(String.format("updatePidStorage %d-%.2f-%s", pid, storage, updated ? " null Adapter" : "done"));
        return updated;
    }

    public boolean updatePidApplyPrice(int pid, int applyPrice) {
        WeakReference<StorageItemAdapter> ref = this.storageItemAdapterRef.get();
        StorageItemAdapter adapter = ref.get();

        boolean updated = false;
        if (adapter != null) {
            adapter.updateItemApplyPrice(pid, applyPrice);
            updated = true;
            if (currentRunningActivity != null) {
                currentRunningActivity.runOnUiThread(adapter::notifyDataSetChanged);
            }
        }

        AppLogger.e(String.format("updatePidApplyPrice %d-%d-%s", pid, applyPrice, updated ? " null Adapter" : "done"));
        return updated;
    }

    public void toInventoryDetail(StoreStorageActivity storeStorageActivity, int productId, int storeId) {
        Intent i = new Intent(storeStorageActivity, MyReactActivity.class);
        i.putExtra("_action", "InventoryDetail");
        Bundle params = new Bundle();
        params.putInt("productId", productId);
        params.putInt("storeId", storeId);
        i.putExtra("_action_params", params);
        storeStorageActivity.startActivity(i);
    }

    public void logRouteTrace(String routeName) {
        this.rnRouteTrace.push(routeName);
        while (this.rnRouteTrace.size() > 10) {
            this.rnRouteTrace.pop();
        }
    }


    public String getRouteTrace() {
        return TextUtils.join(",", this.rnRouteTrace);
    }

    static public class ScanStatus {
        private AtomicLong lastTalking = new AtomicLong(Long.MAX_VALUE);
        private Map<String, Map<String, String>> ls = Maps.newConcurrentMap();
        private Map<String, String> upcList = Maps.newConcurrentMap();

        public long getLastTalking() {
            return lastTalking.longValue();
        }

        public List<Map<String, String>> notConsumed() {
            return new ArrayList<>(ls.values());
        }

        public void add(Map<String, String> result) {
            ls.put(result.get("barCode"), result);
        }

        public void clearCode(String code) {
            ls.remove(code);
        }

        public void markTalking() {
            lastTalking.set(System.currentTimeMillis());
        }
    }

    public interface TaskCountUpdated {
        void callback(int count);
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(base);
        CrashReportHelper.attachBaseContext(base, this);
    }

    private volatile AtomicReference<LongSparseArray<ShipOptions>> shipOptions = new AtomicReference<>();
    private volatile int taskCount = 0;
    private long taskUpdateTs;

    public void getTaskCount(Activity act, final TaskCountUpdated uiAction) {
        act.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                uiAction.callback(taskCount);
            }
        });

        if (System.currentTimeMillis() - taskUpdateTs > 2 * 60 * 1000) {
            new MyAsyncTask<Void, Void, Void>() {
                @Override
                protected Void doInBackground(Void... params) {
                    try {
                        taskCount = new StaffDao(GlobalCtx.this.token()).getTaskCount();
                    } catch (ServiceException e) {
                        e.printStackTrace();
                    }
                    GlobalCtx.this.taskUpdateTs = System.currentTimeMillis();
                    return null;
                }
            }.executeOnNormal();
        }
    }

    public class SoundManager {
        private static final int STORE_SOUND_LEN = 1700;
        private static final int NUMBER_SOUND_LENGTH = 1000;
        private static final String APPID = "58b571b2";
        private SoundPool soundPool;
        private int newOrderSound;
        private int simpleNewOrderSound;
        private int storeSoundUnknown;
        private int storeSoundhlg;
        private int storeSoundYyc;
        private int storeSoundWj;
        private int seriousTimeoutSound;
        private int syncNotWorkSound;
        private int storageEleStatus;
        private int storageSoldout;
        private int storageCheckStorage;
        private int orderCancelled;
        private int customerNewMsgSound;
        private int[] numberSound = new int[10];
        private volatile boolean soundLoaded = false;
        private int customerRemindDeliverSound;
        private int customerAskCancelSound;
        private int dadaManualTimeoutSound;
        private int new_mt_order_sound;
        private int new_jd_order_sound;
        private int new_ele_order_sound;
        private int new_eb_order_sound;
        private int todo_complain_sound;
        private int all_refund_order;
        private int warn_sound;

        public void load(GlobalCtx ctx) {
            soundPool = new SoundPool(3, AudioManager.STREAM_MUSIC, 0);
            newOrderSound = soundPool.load(ctx, R.raw.new_order_sound, 1);
            simpleNewOrderSound = soundPool.load(ctx, R.raw.bell_new_order, 1);

            storeSoundUnknown = soundPool.load(ctx, R.raw.store_unknown, 1);
            storeSoundYyc = soundPool.load(ctx, R.raw.store_yyc, 1);
            storeSoundhlg = soundPool.load(ctx, R.raw.store_hlg, 1);
            storeSoundWj = soundPool.load(ctx, R.raw.store_wj, 1);
            storageEleStatus = soundPool.load(ctx, R.raw.storage_ele_status, 1);
            storageSoldout = soundPool.load(ctx, R.raw.storage_no_good, 1);
            seriousTimeoutSound = soundPool.load(ctx, R.raw.serious_timeout, 1);
            syncNotWorkSound = soundPool.load(ctx, R.raw.sync_not_work, 1);
            customerNewMsgSound = soundPool.load(ctx, R.raw.customer_new_message, 1);
            storageCheckStorage = soundPool.load(ctx, R.raw.check_storage, 1);
            orderCancelled = soundPool.load(ctx, R.raw.order_cancelled, 1);
            customerRemindDeliverSound = soundPool.load(ctx, R.raw.user_ask_speedup, 1);
            customerAskCancelSound = soundPool.load(ctx, R.raw.user_ask_cancel, 1);
            dadaManualTimeoutSound = soundPool.load(ctx, R.raw.manual_dada_timeout, 1);
            todo_complain_sound = soundPool.load(ctx, R.raw.todo_complain, 1);

            new_mt_order_sound = soundPool.load(ctx, R.raw.order_sound1, 1);
            new_ele_order_sound = soundPool.load(ctx, R.raw.ele_new_order, 1);
            new_jd_order_sound = soundPool.load(ctx, R.raw.new_order_not_print, 1);
            new_eb_order_sound = soundPool.load(ctx, R.raw.eb_new_order_sound, 1);
            all_refund_order = soundPool.load(ctx, R.raw.all_refund_order, 1);
            warn_sound = soundPool.load(ctx, R.raw.warning, 1);

            numberSound[0] = soundPool.load(ctx, R.raw.n1, 1);
            numberSound[1] = soundPool.load(ctx, R.raw.n2, 1);
            numberSound[2] = soundPool.load(ctx, R.raw.n3, 1);
            numberSound[3] = soundPool.load(ctx, R.raw.n4, 1);
            numberSound[4] = soundPool.load(ctx, R.raw.n5, 1);
            numberSound[5] = soundPool.load(ctx, R.raw.n6, 1);
            numberSound[6] = soundPool.load(ctx, R.raw.n7, 1);
            numberSound[7] = soundPool.load(ctx, R.raw.n8, 1);
            numberSound[8] = soundPool.load(ctx, R.raw.n9, 1);
            numberSound[9] = soundPool.load(ctx, R.raw.n10, 1);

            soundPool.setOnLoadCompleteListener((soundPool, sampleId, status) -> soundLoaded = true);
        }

        private boolean play_double_sound(final int firstSound, final int suffixSound) {
            if (check_disabled()) return false;
            if (soundLoaded) {
                new MyAsyncTask<Void, Void, Void>() {
                    @Override
                    protected Void doInBackground(Void... params) {
                        soundPool.play(firstSound, 1.0f, 1.0f, 1, 0, 1.0f);
                        pause(STORE_SOUND_LEN);
                        soundPool.play(suffixSound, 1.0f, 1.0f, 1, 0, 1.0f);
                        return null;
                    }
                }.executeOnExecutor(MyAsyncTask.SERIAL_EXECUTOR);
                return true;
            } else {
                AppLogger.e("no sound");
                return false;
            }
        }

        private boolean check_disabled() {
            if (SettingUtility.isDisableSoundNotify() && SettingUtility.isDisableNewOrderSoundNotify()) {
                AppLogger.w("notify sound is disabled!");
                return true;
            }

            TelephonyManager tm = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);
            if (tm != null) {
                if (CALL_STATE_IDLE != tm.getCallState()) {
                    return true;
                }
            }

            return false;
        }

        private void pause(int time) {
            try {
                Thread.sleep(time);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        private int getStoreSound(int store_id) {
            if (store_id == Cts.STORE_HLG) {
                return storeSoundhlg;
            } else if (store_id == STORE_YYC) {
                return storeSoundYyc;
            } else if (store_id == Cts.STORE_WJ) {
                return storeSoundWj;
            } else {
                return storeSoundUnknown;
            }
        }

        public boolean play_new_simple_order_sound() {
            return this.play_single_sound(simpleNewOrderSound);
        }

        public boolean play_new_eb_order_sound() {
            return this.play_single_sound(new_eb_order_sound);
        }

        public boolean play_new_ele_order_sound() {
            return this.play_single_sound(new_ele_order_sound);
        }

        public boolean play_new_mt_order_sound() {
            return this.play_single_sound(new_mt_order_sound);
        }

        public boolean play_new_jd_order_sound() {
            return this.play_single_sound(new_jd_order_sound);
        }

        public boolean play_new_order_sound(int store_id) {
            return this.play_double_sound(getStoreSound(store_id), newOrderSound);
        }

        public boolean play_item_sold_out_sound(int store_id) {
            return this.play_double_sound(getStoreSound(store_id), storageSoldout);
        }

        public boolean play_ele_status_changed(int store_id) {
            return this.play_double_sound(getStoreSound(store_id), storageEleStatus);
        }

        public boolean play_storage_check(int store_id) {
            return this.play_double_sound(getStoreSound(store_id), storageCheckStorage);
        }

        public boolean play_sync_not_work_sound() {
            return !check_disabled() && play_single_sound(this.syncNotWorkSound);
        }

        public boolean play_refund_sound() {
            return !check_disabled() && play_single_sound(this.all_refund_order);
        }

        private boolean play_single_sound(final int sound) {
            if (check_disabled()) return false;
            if (soundLoaded) {
                new MyAsyncTask<Void, Void, Void>() {
                    @Override
                    protected Void doInBackground(Void... params) {
                        soundPool.play(sound, 1.0f, 1.0f, 1, 0, 1.0f);
                        return null;
                    }
                }.executeOnExecutor(MyAsyncTask.SERIAL_EXECUTOR);
                return true;
            } else {
                AppLogger.e("no sound");
                return false;
            }
        }

        public boolean play_serious_timeout(Set<Integer> notifyWorkers) {
            if (check_disabled()) return false;
            if (soundLoaded) {
                boolean shouldWarn = false;
                if (notifyWorkers != null && !notifyWorkers.isEmpty()) {
                    AccountBean accountBean = app().getAccountBean();
                    if (accountBean != null) {
                        int currUid = Integer.parseInt(accountBean.getUid());
                        if (notifyWorkers.contains(currUid)) {
                            shouldWarn = true;
                        }
                    }
                }

                if (shouldWarn) {
                    new MyAsyncTask<Void, Void, Void>() {
                        @Override
                        protected Void doInBackground(Void... params) {
                            soundPool.play(seriousTimeoutSound, 1.0f, 1.0f, 1, 0, 1.0f);
                            return null;
                        }
                    }.executeOnExecutor(MyAsyncTask.SERIAL_EXECUTOR);
                    return true;
                } else {
                    AppLogger.e("error: not notify worker_id");
                    return false;
                }
            } else {
                AppLogger.e("error: no sound!");
                return false;
            }
        }

        public boolean play_customer_new_msg() {
            return !check_disabled() && this.play_single_sound(this.customerNewMsgSound);
        }

        public boolean play_order_cancelled() {
            return (!check_disabled() && this.play_single_sound(this.orderCancelled));
        }

        public boolean play_remind_deliver() {
            return !check_disabled() && this.play_single_sound(this.customerRemindDeliverSound);
        }

        public boolean play_order_ask_cancel() {
            return !check_disabled() && this.play_single_sound(this.customerAskCancelSound);
        }

        public boolean play_dada_manual_timeout() {
            return !check_disabled() && this.play_single_sound(this.dadaManualTimeoutSound);
        }


        public void play_warning_order() {
            try {
                this.play_single_sound(warn_sound);
            } catch (Exception e) {
            }
        }

        public void notifyNewOrder(String text, String plat, String storeName, int notifyTimes) {
            try {
                for (int i = 0; i < notifyTimes; i++) {
                    if (plat.equals("6")) {
                        GlobalCtx.app().getSoundManager().play_new_jd_order_sound();
                    } else if (plat.equals("4")) {
                        GlobalCtx.app().getSoundManager().play_new_ele_order_sound();
                    } else if (plat.equals("3") || plat.equals("7")) {
                        GlobalCtx.app().getSoundManager().play_new_mt_order_sound();
                    } else if (plat.equals("1")) {
                        GlobalCtx.app().getSoundManager().play_new_eb_order_sound();
                    } else {
                        GlobalCtx.app().getSoundManager().play_new_simple_order_sound();
                    }
                    Thread.sleep(5000);
                }
            } catch (Exception e) {
                AppLogger.e(e.getMessage());
            }
        }
    }
}

