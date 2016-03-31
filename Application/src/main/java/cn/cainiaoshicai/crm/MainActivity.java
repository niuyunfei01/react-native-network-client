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
import cn.cainiaoshicai.crm.ui.activity.BTDeviceListActivity;
import com.example.BlueToothPrinterApp.BlueToothPrinterApp;
import com.example.jpushdemo.ExampleUtil;

import java.util.Date;
import java.util.HashMap;

import cn.cainiaoshicai.crm.orders.OrderListFragment;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.support.error.TopExceptionHandler;
import cn.cainiaoshicai.crm.support.utils.BundleArgsConstants;
import cn.cainiaoshicai.crm.ui.activity.DatepickerActivity;

/**
 * This sample shows you how to use ActionBarCompat with a customized theme. It utilizes a split
 * action bar when running on a device with a narrow display, and show three tabs.
 *
 * This Activity extends from {@link ActionBarActivity}, which provides all of the function
 * necessary to display a compatible Action Bar on devices running Android v2.1+.
 *
 * The interesting bits of this sample start in the theme files
 * ('res/values/styles.xml' and 'res/values-v14</styles.xml').
 *
 * Many of the drawables used in this sample were generated with the
 * 'Android Action Bar Style Generator': http://jgilfelt.github.io/android-actionbarstylegenerator
 */
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
        ab.addTab(ab.newTab().setText("待打包").setTabListener(this));
        ab.addTab(ab.newTab().setText("待配送").setTabListener(this));
        ab.addTab(ab.newTab().setText("待送达").setTabListener(this));
        ab.addTab(ab.newTab().setText("已送达").setTabListener(this));

        registerMessageReceiver();
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
            case R.id.menu_refresh:
                onDayAndTypeChanged(null, null);
                return true;
            case R.id.menu_settings:
//                showHelp();
                startActivity(new Intent(getApplicationContext(), BTDeviceListActivity.class));
                return true;
            case R.id.menu_print:
                startActivity(new Intent(getApplicationContext(), BlueToothPrinterApp.class));
                return true;
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
        unregisterReceiver(mMessageReceiver);
        super.onDestroy();
    }

    //for receive customer msg from jpush server
    private MessageReceiver mMessageReceiver;
    public static final String MESSAGE_RECEIVED_ACTION = "com.example.jpushdemo.MESSAGE_RECEIVED_ACTION";
    public static final String KEY_TITLE = "title";
    public static final String KEY_MESSAGE = "message";
    public static final String KEY_EXTRAS = "extras";

    public void registerMessageReceiver() {
        mMessageReceiver = new MessageReceiver();
        IntentFilter filter = new IntentFilter();
        filter.setPriority(IntentFilter.SYSTEM_HIGH_PRIORITY);
        filter.addAction(MESSAGE_RECEIVED_ACTION);
        registerReceiver(mMessageReceiver, filter);
    }

    public class MessageReceiver extends BroadcastReceiver {

        @Override
        public void onReceive(Context context, Intent intent) {
            if (MESSAGE_RECEIVED_ACTION.equals(intent.getAction())) {
                String messge = intent.getStringExtra(KEY_MESSAGE);
                String extras = intent.getStringExtra(KEY_EXTRAS);
                StringBuilder showMsg = new StringBuilder();
                showMsg.append(KEY_MESSAGE + " : " + messge + "\n");
                if (!ExampleUtil.isEmpty(extras)) {
                    showMsg.append(KEY_EXTRAS + " : " + extras + "\n");
                }
                setCostomMsg(showMsg.toString());
            }
        }
    }

    private void setCostomMsg(String msg){
        AppLogger.e("received push message:" + msg);
    }

    public enum ListType {
        NONE(0), WAITING_READY(1), WAITING_SENT(2), WAITING_ARRIVE(3), ARRIVED(4);

        private int value;

        ListType(int value) {
            this.value = value;
        }

        public int getValue() {
            return value;
        }
    }
}
