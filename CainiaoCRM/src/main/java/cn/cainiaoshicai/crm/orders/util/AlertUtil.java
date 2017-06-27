/*
 * Copyright (C) 2011 lytsing.org
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package cn.cainiaoshicai.crm.orders.util;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;

import cn.cainiaoshicai.crm.CrashReportHelper;
import cn.cainiaoshicai.crm.MainActivity;

/**
 * Alert Diaglog Util Class.
 */
public final class AlertUtil {
    
    private AlertUtil() {
        
    }

    /**
     * Show Alert Dialog with resource id.
     * @param context Activity context.
     * @param titleId title id
     * @param messageId message id
     */
    public static void showAlert(Context context, int titleId, int messageId) {
        Dialog dlg = new AlertDialog.Builder(context)
            .setIconAttribute(android.R.attr.alertDialogIcon)
            .setTitle(titleId)
            .setPositiveButton(android.R.string.ok, null)
            .setMessage(messageId)
            .create();

        showDlg(context, dlg, context.getString(messageId));
    }

    /**
     * Show Alert Dialog with String text.
     * @param context Activity context.
     * @param message Message
     */
    public static void error(Context context, String message) {
        error(context, message, null);
    }

    /**
     * Show Alert Dialog with String text.
     * @param context Activity context.
     * @param message Message
     */
    public static void error(Context context, String message, DialogInterface.OnClickListener listener) {
        Dialog dlg = new AlertDialog.Builder(context)
            .setIconAttribute(android.R.attr.alertDialogIcon)
            .setTitle("错误提示")
            .setPositiveButton(android.R.string.ok, listener)
            .setMessage(message)
            .create();
        showDlg(context, dlg, message);
    }

    /**
     * Show Alert Dialog with String text.
     * @param context Activity context.
     * @param title Title
     * @param message Message
     */
    public static void showAlert(Context context, String title, String message) {
        Dialog dlg = new AlertDialog.Builder(context)
            .setIconAttribute(android.R.attr.alertDialogIcon)
            .setTitle(title)
            .setPositiveButton(android.R.string.ok, null)
            .setMessage(message)
            .create();

        showDlg(context, dlg, message);
    }

    /**
     * Show Alert Dialog with tow buttons.
     * @param context
     * @param titleId
     * @param messageId
     * @param positiveButtontxt
     * @param positiveListener
     * @param negativeButtontxt
     * @param negativeListener
     */
    public static void showAlert(Context context, int titleId, int messageId,
            CharSequence positiveButtontxt, DialogInterface.OnClickListener positiveListener,
            CharSequence negativeButtontxt, DialogInterface.OnClickListener negativeListener) {
        Dialog dlg = new AlertDialog.Builder(context)
            .setIconAttribute(android.R.attr.alertDialogIcon)
            .setTitle(titleId)
            .setPositiveButton(positiveButtontxt, positiveListener)
            .setNegativeButton(negativeButtontxt, negativeListener)
            .setMessage(messageId)
            .setCancelable(false)
            .create();

        showDlg(context, dlg, context.getString(messageId));
    }

    /**
     * Show Alert Dialog with tow buttons.
     * @param context
     * @param titleId
     * @param message 消息
     * @param positiveButtontxt
     * @param positiveListener
     * @param negativeButtontxt
     * @param negativeListener
     */
    public static void showAlert(Context context, int titleId, String message,
            CharSequence positiveButtontxt, DialogInterface.OnClickListener positiveListener,
            CharSequence negativeButtontxt, DialogInterface.OnClickListener negativeListener) {
        Dialog dlg = new AlertDialog.Builder(context)
            .setIconAttribute(android.R.attr.alertDialogIcon)
            .setTitle(titleId)
            .setPositiveButton(positiveButtontxt, positiveListener)
            .setNegativeButton(negativeButtontxt, negativeListener)
            .setMessage(message)
            .setCancelable(false)
            .create();

        showDlg(context, dlg, message);
    }

