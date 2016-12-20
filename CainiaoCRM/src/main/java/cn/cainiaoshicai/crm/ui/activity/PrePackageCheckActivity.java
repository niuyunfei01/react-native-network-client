package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import java.io.IOException;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.ProductEstimate;
import cn.cainiaoshicai.crm.domain.ProvideReq;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.domain.ResultObject;
import cn.cainiaoshicai.crm.orders.util.Util;
import cn.cainiaoshicai.crm.orders.view.MyAppWebViewClient;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.orders.view.WebAppInterface;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 */
public class PrePackageCheckActivity extends AbstractActionBarActivity {
    private WebView mWebView;
    private MenuItem refreshItem;
    private String url;

    private final StorageActionDao sad = new StorageActionDao(GlobalCtx.getInstance().getSpecialToken());

    private Button btn_provide_print;
    private ProductEstimate productEstimate;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.pre_package_estimate);

        Intent intent = getIntent();
        int store_id = intent.getIntExtra("store_id", SettingUtility.getCurrentStorageStore());
        String day = intent.getStringExtra("day");
        if (TextUtils.isEmpty(day)) {
            day = "tomorrow";
        }

        android.support.v7.app.ActionBar actionBar = this.getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
            String storeName = GlobalCtx.getApplication().getStoreName(store_id);
            actionBar.setTitle(storeName + "备货估算表");
        }

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
                PrePackageCheckActivity.this.completeRefresh();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {

            }

            @Override
            public void handleRedirectUrl(WebView view, String url) {

            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return Utility.handleUrlJump(PrePackageCheckActivity.this, view, url);
            }
        });

        mWebView.setWebViewClient(client);
        mWebView.addJavascriptInterface(new WebAppInterface(this), "crm_andorid");

        this.init_data(store_id, day);
    }

    private void init_data(final int store_id, final String day) {
        update_loading_url(store_id, day);

        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
        new MyAsyncTask<Integer, Void, Void>() {

            @Override
            protected Void doInBackground(Integer... params) {
                try {
                    ResultObject ro = sad.store_provide_estimate(store_id, day);
                    if (ro.isOk()) {
                        final ProductEstimate req = (ProductEstimate) ro.getObj();
                        if (req != null) {
                            productEstimate = req;
                            PrePackageCheckActivity.this.productEstimate = req;
                            PrePackageCheckActivity.this.runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    PrePackageCheckActivity act = PrePackageCheckActivity.this;
                                    android.support.v7.app.ActionBar actionBar = act.getSupportActionBar();
                                    if (actionBar != null) {
                                        String storeName = GlobalCtx.getApplication().getStoreName(req.getStore_id());
                                        actionBar.setTitle(storeName + "备货估算表");
                                    }
                                }
                            });
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
                return null;
            }
        }.executeOnIO();
    }

    private void update_loading_url(int store_id, String day) {
        String currentAccountId = GlobalCtx.getInstance().getCurrentAccountId();
        this.url = String.format("%s/provide_prepare/%s.html", URLHelper.HTTP_MOBILE_STORES, store_id, day)
                + "?access_token=" + GlobalCtx.getInstance().getSpecialToken() + "&client_id=" + currentAccountId;
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (isFinishing()) {
            this.mWebView.stopLoading();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        this.mWebView.clearCache(true);
    }

    public void refresh() {
        this.mWebView.loadUrl("about:blank");
        LayoutInflater inflater = (LayoutInflater) getSystemService(
                Context.LAYOUT_INFLATER_SERVICE);
        ImageView iv = (ImageView) inflater.inflate(R.layout.refresh_action_view, null);

        Animation rotation = AnimationUtils.loadAnimation(this, R.anim.refresh);
        iv.startAnimation(rotation);

        refreshItem.setActionView(iv);

        if (productEstimate != null) {
            update_loading_url(productEstimate.getStore_id(), productEstimate.getDay());
        }
        this.mWebView.loadUrl(this.url);
    }

    private void completeRefresh() {
        if (refreshItem.getActionView() != null) {
            refreshItem.getActionView().clearAnimation();
            refreshItem.setActionView(null);
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.menu_refresh:
                this.refresh();
                break;
            case R.id.menu_print:
                if (productEstimate == null) {
                    Util.showToast(this, "取不到打印数据");
                } else {

                    final BluetoothPrinters.DeviceStatus ds = BluetoothPrinters.INS.getCurrentPrinter();
                    if(ds == null || ds.getSocket() == null){
                        Intent BTIntent = new Intent(getApplicationContext(), SettingsPrintActivity.class);
                        this.startActivityForResult(BTIntent, SettingsPrintActivity.REQUEST_CONNECT_BT);
                    }
                    else{
                        print(ds);
                    }
//                } else {
//                    AlertDialog dlg = new AlertDialog.Builder(PrePackageCheckActivity.this)
//                            .setTitle("作废订货单")
//                            .setMessage("确定作废订货单吗，作废以后不能恢复！")
//                            .setPositiveButton(R.string.ok,
//                                    new DialogInterface.OnClickListener() {
//                                        public void onClick(DialogInterface dialog, int whichButton) {
//                                            async_set_status(ProvideReq.STATUS_TRASHED, productEstimate.getStatus());
//                                        }
//                                    })
//                            .setNegativeButton(R.string.cancel, null)
//                            .create();
//                    dlg.show();
                }
                break;
            default:
        }
        return super.onOptionsItemSelected(item);
    }

    private void print(final BluetoothPrinters.DeviceStatus ds) {
        new MyAsyncTask<Void, Order, Boolean>() {
            private String error;

            @Override
            protected Boolean doInBackground(Void... params) {
                try {
                    OrderPrinter.printEstimate(ds.getSocket(), productEstimate);
                    return true;
                } catch (Exception e) {
                    AppLogger.e("error IOException:" + e.getMessage(), e);
                    this.error = "打印错误:" + e.getMessage();
                    return false;
                }
            }

            @Override
            protected void onPostExecute(final Boolean aBoolean) {
                super.onPostExecute(aBoolean);
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (!aBoolean) {
                            String msg = "操作：" + (TextUtils.isEmpty(error) ? "成功" : "失败");
                            Toast.makeText(getApplication(), msg, Toast.LENGTH_SHORT).show();
                        }
                    }
                });
            }
        }.executeOnNormal();
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
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.store_sale_estimate_menu, menu);
        refreshItem = menu.findItem(R.id.menu_refresh);
        return true;
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

}
