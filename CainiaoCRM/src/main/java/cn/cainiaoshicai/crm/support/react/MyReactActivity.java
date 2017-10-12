package cn.cainiaoshicai.crm.support.react;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;

import org.devio.rn.splashscreen.SplashScreen;

import java.util.Collection;
import java.util.HashMap;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.Vendor;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.UserBean;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;


public class MyReactActivity extends Activity implements DefaultHardwareBackBtnHandler {

    private ReactRootView mReactRootView;
    private ReactInstanceManager mReactInstanceManager;
    private static String REACT_PREFERENCES = "react_preferences";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        if (Build.VERSION.SDK_INT >= 20) {
            setTranslucent();
        }
        if (isFirstLoad(getApplicationContext())) {
            SplashScreen.show(this);
        }
        super.onCreate(savedInstanceState);
        mReactRootView = new ReactRootView(this);
        Bundle init = new Bundle();
        Intent intent = getIntent();
        String toRoute = intent.getStringExtra("_action");
        Bundle _action_params = new Bundle();
        String nextRoute = intent.getStringExtra("_next_action");
        Long orderId = intent.getLongExtra("order_id", 0);
        if (orderId > 0) {
            init.putLong("order_id", orderId);
            _action_params.putString("orderId", String.valueOf(orderId));
            if (TextUtils.isEmpty(toRoute)) {
                toRoute = "Order";
            }
        }

        AccountBean ab = GlobalCtx.app().getAccountBean();
        if (ab != null) {
            UserBean user = ab.getInfo();

            Bundle userB = new Bundle();
            userB.putString("cover_image", user.getCover_image());
            userB.putString("remark", user.getRemark());
            userB.putString("sex", user.getSex());
            userB.putString("mobilephone", user.getMobilephone());
            userB.putString("id", user.getId());
            userB.putString("screen_name", user.getScreen_name());
            userB.putString("name", user.getName());
            userB.putString("province", user.getProvince());
            userB.putString("city", user.getCity());
            userB.putString("location", user.getLocation());
            userB.putString("description", user.getDescription());
            userB.putString("prefer_store", String.valueOf(user.getPrefer_store()));

            init.putBundle("userProfile", userB);
        }


        Collection<Store> stores = GlobalCtx.app().listStores();

        Bundle storesB = new Bundle();

        if (stores != null) {
            for(Store s : stores) {
                storesB.putBundle(String.valueOf(s.getId()), s.toBundle());
            }
        }
        init.putBundle("canReadStores", storesB);

        Bundle storesV = new Bundle();
        Vendor vendor = GlobalCtx.app().getVendor();
        if (vendor != null){
            storesV.putBundle(String.valueOf(vendor.getId()), vendor.toBundle());
        }
        init.putBundle("canReadVendors", storesV);

        init.putBundle("_action_params", _action_params);
        init.putString("access_token", GlobalCtx.app().token());
        init.putString("currStoreId", String.valueOf(SettingUtility.getListenerStore()));
        init.putString("_action", toRoute);
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
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostPause();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mReactInstanceManager != null) {
            mReactInstanceManager.onHostDestroy();
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

    public static boolean isFirstLoad(Context context) {
        final SharedPreferences reader = context.getSharedPreferences(REACT_PREFERENCES, Context.MODE_PRIVATE);
        final boolean first = reader.getBoolean("is_first", true);
        if (first) {
            final SharedPreferences.Editor editor = reader.edit();
            editor.putBoolean("is_first", false);
            editor.commit();
        }
        return first;
    }
}