    private static void showDlg(Context context, Dialog dlg, String msg) {
        if (context instanceof Activity && ((Activity)context).isFinishing()) {
            Exception e = new Exception("show dlg that activity is finished! context="+context.getClass()+", msg:" + msg);
            CrashReportHelper.handleUncaughtException(null, e);
            return;
        }
        dlg.show();
    }

    /**
     * Show Alert Dialog with tow buttons.
     * @param context
     * @param titleId
     * @param messageId
     * @param positiveButtontxt
     * @param positiveListener
     * @param negativeButtontxt
     * @param negativeListener
     */
    public static void showAlert(Context context, int titleId, int messageId,
            CharSequence positiveButtontxt, DialogInterface.OnClickListener positiveListener,
            CharSequence neutralButtontxt, DialogInterface.OnClickListener neutralListener,
            CharSequence negativeButtontxt, DialogInterface.OnClickListener negativeListener) {
        Dialog dlg = new AlertDialog.Builder(context)
            .setIconAttribute(android.R.attr.alertDialogIcon)
            .setTitle(titleId)
            .setPositiveButton(positiveButtontxt, positiveListener)
            .setNegativeButton(negativeButtontxt, negativeListener)
            .setNeutralButton(neutralButtontxt, neutralListener)
            .setMessage(messageId)
            .setCancelable(false)
            .create();

        showDlg(context, dlg, context.getString(messageId));
    }

    /**
     * Show Alert Dialog with tow buttons.
     * @param context
     * @param titleId
     * @param message
     * @param positiveButtontxt
     * @param positiveListener
     * @param negativeButtontxt
     * @param negativeListener
     */
    public static void showAlert(Context context, int titleId, String message,
            CharSequence positiveButtontxt, DialogInterface.OnClickListener positiveListener,
            CharSequence neutralButtontxt, DialogInterface.OnClickListener neutralListener,
            CharSequence negativeButtontxt, DialogInterface.OnClickListener negativeListener) {
        Dialog dlg = new AlertDialog.Builder(context)
            .setIconAttribute(android.R.attr.alertDialogIcon)
            .setTitle(titleId)
            .setPositiveButton(positiveButtontxt, positiveListener)
            .setNegativeButton(negativeButtontxt, negativeListener)
            .setNeutralButton(neutralButtontxt, neutralListener)
            .setMessage(message)
            .setCancelable(false)
            .create();

        showDlg(context, dlg, message);
    }
    
    /**
     * Show Alert Dialog with positive button.
     * @param context
     * @param titleId
     * @param message
     * @param positiveButtontxt
     * @param positiveListener
     */
    public static void showAlert(Context context, int titleId, String message,
            CharSequence positiveButtontxt, DialogInterface.OnClickListener positiveListener) {
        Dialog dlg = new AlertDialog.Builder(context)
            .setIconAttribute(android.R.attr.alertDialogIcon)
            .setTitle(titleId)
            .setPositiveButton(positiveButtontxt, positiveListener)
            .setMessage(message)
            .setCancelable(false)
            .create();

        showDlg(context, dlg, message);
    }

    /**
     * Show Alert Dialog with positive button.
     * @param context
     * @param titleId
     * @param messageId
     * @param positiveButtontxt
     * @param positiveListener
     */
    public static void showAlert(Context context, int titleId, int messageId,
            CharSequence positiveButtontxt, DialogInterface.OnClickListener positiveListener) {
        Dialog dlg = new AlertDialog.Builder(context)
            .setIconAttribute(android.R.attr.alertDialogIcon)
            .setTitle(titleId)
            .setPositiveButton(positiveButtontxt, positiveListener)
            .setMessage(messageId)
            .setCancelable(false)
            .create();

        showDlg(context, dlg, context.getString(messageId));
    }

    public static void errorOnActivity(final Activity activity, final String msg) {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                error(activity, msg);
            }
        });
    }
}

