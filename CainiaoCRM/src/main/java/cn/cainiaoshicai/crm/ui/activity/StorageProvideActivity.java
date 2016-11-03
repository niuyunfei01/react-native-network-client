package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageView;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.ProvideReq;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.domain.ResultObject;
import cn.cainiaoshicai.crm.orders.util.Util;
import cn.cainiaoshicai.crm.orders.view.MyAppWebViewClient;
import cn.cainiaoshicai.crm.orders.view.WebAppInterface;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 */
public class StorageProvideActivity extends AbstractActionBarActivity {
    private WebView mWebView;
    private MenuItem refreshItem;
    private String url;

    private final StorageActionDao sad = new StorageActionDao(GlobalCtx.getInstance().getSpecialToken());

    private Button btn_provide_print;
    private Button btn_provide_edit;
    private Button btn_provide_lock;
    private Button btn_provide_ship;
    private Button btn_provide_accept;
    private ProvideReq curr_req;

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
        int store_id = intent.getIntExtra("store_id", 0);

        android.support.v7.app.ActionBar actionBar = this.getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
            String storeName = GlobalCtx.getApplication().getStoreName(store_id);
            actionBar.setTitle(storeName + "订货单");
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        mWebView = (WebView) findViewById(R.id.activity_main_webview);
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        MyAppWebViewClient client = new MyAppWebViewClient();
        client.setFinishCallback(new MyAppWebViewClient.PageCallback() {
            @Override
            public void execute(WebView view, String url) {
                StorageProvideActivity.this.completeRefresh();
            }
        });

        mWebView.setWebViewClient(client);
        mWebView.addJavascriptInterface(new WebAppInterface(this), "crm_andorid");

        this.init_data(store_id);
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
                    this.btn_provide_ship.setText("已出发");

                    this.btn_provide_edit.setVisibility(View.GONE);
                    this.btn_provide_lock.setVisibility(View.GONE);
                    break;
                default:
            }
        }
    }

    private void init_data(int store_id) {
        url = String.format("%s/provide_list/%s.html", URLHelper.HTTP_MOBILE_STORES, store_id) + "?access_token=" + GlobalCtx.getInstance().getSpecialToken()+"&client_id="+GlobalCtx.getInstance().getCurrentAccountId();
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
        new MyAsyncTask<Integer, Void, Void>() {

            @Override
            protected Void doInBackground(Integer... params) {
                try {
                    ResultObject ro = sad.store_provide_req(params[0]);
                    if (ro.isOk()) {
                        final ProvideReq req = (ProvideReq) ro.getObj();
                        if (req != null) {
                            curr_req = req;
                            StorageProvideActivity.this.curr_req = req;
                            StorageProvideActivity.this.runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    StorageProvideActivity.this.updateBtnStatus();
                                }
                            });
                        }
                    }
                } catch (ServiceException e) {
                    e.printStackTrace();
                }
                return null;
            }
        }.executeOnIO(store_id);


        this.btn_provide_ship.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
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
                AlertDialog dlg = new AlertDialog.Builder(StorageProvideActivity.this)
                        .setTitle("确认收货")
                        .setMessage("请认真核对货品，检查品质；可以收货后，分类入库，并将缺货商品设为销售状态！")
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
                Util.showToast(StorageProvideActivity.this, "正在开发中...");
            }
        });

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
            Utility.toast("操作失败", StorageProvideActivity.this, null);
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
        this.mWebView.loadUrl("about:blank");
        LayoutInflater inflater = (LayoutInflater) getSystemService(
                Context.LAYOUT_INFLATER_SERVICE);
        ImageView iv = (ImageView) inflater.inflate(R.layout.refresh_action_view, null);

        Animation rotation = AnimationUtils.loadAnimation(this, R.anim.refresh);
        iv.startAnimation(rotation);

        refreshItem.setActionView(iv);
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
