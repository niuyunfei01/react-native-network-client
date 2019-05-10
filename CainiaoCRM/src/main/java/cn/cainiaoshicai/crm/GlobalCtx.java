package cn.cainiaoshicai.crm;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.AudioManager;
import android.media.SoundPool;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.multidex.BuildConfig;
import android.support.multidex.MultiDex;
import android.telephony.TelephonyManager;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.LongSparseArray;
import android.util.LruCache;
import android.view.Display;
import android.widget.Toast;

import com.RNFetchBlob.RNFetchBlobPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.shell.MainReactPackage;
import com.fanjun.keeplive.KeepLive;
import com.fanjun.keeplive.config.ForegroundNotification;
import com.fanjun.keeplive.config.ForegroundNotificationClickListener;
import com.fanjun.keeplive.config.KeepLiveService;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.i18n.reactnativei18n.ReactNativeI18n;
import com.iflytek.cloud.SpeechConstant;
import com.iflytek.cloud.SpeechUtility;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.llew.huawei.verifier.LoadedApkHuaWei;
import com.oblador.vectoricons.VectorIconsPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.xdandroid.hellodaemon.DaemonEnv;

import org.devio.rn.splashscreen.SplashScreenReactPackage;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;

import cn.cainiaoshicai.crm.bt.BtService;
import cn.cainiaoshicai.crm.dao.CRMService;
import cn.cainiaoshicai.crm.dao.CommonConfigDao;
import cn.cainiaoshicai.crm.dao.StaffDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.dao.UserTalkDao;
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
import cn.cainiaoshicai.crm.orders.service.ImageLoader;
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
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.GeneralWebViewActivity;
import cn.cainiaoshicai.crm.ui.activity.LoginActivity;
import cn.cainiaoshicai.crm.utils.AidlUtil;
import cn.customer_serv.core.callback.OnInitCallback;
import cn.customer_serv.customer_servsdk.util.MQConfig;
import cn.jpush.android.api.JPushInterface;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;


import static android.telephony.TelephonyManager.CALL_STATE_IDLE;
import static cn.cainiaoshicai.crm.Cts.STORE_YYC;

public class GlobalCtx extends Application {


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

    private SortedMap<Integer, Worker> storeWorkers = new TreeMap<>();
    private long storeWorkersTs = 0;

    private DisplayMetrics displayMetrics = null;

    private ImageLoader imageLoader;

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

