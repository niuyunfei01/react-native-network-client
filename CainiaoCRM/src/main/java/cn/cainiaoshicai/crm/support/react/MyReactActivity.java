package cn.cainiaoshicai.crm.support.react;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.Callback;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;

import org.devio.rn.splashscreen.SplashScreen;

import java.util.Collection;

import javax.annotation.Nullable;

import cn.cainiaoshicai.crm.BuildConfig;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.domain.Config;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.Vendor;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.scan.BluetoothScanGunKeyEventHelper;
import cn.cainiaoshicai.crm.support.DaoHelper;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.ui.activity.AbstractActionBarActivity;


public class MyReactActivity extends AbstractActionBarActivity implements DefaultHardwareBackBtnHandler, PermissionAwareActivity, BluetoothScanGunKeyEventHelper.OnScanSuccessListener {

    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;

    private @Nullable
    Callback mPermissionsCallback;
    private @Nullable
    PermissionListener mPermissionListener;


    private static final int OVERLAY_PERMISSION_REQUEST_CODE = 2;

    @TargetApi(Build.VERSION_CODES.M)
    private void _askForOverlayPermission() {
        if (!BuildConfig.DEBUG || android.os.Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return;
        }
        if (!Settings.canDrawOverlays(this)) {
            Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getPackageName()));
            startActivityForResult(settingsIntent, OVERLAY_PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
            setTranslucent();
        }
        super.onCreate(savedInstanceState);
        mReactRootView = new ReactRootView(this);
        Bundle init = new Bundle();
        Intent intent = getIntent();
        String toRoute = intent.getStringExtra("_action");
        AccountBean ab = GlobalCtx.app().getAccountBean();
        if (ab != null && ab.getInfo() != null) {
            init.putBundle("userProfile", ab.getInfo().toBundle());
        } else {
            toRoute = "Login";
        }
        if ("Login".equals(toRoute)) {
            SplashScreen.show(this);
        }
        Bundle _action_params = intent.getBundleExtra("_action_params");
        if (_action_params == null) {
            _action_params = new Bundle();
        }

        String nextRoute = intent.getStringExtra("_next_action");
        Long orderId = intent.getLongExtra("order_id", 0);
        if (orderId > 0) {
            init.putLong("order_id", orderId);
            _action_params.putString("orderId", String.valueOf(orderId));
            if (TextUtils.isEmpty(toRoute)) {
                toRoute = "Order";
            }
        }

        Integer productId = intent.getIntExtra("product_id", 0);
        if (productId > 0) {
            _action_params.putString("productId", String.valueOf(productId));
            if (TextUtils.isEmpty(toRoute)) {
                toRoute = "GoodsDetail";
            }
        }

        init.putBundle("_action_params", _action_params);
        init.putString("access_token", GlobalCtx.app().token());
        init.putString("currStoreId", String.valueOf(SettingUtility.getListenerStore()));
        init.putString("_action", toRoute);
        init.putString("backPage", "Orders");

        if (!TextUtils.isEmpty(nextRoute)) {
            init.putString("_next_action", nextRoute);
        }
        mReactInstanceManager = GlobalCtx.app().getmReactInstanceManager();
        mReactRootView.startReactApplication(mReactInstanceManager, "crm", init);
        setContentView(mReactRootView);
    }

    @Override
    public void invokeDefaultOnBackPressed() {
        super.onBackPressed();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostResume(this, this);
        }

        if (mPermissionsCallback != null) {
            mPermissionsCallback.invoke();
            mPermissionsCallback = null;
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostPause(this);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostDestroy(this);
        }
    }

    @Override
    public void onBackPressed() {
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onBackPressed();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_MENU && mReactInstanceManager != null) {
            mReactInstanceManager.showDevOptionsDialog();
            return true;
        }
        return super.onKeyUp(keyCode, event);
    }

    @TargetApi(20)
    private void setTranslucent() {
        final Activity activity = this;
        ViewGroup decorView = (ViewGroup) activity.getWindow().getDecorView();
        decorView.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsets onApplyWindowInsets(View v, WindowInsets insets) {
                WindowInsets defaultInsets = v.onApplyWindowInsets(insets);
                return defaultInsets.replaceSystemWindowInsets(
                        defaultInsets.getSystemWindowInsetLeft(),
                        0,
                        defaultInsets.getSystemWindowInsetRight(),
                        defaultInsets.getSystemWindowInsetBottom());
            }
        });
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        mReactInstanceManager.onActivityResult(this, requestCode, resultCode, data);
    }

    @TargetApi(Build.VERSION_CODES.M)
    public void requestPermissions(
            String[] permissions,
            int requestCode,
            PermissionListener listener) {
        mPermissionListener = listener;
        this.requestPermissions(permissions, requestCode);
    }

    public void onRequestPermissionsResult(
            final int requestCode,
            @NonNull final String[] permissions,
            @NonNull final int[] grantResults) {
        mPermissionsCallback = new Callback() {
            @Override
            public void invoke(Object... args) {
                if (mPermissionListener != null && mPermissionListener.onRequestPermissionsResult(requestCode, permissions, grantResults)) {
                    mPermissionListener = null;
                }
            }
        };
    }
}