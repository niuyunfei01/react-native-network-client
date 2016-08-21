package cn.cainiaoshicai.crm.orders.view;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DialogFragment;
import android.app.TimePickerDialog;
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
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.Switch;
import android.widget.TimePicker;
import android.widget.Toast;

import java.io.IOException;
import java.util.Calendar;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicReference;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.CommonConfigDao;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.ui.activity.AbstractActionBarActivity;
import cn.cainiaoshicai.crm.ui.activity.DelayFaqFragment;
import cn.cainiaoshicai.crm.ui.activity.FeedbackViewActivity;
import cn.cainiaoshicai.crm.ui.activity.RemindersActivity;
import cn.cainiaoshicai.crm.ui.activity.SettingsPrintActivity;
import cn.cainiaoshicai.crm.ui.activity.FeedBackEditActivity;
import cn.cainiaoshicai.crm.ui.basefragment.UserFeedbackDialogFragment;

/**
 */
public class OrderSingleActivity extends AbstractActionBarActivity implements DelayFaqFragment.NoticeDialogListener, UserFeedbackDialogFragment.NoticeDialogListener {
    private static final String HTTP_MOBILE_STORES = "http://www.cainiaoshicai.cn/stores";
    private static final int REQUEST_CODE_ADDFB = 1001;
    private WebView mWebView;
    private DelayFaqFragment delayFaqFragment;
    private MenuItem refreshItem;

    private int orderId;
    private String platformOid;
    private String shipWorkerName;
    private int platform;
    private String url;
    private Button printButton = null;
    private Button btnCallDada = null;
    private Switch sourceReadyButton;
    private int listType;
    private int fromStatus;
    private int ship_worker_id;
    private int pack_worker_id;
    private OrderSingleHelper helper;
    private AtomicReference<Order> orderRef = new AtomicReference<>();


    public int getPack_worker_id() {
        return pack_worker_id;
    }

    public void setPack_worker_id(int pack_worker_id) {
        this.pack_worker_id = pack_worker_id;
    }

    public int getShip_worker_id() {
        return ship_worker_id;
    }

    public void setShip_worker_id(int ship_worker_id) {
        this.ship_worker_id = ship_worker_id;
    }

    public static final int ACTION_NORMAL = 0;
    public static final int ACTION_EDIT_SHIP_WORKER = 1;
    public static final int ACTION_EDIT_PACK_WORKER = 2;
    private String platformWithId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.order_single);

        android.support.v7.app.ActionBar actionBar = this.getSupportActionBar();
        if (actionBar != null) {
            actionBar.setDisplayHomeAsUpEnabled(true);
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
                OrderSingleActivity.this.completeRefresh();
            }
        });

        mWebView.setWebViewClient(client);

        mWebView.addJavascriptInterface(new WebAppInterface(this), "crm_andorid");

        Intent intent = getIntent();

        final Order order = (Order) intent.getSerializableExtra("order");
        final boolean is_from_new_order = "new_order".equals(intent.getStringExtra("from"));
        listType = intent.getIntExtra("list_type", 0);

        if (order == null) {
            final int order_id = intent.getIntExtra("order_id", 0);
            new MyAsyncTask<Integer, Void, Order>() {
                @Override
                protected Order doInBackground(Integer... params) {
                    OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
                    final Order o = dao.getOrder(order_id);
                    final OrderSingleActivity act = OrderSingleActivity.this;
                    if (o != null) {
                        act.orderRef.set(o);
                        update_dada_btn(o.getDada_status(), o);
                        act.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                act.init_data(o, is_from_new_order);
                            }
                        });
                    } else {
                        Toast.makeText(act, "获取订单失败", Toast.LENGTH_LONG).show();
                    }
                    return null;
                }
            }.executeOnNormal(order_id);
        } else {
            this.orderRef.set(order);
            init_data(order, is_from_new_order);
        }
    }

    private void init_data(final Order order, boolean is_from_new_order) {
        ship_worker_id = order.getShip_worker_id();
        pack_worker_id = order.getPack_operator();
        platform = order.getPlatform();
        this.orderId = order.getId();
        platformOid = order.getPlatform_oid();
        shipWorkerName = order.getShip_worker_name();
        platformWithId = order.platformWithId();

        helper = new OrderSingleHelper(platform, platformOid, OrderSingleActivity.this, orderId);

        int sourceReady = order.getSource_ready();
        fromStatus = order.getOrderStatus();
        final boolean isDelay = order.getOrderStatus() == Cts.WM_ORDER_STATUS_ARRIVED && !Cts.DeliverReview.find(order.getReview_deliver()).isGood();
        printButton = (Button) findViewById(R.id.button1);
        int printTimes = order.getPrint_times();
        this.showPrintTimes(printTimes);

        printButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                connect(platform, platformOid);
            }
        });
