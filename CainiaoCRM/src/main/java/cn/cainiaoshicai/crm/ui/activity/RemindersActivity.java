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

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.core.view.MenuItemCompat;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;

import cn.cainiaoshicai.crm.orders.view.MyAppWebViewClient;
import cn.cainiaoshicai.crm.orders.view.WebAppInterface;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.helper.MyMenuItemStuffListener;

public class RemindersActivity extends AbstractActionBarActivity {

    private final int contentViewRes;
    private WebView mWebView;
    private TextView notifCount;
    private int mNotifCount = 1;

    public RemindersActivity() {
        AppLogger.v("start reminds web view activity");
        this.contentViewRes = R.layout.quality_case_list;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(this.contentViewRes);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        mWebView = (WebView) findViewById(R.id.activity_main_webview);
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        MyAppWebViewClient client = new MyAppWebViewClient();
        client.setCallback(new MyAppWebViewClient.PageCallback() {
            @Override
            public void onPageFinished(WebView view, String url) {
                if (!url.equals("about:blank")) {
                    completeRefresh();
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                Toast.makeText(RemindersActivity.this, "发生错误" + error, Toast.LENGTH_LONG).show();
                AppLogger.e("web view error:" + error);
            }

            public void handleRedirectUrl(WebView view, String url) {
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return Utility.handleUrlJump(RemindersActivity.this, view, url);
            }

        });
        mWebView.setWebViewClient(client);
        mWebView.addJavascriptInterface(new WebAppInterface(this), "crm_andorid");

        String url = this.getIntent().getStringExtra("url");
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }

    private void completeRefresh() {

    }

    @Override
    public void onBackPressed() {
        if(mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Check if the key event was the Back button and if there's history
        if ((keyCode == KeyEvent.KEYCODE_BACK) && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        // If it wasn't the Back key or there's no web page history, bubble up to the default
        // system behavior (probably exit the activity)
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate menu from menu resource (res/menu/print)
        getMenuInflater().inflate(R.menu.main_menu, menu);
        MenuItem item = menu.findItem(R.id.menu_accept);
        MenuItemCompat.setActionView(item, R.layout.feed_update_count);

        View count = item.getActionView();
        notifCount = (TextView) count.findViewById(R.id.hotlist_hot);
        notifCount.setText(String.valueOf(mNotifCount));
        GlobalCtx.app().getTaskCount(this, new GlobalCtx.TaskCountUpdated() {
            @Override
            public void callback(int count) {
                mNotifCount = count;
                updateHotCount(mNotifCount);
            }
        });
        new MyMenuItemStuffListener(count, "查看任务") {
            @Override
            public void onClick(View v) {
                GlobalCtx.app().toTaskListActivity(RemindersActivity.this);
            }
        };

        return super.onCreateOptionsMenu(menu);
    }


    @NonNull
    private ListType getListTypeByTab(int position) {
        return RemindersActivity.ListType.findByType(position + 1);
    }

    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.menu_process:
                startActivity(new Intent(getApplicationContext(), MainActivity.class));
                return true;
            case R.id.menu_accept:
                return true;
            case R.id.menu_mine:
                startActivity(new Intent(getApplicationContext(), MineActivity.class));
                return true;
//            case R.id.menu_search:
//                this.onSearchRequested();
//                return true;
            case R.id.menu_store_maint:
                return GlobalCtx.app().toGoodsMgrRN(RemindersActivity.this);
            default:
                return super.onOptionsItemSelected(item);
        }
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
    }

    public enum ListType {
            COMPLAIN(1, "客户投诉"), CUSTOMER_NOTIFY(2, "用户催单"), REMINDER(3, "提醒");

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
            if (type == 1) return COMPLAIN;
            if (type == 2) return CUSTOMER_NOTIFY;
            if (type == 3) return REMINDER;
            throw new IllegalArgumentException("incorrect argument:" + type);
        }
    }
}
