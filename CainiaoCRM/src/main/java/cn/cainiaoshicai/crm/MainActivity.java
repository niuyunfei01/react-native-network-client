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

import android.app.FragmentManager;
import android.app.SearchManager;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.FragmentTransaction;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.text.TextUtils;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.TextView;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import cn.cainiaoshicai.crm.orders.OrderListFragment;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.utils.BundleArgsConstants;
import cn.cainiaoshicai.crm.ui.activity.AbstractActionBarActivity;
import cn.cainiaoshicai.crm.ui.activity.BTDeviceListActivity;
import cn.cainiaoshicai.crm.ui.activity.DatepickerActivity;
import cn.cainiaoshicai.crm.ui.activity.MineActivity;
import cn.cainiaoshicai.crm.ui.activity.RemindersActivity;

public class MainActivity extends AbstractActionBarActivity implements ActionBar.TabListener {

    private static final List<ListType> TAB_LIST_TYPES = Arrays.asList(ListType.WAITING_READY, ListType.WAITING_SENT, ListType.WAITING_ARRIVE, ListType.ARRIVED);
    private HashMap<Integer, Integer> fragmentMap = new HashMap<>();
    public static final int REQUEST_DAY = 1;
    public static final int REQUEST_INFO = 1;

    private Date day = new Date();
    private AccountBean accountBean;

    public static Intent newIntent() {
        return new Intent(GlobalCtx.getInstance(), MainActivity.class);
    }

    public static Intent newIntent(AccountBean accountBean) {
        Intent intent = newIntent();
        intent.putExtra(BundleArgsConstants.ACCOUNT_EXTRA, accountBean);
        return intent;
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

//        GlobalCtx.getInstance().setGroup(null);
        GlobalCtx.getInstance().setAccountBean(accountBean);
        SettingUtility.setDefaultAccountId(accountBean.getUid());

        setContentView(R.layout.order_list_main);

        // Set the Action Bar to use tabs for navigation
        ActionBar ab = getSupportActionBar();
        ab.setDisplayHomeAsUpEnabled(false);
        ab.setDisplayShowHomeEnabled(false);
        ab.setDisplayShowTitleEnabled(false);
        ab.setNavigationMode(ActionBar.NAVIGATION_MODE_TABS);

        for(ListType type : TAB_LIST_TYPES) {
            ab.addTab(ab.newTab().setText(type.getName()).setTabListener(this));
        }

        // Get the intent, verify the action and get the query
        Intent intent = getIntent();
        handleIntent(ab, intent);
    }

