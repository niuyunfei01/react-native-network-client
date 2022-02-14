package cn.cainiaoshicai.crm;

import android.content.Context;

import org.acra.ACRA;
import org.acra.ReportingInteractionMode;
import org.acra.config.ACRAConfiguration;
import org.acra.config.ACRAConfigurationException;
import org.acra.config.ConfigurationBuilder;
import org.acra.sender.HttpSender;

import cn.cainiaoshicai.crm.support.helper.SettingUtility;

import static org.acra.ReportField.ANDROID_VERSION;
import static org.acra.ReportField.APP_VERSION_CODE;
import static org.acra.ReportField.APP_VERSION_NAME;
import static org.acra.ReportField.AVAILABLE_MEM_SIZE;
import static org.acra.ReportField.BRAND;
import static org.acra.ReportField.BUILD;
import static org.acra.ReportField.BUILD_CONFIG;
import static org.acra.ReportField.CRASH_CONFIGURATION;
import static org.acra.ReportField.CUSTOM_DATA;
import static org.acra.ReportField.DEVICE_FEATURES;
import static org.acra.ReportField.DISPLAY;
import static org.acra.ReportField.DUMPSYS_MEMINFO;
import static org.acra.ReportField.ENVIRONMENT;
import static org.acra.ReportField.FILE_PATH;
import static org.acra.ReportField.INITIAL_CONFIGURATION;
import static org.acra.ReportField.INSTALLATION_ID;
import static org.acra.ReportField.IS_SILENT;
import static org.acra.ReportField.LOGCAT;
import static org.acra.ReportField.PACKAGE_NAME;
import static org.acra.ReportField.PHONE_MODEL;
import static org.acra.ReportField.PRODUCT;
import static org.acra.ReportField.REPORT_ID;
import static org.acra.ReportField.SHARED_PREFERENCES;
import static org.acra.ReportField.STACK_TRACE;
import static org.acra.ReportField.TOTAL_MEM_SIZE;
import static org.acra.ReportField.USER_APP_START_DATE;
import static org.acra.ReportField.USER_CRASH_DATE;
import static org.acra.ReportField.USER_IP;

/**
 * Created by liuzhr on 6/6/17.
 */

public class CrashReportHelper {

    public static void attachBaseContext(Context base, GlobalCtx ctx) {
        final ACRAConfiguration config;
        try {
            config = new ConfigurationBuilder(ctx)
                    .setFormUri("https://api.waisongbang.com/util/crm_error_report")
                    .setCustomReportContent(REPORT_ID, APP_VERSION_CODE, APP_VERSION_NAME,
                            PACKAGE_NAME, FILE_PATH, PHONE_MODEL, BRAND, PRODUCT, ANDROID_VERSION, BUILD, TOTAL_MEM_SIZE,
                            AVAILABLE_MEM_SIZE, BUILD_CONFIG, CUSTOM_DATA, IS_SILENT, STACK_TRACE, INITIAL_CONFIGURATION, CRASH_CONFIGURATION,
                            DISPLAY/*, USER_COMMENT, USER_EMAIL*/, USER_APP_START_DATE, USER_CRASH_DATE, DUMPSYS_MEMINFO, LOGCAT,
                            INSTALLATION_ID, DEVICE_FEATURES, ENVIRONMENT/*, SHARED_PREFERENCES*/, CUSTOM_DATA, USER_IP)
                    .setReportingInteractionMode(ReportingInteractionMode.SILENT)
                    .setReportType(HttpSender.Type.JSON)
                    .build();
            ACRA.init(ctx, config);
        } catch (ACRAConfigurationException e) {
            e.printStackTrace();
        }
    }

    public static void handleUncaughtException(Thread t, Throwable e) {
        try {
            ACRA.getErrorReporter().putCustomData("UID", GlobalCtx.app().getCurrentAccountId());
            ACRA.getErrorReporter().putCustomData("CURR-STORE", String.valueOf(SettingUtility.getListenerStore()));
            ACRA.getErrorReporter().putCustomData("RN-TRACE", GlobalCtx.app().getRouteTrace());
        }catch (Exception ex) {
            ex.printStackTrace();
        }
        ACRA.getErrorReporter().handleSilentException(e);
    }
}
