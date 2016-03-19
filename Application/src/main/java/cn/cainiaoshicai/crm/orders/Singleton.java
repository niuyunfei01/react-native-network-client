package cn.cainiaoshicai.crm.orders;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;

import cn.cainiaoshicai.crm.CrmApplication;
import cn.cainiaoshicai.crm.orders.domain.User;
import cn.cainiaoshicai.crm.orders.service.FileCache;
import cn.cainiaoshicai.crm.orders.service.ImageLoader;
import cn.cainiaoshicai.crm.orders.service.OrderService;
import cn.cainiaoshicai.crm.orders.service.StatusService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

public class Singleton {


    public static final String ORDERS_TAG = "orders";
    public static final String REST_API = "http://www.cainiaoshicai.cn/crm_api";
    public static final int INT_SUCESS_API = 1;

    private ImageLoader imageLoader;
    /**
     * Cached for booked user uid=>name mapping.
     */
    private Map<Integer, String> uidNames = new HashMap<Integer, String>();
    private User currUser;
    private OrderService postService;
    private StatusService statusService;

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

    public OrderService getOrderService() {
        return postService;
    }

    public void setPostService(OrderService postService) {
        this.postService = postService;
    }

    static class SingleHolder {
        private static final Singleton single = new Singleton();
    }

    public StatusService getStatusService() {
        return statusService;
    }

    private Singleton() {
        this.postService = new OrderService();
        this.statusService=new StatusService();
    }

    public static Singleton getInstance() {
        return SingleHolder.single;
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
            fileCache.compareAndSet(null, new FileCache(CrmApplication.getApplication()));
        }
        return fileCache.get();
    }
}
