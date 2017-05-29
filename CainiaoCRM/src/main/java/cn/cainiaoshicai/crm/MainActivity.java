/*
 * Copyright (C) 2013 The Android Open Source Project
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

package cn.cainiaoshicai.crm;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.location.Location;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.support.annotation.IdRes;
import android.support.annotation.NonNull;
import android.support.design.widget.TabLayout;
import android.support.v4.content.ContextCompat;
import android.support.v4.view.ViewPager;
import android.text.TextUtils;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

import com.roughike.bottombar.BottomBar;
import com.roughike.bottombar.BottomBarTab;
import com.roughike.bottombar.OnTabSelectListener;
import com.roughike.bottombar.TabSelectionInterceptor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import cn.cainiaoshicai.crm.dao.StaffDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.orders.OrderListFragment;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.util.AlertUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.LocationHelper;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.utils.BundleArgsConstants;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.AbstractActionBarActivity;
import cn.cainiaoshicai.crm.ui.activity.GeneralWebViewActivity;
import cn.cainiaoshicai.crm.ui.activity.MineActivity;
import cn.cainiaoshicai.crm.ui.activity.ProgressFragment;
import cn.cainiaoshicai.crm.ui.activity.SettingsPrintActivity;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageActivity;
import cn.cainiaoshicai.crm.ui.adapter.OrdersPagerAdapter;

public class MainActivity extends AbstractActionBarActivity {

    private static final List<ListType> TAB_LIST_TYPES = Arrays.asList(ListType.WAITING_READY,
            ListType.WAITING_SENT, ListType.WAITING_ARRIVE, ListType.ARRIVED);
    public static final int REQUEST_DAY = 1;
    public static final int REQUEST_INFO = 1;

    public static String POSITION = "tab_position";

    private Date day = new Date();
    private AccountBean accountBean;
    private LocationHelper locationHelper;
    private TextView notifCount;
    private int mNotifCount = 1;
    private BottomBarTab remindIconView;
    private ViewPager ordersViewPager;
    private TabLayout tabLayout;
    private BottomBar bottomBar;

    public static Intent newIntent() {
        return new Intent(GlobalCtx.getInstance(), MainActivity.class);
    }

    public static Intent newIntent(AccountBean accountBean) {
        Intent intent = newIntent();
        intent.putExtra(BundleArgsConstants.ACCOUNT_EXTRA, accountBean);
        return intent;
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        ordersViewPager.setCurrentItem(savedInstanceState.getInt(POSITION));
    }

    @Override
    public void onSaveInstanceState(Bundle outState, PersistableBundle outPersistentState) {
        super.onSaveInstanceState(outState, outPersistentState);
        outState.putInt(POSITION, tabLayout.getSelectedTabPosition());
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (savedInstanceState != null) {
            accountBean = savedInstanceState.getParcelable(BundleArgsConstants.ACCOUNT_EXTRA);
        } else {
            Intent intent = getIntent();
            accountBean = intent.getParcelableExtra(BundleArgsConstants.ACCOUNT_EXTRA);
        }

        if (accountBean == null) {
            accountBean = GlobalCtx.getInstance().getAccountBean();
        }

        if (accountBean == null) {
            Utility.showExpiredTokenDialogOrNotification();
            return;
        }
        GlobalCtx.getInstance().setAccountBean(accountBean);
        SettingUtility.setDefaultAccountId(accountBean.getUid());

        setContentView(R.layout.order_list_main);

        // Get the ViewPager and set it's PagerAdapter so that it can display items
        ordersViewPager = (ViewPager) findViewById(R.id.viewpager);
        final OrdersPagerAdapter adapter = new OrdersPagerAdapter(getSupportFragmentManager(),
                MainActivity.this);
        ordersViewPager.setAdapter(adapter);
        ordersViewPager.setOffscreenPageLimit(adapter.getCount());
        ordersViewPager.addOnPageChangeListener(new ViewPager.OnPageChangeListener() {
            @Override
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {

            }

            @Override
            public void onPageSelected(int position) {
                OrderListFragment frag = (OrderListFragment) adapter.getItem(position);
                frag.refresh();
            }

            @Override
            public void onPageScrollStateChanged(int state) {

            }
        });

        tabLayout = (TabLayout) findViewById(R.id.order_list_main);
        tabLayout.setupWithViewPager(ordersViewPager);

        // Get the intent, verify the action and userTalkStatus the query
        Intent intent = getIntent();
        handleIntent(intent);

        if (locationHelper == null) {
            locationHelper = new LocationHelper(this);
            locationHelper.initLocation();
        }
    }

    private void resetPrinterStatusBar() {

        final ArrayList<Integer> autoPrintStores = SettingUtility.getAutoPrintStores();
        TextView printerStatus = (TextView) this.findViewById(R.id.head_status_printer);
        this.findViewById(R.id.head_orders_schedule).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getApplicationContext(), GeneralWebViewActivity.class);

                Set<Integer> listenerStores =  SettingUtility.getListenerStores();
                listenerStores.remove(Cts.STORE_UNKNOWN);
                if (listenerStores.size() > 1 || listenerStores.isEmpty()) {
                    Utility.toast("排单/采购系统只支持一个店铺的订单，请修改设置！", MainActivity.this, null);
                    return;
                }

                String storeStr = TextUtils.join(",", listenerStores);
                String token = GlobalCtx.getApplication().getSpecialToken();
                intent.putExtra("url", String.format("%s/orders_processing/%s.html?access_token="+ token, URLHelper.getStoresPrefix(), storeStr));
                startActivity(intent);
            }
        });

        final TextView shipStatusText = (TextView) this.findViewById(R.id.head_ship_status);
        AccountBean workStatus = GlobalCtx.getApplication().getWorkerStatus();
        shipStatusText.setText(Cts.getShipStatusLabel(workStatus));

        final TextView signingText = (TextView) this.findViewById(R.id.head_orders_waiting);
        signingText.setText(Cts.getSignInLabel(SettingUtility.getSignInStatus()));

        signingText.setOnClickListener(new View.OnClickListener() {
            @SuppressLint("HardwareIds")
            @Override
            public void onClick(View v) {
                if (locationHelper == null) {
                    AlertUtil.showAlert(MainActivity.this, "错误提示", "暂时无法检测您的位置，请打开GPS");
                    return;
                }
                final Integer signInStore = SettingUtility.getSignInStore();
                final Integer signInStatus = SettingUtility.getSignInStatus();
                final HashMap<String, String> envInfos = extraEnvInfo();
                if (signInStatus == Cts.SIGN_ACTION_IN) {

                    final ProgressFragment pf = ProgressFragment.newInstance(R.string.signing);
                    Utility.forceShowDialog(MainActivity.this, pf);

                    new MyAsyncTask<Void, Void, Void>() {
                        @Override
                        protected Void doInBackground(Void... params) {
                            pf.dismissAllowingStateLoss();

                            String err = "";
                            try {
                                StaffDao staffDao = new StaffDao(GlobalCtx.getApplication().getSpecialToken());
                                final ResultBean<HashMap<String, String>> msg = staffDao.getWorkingStatus();
                                if (msg.isOk()) {
                                    MainActivity.this.runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            AlertUtil.showAlert(MainActivity.this, R.string.working_status,
                                                    msg.getDesc(), "知道了", null, "查看详情", new StaffDetailsClickListener(), "现在下班",
                                                    new SignOffOnClickListener(signInStore, envInfos, signingText));
                                        }
                                    });
                                } else {
                                    err = "获取工作状态失败:" + msg.getDesc();
                                }
                            } catch (ServiceException e) {
                                err = "异常:" + e.getMessage();
                            }

                            if (!TextUtils.isEmpty(err)) {
                                AlertUtil.showAlert(MainActivity.this, "发生错误", err);
                            }

                            return null;
                        }
                    }.executeOnNormal();

                } else {
                    final HashSet<Integer> selectedStores = new HashSet<>();
                    if (signInStore > 0) {
                        selectedStores.add(signInStore);
                    }
                    Utility.showStoreSelector(MainActivity.this, "选择工作门店", "签到", "暂不签到", selectedStores,
                            new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    if (selectedStores.size() != 1) {
                                        AlertUtil.showAlert(MainActivity.this, "错误提醒", "选择一个工作门店");
                                    } else {
                                        final ProgressFragment pf = ProgressFragment.newInstance(R.string.signing);
                                        Utility.forceShowDialog(MainActivity.this, pf);
                                        final Integer signInStoreId = selectedStores.iterator().next();

                                        new MyAsyncTask<Void, Void, Void>() {
                                            private ResultBean<HashMap<String, String>> resultBean;

                                            @Override
                                            protected Void doInBackground(Void... params) {
                                                StaffDao fbDao = new StaffDao(GlobalCtx.getInstance().getSpecialToken());
                                                try {
                                                    resultBean = fbDao.sign_in(signInStoreId, envInfos);
                                                } catch (ServiceException e) {
                                                    resultBean = ResultBean.serviceException("服务异常:" + e.getMessage());
                                                }
                                                return null;
                                            }

                                            @Override
                                            protected void onPostExecute(Void aVoid) {
                                                pf.dismissAllowingStateLoss();
                                                if (resultBean.isOk()) {
                                                    final HashMap<String, String> obj = resultBean.getObj();

                                                    final String okTips = "打卡成功，今日值班店长："
                                                            + (obj != null ? obj.get("working_mgr") : "未安排")
                                                            + resultBean.getDesc();

                                                    MainActivity.this.runOnUiThread(new Runnable() {
                                                        @Override
                                                        public void run() {
                                                            AlertUtil.showAlert(MainActivity.this, "门店提醒", okTips);
                                                            updateSignInStatus(obj, signingText);
                                                        }
                                                    });
                                                } else {
                                                    Utility.toast("签到失败:" + resultBean.getDesc(), MainActivity.this);
                                                    MainActivity.this.runOnUiThread(new Runnable() {
                                                        @Override
                                                        public void run() {
                                                            updateSignInStatus(resultBean.getObj(), signingText);
                                                        }
                                                    });
                                                }
                                            }
                                        }.executeOnNormal();
                                    }
                                }
                            }, "查看考勤表", new StaffDetailsClickListener());
                }
            }
        });
        final int bgColorResId;
        if (!autoPrintStores.isEmpty()) {
            final String printStatusTxt;
            String autoPrintNames = GlobalCtx.getApplication().getStoreNames(autoPrintStores);
            if (SettingsPrintActivity.isPrinterConnected()) {
                printStatusTxt = "自动打印(" + autoPrintNames + ")，已连接！";
                bgColorResId = R.color.green;
            } else {
                printStatusTxt = "自动打印(" + autoPrintNames + ")，未连接！";
                bgColorResId = R.color.red;
            }
            printerStatus.setText(printStatusTxt);
        } else {
            printerStatus.setText("自动打印：关闭");
            bgColorResId = R.color.gray;
        }
        printerStatus.setBackground(ContextCompat.getDrawable(getApplicationContext(), bgColorResId));
        printerStatus.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent i = new Intent(getApplicationContext(), SettingsPrintActivity.class);
                MainActivity.this.startActivity(i);
            }
        });

        bottomBar = (BottomBar) findViewById(R.id.toolbar_bottom);
        bottomBar.setDefaultTab(R.id.menu_process);
        bottomBar.setTabSelectionInterceptor(new TabSelectionInterceptor() {
            @Override
            public boolean shouldInterceptTabSelection(@IdRes int oldTabId, @IdRes int newTabId) {
//                if (newTabId == R.id.tab_pro_feature && !userHasProVersion()) {
//                    startProVersionPurchaseFlow();
//                    return true;
//                }

                return false;
            }
        });

        bottomBar.setOnTabSelectListener(new OnTabSelectListener() {
            @Override
            public void onTabSelected(@IdRes int tabId) {
                onMenuClick(tabId);
                //TODO: 更新orders 表格的数据, store_order updated
                ordersViewPager.getAdapter().notifyDataSetChanged();
                requestUpdateBadges();
            }
        });

        if (bottomBar.getCurrentTabId() != R.id.menu_process) {
            bottomBar.selectTabWithId(R.id.menu_process);
        }

        remindIconView = bottomBar.getTabWithId(R.id.menu_accept);

/**
        MenuItem item = menu.findItem(R.id.menu_accept);
        MenuItemCompat.setActionView(item, R.layout.feed_update_count);

        View count = item.getActionView();
        notifCount = (TextView) count.findViewById(R.id.hotlist_hot);
        notifCount.setText(String.valueOf(mNotifCount));

        GlobalCtx.getApplication().getTaskCount(this, new GlobalCtx.TaskCountUpdated() {
            @Override
            public void callback(int count) {
                mNotifCount = count;
                updateHotCount(mNotifCount);
            }
        });

        new MyMenuItemStuffListener(count, "查看任务") {
            @Override
            public void onClick(View v) {
                GlobalCtx.getApplication().toTaskListActivity(MainActivity.this);
            }
        }; */
    }

    private void requestUpdateBadges() {
        GlobalCtx.getApplication().getTaskCount(MainActivity.this, new GlobalCtx.TaskCountUpdated() {
            @Override
            public void callback(int count) {
                mNotifCount = count;
                updateHotCount(mNotifCount);
            }
        });
    }

    public void updateSignInStatus(HashMap<String, String> obj, TextView signingText) {
        if (obj != null
                && (obj.containsKey("sign_store") && obj.containsKey("sign_status"))) {
            int sign_store = Integer.valueOf(obj.get("sign_store"));
            int sign_status = Integer.valueOf(obj.get("sign_status"));
            SettingUtility.setSignIn(sign_store, sign_status);
            signingText.setText(Cts.getSignInLabel(sign_status));
        }
    }

    @NonNull
    public HashMap<String, String> extraEnvInfo() {
        final HashMap<String, String> envInfos = new HashMap<>();
        Location location = locationHelper.getLastBestLocation();
        if (location != null) {
            AppLogger.e("location: Lat: " + location.getLatitude() + " Lng: \"\n" + location.getLongitude());
            envInfos.put("loc_lat", String.valueOf(location.getLatitude()));
            envInfos.put("loc_lng", String.valueOf(location.getLongitude()));
        } else {
            AlertUtil.showAlert(MainActivity.this, "签到失败", "无法获得当前的地理位置，开启位置权限后重试！");
        }

        WifiManager mWifi = (WifiManager) getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        if (!mWifi.isWifiEnabled()) {
            mWifi.setWifiEnabled(true);
        }

        StringBuilder sb = new StringBuilder();
        WifiInfo wifiInfo = mWifi.getConnectionInfo();
        if (wifiInfo != null) {

            envInfos.put("wifi_name", wifiInfo.getSSID());
            envInfos.put("device_mac", wifiInfo.getMacAddress());
            envInfos.put("wifi_mac", wifiInfo.getBSSID());

            sb.append("\n获取BSSID属性（所连接的WIFI设备的MAC地址）：" + wifiInfo.getBSSID());
            //		sb.append("getDetailedStateOf()  获取客户端的连通性：");
            sb.append("\n\n获取SSID 是否被隐藏：" + wifiInfo.getHiddenSSID());
            sb.append("\n\n获取IP 地址：" + wifiInfo.getIpAddress());
            sb.append("\n\n获取连接的速度：" + wifiInfo.getLinkSpeed());
            sb.append("\n\n获取Mac 地址（手机本身网卡的MAC地址）：" + wifiInfo.getMacAddress());
            sb.append("\n\n获取802.11n 网络的信号：" + wifiInfo.getRssi());
            sb.append("\n\n获取SSID（所连接的WIFI的网络名称）：" + wifiInfo.getSSID());
            sb.append("\n\n获取具体客户端状态的信息：" + wifiInfo.getSupplicantState());
        }
        AppLogger.e("wifi info:" + sb.toString());
        return envInfos;
    }

    private void handleIntent(Intent intent) {

        ListType list_type;
        if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
            list_type = ListType.ARRIVED;
        } else {
            list_type = ListType.findByType(intent.getIntExtra("list_type", 0));
        }

        if (list_type.getValue() > 0) {
            this.ordersViewPager.setCurrentItem(list_type.getValue() - 1);
        }
        this.resetPrinterStatusBar();
    }

    public void updateStatusCnt(HashMap<Integer, Integer> totalByStatus) {
        OrdersPagerAdapter adapter = (OrdersPagerAdapter) this.ordersViewPager.getAdapter();
        for(ListType listType : TAB_LIST_TYPES) {
            Integer count = totalByStatus.get(listType.getValue());
            if (count == null) count = 0;
            adapter.setCount(listType, count);
        }
        adapter.notifyDataSetChanged();
    }

    @Override
    protected void onResume() {
        super.onResume();
        this.resetPrinterStatusBar();
    }

    @NonNull
    public static ListType getListTypeByTab(int position) {
        ListType listType = ListType.NONE;
        if (position == 0) {
            listType = ListType.WAITING_READY;
        } else if (position == 1) {
            listType = ListType.WAITING_SENT;
        } else if (position == 2) {
            listType = ListType.WAITING_ARRIVE;
        } else if (position == 3) {
            listType = ListType.ARRIVED;
        }
        return listType;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        setIntent(intent);
        handleIntent(intent);
    }

    public boolean onOptionsItemSelected(MenuItem item) {

        int itemId = item.getItemId();

        return onMenuClick(itemId) || super.onOptionsItemSelected(item);
    }

    public boolean onMenuClick(int itemId) {
        switch (itemId) {
            case R.id.menu_process:
                return true;
            case R.id.menu_accept:
//                startActivity(new Intent(getApplicationContext(), RemindersActivity.class));
                GlobalCtx.getApplication().toTaskListActivity(this);
                return true;
            case R.id.menu_search:
                this.onSearchRequested();
                return true;
            case R.id.menu_mine:
                startActivity(new Intent(getApplicationContext(), MineActivity.class));
                return true;
            case R.id.menu_store_maint:
                startActivity(new Intent(getApplicationContext(), StoreStorageActivity.class));
                return true;
            default:
        }

        return false;
    }

    // call the updating code on the main thread,
