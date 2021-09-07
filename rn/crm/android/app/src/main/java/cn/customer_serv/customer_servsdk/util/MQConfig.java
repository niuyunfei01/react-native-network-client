package cn.customer_serv.customer_servsdk.util;

import android.content.Context;
import androidx.annotation.ColorRes;
import androidx.annotation.DrawableRes;

import cn.cainiaoshicai.crm.dao.IUserTalkDao;
import cn.customer_serv.core.MQManager;
import cn.customer_serv.core.callback.OnInitCallback;
import cn.customer_serv.customer_servsdk.callback.MQActivityLifecycleCallback;
import cn.customer_serv.customer_servsdk.callback.MQSimpleActivityLifecyleCallback;
import cn.customer_serv.customer_servsdk.callback.OnLinkClickCallback;
import cn.customer_serv.customer_servsdk.controller.ControllerImpl;
import cn.customer_serv.customer_servsdk.controller.MQController;
import cn.customer_serv.customer_servsdk.imageloader.MQImageLoader;


public final class MQConfig {
    public static final int DEFAULT = -1;

    public static final class ui {
        public static MQTitleGravity titleGravity = MQTitleGravity.CENTER; // 标题文字对其方式
        @ColorRes
        public static int titleBackgroundResId = DEFAULT; // 标题栏背景颜色
        @ColorRes
        public static int titleTextColorResId = DEFAULT; // 标题栏文字颜色
        @ColorRes
        public static int leftChatBubbleColorResId = DEFAULT; // 左边气泡背景颜色
        @ColorRes
        public static int rightChatBubbleColorResId = DEFAULT; // 右边气泡背景颜色
        @ColorRes
        public static int leftChatTextColorResId = DEFAULT; // 左边气泡文字颜色
        @ColorRes
        public static int rightChatTextColorResId = DEFAULT; // 右边气泡文字颜色
        @DrawableRes
        public static int backArrowIconResId = DEFAULT; // 返回箭头图标资源id
        @ColorRes
        public static int robotMenuItemTextColorResId = DEFAULT; // 机器人菜单消息列表文字颜色
        @ColorRes
        public static int robotMenuTipTextColorResId = DEFAULT; // 机器人菜单消息提示文本颜色
        @ColorRes
        public static int robotEvaluateTextColorResId = DEFAULT; // 机器人消息评价按钮的文字颜色

        public enum MQTitleGravity {
            LEFT, CENTER
        }
    }

    public static boolean isVoiceSwitchOpen = true; // 语音开关
    public static boolean isSoundSwitchOpen = true; // 声音开关
    public static boolean isLoadMessagesFromNativeOpen = false; // 加载本地数据开关
    public static boolean isEvaluateSwitchOpen = true; // 是否开启评价
    public static boolean isShowClientAvatar = false; // 是否显示客户头像

    private static MQActivityLifecycleCallback sActivityLifecycleCallback;
    private static OnLinkClickCallback sOnLinkClickCallback;

    private static MQController sController;

    public static MQController getController(Context context) {
        if (sController == null) {
            synchronized (MQConfig.class) {
                if (sController == null) {
                    sController = new ControllerImpl(context.getApplicationContext());
                }
            }
        }
        return sController;
    }

    public static void registerController(MQController controller) {
        sController = controller;
    }

    public static void setActivityLifecycleCallback(MQActivityLifecycleCallback lifecycleCallback) {
        sActivityLifecycleCallback = lifecycleCallback;
    }

    public static MQActivityLifecycleCallback getActivityLifecycleCallback() {
        if (sActivityLifecycleCallback == null) {
            sActivityLifecycleCallback = new MQSimpleActivityLifecyleCallback();
        }
        return sActivityLifecycleCallback;
    }


    /**
     * 设置链接点击的回调
     * 注意:设置监听回调后,将不再跳转网页.如果需要跳转,开发者需要自行处理,例如: ac
     * @param onLinkClickCallback 回调
     */
    public static void setOnLinkClickCallback(OnLinkClickCallback onLinkClickCallback) {
        MQConfig.sOnLinkClickCallback = onLinkClickCallback;
    }

    public static OnLinkClickCallback getOnLinkClickCallback() {
        return MQConfig.sOnLinkClickCallback;
    }

    @Deprecated
    public static void init(Context context, String appKey, MQImageLoader imageLoader, IUserTalkDao dao, final OnInitCallback onInitCallBack) {
        MQManager.init(context, appKey, onInitCallBack, dao);
    }

    public static void init(Context context, String appKey, IUserTalkDao dao, OnInitCallback onInitCallBack) {
        MQManager.init(context, appKey, onInitCallBack, dao);
    }
}

