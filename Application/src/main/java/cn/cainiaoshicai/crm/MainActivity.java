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

import android.app.Fragment;
import android.app.FragmentManager;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.FragmentTransaction;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;

import com.example.BlueToothPrinterApp.BlueToothPrinterApp;

import cn.cainiaoshicai.crm.orders.OrderListFragment;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.support.utils.BundleArgsConstants;

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

    private int fragmentIdToPrepare=0, getFragmentIdToShip=1, getFragmentIdToArrive=2;


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
        setContentView(R.layout.order_list_main);

        // Set the Action Bar to use tabs for navigation
        ActionBar ab = getSupportActionBar();
        ab.setNavigationMode(ActionBar.NAVIGATION_MODE_TABS);

        // Add three tabs to the Action Bar for display
        ab.addTab(ab.newTab().setText("待打包").setTabListener(this));
        ab.addTab(ab.newTab().setText("待配送").setTabListener(this));
        ab.addTab(ab.newTab().setText("待送达").setTabListener(this));
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

        int fragmentId = 0, listType = Constants.ORDER_LIST_PREPARE;
        if (tab.getPosition() == 0) {
            fragmentId = this.fragmentIdToPrepare;

        } else if (tab.getPosition() == 1) {
            fragmentId = this.getFragmentIdToShip;
            listType = Constants.ORDER_LIST_SHIP;
        } else if (tab.getPosition() == 2) {
            fragmentId = this.getFragmentIdToArrive;
            listType = Constants.ORDER_LIST_ARRIVE;
        }

        FragmentManager fm = getFragmentManager();
        Fragment found = fm.findFragmentById(fragmentId);
        if (found == null) {
            found = new OrderListFragment();
            ((OrderListFragment)found).setListType(listType);
        }
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
            case R.id.menu_print:
                startPrint();
                return true;
            case R.id.menu_settings:
//                showHelp();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private void startPrint() {
        Intent printAct = new Intent(getApplicationContext(), BlueToothPrinterApp.class);
//        printAct.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(printAct);
        finish();
    }
}
