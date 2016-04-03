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
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.FragmentTransaction;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;

import cn.cainiaoshicai.crm.support.debug.AppLogger;

import com.example.jpushdemo.ExampleUtil;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import cn.cainiaoshicai.crm.orders.OrderListFragment;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.support.error.TopExceptionHandler;
import cn.cainiaoshicai.crm.support.utils.BundleArgsConstants;
import cn.cainiaoshicai.crm.ui.activity.DatepickerActivity;
import cn.cainiaoshicai.crm.ui.activity.RemindersActivity;
import cn.cainiaoshicai.crm.ui.activity.StorePerformActivity;

public class MainActivity extends ActionBarActivity implements ActionBar.TabListener {

    private HashMap<Integer, Integer> fragmentMap = new HashMap<>();
    public static final int REQUEST_DAY = 1;
    public static final int REQUEST_INFO = 1;

    private Date day = new Date();

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
        Thread.setDefaultUncaughtExceptionHandler(new TopExceptionHandler(this));

        setContentView(R.layout.order_list_main);

        // Set the Action Bar to use tabs for navigation
        ActionBar ab = getSupportActionBar();
        ab.setNavigationMode(ActionBar.NAVIGATION_MODE_TABS);

        View barTitleView = findViewById(R.id.action_bar_title);
        if (barTitleView == null) {
            final int abTitleId = getResources().getIdentifier("action_bar_title", "id", "android");
            barTitleView = findViewById(abTitleId);
        }

        if (barTitleView != null) {
            barTitleView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    startPicker();
                }
            });
        }

        // Add three tabs to the Action Bar for display
        for(ListType type : Arrays.asList(ListType.WAITING_READY, ListType.WAITING_SENT, ListType.WAITING_ARRIVE, ListType.ARRIVED)) {
            ab.addTab(ab.newTab().setText(type.getName()).setTabListener(this));
        }

        Intent intent = this.getIntent();
        if (intent != null) {
            int list_type = intent.getIntExtra("list_type", 0);
            if (list_type > 0) {
                ActionBar.Tab tabAt = ab.getTabAt(list_type - 1);
                if (tabAt != null) {
                    ab.selectTab(tabAt);
                }
            }
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate menu from menu resource (res/menu/print)
        getMenuInflater().inflate(R.menu.main, menu);

        return super.onCreateOptionsMenu(menu);
    }

    // Implemented from ActionBar.TabListener
    @Override
    public void onTabSelected(ActionBar.Tab tab, FragmentTransaction fragmentTransaction) {
        Log.d(GlobalCtx.ORDERS_TAG, String.valueOf(tab.getText()));

        int position = tab.getPosition();
        ListType listType = getListTypeByTab(position);

        onDayAndTypeChanged(listType, this.day);
    }

    public void updateStatusCnt(HashMap<Integer, Integer> totalByStatus) {
        for (Map.Entry<Integer, Integer> en : totalByStatus.entrySet()) {
            Integer status = en.getKey();
            ActionBar.Tab tabAt = this.getSupportActionBar().getTabAt(status - 1);
            ListType type = ListType.findByType(status);
            if (tabAt != null && type != null) {
                tabAt.setText(type.getName() + "(" + en.getValue() + ")");
            }
        }
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

    private void onDayAndTypeChanged(ListType listType, Date orderDay) {

        if (listType == null) {
            listType = getListTypeByTab(this.getSupportActionBar().getSelectedTab().getPosition());
        }

        if (orderDay != null) {
            this.day = orderDay;
            this.getSupportActionBar().setTitle(DateTimeUtils.shortYmd(this.day));
        }

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
        found.setDayAndType(listType, DateTimeUtils.shortYmd(this.day));
        fm.beginTransaction().replace(R.id.order_list_main, found).commit();
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
            case R.id.menu_manage:
                startActivity(new Intent(getApplicationContext(), StorePerformActivity.class));
                return true;
//            case R.id.menu_settings:
//                showHelp();
//                startActivity(new Intent(getApplicationContext(), BTDeviceListActivity.class));
//                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
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
                        onDayAndTypeChanged(null, day);
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
        NONE(0, "ALL"), WAITING_READY(1, "待打包"), WAITING_SENT(2, "待配送"), WAITING_ARRIVE(3, "待送达"), ARRIVED(4, "已完成");

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
