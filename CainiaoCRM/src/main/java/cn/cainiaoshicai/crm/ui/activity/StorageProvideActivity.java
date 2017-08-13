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

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.ProductProvideList;
import cn.cainiaoshicai.crm.domain.ProvideReq;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.util.AlertUtil;
import cn.cainiaoshicai.crm.orders.util.Util;
import cn.cainiaoshicai.crm.orders.view.MyAppWebViewClient;
import cn.cainiaoshicai.crm.orders.view.WebAppInterface;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 */
public class StorageProvideActivity extends AbstractActionBarActivity {
    private WebView mWebView;
    private MenuItem refreshItem;
    private String url;

    private final StorageActionDao sad = new StorageActionDao(GlobalCtx.app().token());

    private Button btn_provide_print;
    private Button btn_provide_edit;
    private Button btn_provide_lock;
    private Button btn_provide_ship;
    private Button btn_provide_accept;
    private ProvideReq curr_req;
    private int supplierId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.storage_provide_list);

        btn_provide_accept = (Button) findViewById(R.id.btn_provide_accept);
        btn_provide_edit = (Button) findViewById(R.id.btn_provide_edit);
        btn_provide_lock = (Button) findViewById(R.id.btn_provide_lock);
        btn_provide_ship = (Button) findViewById(R.id.btn_provide_ship);
        btn_provide_print = (Button) findViewById(R.id.btn_provide_print);

        Intent intent = getIntent();
        long store_id = intent.getLongExtra("store_id", 0L);
        int req_id = intent.getIntExtra("req_id", 0);
        supplierId = intent.getIntExtra("supplier_id", 0);

        android.support.v7.app.ActionBar actionBar = this.getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
            String storeName = GlobalCtx.app().getStoreName(store_id);
            actionBar.setTitle(storeName + "订货单");
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
                StorageProvideActivity.this.completeRefresh();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {

            }

            @Override
            public void handleRedirectUrl(WebView view, String url) {

            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return Utility.handleUrlJump(StorageProvideActivity.this, view, url);
            }
        });

        mWebView.setWebViewClient(client);
        mWebView.addJavascriptInterface(new WebAppInterface(this), "crm_andorid");

        this.init_data(store_id, req_id);
    }

    private void updateBtnStatus() {
        if (curr_req != null) {
            int status = curr_req.getStatus();

            switch (status) {
                case ProvideReq.STATUS_CONFIRMED:
                    this.btn_provide_accept.setVisibility(View.VISIBLE);
                    this.btn_provide_accept.setText("已签收");

                    this.btn_provide_edit.setVisibility(View.GONE);
                    this.btn_provide_lock.setVisibility(View.GONE);
                    this.btn_provide_ship.setVisibility(View.GONE);
                    break;
                case ProvideReq.STATUS_CREATED:
                    this.btn_provide_edit.setVisibility(View.VISIBLE);
                    this.btn_provide_lock.setVisibility(View.VISIBLE);
                    this.btn_provide_lock.setText(this.getString(R.string.menu_provide_lock));

                    this.btn_provide_ship.setVisibility(View.GONE);
                    this.btn_provide_accept.setVisibility(View.GONE);
                    break;
                case ProvideReq.STATUS_LOCKED:
                    this.btn_provide_ship.setVisibility(View.VISIBLE);
                    this.btn_provide_lock.setVisibility(View.VISIBLE);
                    this.btn_provide_lock.setText(this.getString(R.string.menu_provide_locked));

                    this.btn_provide_edit.setVisibility(View.GONE);
                    this.btn_provide_accept.setVisibility(View.GONE);
                    break;
                case ProvideReq.STATUS_SHIPPED:
                    this.btn_provide_accept.setVisibility(View.VISIBLE);
                    this.btn_provide_ship.setVisibility(View.VISIBLE);
                    this.btn_provide_ship.setText("配送在途");

                    this.btn_provide_edit.setVisibility(View.GONE);
                    this.btn_provide_lock.setVisibility(View.GONE);
                    break;
                default:
            }
        }
    }

    private void init_data(final long store_id, final int req_id) {
        update_loading_url(store_id, req_id);

        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
        new MyAsyncTask<Void, Void, Void>() {

            @Override
            protected Void doInBackground(Void... params) {
                try {
                    ResultBean ro = sad.store_provide_req(store_id, req_id);
                    if (ro.isOk()) {
                        final ProvideReq req = (ProvideReq) ro.getObj();
                        if (req != null) {
                            curr_req = req;
                            StorageProvideActivity.this.curr_req = req;
                            StorageProvideActivity.this.runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    StorageProvideActivity act = StorageProvideActivity.this;
                                    act.updateBtnStatus();
                                    android.support.v7.app.ActionBar actionBar = act.getSupportActionBar();
                                    if (actionBar != null) {
                                        String storeName = GlobalCtx.app().getStoreName(req.getStore_id());
                                        actionBar.setTitle(storeName + "订货单");
                                    }
                                }
                            });
                        }
                    }
                } catch (ServiceException e) {
                    e.printStackTrace();
                }
                return null;
            }
        }.executeOnIO();


        this.btn_provide_ship.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                if (curr_req.getStatus() != ProvideReq.STATUS_LOCKED)  {
                    return;
                }

                AlertDialog dlg = new AlertDialog.Builder(StorageProvideActivity.this)
                        .setTitle("通知门店：订货单已发出")
                        .setMessage("请认真核对货品，保证件数；注意装车，保温；开车注意安全！")
                        .setPositiveButton(R.string.ok,
                                new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int whichButton) {
                                        async_set_status(ProvideReq.STATUS_SHIPPED, ProvideReq.STATUS_LOCKED);
                                    }
                                })
                        .setNegativeButton(R.string.cancel, null)
                        .create();
                dlg.show();
            }
        });

        this.btn_provide_accept.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                if (curr_req != null && curr_req.getStatus() != ProvideReq.STATUS_SHIPPED) {
                    return;
                }

                AlertDialog dlg = new AlertDialog.Builder(StorageProvideActivity.this)
                        .setTitle("确认收货")
                        .setMessage("请认真核对货品，检查品质；品质、数量不符合可以拒收！\n" +
                                "确认收货后，库存将自动增加；\n" +
                                "设定总部来货后上架的商品将自动上架销售。")
                        .setPositiveButton(R.string.ok,
                                new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int whichButton) {
                                        async_set_status(ProvideReq.STATUS_CONFIRMED, ProvideReq.STATUS_SHIPPED);
                                    }
                                })
                        .setNegativeButton(R.string.cancel, null)
                        .create();
                dlg.show();
            }
        });

        this.btn_provide_lock.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (curr_req != null && curr_req.getStatus() != ProvideReq.STATUS_CREATED) {
                    return;
                }

                if (curr_req != null && curr_req.getTotal_req() == 0){
                    Util.showToast(StorageProvideActivity.this, "调货单为空，还不能提交");
                    return;
                }
                AlertDialog dlg = new AlertDialog.Builder(StorageProvideActivity.this)
                        .setTitle("提交订货单")
                        .setMessage("确定提交吗？提交以后不能再修改，默认明早发货")
                        .setPositiveButton(R.string.ok,
                                new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int whichButton) {
                                        async_set_status(ProvideReq.STATUS_LOCKED, ProvideReq.STATUS_CREATED);
                                    }
                                })
                        .setNegativeButton(R.string.cancel, null)
                        .create();
                dlg.show();
            }
        });

        this.btn_provide_edit.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(StorageProvideActivity.this, StoreStorageActivity.class);
                StorageProvideActivity.this.startActivity(intent);
            }
        });

        this.btn_provide_print.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                final ProvideReq curr_req = StorageProvideActivity.this.curr_req;
                if (curr_req == null) {

                    AlertUtil.showAlert(StorageProvideActivity.this, "错误", "不能取得当前打印数据，请关闭重试");
                    return;
                }

                final BluetoothPrinters.DeviceStatus ds = BluetoothPrinters.INS.getCurrentPrinter();
                if(ds == null || ds.getSocket() == null){
                    Intent BTIntent = new Intent(getApplicationContext(), SettingsPrintActivity.class);
                    StorageProvideActivity.this.startActivityForResult(BTIntent, SettingsPrintActivity.REQUEST_CONNECT_BT);
                }
                else{
                    new MyAsyncTask<Void, Void, Void>() {
                        @Override
                        protected Void doInBackground(Void... params) {
                            ResultBean<ProductProvideList> ro = sad.provide_list_to_print(curr_req.getId(), supplierId);
                            if (ro.isOk()) {
                                final ProductProvideList printList = ro.getObj();
                                if (printList != null) {
                                    print(ds, printList);
                                    return null;
                                }
                            }

                            AlertUtil.showAlert(StorageProvideActivity.this, "错误", "获取数据失败：" + ro.getDesc());
                            return null;
                        }

                    }.executeOnNormal();
                }
            }
        });
    }

    private void print(final BluetoothPrinters.DeviceStatus ds, final ProductProvideList printList) {
        new MyAsyncTask<Void, Order, Boolean>() {
            private String error;

            @Override
            protected Boolean doInBackground(Void... params) {
                try {
                    OrderPrinter.printProvideList(ds.getSocket(), printList);
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

    private void update_loading_url(long store_id, int req_id) {
        String currentAccountId = GlobalCtx.app().getCurrentAccountId();
        String gotoUrl = String.format("%s/provide_list/%s.html", URLHelper.getStoresPrefix(), store_id)
                + "?access_token=" + GlobalCtx.app().token() + "&client_id=" + currentAccountId;
        if (req_id > 0) {
            gotoUrl += "&req_id=" + req_id;
        }
        url = gotoUrl;
    }

    private void async_set_status(final int toStatus, final int fromStatus) {
        if (curr_req != null && curr_req.getStatus() == fromStatus) {
            new MyAsyncTask<Void, Void, Void>() {
                @Override
                protected Void doInBackground(Void... params) {
                    final ResultBean rb = sad.store_status_provide_req(curr_req.getId(), fromStatus,
                            toStatus);
                    if (rb.isOk()) {
                        curr_req.setStatus(toStatus);
                        StorageProvideActivity.this.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                updateBtnStatus();
                                refresh();
                            }
                        });
                    }
                    return null;
                }
            }.executeOnIO();
        } else {
            Utility.toast("操作失败", StorageProvideActivity.this, null, Toast.LENGTH_LONG);
        }
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
//        this.mWebView.loadUrl("about:blank");
        LayoutInflater inflater = (LayoutInflater) getSystemService(
                Context.LAYOUT_INFLATER_SERVICE);
        ImageView iv = (ImageView) inflater.inflate(R.layout.refresh_action_view, null);

        Animation rotation = AnimationUtils.loadAnimation(this, R.anim.refresh);
        iv.startAnimation(rotation);

        refreshItem.setActionView(iv);

        if (curr_req != null) {
            update_loading_url(curr_req.getStore_id(), curr_req.getId());
        }
        this.mWebView.loadUrl("about:blank");
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
            case R.id.menu_trash:
                if (curr_req == null) {
                    Util.showToast(this, "数据状态不正确");
                } else if (curr_req.getStatus() != ProvideReq.STATUS_CREATED
                            && curr_req.getStatus() != ProvideReq.STATUS_LOCKED) {
                    Util.showToast(StorageProvideActivity.this, "订单已发货/收货，不能作废");
                } else {
                    AlertDialog dlg = new AlertDialog.Builder(StorageProvideActivity.this)
                            .setTitle("作废订货单")
                            .setMessage("确定作废订货单吗，作废以后不能恢复！")
                            .setPositiveButton(R.string.ok,
                                    new DialogInterface.OnClickListener() {
                                        public void onClick(DialogInterface dialog, int whichButton) {
                                            async_set_status(ProvideReq.STATUS_TRASHED, curr_req.getStatus());
                                        }
                                    })
                            .setNegativeButton(R.string.cancel, null)
                            .create();
                    dlg.show();
                }
                break;
            default:
        }
        return super.onOptionsItemSelected(item);
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
        getMenuInflater().inflate(R.menu.storage_provide_menu, menu);
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