    private ReactInstanceManager mReactInstanceManager;
    private ReactContext reactContext;
    private Config configByServer;

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
            String msg = denied ? "账户没有授权，请联系店长开通" : "获取不到账户相关信息";
            throw new ServiceException(msg);
        }
    }

    public ImageLoader getImageLoader() {
        return imageLoader;
    }

    public void setImageLoader(ImageLoader imageLoader) {
        this.imageLoader = imageLoader;
    }

    private volatile boolean imageLoaderInited = false;

    public void initImageLoader(Context appCtx) {
        if (!imageLoaderInited) {
            synchronized (this) {
                if (this.imageLoaderInited)
                    return;
                imageLoader = new ImageLoader(appCtx);
                this.imageLoaderInited = true;
            }
        }
    }

    //Should set at startup
    private static AtomicReference<FileCache> fileCache = new AtomicReference<FileCache>();

    public static FileCache getFileCache() {
        if (fileCache.get() == null) {
            fileCache.compareAndSet(null, new FileCache(GlobalCtx.app()));
        }
        return fileCache.get();
    }


    @Override
    public void onCreate() {
        Log.d(ORDERS_TAG, "[GlobalCtx] onCreate");
        super.onCreate();

        MultiDex.install(this);

        Thread.setDefaultUncaughtExceptionHandler(new TopExceptionHandler(this.getApplicationContext()));
        JPushInterface.setDebugMode(BuildConfig.DEBUG);    // 设置开启日志,发布时请关闭日志
        JPushInterface.init(this);            // 初始化 JPush
        application = this;

        @SuppressLint("HardwareIds") String android_id = Settings.Secure.getString(this.getContentResolver(),
                Settings.Secure.ANDROID_ID);
        agent = "CNCRM" + (TextUtil.isEmpty(android_id) ? "" : android_id);
        dao = DaoHelper.factory(agent, BuildConfig.DEBUG);
        initTalkSDK();
        updateAfterGap(5 * 60 * 1000);
        cn.customer_serv.core.MQManager.setDebugMode(true);

        //init react
        mReactInstanceManager = ReactInstanceManager.builder()
                .setApplication(this)
                .setBundleAssetName("index.android.bundle")
                .setJSMainModulePath("index")
                .addPackage(new MainReactPackage())
                .addPackage(new ActivityStarterReactPackage())
                .addPackage(new SplashScreenReactPackage())
                .addPackage(new RNFetchBlobPackage())
                .addPackage(new VectorIconsPackage())
                .addPackage(new ReactNativeI18n())
                .addPackage(new RNDeviceInfo())
                .addPackage(new PickerPackage())
                .setUseDeveloperSupport(cn.cainiaoshicai.crm.BuildConfig.DEBUG)
                .setInitialLifecycleState(LifecycleState.RESUMED)
                .build();

        // 初始化合成对象
        SpeechUtility.createUtility(getApplicationContext(), SpeechConstant.APPID + "=58b571b2");
        AudioUtils.getInstance().init(getApplicationContext());
        this.soundManager = new SoundManager();
        this.soundManager.load(this);

        //初始化蓝牙管理
        AppInfo.init(this);
        startKeepAlive();
    }

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
                public void foregroundNotificationClick() {

                }
            });

            //启动保活服务
            KeepLive.startWork(this, foregroundNotification, new KeepLiveService() {
                @Override
                public void onWorking(Context context) {
                }

                @Override
                public void onStop(Context context) {
                }
            });
        } catch (Exception e) {

        }
    }

    public void updateAfterGap(final int fiveMin) {
        updateCfgInterval();
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                updateAfterGap(fiveMin);
            }
        }, fiveMin);
    }

    public void updateCfgInterval() {
        if (!TextUtils.isEmpty(this.token())) {
            this.initConfigs(SettingUtility.getListenerStore());
            this.listStores(true);
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

    private void initTalkSDK() {
        cn.customer_serv.core.MQManager.setDebugMode(true);

        // 替换成自己的key
        UserTalkDao userTalkDao = new UserTalkDao(this.token());

        MQConfig.init(this,
                app().token(), userTalkDao, new OnInitCallback() {
                    @Override
                    public void onSuccess(String clientId) {
                        Toast.makeText(GlobalCtx.this, "init success", Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onFailure(int code, String message) {
                        Toast.makeText(GlobalCtx.this, "int failure message = " + message, Toast.LENGTH_SHORT).show();
                    }
                });

        // 可选
        customMeiqiaSDK();
    }

    private void customMeiqiaSDK() {
        // 配置自定义信息
        MQConfig.ui.titleGravity = MQConfig.ui.MQTitleGravity.LEFT;
    }

    public ReactInstanceManager getmReactInstanceManager() {
        return mReactInstanceManager;
    }

    public void setmReactInstanceManager(ReactInstanceManager mReactInstanceManager) {
        this.mReactInstanceManager = mReactInstanceManager;
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

    public Config getConfigByServer() {
        return configByServer;
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


    public synchronized LruCache<String, Bitmap> getBitmapCache() {
        if (appBitmapCache == null) {
            buildCache();
        }
        return appBitmapCache;
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

    private void buildCache() {
        int memClass = ((ActivityManager) getSystemService(
                Context.ACTIVITY_SERVICE)).getMemoryClass();

        int cacheSize = Math.max(1024 * 1024 * 8, 1024 * 1024 * memClass / 5);

        appBitmapCache = new LruCache<String, Bitmap>(cacheSize) {
            @Override
            protected int sizeOf(String key, Bitmap bitmap) {

                return bitmap.getByteCount();
            }
        };
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

    public boolean acceptReadyTimeoutNotify() {
        return this.acceptNotifyNew();
    }

    public boolean acceptTechNotify() {
        return this.acceptNotifyNew();
    }

    public Collection<Store> listStores() {
        return this.listStores(0, false);
    }


    public Collection<Store> listStores(boolean forceUpdate) {
        return this.listStores(0, forceUpdate);
    }

    public Collection<Store> listStores(int limitVendorId, boolean forceUpdate) {
        final long storeId = SettingUtility.getListenerStore();
        LinkedHashMap<Long, Store> stores = storesRef.get();
        if (forceUpdate || stores == null || stores.isEmpty()) {
            new MyAsyncTask<Void, Void, List<Store>>() {
                @Override
                protected List<Store> doInBackground(Void... params) {
                    String token = app().token();
                    if (null != token && token.length() > 0) {
                        CommonConfigDao cfgDao = new CommonConfigDao(app().token());
                        try {
                            LinkedHashMap<Long, Store> s = cfgDao.listStores(storeId);
                            if (s != null) {
                                storesRef.set(s);
                            }
                        } catch (ServiceException e) {
                            AppLogger.e("获取店铺列表错误:" + e.getMessage(), e);
                            Activity runningActivity = app().getCurrentRunningActivity();
//                        if (runningActivity != null) {
                            //AlertUtil.errorOnActivity(runningActivity, "获取店铺列表失败，请检查网络后重试");
//                        }
                        }
                    }
                    return null;
                }
            }.executeOnNormal();
        }
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
        return (idStoreMap != null) ? idStoreMap.get(storeId) : null;
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

    public void toOperationActivity(Activity ctx){
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "Tab");
        Bundle params = new Bundle();
        params.putString("initTab", "Operation");
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toGoodsEditProdStores(Activity ctx) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "GoodMultiEdit");
        ctx.startActivity(i);
    }

    public void toGoodsMgrRN(Activity ctx) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "Tab");
        Bundle params = new Bundle();
        params.putString("initTab", "Goods");
        i.putExtra("_action_params", params);
        ctx.startActivity(i);
    }

    public void toGoodsNew(Activity ctx, boolean isPriceControlled, long storeId) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", /*isPriceControlled ?*/ "SearchGoods" /*: "GoodsEdit"*/);
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

    public void toStoreProductIndex(Activity ctx, Map<String, String> data){
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

    public void toStockCheck(Activity ctx, int pid, int storeId) {
        Intent i = new Intent(ctx, MyReactActivity.class);
        i.putExtra("_action", "InventoryStockCheck");
        Bundle params = new Bundle();
        params.putInt("productId", pid);
        params.putInt("storeId", storeId);
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
        return reactContext != null ? reactContext : mReactInstanceManager != null ? mReactInstanceManager.getCurrentReactContext() : null;
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
     * @param ctx
     */
    public void toSetStoreStatusView(Activity ctx){
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
        return this.getAccountBean().shipAcceptStatus(storeId);
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
        return new MainActivity();
    }

    public boolean appEnabledGoodMgr() {
        Config cfg = this.serverCfg.get(SettingUtility.getListenerStore());
        return cfg != null && cfg.isEnabled_good_mgr();
    }

    public ScanStatus scanInfo() {
        ssRef.compareAndSet(null, new ScanStatus());
        return ssRef.get();
    }

    private AtomicReference<ScanStatus> ssRef = new AtomicReference<>();

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

    public static boolean smPrintIsEnable() {
        return AidlUtil.getInstance().isConnect();
    }


    public class SoundManager {
        private static final int STORE_SOUND_LEN = 1700;
        private static final int NUMBER_SOUND_LENGTH = 1000;
        private static final String APPID = "58b571b2";
        private SoundPool soundPool;
        private int newOrderSound;
        private int readyDelayWarnSound;
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

        public void load(GlobalCtx ctx) {
            soundPool = new SoundPool(3, AudioManager.STREAM_MUSIC, 0);
            newOrderSound = soundPool.load(ctx, R.raw.new_order_sound, 1);
            simpleNewOrderSound = soundPool.load(ctx, R.raw.bell_new_order, 1);

            //readyDelayWarnSound = soundPool.load(GlobalCtx.app().getApplicationContext(), R.raw.order_not_leave_off_more, 1);
            readyDelayWarnSound = soundPool.load(ctx, R.raw.should_be_ready, 1);

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

            soundPool.setOnLoadCompleteListener(new SoundPool.OnLoadCompleteListener() {
                @Override
                public void onLoadComplete(SoundPool soundPool, int sampleId, int status) {
                    soundLoaded = true;
                }
            });
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

        private boolean play_three_sound(final int storeSound, final int numberSound, final int suffixSound) {
            if (check_disabled()) return false;
            if (soundLoaded) {
                new MyAsyncTask<Void, Void, Void>() {
                    @Override
                    protected Void doInBackground(Void... params) {
                        soundPool.play(storeSound, 100.0f, 100.0f, 1, 0, 1.0f);
                        pause(STORE_SOUND_LEN);
                        soundPool.play(numberSound, 100.0f, 100.0f, 1, 0, 1.0f);
                        pause(NUMBER_SOUND_LENGTH);
                        soundPool.play(suffixSound, 100.0f, 100.0f, 1, 0, 1.0f);
                        pause(4000);
                        return null;
                    }
                }.executeOnExecutor(MyAsyncTask.SERIAL_EXECUTOR);
                return true;
            } else {
                AppLogger.e("no sound");
                return false;
            }
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

        public boolean play_will_ready_timeout(int store_id, int totalLate) {
            return this.play_three_sound(getStoreSound(store_id), numberSound[totalLate - 1], readyDelayWarnSound);
        }

        public boolean play_sync_not_work_sound() {
            return !check_disabled() && play_single_sound(this.syncNotWorkSound);
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

        public boolean play_by_xunfei(String s) {
            return !check_disabled() && AudioUtils.getInstance().speakText(s);
        }

        public void notifyNewOrder(String text, String plat, String storeName, int notifyTimes) {
            try {
                //获取系统的Audio管理者
                AudioManager mAudioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
                //最大音量
                int maxVolume = mAudioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);

                //当前音量
                int currentMusicVolume = mAudioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
                int currentAlarmVolume = mAudioManager.getStreamVolume(AudioManager.STREAM_ALARM);
                int currentRingVolume = mAudioManager.getStreamVolume(AudioManager.STREAM_RING);

                mAudioManager.setStreamVolume(AudioManager.STREAM_MUSIC, maxVolume, 0);
                mAudioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxVolume, 0);
                mAudioManager.setStreamVolume(AudioManager.STREAM_RING, maxVolume, 0);
                for (int i = 0; i < notifyTimes; i++) {
                    if (storeName != null && !storeName.isEmpty()) {
                        GlobalCtx.app().getSoundManager().play_by_xunfei(storeName);
                        Thread.sleep(1300);
                    }
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
                    Thread.sleep(8000);
                }
                mAudioManager.setStreamVolume(AudioManager.STREAM_MUSIC, currentMusicVolume, 0);
                mAudioManager.setStreamVolume(AudioManager.STREAM_ALARM, currentAlarmVolume, 0);
                mAudioManager.setStreamVolume(AudioManager.STREAM_RING, currentRingVolume, 0);
            } catch (Exception e) {
                AppLogger.e(e.getMessage());
            }
        }
    }
}

