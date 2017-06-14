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
import android.os.Handler;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.support.multidex.MultiDex;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.LruCache;
import android.view.Display;
import android.widget.Toast;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.iflytek.cloud.SpeechUtility;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

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
import cn.cainiaoshicai.crm.domain.Worker;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.FileCache;
import cn.cainiaoshicai.crm.orders.service.ImageLoader;
import cn.cainiaoshicai.crm.orders.util.TextUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.DaoHelper;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.database.AccountDBTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.error.TopExceptionHandler;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.GeneralWebViewActivity;
import cn.cainiaoshicai.crm.ui.activity.RemindersActivity;
import cn.customer_serv.core.callback.OnInitCallback;
import cn.customer_serv.customer_servsdk.util.MQConfig;
import cn.jpush.android.api.JPushInterface;

import static cn.cainiaoshicai.crm.Cts.STORE_YYC;

public class GlobalCtx extends Application {


    public static final String ORDERS_TAG = "cn.cainiaoshicai.crm";
    public static final int INT_SUCESS_API = 1;

    public static final CopyOnWriteArrayList<Integer> newOrderNotifies = new CopyOnWriteArrayList<>();
    ;
    private static GlobalCtx application;

    private Activity activity = null;
    private Activity currentRunningActivity = null;
    private Handler handler = new Handler();

    private AtomicReference<LinkedHashMap<Long, Store>> storesRef = new AtomicReference<>(null);
    private AtomicReference<Config> serverCfg = new AtomicReference<>(null);
    private AtomicReference<ArrayList<Tag>> tagsRef = new AtomicReference<>(null);
    private SortedMap<Integer, Worker> workers = new TreeMap<>();
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

    //private SpeechSynthesizer mTts;

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
                                            CommonConfigDao dao = new CommonConfigDao(GlobalCtx.this.getSpecialToken());
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


    public ImageLoader getImageLoader() {
        return imageLoader;
    }

    public void setImageLoader(ImageLoader imageLoader) {
        this.imageLoader = imageLoader;
    }