//        sourceReadyButton = (Switch) findViewById(R.id.button_source_ready);
        btnCallDada = (Button) findViewById(R.id.button_call_dada);
        final boolean isWaitingReady = fromStatus == Cts.WM_ORDER_STATUS_TO_READY;

//        this.showSourceReady(sourceReady > 0, isWaitingReady);
//        sourceReadyButton.setVisibility(isWaitingReady ? View.VISIBLE : View.GONE);

        Button delayFaqButton = (Button) findViewById(R.id.button3);
        if(!isDelay){
            delayFaqButton.setVisibility(View.GONE);
        }else{
            delayFaqButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    delayFaqFragment = DelayFaqFragment.newInstance("选择延误原因");
                    delayFaqFragment.setPlatform(platform);
                    delayFaqFragment.setPlatformOid(platformOid);
                    delayFaqFragment.show(getFragmentManager(), "dialog");
                }
            });
        }

        update_dada_btn(order.getDada_status(), order);

        final Button actionButton = (Button) findViewById(R.id.button2);
        if(is_from_new_order) {
            actionButton.setText("确认接单");
            actionButton.setOnClickListener(new AccpetOrderButtonClicked(platform, platformOid, fromStatus, listType));
        } else {
            if (fromStatus == Cts.WM_ORDER_STATUS_ARRIVED) {
                actionButton.setVisibility(View.GONE);
            } else {
                actionButton.setText(getActionText(fromStatus));
                actionButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(final View v) {
                        if (fromStatus == Cts.WM_ORDER_STATUS_TO_ARRIVE) {
                            AlertDialog.Builder adb = new AlertDialog.Builder(v.getContext());
                            adb.setTitle("送达提醒")
                                .setMessage(String.format("您的食材已由快递小哥【%s】送到，如有缺漏、品质或其他问题请立即联系店长【%s(%s)】。春风十里，不如赐个好评就送个金菠萝给你 :)", shipWorkerName, "青青", "18910275329"))
                                .setPositiveButton("发送", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        new OrderActionOp(platform, platformOid, (Activity)v.getContext(), listType).executeOnNormal(fromStatus);
                                    }
                                });
                            adb.setNegativeButton(getString(R.string.cancel), null);
                            adb.show();
                        } else {
                            helper.chooseWorker((Activity) v.getContext(), listType, fromStatus, ACTION_NORMAL);
                        }
                    }
                });
            }
        }

        url = String.format("%s/single_order/android/%s/%s.html", HTTP_MOBILE_STORES, platform, platformOid) + "?access_token=" + GlobalCtx.getInstance().getSpecialToken()+"&client_id="+GlobalCtx.getInstance().getCurrentAccountId();
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }

    private void update_dada_btn(int dada_status, final Order order) {
        if (btnCallDada != null) {
            if (order.getOrderStatus() == Cts.WM_ORDER_STATUS_ARRIVED
                    && order.getShip_worker_id() == Cts.ID_DADA_MANUAL_WORKER) {
                btnCallDada.setText("修改到达时间");
                btnCallDada.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        if (order.getOrderStatus() != Cts.WM_ORDER_STATUS_ARRIVED
                                || order.getShip_worker_id() != Cts.ID_DADA_MANUAL_WORKER
                                || (System.currentTimeMillis() - order.getTime_arrived().getTime() > Cts.DADA_MAX_EDIT_ARRIVED_LIMIT)) {
                            helper.showToast("只有5天内的手动达达订单支持修改。");
                            return;
                        }

                        final Calendar cal = Calendar.getInstance();
                        cal.setTime(order.getTime_arrived());

                        TimePickerDialog tpd = new TimePickerDialog(OrderSingleActivity.this, new TimePickerDialog.OnTimeSetListener() {
                            @Override
                            public void onTimeSet(TimePicker view, final int hourOfDay, final int minute) {
                                new MyAsyncTask<Void, Void, Void>() {
                                    @Override
                                    protected Void doInBackground(Void... params) {
                                        cal.set(Calendar.HOUR_OF_DAY, hourOfDay);
                                        cal.set(Calendar.MINUTE, minute);
                                            ResultBean rb;
                                        try {
                                            String token = GlobalCtx.getInstance().getSpecialToken();
                                            rb = new OrderActionDao(token).order_chg_arrived_time(order.getId(), order.getTime_arrived(), cal.getTime());
                                            if (rb.isOk()) {
                                                helper.updateUI(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        refresh();
                                                    }
                                                });
                                            }
                                        } catch (ServiceException e) {
                                            rb = ResultBean.serviceException(e.getMessage());
                                        }
                                        helper.showToast(rb.isOk() ? "修改成功" : "修改失败："+ rb.getDesc());
                                        return null;
                                    }
                                }.executeOnNormal();

                            }
                        }, cal.get(Calendar.HOUR_OF_DAY), cal.get(Calendar.MINUTE), true);

                        tpd.show();
                    }
                });
            } else {
                btnCallDada.setText(OrderSingleHelper.CallDadaClicked.getDadaBtnLabel(dada_status));
                btnCallDada.setOnClickListener(new OrderSingleHelper.CallDadaClicked(dada_status, orderId, helper, btnCallDada));
            }
        }
    }

    private void showSourceReady(final boolean isSourceReady, boolean isWaitingReady) {
        this.sourceReadyButton.setTextOn("已备货");
        this.sourceReadyButton.setTextOff("备货中");
        this.sourceReadyButton.setChecked(isSourceReady);
        if (!isWaitingReady) {
            this.sourceReadyButton.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                    SettingUtility.setAutoPrintHLG(isChecked);
                }
            });
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

    public void showPrintTimes(int print_times) {
        String printTimesLabel = print_times > 0 ? String.format("(%d)", print_times) : "";
        try {
            printButton.setText(getString(R.string.menu_print) + printTimesLabel);
        }catch (Exception e) {
            e.printStackTrace();
        }
    }

    protected void connect(final int platform, final String platformOid) {
        final BluetoothPrinters.DeviceStatus ds = BluetoothPrinters.INS.getCurrentPrinter();
        if(ds == null || ds.getSocket() == null){
            Intent BTIntent = new Intent(getApplicationContext(), SettingsPrintActivity.class);
            this.startActivityForResult(BTIntent, SettingsPrintActivity.REQUEST_CONNECT_BT);
        }
        else{
            new MyAsyncTask<Void,Order, Boolean>(){
                private String error;
                private Order order;

                @Override
                protected Boolean doInBackground(Void... params) {
                    String access_token = GlobalCtx.getInstance().getAccountBean().getAccess_token();
                    Order order = new OrderActionDao(access_token).getOrder(platform, platformOid);
                    if (order == null) {
                        this.error = getApplication().getString(R.string.error_get_order);
                        return false;
                    } else {
                        this.order = order;
                        OrderSingleActivity.this.orderRef.set(order);
                        OrderSingleActivity.this.update_dada_btn(order.getDada_status(), order);
                        try {
                            OrderPrinter.printOrder(ds.getSocket(), order);
                            order.incrPrintTimes();
                            try {
                                new OrderActionDao(access_token).logOrderPrinted(order.getId());
                            } catch (ServiceException e) {
                                AppLogger.e("error Service Exception:" + e.getMessage(), e);
                            }
                        } catch (Exception e) {
                            AppLogger.e("error IOException:" + e.getMessage(), e);
                            this.error = "打印错误:" + e.getMessage();

                            if (e instanceof IOException) {
                                ds.closeSocket();
                            }

                            return false;
                        }
                    }

                    return true;
                }

                @Override
                protected void onPostExecute(Boolean aBoolean) {
                    super.onPostExecute(aBoolean);
                    if (!aBoolean) {
                        Toast.makeText(getApplication(), "操作失败：" + this.error, Toast.LENGTH_SHORT).show();
                    }

                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            if (printButton != null) {
                                showPrintTimes(order.getPrint_times());
                            } else {
                                AppLogger.w("printButton is null");
                            }
                        }
                    });
                }
            }.executeOnNormal();
        }
    }

    private String getActionText(int status) {
        switch(status) {
            case Cts.WM_ORDER_STATUS_TO_SHIP:
                return getString(R.string.action_start_ship);
            case Cts.WM_ORDER_STATUS_TO_ARRIVE:
                return getString(R.string.action_set_arrived);
            case Cts.WM_ORDER_STATUS_TO_READY:
                return getString(R.string.action_package_done);
        }
        return "";
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.single_order_menu, menu);
        refreshItem = menu.findItem(R.id.menu_refresh);
        refresh();
        return true;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_CODE_ADDFB) {
            if (resultCode == RESULT_OK) {
                if (data != null) {
                    boolean added = data.getBooleanExtra("done", false);
                    if (added) {
                        this.refresh();
                    }
                }
            }
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {

        switch (item.getItemId()) {
            case R.id.menu_user_feedback:

                final Intent intent;

                if (this.orderRef.get() != null && this.orderRef.get().getFeedback() != null) {
                    intent = new Intent(this, FeedbackViewActivity.class);
                    intent.putExtra("fb", this.orderRef.get().getFeedback());
                } else {
                    intent = new Intent(this, FeedBackEditActivity.class);
                }

                intent.putExtra("order_id", this.orderId);
                intent.putExtra("wm_id", this.orderId);
                intent.putExtra("platformWithId", this.platformWithId);

                startActivityForResult(intent, REQUEST_CODE_ADDFB);

                break;
            case R.id.menu_set_invalid:
                AlertDialog.Builder adb = new AlertDialog.Builder(this);
                adb.setTitle("置为无效")
                        .setMessage("确定设置此订单为无效订单吗？此操作不可撤销！")
                        .setPositiveButton(R.string.ok, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                new MyAsyncTask<Void, Void, Void>() {
                                    private String errorDesc = null;
                                    @Override
                                    protected Void doInBackground(Void... params) {
                                        OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
                                        try {
                                            ResultBean resultBean = dao.setOrderInvalid(orderId);
                                            if(!resultBean.isOk()) {
                                                errorDesc = "err:" + resultBean.getDesc();
                                            }
                                        } catch (ServiceException e) {
                                            AppLogger.e("error:" + e.getMessage(), e);
                                            errorDesc = "操作失败:" + e.getMessage();
                                        }
                                        return null;
                                    }

                                    @Override
                                    protected void onPostExecute(Void aVoid) {
                                        runOnUiThread(new Runnable() {
                                            @Override
                                            public void run() {
                                                String text = TextUtils.isEmpty(errorDesc) ? "操作成功" : errorDesc;
                                                Toast.makeText(OrderSingleActivity.this, text, Toast.LENGTH_LONG).show();
                                            }
                                        });
                                    }
                                }.executeOnNormal();
                            }
                        }).setNegativeButton(R.string.cancel, null);
                adb.show();
                break;
            case R.id.menu_chg_pack_worker:
                if (pack_worker_id <= 0) {
                    Toast.makeText(this, "该订单尚未指定过打包员，请先打包出库", Toast.LENGTH_LONG).show();
                    return false;
                }
                helper.chooseWorker(this, this.listType, fromStatus, ACTION_EDIT_PACK_WORKER, ship_worker_id);
                break;
            case R.id.menu_chg_ship_worker:
                if (ship_worker_id <= 0 && ship_worker_id != Cts.ID_DADA_MANUAL_WORKER) {
                    Toast.makeText(this, "该订单尚未指定过配送员，请先打包出库", Toast.LENGTH_LONG).show();
                    return false;
                }
                helper.chooseWorker(this, this.listType, fromStatus, ACTION_EDIT_SHIP_WORKER, ship_worker_id);
                break;
            case R.id.menu_refresh:
                refresh();
                return true;
            case R.id.menu_send_coupon:
                AlertDialog.Builder couponsAdb = new AlertDialog.Builder(this);
                String[] coupons = new String[]{
                        "延误补偿(6元优惠券)", //type = 1
                        "严重延误补偿（满79减20）", //type = 2
                        "品质补偿券(6元)", //type = 3
                        "品质补偿券(10元)", //type = 4
                        "品质补偿券(15元)", //type = 5
                        "品质补偿券(20元)", //type = 6
                        "品质补偿券(30元)", //type = 7
                };
                final int[] checkedIdx = new int[1];
                couponsAdb.setSingleChoiceItems(coupons, checkedIdx[0], new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        checkedIdx[0] = which;
                    }
                });
                couponsAdb.setTitle("发放优惠券")
                        .setPositiveButton(R.string.ok, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                new MyAsyncTask<Void, Void, Void>() {
                                    private String errorDesc = null;
                                    @Override
                                    protected Void doInBackground(Void... params) {
                                        int type = checkedIdx[0] + 1;
                                        if (type > 0) {
                                            OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
                                            try {
                                                ResultBean resultBean = dao.genCoupon(type, orderId);
                                                if (!resultBean.isOk()) {
                                                    errorDesc = "err:" + resultBean.getDesc();
                                                }
                                            } catch (ServiceException e) {
                                                AppLogger.e("error:" + e.getMessage(), e);
                                                errorDesc = "操作失败:" + e.getMessage();
                                            }
                                        }
                                        return null;
                                    }

                                    @Override
                                    protected void onPostExecute(Void aVoid) {
                                        runOnUiThread(new Runnable() {
                                            @Override
                                            public void run() {
                                                String text = TextUtils.isEmpty(errorDesc) ? "操作成功" : errorDesc;
                                                Toast.makeText(OrderSingleActivity.this, text, Toast.LENGTH_LONG).show();
                                            }
                                        });
                                    }
                                }.executeOnNormal();
                            }
                        }).setNegativeButton(R.string.cancel, null);
                couponsAdb.show();
                return true;
            case R.id.menu_chg_store:
                AlertDialog.Builder storesDlg = new AlertDialog.Builder(this);
                Collection<Store> stores = GlobalCtx.getInstance().listStores();
                if (stores == null || stores.isEmpty()) {
                    helper.showToast("正在加载店铺列表，请重试...");
                    return false;
                }

                final int[] selectedIdx = new int[1];
                String[] storeNames = new String[stores.size()];
                final int[] storeIds = new int[stores.size()];
                int idx = 0;
                for(Store store : stores) {
                    storeNames[idx] = store.getName();
                    storeIds[idx] = store.getId();

                    if (store.getId() == this.orderRef.get().getStore_id()) {
                        selectedIdx[0] = idx;
                    }

                    idx++;
                }
                storesDlg.setSingleChoiceItems(storeNames, selectedIdx[0], new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        selectedIdx[0] = which;
                    }
                }).setNegativeButton(R.string.cancel, null)
                .setPositiveButton(R.string.submit, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        final Order order = orderRef.get();
                        final int storeId = storeIds[selectedIdx[0]];
                        if (storeId != order.getStore_id()) {
                            new MyAsyncTask<Void, Void, Void>() {
                                @Override
                                protected Void doInBackground(Void... params) {
                                    OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
                                    try {
                                        ResultBean rb = dao.orderChgStore(order.getId(), storeId, order.getStore_id());
                                        if (rb.isOk()) {
                                            helper.showToast("修改成功！");
                                            orderRef.get().setStore_id(storeId);
                                            helper.updateUI(new Runnable() {
                                                @Override
                                                public void run() {
                                                    refresh();
                                                }
                                            });
                                        } else {
                                            helper.showToast("修改失败：" + rb.getDesc());
                                        }
                                    } catch (ServiceException e) {
                                        e.printStackTrace();
                                        helper.showToast("修改店铺错误：" + e.getMessage());
                                    }
                                    return null;
                                }
                            }.executeOnNormal();
                        } else {
                            helper.showToast("未修改店铺");
                        }
                    }
                });

                storesDlg.show();

                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
        return true;
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
    public void afterDelayReasonSaved() {
        this.refresh();
    }

    @Override
    public void onDialogPositiveClick(DialogFragment dialog) {

    }

    @Override
    public void onDialogNegativeClick(DialogFragment dialog) {

    }

    static public class OrderActionOp extends MyAsyncTask<Integer, ResultBean, ResultBean> {
        final int oid;
        final String platformOid;
        private Activity activity;
        private int listType;
        private int workerId;

        public OrderActionOp(int oid, String platformOid, Activity v, int listType) {
            this.oid = oid;
            this.platformOid = platformOid;
            activity = v;
            this.listType = listType;
        }

        @Override
        protected ResultBean doInBackground(Integer... params) {
            int fromStatus = params[0];
            String token = GlobalCtx.getInstance().getSpecialToken();
            ResultBean oc;
            try {
                switch (fromStatus) {
                    case Cts.WM_ORDER_STATUS_TO_SHIP:
                        oc = new OrderActionDao(token).startShip(Cts.Platform.find(oid), platformOid, workerId);
                        break;
                    case Cts.WM_ORDER_STATUS_TO_ARRIVE:
                        oc = new OrderActionDao(token).setArrived(Cts.Platform.find(oid), platformOid);
                        break;
                    case Cts.WM_ORDER_STATUS_TO_READY:
                        oc = new OrderActionDao(token).setReady(Cts.Platform.find(oid), platformOid, workerId);
                        break;
                    default:
                        throw new ServiceException("incorrect status:" + fromStatus);
                }
                return oc;
            } catch (Exception ex) {
                AppLogger.e("error on handle click action: status=" + fromStatus, ex);
                return ResultBean.exception();
            }
        }

        @Override
        protected void onPostExecute(final ResultBean oc) {
            super.onPostExecute(oc);
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(GlobalCtx.getInstance(), oc.isOk() ? "操作成功" : "操作失败：" + oc.getDesc(), Toast.LENGTH_LONG).show();
                    Intent intent = new Intent(GlobalCtx.getInstance(), MainActivity.class);
                    intent.putExtra("list_type", listType);
                    activity.startActivity(intent);
                }
            });
        }

        public void setWorkerId(int workerId) {
            this.workerId = workerId;
        }
    }

    private static class AccpetOrderButtonClicked implements View.OnClickListener {
        private final int platform;
        private final String platformOid;
        private final int status;
        private final int listType;

        public AccpetOrderButtonClicked(int platform, String platformOid, int status, int listType) {
            this.platform = platform;
            this.platformOid = platformOid;
            this.status = status;
            this.listType = listType;
        }

        @Override
        public void onClick(final View v) {
            new MyAsyncTask<Void, ResultBean, ResultBean>(){
                @Override
                protected ResultBean doInBackground(Void... params) {
                    String token = GlobalCtx.getInstance().getSpecialToken();
                    try {
                        return new OrderActionDao(token).confirmAccepted(Cts.Platform.find(platform), platformOid);
                    } catch (Exception ex) {
                        AppLogger.e("error on handle click action: status=" + status, ex);
                        return ResultBean.exception();
                    }
                }

                @Override
                protected void onPostExecute(final ResultBean oc) {
                    super.onPostExecute(oc);
                    final Activity activity = (Activity)v.getContext();
                    activity.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(GlobalCtx.getInstance(), oc.isOk() ? "操作成功" : "操作失败：" + oc.getDesc(), Toast.LENGTH_LONG).show();
                            Intent intent = new Intent(GlobalCtx.getInstance(), RemindersActivity.class);
                            intent.putExtra("list_type", listType);
                            activity.startActivity(intent);
                        }
                    });
                }

            }.executeOnNormal();
        }
    }

}
