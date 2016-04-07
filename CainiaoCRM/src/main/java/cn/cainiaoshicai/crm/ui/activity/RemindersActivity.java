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

package cn.cainiaoshicai.crm.ui.activity;

import android.app.FragmentManager;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.FragmentTransaction;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.support.error.TopExceptionHandler;
import cn.cainiaoshicai.crm.support.utils.BundleArgsConstants;

public class RemindersActivity extends ActionBarActivity implements ActionBar.TabListener {

    private HashMap<Integer, Integer> fragmentMap = new HashMap<>();

    public static Intent newIntent() {
        return new Intent(GlobalCtx.getInstance(), RemindersActivity.class);
    }

    public static Intent newIntent(AccountBean accountBean) {
        Intent intent = newIntent();
        intent.putExtra(BundleArgsConstants.ACCOUNT_EXTRA, accountBean);
        return intent;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.order_list_main);

        // Set the Action Bar to use tabs for navigation
        ActionBar ab = getSupportActionBar();
        ab.setNavigationMode(ActionBar.NAVIGATION_MODE_TABS);
        ab.setDisplayHomeAsUpEnabled(false);
        ab.setDisplayShowHomeEnabled(false);
        ab.setDisplayShowTitleEnabled(false);

        // Add three tabs to the Action Bar for display
        for(ListType type : Arrays.asList(ListType.NEW_ORDER, ListType.CUSTOMER_NOTIFY, ListType.REMINDER)) {
            ab.addTab(ab.newTab().setText(type.getName()).setTabListener(this));
        }

        GlobalCtx.clearNewOrderNotifies(this);

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

        onListChanged(getListTypeByTab(position));
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
        return RemindersActivity.ListType.findByType(position + 1);
    }

    private void onListChanged(ListType listType) {

        if (listType == null) {
            listType = getListTypeByTab(this.getSupportActionBar().getSelectedTab().getPosition());
        }

        FragmentManager fm = getFragmentManager();
        Integer fragmentId = fragmentMap.get(listType.getValue());
        NewOrderFragment found = null;
        if (fragmentId != null) {
           found =(NewOrderFragment) fm.findFragmentById(fragmentId);
        }
        if (found == null) {
            found = new NewOrderFragment();
            fragmentMap.put(listType.getValue(), found.getId());
        }
        found.setType(listType);
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
                startActivity(new Intent(getApplicationContext(), MainActivity.class));
                return true;
            case R.id.menu_accept:
                return true;
            case R.id.menu_manage:
                startActivity(new Intent(getApplicationContext(), StorePerformActivity.class));
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    }

    public enum ListType {
            NEW_ORDER(1, "新订单"), CUSTOMER_NOTIFY(2, "用户催单"), REMINDER(3, "提醒");

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
            if (type == 1) return NEW_ORDER;
            if (type == 2) return CUSTOMER_NOTIFY;
            if (type == 3) return REMINDER;
            throw new IllegalArgumentException("incorrect argument:" + type);
        }
    }
}
