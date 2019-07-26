package cn.cainiaoshicai.crm.support.helper;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.google.gson.Gson;

import java.util.Map;

import cn.cainiaoshicai.crm.GlobalCtx;

/**
 * User: qii
 * Date: 12-11-28
 */
public class SettingHelper {

    private static final String USE_PREVIEW_HOST = "use_preview_host";
    private static SharedPreferences.Editor editor = null;
    private static SharedPreferences sharedPreferences = null;

    private SettingHelper() {

    }

    private static SharedPreferences.Editor getEditorObject(Context paramContext) {
        if (editor == null) {
            editor = PreferenceManager.getDefaultSharedPreferences(paramContext).edit();
        }
        return editor;
    }

    public static Map<String, ?>  getAllConfigs(Context paramContext) {
        Map<String, ?> allEntries = PreferenceManager.getDefaultSharedPreferences(paramContext).getAll();
        return allEntries;
    }

    public static int getSharedPreferences(Context paramContext, String paramString, int paramInt) {
        return getSharedPreferencesObject(paramContext).getInt(paramString, paramInt);
    }

    public static long getSharedPreferences(Context paramContext, String paramString,
            long paramLong) {
        return getSharedPreferencesObject(paramContext).getLong(paramString, paramLong);
    }

    public static Boolean getSharedPreferences(Context paramContext, String paramString,
            Boolean paramBoolean) {
        return getSharedPreferencesObject(paramContext).getBoolean(paramString, paramBoolean);
    }

    public static String getSharedPreferences(Context paramContext, String paramString1,
            String paramString2) {
        return getSharedPreferencesObject(paramContext).getString(paramString1, paramString2);
    }

    private static SharedPreferences getSharedPreferencesObject(Context paramContext) {
        if (sharedPreferences == null) {
            sharedPreferences = PreferenceManager.getDefaultSharedPreferences(paramContext);
        }
        return sharedPreferences;
    }

    public static void removeEditor(Context paramContext, String... paramStrings) {
        if (paramStrings != null) {
            SharedPreferences.Editor eo = getEditorObject(paramContext);
            for(String key : paramStrings) {
                eo.remove(key);
            }

            if (paramStrings.length > 0) {
                eo.commit();
            }
        }
    }

    public static void setEditor(Context paramContext, String paramString, int paramInt) {
        getEditorObject(paramContext).putInt(paramString, paramInt).commit();
    }

    public static void setEditor(Context paramContext, String paramString, long paramLong) {
        getEditorObject(paramContext).putLong(paramString, paramLong).commit();
    }

    public static void setEditor(Context paramContext, String paramString, Boolean paramBoolean) {
        getEditorObject(paramContext).putBoolean(paramString, paramBoolean).commit();
    }

    public static void setEditor(Context paramContext, String paramString1, String paramString2) {
        getEditorObject(paramContext).putString(paramString1, paramString2).commit();
    }

    public static void setUserPreviewHost(boolean isChecked) {
        setEditor(GlobalCtx.app(), USE_PREVIEW_HOST, isChecked ? "1" : "0");
    }

    public static boolean usePreviewHost() {
        return "1".equals(getSharedPreferences(GlobalCtx.app(), USE_PREVIEW_HOST, "0"));
    }

    public static boolean useZitiMode() {
        return getSharedPreferences(GlobalCtx.app(), "store_is_ziti_mode", false);
    }
}
