package com.learnium.RNDeviceInfo;

import android.Manifest;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.KeyguardManager;
import android.bluetooth.BluetoothAdapter;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiInfo;
import android.os.Build;
import android.os.Environment;
import android.os.StatFs;
import android.provider.Settings.Secure;
import android.webkit.WebSettings;
import android.telephony.TelephonyManager;
import android.text.format.Formatter;

//import com.google.android.gms.iid.InstanceID;
import android.provider.Settings;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;

import java.math.BigInteger;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;

import javax.annotation.Nullable;

public class RNDeviceModule extends ReactContextBaseJavaModule {

    ReactApplicationContext reactContext;

    WifiInfo wifiInfo;

    public RNDeviceModule(ReactApplicationContext reactContext) {
        super(reactContext);

        this.reactContext = reactContext;

        WifiManager manager = (WifiManager) reactContext.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        this.wifiInfo = manager.getConnectionInfo();
    }

    @Override
    public String getName() {
        return "RNDeviceInfo";
    }

    private String getCurrentLanguage() {
        Locale current = getReactApplicationContext().getResources().getConfiguration().locale;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            return current.toLanguageTag();
        } else {
            StringBuilder builder = new StringBuilder();
            builder.append(current.getLanguage());
            if (current.getCountry() != null) {
                builder.append("-");
                builder.append(current.getCountry());
            }
            return builder.toString();
        }
    }

    private String getCurrentCountry() {
        Locale current = getReactApplicationContext().getResources().getConfiguration().locale;
        return current.getCountry();
    }

    private Boolean isEmulator() {
        return Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
                || "google_sdk".equals(Build.PRODUCT);
    }

    private Boolean isTablet() {
        int layout = getReactApplicationContext().getResources().getConfiguration().screenLayout & Configuration.SCREENLAYOUT_SIZE_MASK;
        return layout == Configuration.SCREENLAYOUT_SIZE_LARGE || layout == Configuration.SCREENLAYOUT_SIZE_XLARGE;
    }

    @ReactMethod
    public void isPinOrFingerprintSet(Callback callback) {
        KeyguardManager keyguardManager = (KeyguardManager) this.reactContext.getSystemService(Context.KEYGUARD_SERVICE); //api 16+
        callback.invoke(keyguardManager.isKeyguardSecure());
    }

    @ReactMethod
    public void getIpAddress(Promise p) {
        String ipAddress = Formatter.formatIpAddress(wifiInfo.getIpAddress());
        p.resolve(ipAddress);
    }

    @ReactMethod
    public void getMacAddress(Promise p) {
        String macAddress = wifiInfo.getMacAddress();
        p.resolve(macAddress);
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public int getApiLevelSync() {
        return Build.VERSION.SDK_INT;
    }

    @ReactMethod
    public void getApiLevel(Promise p) {
        p.resolve(getApiLevelSync());
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getDeviceSync() {
        return Build.DEVICE;
    }

    @ReactMethod
    public void getDevice(Promise p) {
        p.resolve(getDeviceSync());
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getDeviceNameSync() {
        try {
            String bluetoothName = Settings.Secure.getString(getReactApplicationContext().getContentResolver(), "bluetooth_name");
            if (bluetoothName != null) {
                return bluetoothName;
            }

            if (Build.VERSION.SDK_INT >= 25) {
                String deviceName = Settings.Global.getString(getReactApplicationContext().getContentResolver(), Settings.Global.DEVICE_NAME);
                if (deviceName != null) {
                    return deviceName;
                }
            }
        } catch (Exception e) {
            // same as default unknown return
        }
        return "unknown";
    }

    @ReactMethod
    public void getDeviceName(Promise p) {
        p.resolve(getDeviceNameSync());
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public float getFontScaleSync() { return getReactApplicationContext().getResources().getConfiguration().fontScale; }
    @ReactMethod
    public void getFontScale(Promise p) { p.resolve(getFontScaleSync()); }

    private long getTotalAvailableBlocks(StatFs dir, Boolean intApiDeprecated) {
        return (intApiDeprecated ? dir.getAvailableBlocksLong() : dir.getAvailableBlocks());
    }

    private long getBlockSize(StatFs dir, Boolean intApiDeprecated) {
        return (intApiDeprecated ? dir.getBlockSizeLong() : dir.getBlockSize());
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public double getFreeDiskStorageSync() {
        try {
            StatFs rootDir = new StatFs(Environment.getRootDirectory().getAbsolutePath());
            StatFs dataDir = new StatFs(Environment.getDataDirectory().getAbsolutePath());

            Boolean intApiDeprecated = Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2;
            long rootAvailableBlocks = getTotalAvailableBlocks(rootDir, intApiDeprecated);
            long rootBlockSize = getBlockSize(rootDir, intApiDeprecated);
            double rootFree = BigInteger.valueOf(rootAvailableBlocks).multiply(BigInteger.valueOf(rootBlockSize)).doubleValue();

            long dataAvailableBlocks = getTotalAvailableBlocks(dataDir, intApiDeprecated);
            long dataBlockSize = getBlockSize(dataDir, intApiDeprecated);
            double dataFree = BigInteger.valueOf(dataAvailableBlocks).multiply(BigInteger.valueOf(dataBlockSize)).doubleValue();

            return rootFree + dataFree;
        } catch (Exception e) {
            return -1;
        }
    }
    @ReactMethod
    public void getFreeDiskStorage(Promise p) { p.resolve(getFreeDiskStorageSync()); }


    @ReactMethod(isBlockingSynchronousMethod = true)
    public double getTotalMemorySync() {
        ActivityManager actMgr = (ActivityManager) getReactApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        ActivityManager.MemoryInfo memInfo = new ActivityManager.MemoryInfo();
        if (actMgr != null) {
            actMgr.getMemoryInfo(memInfo);
        } else {
            System.err.println("Unable to getMemoryInfo. ActivityManager was null");
            return -1;
        }
        return (double)memInfo.totalMem;
    }
    @ReactMethod
    public void getTotalMemory(Promise p) { p.resolve(getTotalMemorySync()); }

    @ReactMethod(isBlockingSynchronousMethod = true)
    public double getMaxMemorySync() { return (double)Runtime.getRuntime().maxMemory(); }
    @ReactMethod
    public void getMaxMemory(Promise p) { p.resolve(getMaxMemorySync()); }

    @Override
    public @Nullable
    Map<String, Object> getConstants() {
        HashMap<String, Object> constants = new HashMap<String, Object>();

        PackageManager packageManager = this.reactContext.getPackageManager();
        String packageName = this.reactContext.getPackageName();

        constants.put("appVersion", "not available");
        constants.put("buildVersion", "not available");
        constants.put("buildNumber", 0);

        try {
            PackageInfo info = packageManager.getPackageInfo(packageName, 0);
            constants.put("appVersion", info.versionName);
            constants.put("buildNumber", info.versionCode);
            constants.put("firstInstallTime", info.firstInstallTime);
            constants.put("lastUpdateTime", info.lastUpdateTime);
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }

        String deviceName = "Unknown";

        try {
            BluetoothAdapter myDevice = BluetoothAdapter.getDefaultAdapter();
            if (myDevice != null) {
                deviceName = myDevice.getName();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        //constants.put("instanceId", InstanceID.getInstance(this.reactContext).getId());
        constants.put("serialNumber", Build.SERIAL);
        constants.put("deviceName", deviceName);
        constants.put("systemName", "Android");
        constants.put("systemVersion", Build.VERSION.RELEASE);
        constants.put("model", Build.MODEL);
        constants.put("brand", Build.BRAND);
        constants.put("deviceId", Build.BOARD);
        constants.put("apiLevel", Build.VERSION.SDK_INT);
        constants.put("deviceLocale", this.getCurrentLanguage());
        constants.put("deviceCountry", this.getCurrentCountry());
        constants.put("uniqueId", Secure.getString(this.reactContext.getContentResolver(), Secure.ANDROID_ID));
        constants.put("systemManufacturer", Build.MANUFACTURER);
        constants.put("bundleId", packageName);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR1) {
            constants.put("userAgent", WebSettings.getDefaultUserAgent(this.reactContext));
        }
        constants.put("timezone", TimeZone.getDefault().getID());
        constants.put("isEmulator", this.isEmulator());
        constants.put("isTablet", this.isTablet());
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            return constants;
        }
        if (currentActivity.checkCallingOrSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED ||
                currentActivity.checkCallingOrSelfPermission(Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED ||
                currentActivity.checkCallingOrSelfPermission("android.permission.READ_PHONE_NUMBERS") == PackageManager.PERMISSION_GRANTED) {
            TelephonyManager telMgr = (TelephonyManager) this.reactContext.getSystemService(Context.TELEPHONY_SERVICE);
            constants.put("phoneNumber", telMgr.getLine1Number());
        }
        return constants;
    }
}