    private void resetPrinterStatusBar(boolean show) {
        TextView printerStatus = (TextView) this.findViewById(R.id.head_status_printer);
        if (show && (SettingUtility.isAutoPrintYYC() || SettingUtility.isAutoPrintHLG())) {
            String storeDesc = SettingUtility.isAutoPrintHLG() ? "回龙观店" : "";
            storeDesc += SettingUtility.isAutoPrintYYC() ? (("".equals(storeDesc) ? "" : ", ") + "亚运村店") : "";

            final String printStatusTxt;
            final int bgColorResId;
            if (BTDeviceListActivity.isPrinterConnected()) {
                printStatusTxt = "已设自动打印(" + storeDesc + ")，打印机已就绪！";
                bgColorResId = R.color.green;
            } else {
                printStatusTxt = "已设自动打印(" + storeDesc + ")，点此连接打印机！";
                bgColorResId = R.color.red;
            }
            printerStatus.setBackground(ContextCompat.getDrawable(getApplicationContext(), bgColorResId));
            printerStatus.setText(printStatusTxt);
            printerStatus.setVisibility(View.VISIBLE);
            printerStatus.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent i = new Intent(getApplicationContext(), BTDeviceListActivity.class);
                    MainActivity.this.startActivity(i);
                }
            });
        } else {
            printerStatus.setVisibility(View.GONE);
        }
    }

    private void handleIntent(ActionBar ab, Intent intent) {
        int list_type = intent.getIntExtra("list_type", 0);

        if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
            list_type = ListType.ARRIVED.getValue();
        }

        if (list_type > 0) {
            ActionBar.Tab tabAt = ab.getTabAt(list_type - 1);
            if (tabAt != null) {
                ab.selectTab(tabAt);
            }
        }

        if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
            String query = intent.getStringExtra(SearchManager.QUERY);
            this.onDayAndTypeChanged(null, query);
        } else {
            this.resetPrinterStatusBar(true);
        }
    }

    @Override
    public void onTabSelected(ActionBar.Tab tab, FragmentTransaction fragmentTransaction) {
        Log.d(GlobalCtx.ORDERS_TAG, String.valueOf(tab.getText()));

        int position = tab.getPosition();
        ListType listType = getListTypeByTab(position);

        onDayAndTypeChanged(listType, null);
    }

    public void updateStatusCnt(HashMap<Integer, Integer> totalByStatus, boolean isSearch) {
        for(ListType listType : TAB_LIST_TYPES) {
            Integer count = totalByStatus.get(listType.getValue());
            if (count == null) count = 0;

            ActionBar.Tab tab = this.getSupportActionBar().getTabAt(listType.getValue() - 1);
            if (tab != null && (isSearch || !listType.equals(ListType.ARRIVED))) {
                tab.setText(listType.getName() + "\n(" + count + ")");
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        this.resetPrinterStatusBar(ListType.WAITING_READY.equals(getListTypeByTab(this.getSupportActionBar().getSelectedTab().getPosition())));
    }

    @NonNull
    private ListType getListTypeByTab(int position) {
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

    private void onDayAndTypeChanged(ListType listType, String query) {

        if (listType == null) {
            listType = getListTypeByTab(this.getSupportActionBar().getSelectedTab().getPosition());
        }

        this.resetPrinterStatusBar(ListType.WAITING_READY.equals(listType));

        FragmentManager fm = getFragmentManager();
        Integer fragmentId = fragmentMap.get(listType.getValue());
        OrderListFragment found = null;
        if (fragmentId != null) {
           found =(OrderListFragment) fm.findFragmentById(fragmentId);
        }
        if (found == null) {
            found = new OrderListFragment();
            fragmentMap.put(listType.getValue(), found.getId());
        }
        if (TextUtils.isEmpty(query)) {
            found.setDayAndType(listType);
        } else {
            found.executeSearch(listType, query);
        }
        fm.beginTransaction().replace(R.id.order_list_main, found).commit();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        setIntent(intent);
        handleIntent(this.getSupportActionBar(), intent);
    }

    // Implemented from ActionBar.TabListener
    @Override
    public void onTabUnselected(ActionBar.Tab tab, FragmentTransaction fragmentTransaction) {
        // This is called when a previously selected tab is unselected.
    }

    // Implemented from ActionBar.TabListener
    @Override
    public void onTabReselected(ActionBar.Tab tab, FragmentTransaction fragmentTransaction) {
        // This is called when a previously selected tab is selected again.
    }

    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.menu_process:
                onDayAndTypeChanged(null, null);
                return true;
            case R.id.menu_accept:
                startActivity(new Intent(getApplicationContext(), RemindersActivity.class));
                return true;
            case R.id.menu_search:
                this.onSearchRequested();
                return true;
            case R.id.menu_mine:
                startActivity(new Intent(getApplicationContext(), MineActivity.class));
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return super.onCreateOptionsMenu(menu);
    }

    private void startPicker() {
        Intent pickerIntent = new Intent(getApplicationContext(), DatepickerActivity.class);
        pickerIntent.putExtra("daytime", this.day);
        startActivityForResult(pickerIntent, REQUEST_DAY);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_DAY) {
            if (resultCode == RESULT_OK) {
                if (data != null) {
                    Date day = (Date)data.getSerializableExtra("daytime");
                    if (day != null) {
                        onDayAndTypeChanged(null, null);
                    }
                }
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    public enum ListType {
        NONE(0, "ALL"), WAITING_READY(1, "打包中"), WAITING_SENT(2, "待送"), WAITING_ARRIVE(3, "在途"), ARRIVED(4, "送达");

        private int value;
        private String name;

        ListType(int value, String name) {
            this.value = value;
            this.name = name;
        }

        public int getValue() {
            return value;
        }

        public String getName() {
            return name;
        }

        static public ListType findByType(int type) {
            if (type == 0) return NONE;
            if (type == 1) return WAITING_READY;
            if (type == 2) return WAITING_SENT;
            if (type == 3) return WAITING_ARRIVE;
            if (type == 4) return ARRIVED;
            return null;
        }
    }
}