    public static GlobalCtx getInstance() {
        return getApplication();
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
            fileCache.compareAndSet(null, new FileCache(GlobalCtx.getApplication()));
        }
        return fileCache.get();
    }

    @Override
    public void onCreate() {
        Log.d(ORDERS_TAG, "[GlobalCtx] onCreate");
        super.onCreate();

        MultiDex.install(this);

        new MyAsyncTask<Void, Void, Void>(){
            @Override
            protected Void doInBackground(Void... params) {
                // 初始化合成对象
                SpeechUtility.createUtility(getApplicationContext(), "appid=" + getString(R.string.app_id));
                AudioUtils.getInstance().init(getApplicationContext());
                //mTts = SpeechSynthesizer.createSynthesizer(GlobalCtx.this, mTtsInitListener);
                //mInstaller = new  ApkInstaller(TtsDemo.this);
                return null;
            }
        }.execute();

        Thread.setDefaultUncaughtExceptionHandler(new TopExceptionHandler(this.getApplicationContext()));
        JPushInterface.setDebugMode(BuildConfig.DEBUG);    // 设置开启日志,发布时请关闭日志
        JPushInterface.init(this);            // 初始化 JPush
        application = this;

        @SuppressLint("HardwareIds") String android_id = Settings.Secure.getString(this.getContentResolver(),
                Settings.Secure.ANDROID_ID);
        agent = "CNCRM" + (TextUtil.isEmpty(android_id) ? "" : android_id);
        dao = DaoHelper.factory(agent);

        initTalkSDK();

        updateAfterGap(5 * 60 * 1000);

        cn.customer_serv.core.MQManager.setDebugMode(true);

        this.soundManager = new SoundManager();
        this.soundManager.load(this);
        //this.soundManager.play_by_xunfei("你好，我是讯飞！");
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
        this.initConfigs();
        this.listStores();
        this.listTags();
        this.updateShipOptions();
    }

    private void initConfigs() {
        new MyAsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                try {
                    String token = GlobalCtx.getInstance().getSpecialToken();
                    if (!TextUtils.isEmpty(token)) {

                        try {
                            GlobalCtx ctx = GlobalCtx.this;
                            String uid = ctx.getCurrentAccountId();
                            if (!TextUtils.isEmpty(uid)) {
                                JPushInterface.setAliasAndTags(ctx, "uid_" + uid, null);
                            }
                        } catch (Exception e) {
                            AppLogger.w("error to set jpush alias");
                        }

                        Config config = new CommonConfigDao(token).get();

                        SortedMap<Integer, Worker> workers = config.getWorkers();
                        if (workers != null) {
                            GlobalCtx.this.workers = workers;
                        }
                        if (config.getShip_workers() != null) {
                            GlobalCtx.this.ship_workers = config.getShip_workers();
                        }
                        GlobalCtx.this.delayReasons.set(config.getDelayReasons());
                        GlobalCtx.this.configUrls.clear();
                        HashMap<String, String> configUrls = config.getConfigUrls();
                        if (configUrls != null) {
                            GlobalCtx.this.configUrls.putAll(configUrls);
                        }

                        GlobalCtx.this.coupons = config.getCoupons();
                        GlobalCtx.this.serverCfg.set(config);
                    }
                } catch (Exception e) {
                    AppLogger.w("error to init config:" + e.getMessage(), e);
                }
                return null;
            }
        }.executeOnNormal();
    }

    private void initTalkSDK() {
        cn.customer_serv.core.MQManager.setDebugMode(true);

        // 替换成自己的key
        UserTalkDao userTalkDao = new UserTalkDao(this.getSpecialToken());

        MQConfig.init(this,
                GlobalCtx.getInstance().getSpecialToken(), userTalkDao, new OnInitCallback() {
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
//        MQConfig.ui.backArrowIconResId = android.support.v7.appcompat.R.drawable.abc_ic_ab_back_holo_light;

        //.abc_ic_ab_back_mtrl_am_alpha;

//        MQConfig.ui.titleBackgroundResId = R.color.test_red;
//        MQConfig.ui.titleTextColorResId = R.color.test_blue;
//        MQConfig.ui.leftChatBubbleColorResId = R.color.test_green;
//        MQConfig.ui.leftChatTextColorResId = R.color.test_red;
//        MQConfig.ui.rightChatBubbleColorResId = R.color.test_red;
//        MQConfig.ui.rightChatTextColorResId = R.color.test_green;
//        MQConfig.ui.robotEvaluateTextColorResId = R.color.test_red;
//        MQConfig.ui.robotMenuItemTextColorResId = R.color.test_blue;
//        MQConfig.ui.robotMenAuTipTextColorResId = R.color.test_blue;
    }

    public SortedMap<Integer, Worker> getWorkers() {
        if (workers == null || workers.isEmpty()) {
            initConfigs();
        }

        return this.workers == null ? new TreeMap<Integer, Worker>() : this.workers;
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
            initConfigs();
        }

        return this.ship_workers == null ? new TreeMap<Integer, Worker>() : this.ship_workers;
    }

    public SortedMap<Integer, Worker> getStoreWorkers(final int posType, final int storeId) {

        if (System.currentTimeMillis() - storeWorkersTs > 2 * 60 * 1000) {
            new MyAsyncTask<Void, Void, Void>() {
                @Override
                protected Void doInBackground(Void... params) {
                    try {
                        GlobalCtx.this.storeWorkers = new StaffDao(GlobalCtx.this.getSpecialToken()).getStoreTodayWorkers(storeId);
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

    public static GlobalCtx getApplication() {
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
        return getAccountBean().getUsernick();
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

    public String getSpecialToken() {
        return getSpecialToken(true);
    }

    public String getSpecialToken(boolean required) {
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
            s += "&access_token=" + this.getSpecialToken();
        }
        return s;
    }

    public static boolean isAutoPrint(int store_id) {
        return store_id == Cts.STORE_UNKNOWN
                || (SettingUtility.isAutoPrint(store_id));
    }

    public SoundManager getSoundManager() {
        return soundManager;
    }

    public Worker getCurrentWorker() {
        String currUid = GlobalCtx.getApplication().getCurrentAccountId();
        if (currUid != null) {
            try {
                int iUid = Integer.parseInt(currUid);
                return this.workers.get(iUid);
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
        LinkedHashMap<Long, Store> stores = storesRef.get();
        if (stores == null || stores.isEmpty()) {
            new MyAsyncTask<Void, Void, List<Store>>() {
                @Override
                protected List<Store> doInBackground(Void... params) {
                    CommonConfigDao cfgDao = new CommonConfigDao(GlobalCtx.getInstance().getSpecialToken());
                    try {
                        LinkedHashMap<Long, Store> s = cfgDao.listStores();
                        if (s != null) {
                            storesRef.set(s);
                        }
                    } catch (ServiceException e) {
                        AppLogger.e("获取店铺列表错误:" + e.getMessage(), e);
                    }
                    return null;
                }
            }.executeOnNormal();
        }
        return stores != null ? stores.values() : null;
    }


    public ArrayList<Tag> listTags() {
        ArrayList<Tag> tags = tagsRef.get();
        if (tags == null || tags.isEmpty()) {
            new MyAsyncTask<Void, Void, List<Store>>() {
                @Override
                protected List<Store> doInBackground(Void... params) {
                    CommonConfigDao cfgDao = new CommonConfigDao(GlobalCtx.getInstance().getSpecialToken());
                    try {
                        ArrayList<Tag> s = cfgDao.getTags();
                        if (s != null) {
                            tagsRef.set(s);
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
                System.currentTimeMillis(), this.getSpecialToken());
        gog.putExtra("url", url);
        ctx.startActivity(gog);
    }

    @NonNull
    public Intent toTaskListIntent(Context ctx) {
        Intent intent = new Intent(ctx, RemindersActivity.class);
        String token = GlobalCtx.getApplication().getSpecialToken();
        intent.putExtra("url", String.format("%s/quick_task_list.html?access_token=" + token, URLHelper.getStoresPrefix()));
        return intent;
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

    public ShipOptions getShipOptions(final int storeId) {
        Map<Integer, ShipOptions> p = shipOptions.get();
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
        new MyAsyncTask<Void, Void, Void>(){
            @Override
            protected Void doInBackground(Void... params) {
                CommonConfigDao oad = new CommonConfigDao(GlobalCtx.getInstance().getSpecialToken());
                try {
                    ResultBean<ArrayList<ShipOptions>> options = oad.shipOptions();
                    if (options.isOk() && options.getObj() != null) {
                        HashMap<Integer, ShipOptions> mm = new HashMap<>();
                        for(ShipOptions so : options.getObj()) {
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

    public void dial(String tel) {
        Intent callIntent = new Intent(Intent.ACTION_DIAL);
        callIntent.setData(Uri.parse("tel:" + tel));
        startActivity(callIntent);
    }

    public String getSupportTel() {
        Config cfg = this.serverCfg.get();
        if (cfg != null) {
            return cfg.getSupportTel();
        }
        return "";
    }

    public interface TaskCountUpdated {
        void callback(int count);
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        CrashReportHelper.attachBaseContext(base, this);
    }

    private volatile AtomicReference<Map<Integer, ShipOptions>> shipOptions = new AtomicReference<>();
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
                        taskCount = new StaffDao(GlobalCtx.this.getSpecialToken()).getTaskCount();
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
        private int readyDelayWarnSound;
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
        private int todo_complain_sound;

        public void load(GlobalCtx ctx) {
            soundPool = new SoundPool(3, AudioManager.STREAM_MUSIC, 0);
            newOrderSound = soundPool.load(ctx, R.raw.new_order_sound, 1);

            //readyDelayWarnSound = soundPool.load(GlobalCtx.getApplication().getApplicationContext(), R.raw.order_not_leave_off_more, 1);
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
                        soundPool.play(firstSound, 100.0f, 100.0f, 1, 0, 1.0f);
                        pause(STORE_SOUND_LEN);
                        soundPool.play(suffixSound, 100.0f, 100.0f, 1, 0, 1.0f);
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
            if (SettingUtility.isDisableSoundNotify()) {
                AppLogger.w("notify sound is disabled!");
                return true;
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
                ;
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
                    AccountBean accountBean = GlobalCtx.getInstance().getAccountBean();
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
            return  (!check_disabled() && this.play_single_sound(this.orderCancelled));
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
    }
}

