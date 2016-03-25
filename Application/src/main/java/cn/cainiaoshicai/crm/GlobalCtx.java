package cn.cainiaoshicai.crm;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.os.Handler;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.LruCache;
import android.view.Display;

import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.User;
import cn.cainiaoshicai.crm.orders.domain.UserBean;
import cn.cainiaoshicai.crm.orders.service.FileCache;
import cn.cainiaoshicai.crm.orders.service.ImageLoader;
import cn.cainiaoshicai.crm.orders.service.StatusService;
import cn.cainiaoshicai.crm.support.database.AccountDBTask;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.jpush.android.api.JPushInterface;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

public class GlobalCtx extends Application {


    public static final String ORDERS_TAG = "cn.cainiaoshicai.crm";
    public static final int INT_SUCESS_API = 1;

    private static GlobalCtx application;

    private Activity activity = null;
    private Activity currentRunningActivity = null;
    private Handler handler = new Handler();

    private DisplayMetrics displayMetrics = null;

    private ImageLoader imageLoader;

    //image memory cache
    private LruCache<String, Bitmap> appBitmapCache = null;
    /**
     * Cached for booked user uid=>name mapping.
     */
    private Map<Integer, String> uidNames = new HashMap<Integer, String>();
    private User currUser;
    private StatusService statusService;

    public boolean tokenExpiredDialogIsShowing = false;
    private AccountBean accountBean;

    public GlobalCtx() {
        this.statusService=new StatusService();
    }


    public ImageLoader getImageLoader() {
        return imageLoader;
    }

    public void setImageLoader(ImageLoader imageLoader) {
        this.imageLoader = imageLoader;
    }

    public String getCurrUid() {
        return currUser != null? currUser.getId() : null;
    }

    public void addCommentUidNames(HashMap<Integer, String> commentIdNames) {
        this.uidNames.putAll(commentIdNames);
    }

    public User getCurrUser() {
        return currUser;
    }

    public void setCurrUser(User currUser) {
        this.currUser = currUser;
    }

    public String getUNameById(String bookedUid) {
        int uid = 0;
        try {
            uid = Integer.parseInt(bookedUid);
        } catch (NumberFormatException e) {
            return bookedUid;
        }
        String s = this.uidNames.get(uid);
        return s != null? s : "";
    }

    public void addCommentUidNames(User currU) {
        this.uidNames.put(Integer.parseInt(currU.getId()), currU.getName());
    }

    public StatusService getStatusService() {
        return statusService;
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

    public static boolean isIntentAvailable(Context context, final Intent intent) {
        final PackageManager packageManager = context.getPackageManager();
        List<ResolveInfo> list =
                packageManager.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
        return list.size() > 0;
    }

    public static boolean isSucc(int code) {
        return code == INT_SUCESS_API;
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

        //JPushInterface.setDebugMode(true); 	// 设置开启日志,发布时请关闭日志
        JPushInterface.init(this);     		// 初始化 JPush

        application = this;
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

    public void updateUserInfo(final UserBean userBean) {
        this.accountBean.setInfo(userBean);
    }

    public AccountBean getAccountBean() {
        if (accountBean == null) {
            String id = SettingUtility.getDefaultAccountId();
            if (!TextUtils.isEmpty(id)) {
                accountBean = AccountDBTask.getAccount(id);
            } else {
                List<AccountBean> accountList = AccountDBTask.getAccountList();
                if (accountList != null && accountList.size() > 0) {
                    accountBean = accountList.get(0);
                }
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
        return getAccountBean().getUid();
    }

    public String getCurrentAccountName() {
        return "小菜鸟";
//        return getAccountBean().getUsernick();
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
        return "test_token";
//        if (getAccountBean() != null) {
//            return getAccountBean().getAccess_token();
//        } else {
//            return "";
//        }
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
}