// so we can call this asynchronously
    public void updateHotCount(final int new_hot_number) {
        mNotifCount = new_hot_number;
        if (notifCount == null) return;
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (new_hot_number == 0)
                    notifCount.setVisibility(View.INVISIBLE);
                else {
                    notifCount.setVisibility(View.VISIBLE);
                    notifCount.setText(Integer.toString(new_hot_number));
                }
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_DAY) {
            if (resultCode == RESULT_OK) {
                if (data != null) {
                }
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    private class SignOffOnClickListener implements DialogInterface.OnClickListener {
        private final Integer signInStore;
        private final HashMap<String, String> envInfos;
        private final TextView signingText;

        public SignOffOnClickListener(Integer signInStore, HashMap<String, String> envInfos, TextView signingText) {
            this.signInStore = signInStore;
            this.envInfos = envInfos;
            this.signingText = signingText;
        }

        @Override
        public void onClick(DialogInterface dialog, int which) {
            AlertDialog.Builder adb = new AlertDialog.Builder(MainActivity.this);
            final String[] titles = new String[]{
                    "已完成订货",
                    "已完成报损",
                    "下架产品已重新上架",
                    "门店卫生已清理",
                    "已向值班店长报告各项工作下班",
            };
            final boolean[] checked = new boolean[titles.length];
            adb.setMultiChoiceItems(titles, checked, new DialogInterface.OnMultiChoiceClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which, boolean isChecked) {
                    checked[which] = isChecked;
                }
            });

            adb.setTitle("检查下班各项工作是否已完成？")
                    .setPositiveButton("现在下班", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {

                            for (boolean aChecked : checked) {
                                if (!aChecked) {
                                    AlertUtil.showAlert(MainActivity.this, "", "店内各项工作完成方可打卡下班");
                                    return;
                                }
                            }

                            final ProgressFragment pf = ProgressFragment.newInstance(R.string.signing);
                            Utility.forceShowDialog(MainActivity.this, pf);
                            new MyAsyncTask<Void, Void, Void>() {
                                private ResultBean<HashMap<String, String>> resultBean;

                                @Override
                                protected Void doInBackground(Void... params) {
                                    StaffDao fbDao = new StaffDao(GlobalCtx.getInstance().getSpecialToken());
                                    try {
                                        resultBean = fbDao.sign_off(signInStore, envInfos);
                                    } catch (ServiceException e) {
                                        resultBean = ResultBean.serviceException("系统异常:" + e.getMessage());
                                    }
                                    return null;
                                }

                                @Override
                                protected void onPostExecute(Void aVoid) {
                                    pf.dismissAllowingStateLoss();
                                    if (resultBean.isOk()) {
                                        MainActivity.this.runOnUiThread(new Runnable() {
                                            @Override
                                            public void run() {
                                                AlertUtil.showAlert(MainActivity.this, "下班提示", resultBean.getDesc());
                                                updateSignInStatus(resultBean.getObj(), signingText);
                                            }
                                        });
                                    } else {
                                        Utility.toast("打卡失败:" + resultBean.getDesc(), MainActivity.this);
                                        MainActivity.this.runOnUiThread(new Runnable() {
                                            @Override
                                            public void run() {
                                                updateSignInStatus(resultBean.getObj(), signingText);
                                            }
                                        });
                                    }
                                }
                            }.executeOnNormal();
                        }
                    });
            adb.setNegativeButton("取消", null);
            adb.show();
        }
    }

    private class StaffDetailsClickListener implements DialogInterface.OnClickListener {
        @Override
        public void onClick(DialogInterface dialog, int which) {
            String token = GlobalCtx.getInstance().getSpecialToken();
            GeneralWebViewActivity.gotoWeb(MainActivity.this,
                    URLHelper.getStoresPrefix() + "/working_status.html?access_token=" + token);
        }
    }
}
