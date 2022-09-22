package com.reactnativerestart;

import android.app.Activity;
import android.os.Handler;
import android.os.Looper;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.JSBundleLoader;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.devio.rn.splashscreen.SplashScreen;

import java.io.File;
import java.lang.reflect.Field;

import cn.cainiaoshicai.crm.support.utils.Utility;

public class RestartModule extends ReactContextBaseJavaModule {

    private LifecycleEventListener mLifecycleEventListener = null;

    public RestartModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    private void loadBundleLegacy() {
        final Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            return;
        }
        currentActivity.runOnUiThread(currentActivity::recreate);
    }

    private void loadBundle() {
        clearLifecycleEventListener();
        try {
            final ReactInstanceManager instanceManager = resolveInstanceManager();
            if (instanceManager == null) {
                return;
            }

            new Handler(Looper.getMainLooper()).post(() -> {
                try {
                    String DocumentDir = getReactApplicationContext().getFilesDir().getAbsolutePath();
                    String versionCode = Utility.getVersionCode(getReactApplicationContext());
                    String jsBundleFile = DocumentDir + "/last.android/" + versionCode + ".android.bundle";
                    File file = new File(jsBundleFile);
                    if (file.exists() && file.isFile()) {
                        SplashScreen.show(getCurrentActivity());
                        JSBundleLoader loader = JSBundleLoader.createFileLoader(jsBundleFile);
                        Field loadField = instanceManager.getClass().getDeclaredField("mBundleLoader");
                        loadField.setAccessible(true);
                        loadField.set(instanceManager, loader);
                        instanceManager.recreateReactContextInBackground();
                        return;
                    }
                    loadBundleLegacy();
                } catch (Throwable t) {
                    loadBundleLegacy();
                }
            });

        } catch (Throwable t) {
            loadBundleLegacy();
        }
    }

    private static ReactInstanceHolder mReactInstanceHolder;

    static ReactInstanceManager getReactInstanceManager() {
        if (mReactInstanceHolder == null) {
            return null;
        }
        return mReactInstanceHolder.getReactInstanceManager();
    }

    private ReactInstanceManager resolveInstanceManager() throws NoSuchFieldException, IllegalAccessException {
        ReactInstanceManager instanceManager = getReactInstanceManager();
        if (instanceManager != null) {
            return instanceManager;
        }

        final Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            return null;
        }

        ReactApplication reactApplication = (ReactApplication) currentActivity.getApplication();
        instanceManager = reactApplication.getReactNativeHost().getReactInstanceManager();

        return instanceManager;
    }


    private void clearLifecycleEventListener() {
        if (mLifecycleEventListener != null) {
            getReactApplicationContext().removeLifecycleEventListener(mLifecycleEventListener);
            mLifecycleEventListener = null;
        }
    }

    @ReactMethod
    public void Restart() {
        loadBundle();
    }

    @Override
    public String getName() {
        return "RNRestart";
    }

}
