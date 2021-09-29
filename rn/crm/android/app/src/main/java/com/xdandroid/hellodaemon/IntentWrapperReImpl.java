package com.xdandroid.hellodaemon;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;

import androidx.annotation.NonNull;

import java.util.ArrayList;
import java.util.List;

public class IntentWrapperReImpl extends IntentWrapper {
    protected IntentWrapperReImpl(Intent intent, int type) {
        super(intent, type);
    }


    /**
     * 处理白名单.
     * @return 弹过框的 IntentWrapper.
     */
    @NonNull
    public static List<IntentWrapper> whiteListMatters(final Activity a, String reason) {
        List<IntentWrapper> showed = new ArrayList<>();
        if (reason == null) reason = "核心服务的持续运行";
        List<IntentWrapper> intentWrapperList = getIntentWrapperList();
        for (final IntentWrapper iw : intentWrapperList) {
            //如果本机上没有能处理这个Intent的Activity，说明不是对应的机型，直接忽略进入下一次循环。
            if (!iw.doesActivityExists()) continue;
            boolean cancelable = true;
            switch (iw.type) {
                case DOZE:
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                        PowerManager pm = (PowerManager) a.getSystemService(Context.POWER_SERVICE);
                        if (pm.isIgnoringBatteryOptimizations(a.getPackageName())) break;
                        new AlertDialog.Builder(a)
                                .setCancelable(cancelable)
                                .setTitle("需要忽略 " + getApplicationName() + " 的电池优化")
                                .setMessage(reason + "需要 " + getApplicationName() + " 加入到电池优化的忽略名单。\n\n" +
                                        "请点击『确定』，在弹出的『忽略电池优化』对话框中，选择『是』。")
                                .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                                .show();
                        showed.add(iw);
                    }
                    break;
                case HUAWEI:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要允许 " + getApplicationName() + " 自动启动")
                            .setMessage(reason + "需要允许 " + getApplicationName() + " 的自动启动。\n\n" +
                                    "请点击『确定』，在弹出的『自启管理』中，将 " + getApplicationName() + " 对应的开关打开。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case ZTE_GOD:
                case HUAWEI_GOD:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle(getApplicationName() + " 需要加入锁屏清理白名单")
                            .setMessage(reason + "需要 " + getApplicationName() + " 加入到锁屏清理白名单。\n\n" +
                                    "请点击『确定』，在弹出的『锁屏清理』列表中，将 " + getApplicationName() + " 对应的开关打开。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case XIAOMI_GOD:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要关闭 " + getApplicationName() + " 的神隐模式")
                            .setMessage(reason + "需要关闭 " + getApplicationName() + " 的神隐模式。\n\n" +
                                    "请点击『确定』，在弹出的 " + getApplicationName() + " 神隐模式设置中，选择『无限制』，然后选择『允许定位』。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case SAMSUNG_L:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要允许 " + getApplicationName() + " 的自启动")
                            .setMessage(reason + "需要 " + getApplicationName() + " 在屏幕关闭时继续运行。\n\n" +
                                    "请点击『确定』，在弹出的『智能管理器』中，点击『内存』，选择『自启动应用程序』选项卡，将 " + getApplicationName() + " 对应的开关打开。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case SAMSUNG_M:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要允许 " + getApplicationName() + " 的自启动")
                            .setMessage(reason + "需要 " + getApplicationName() + " 在屏幕关闭时继续运行。\n\n" +
                                    "请点击『确定』，在弹出的『电池』页面中，点击『未监视的应用程序』->『添加应用程序』，勾选 " + getApplicationName() + "，然后点击『完成』。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case MEIZU:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要允许 " + getApplicationName() + " 保持后台运行")
                            .setMessage(reason + "需要允许 " + getApplicationName() + " 保持后台运行。\n\n" +
                                    "请点击『确定』，在弹出的应用信息界面中，将『后台管理』选项更改为『保持后台运行』。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case MEIZU_GOD:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle(getApplicationName() + " 需要在待机时保持运行")
                            .setMessage(reason + "需要 " + getApplicationName() + " 在待机时保持运行。\n\n" +
                                    "请点击『确定』，在弹出的『待机耗电管理』中，将 " + getApplicationName() + " 对应的开关打开。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case ZTE:
                case LETV:
                case XIAOMI:
                case OPPO:
                case OPPO_OLD:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要允许 " + getApplicationName() + " 的自启动")
                            .setMessage(reason + "需要 " + getApplicationName() + " 加入到自启动白名单。\n\n" +
                                    "请点击『确定』，在弹出的『自启动管理』中，将 " + getApplicationName() + " 对应的开关打开。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case COOLPAD:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要允许 " + getApplicationName() + " 的自启动")
                            .setMessage(reason + "需要允许 " + getApplicationName() + " 的自启动。\n\n" +
                                    "请点击『确定』，在弹出的『酷管家』中，找到『软件管理』->『自启动管理』，取消勾选 " + getApplicationName() + "，将 " + getApplicationName() + " 的状态改为『已允许』。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case VIVO_GOD:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要允许 " + getApplicationName() + " 的后台运行")
                            .setMessage(reason + "需要允许 " + getApplicationName() + " 在后台高耗电时运行。\n\n" +
                                    "请点击『确定』，在弹出的『后台高耗电』中，将 " + getApplicationName() + " 对应的开关打开。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case GIONEE:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle(getApplicationName() + " 需要加入应用自启和绿色后台白名单")
                            .setMessage(reason + "需要允许 " + getApplicationName() + " 的自启动和后台运行。\n\n" +
                                    "请点击『确定』，在弹出的『系统管家』中，分别找到『应用管理』->『应用自启』和『绿色后台』->『清理白名单』，将 " + getApplicationName() + " 添加到白名单。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case LETV_GOD:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要禁止 " + getApplicationName() + " 被自动清理")
                            .setMessage(reason + "需要禁止 " + getApplicationName() + " 被自动清理。\n\n" +
                                    "请点击『确定』，在弹出的『应用保护』中，将 " + getApplicationName() + " 对应的开关关闭。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case LENOVO:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要允许 " + getApplicationName() + " 的后台运行")
                            .setMessage(reason + "需要允许 " + getApplicationName() + " 的后台自启、后台 GPS 和后台运行。\n\n" +
                                    "请点击『确定』，在弹出的『后台管理』中，分别找到『后台自启』、『后台 GPS』和『后台运行』，将 " + getApplicationName() + " 对应的开关打开。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
                case LENOVO_GOD:
                    new AlertDialog.Builder(a)
                            .setCancelable(cancelable)
                            .setTitle("需要关闭 " + getApplicationName() + " 的后台耗电优化")
                            .setMessage(reason + "需要关闭 " + getApplicationName() + " 的后台耗电优化。\n\n" +
                                    "请点击『确定』，在弹出的『后台耗电优化』中，将 " + getApplicationName() + " 对应的开关关闭。")
                            .setPositiveButton("确定", (d, w) -> iw.startActivitySafely(a))
                            .show();
                    showed.add(iw);
                    break;
            }
        }
        return showed;
    }
}
