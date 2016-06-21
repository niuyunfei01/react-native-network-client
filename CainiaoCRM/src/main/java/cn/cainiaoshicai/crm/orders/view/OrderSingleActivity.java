package cn.cainiaoshicai.crm.orders.view;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DialogFragment;
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
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.Switch;
import android.widget.Toast;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.CommonConfigDao;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.ui.activity.BTDeviceListActivity;
import cn.cainiaoshicai.crm.ui.activity.DelayFaqFragment;
import cn.cainiaoshicai.crm.ui.activity.RemindersActivity;
import cn.cainiaoshicai.crm.ui.basefragment.UserFeedbackDialogFragment;

/**
 */
public class OrderSingleActivity extends Activity implements DelayFaqFragment.NoticeDialogListener, UserFeedbackDialogFragment.NoticeDialogListener {
    private static final String HTTP_MOBILE_STORES = "http://www.cainiaoshicai.cn/stores";
    private WebView mWebView;
    private DelayFaqFragment delayFaqFragment;
    private MenuItem refreshItem;

    private int orderId;
    private String platformOid;
    private String shipWorkerName;
    private int platform;
    private String url;
    private Button printButton = null;
    private Switch sourceReadyButton;
    private int listType;
    private int fromStatus;
    private int ship_worker_id;
    private int pack_worker_id;

    private static final int ACTION_NORMAL = 0;
    private static final int ACTION_EDIT_SHIP_WORKER = 1;
    private static final int ACTION_EDIT_PACK_WORKER = 2;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.order_single);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        mWebView = (WebView) findViewById(R.id.activity_main_webview);
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        mWebView.setWebViewClient(new MyAppWebViewClient());

        mWebView.addJavascriptInterface(new WebAppInterface(this), "crm_andorid");

        Intent intent = getIntent();
        Order order = (Order) intent.getSerializableExtra("order");
        ship_worker_id = order.getShip_worker_id();
        pack_worker_id = order.getPack_operator();
        platform = order.getPlatform();
        this.orderId = order.getId();
        platformOid = order.getPlatform_oid();
        shipWorkerName = order.getShip_worker_name();
        int sourceReady = order.getSource_ready();
        listType = intent.getIntExtra("list_type", 0);
        fromStatus = order.getOrderStatus();
        final boolean isDelay = intent.getBooleanExtra("is_delay", false);
        printButton = (Button) findViewById(R.id.button1);
        int printTimes = order.getPrint_times();
        this.showPrintTimes(printTimes);

        printButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                connect(platform, platformOid);
            }
        });
        sourceReadyButton = (Switch) findViewById(R.id.button_source_ready);
        final boolean isWaitingReady = fromStatus == Constants.WM_ORDER_STATUS_TO_READY;
        this.showSourceReady(sourceReady > 0, isWaitingReady);
        sourceReadyButton.setVisibility(isWaitingReady ? View.VISIBLE : View.GONE);

        Button delayFaqButton = (Button) findViewById(R.id.button3);
        if(!isDelay){
            delayFaqButton.setVisibility(View.INVISIBLE);
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

        final Button actionButton = (Button) findViewById(R.id.button2);
        if("new_order".equals(intent.getStringExtra("from"))) {
            actionButton.setText("确认接单");
            actionButton.setOnClickListener(new AccpetOrderButtonClicked(platform, platformOid, fromStatus, listType));
        } else {
            if (fromStatus == Constants.WM_ORDER_STATUS_ARRIVED) {
                actionButton.setVisibility(View.INVISIBLE);
            } else {
                actionButton.setText(getActionText(fromStatus));
                actionButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(final View v) {
                        if (fromStatus == Constants.WM_ORDER_STATUS_TO_ARRIVE) {
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
                            chooseWorker((Activity) v.getContext(), listType, fromStatus);
                        }
                    }
                });
            }
        }

        url = String.format("%s/single_order/android/%s/%s.html", HTTP_MOBILE_STORES, platform, platformOid) + "?access_token=" + GlobalCtx.getInstance().getSpecialToken()+"&client_id="+GlobalCtx.getInstance().getCurrentAccountId();
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }

    private void showToast(final String msg) {
        this.showToast(msg, false);
    }

    private void showToast(final String msg, final boolean refresh) {
        this.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(OrderSingleActivity.this, msg, Toast.LENGTH_LONG).show();
                if (refresh) {
                    OrderSingleActivity.this.refresh();
                }
            }
        });
    }

    private void chooseWorker(final Activity activity, final int orderListTypeToJump, final int fromStatus) {
        this.chooseWorker(activity, orderListTypeToJump, fromStatus, ACTION_NORMAL);
    }
    private void chooseWorker(final Activity activity, final int orderListTypeToJump, final int fromStatus, final int action) {

        final boolean isWaitingReady = fromStatus == Constants.WM_ORDER_STATUS_TO_READY;
        AlertDialog.Builder adb = new AlertDialog.Builder(activity);
        final ArrayList<CommonConfigDao.Worker> workerList = new ArrayList<>();
        HashMap<Integer, CommonConfigDao.Worker> workers = GlobalCtx.getApplication().getWorkers();
        if (workers != null && !workers.isEmpty()) {
            for(CommonConfigDao.Worker worker : workers.values()) {
                if (!isWaitingReady || !worker.isExtShipWorker()) {
                  workerList.add(worker);
                }
            }
        }

        String currUid = GlobalCtx.getInstance().getCurrentAccountId();
        int iCurrUid = currUid != null ? Integer.parseInt(currUid) : 0;
        final int[] checkedIdx = {0};
        List<String> items = new ArrayList<>();
        for (int i = 0; i < workerList.size(); i++) {
            CommonConfigDao.Worker worker = workerList.get(i);
            items.add(worker.getNickname());
            if (iCurrUid == worker.getId()) {
                checkedIdx[0] = items.size() - 1;
            }
        }

        adb.setSingleChoiceItems(items.toArray(new String[items.size()]), checkedIdx[0], new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                checkedIdx[0] = which;
            }
        });
        adb.setTitle((isWaitingReady || action == ACTION_EDIT_PACK_WORKER) ? "谁打包的？" : "选择快递小哥")
                .setPositiveButton(getString(R.string.ok), new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {

                        final int selectedWorker = workerList.get(checkedIdx[0]).getId();
                        if (action == ACTION_EDIT_SHIP_WORKER) {
                            new EditShipWorkerTask(selectedWorker, activity).executeOnIO();
                        } else if (action == ACTION_EDIT_PACK_WORKER) {
                            new EditPackWorkerTask(selectedWorker, activity).executeOnIO();
                        } else {
                            OrderActionOp orderActionOp = new OrderActionOp(platform, platformOid, activity, orderListTypeToJump);
                            orderActionOp.setWorkerId(selectedWorker);
                            orderActionOp.executeOnNormal(fromStatus);
                        }
                    }
                });
        adb.setNegativeButton(getString(R.string.cancel), null);
        adb.show();
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
        this.mWebView.clearView();
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
        printButton.setText(getString(R.string.menu_print) + (print_times > 0 ? String.format("(%d)", print_times) : ""));
    }

    protected void connect(final int platform, final String platformOid) {
        final BluetoothPrinters.DeviceStatus ds = BluetoothPrinters.INS.getCurrentPrinter();
        if(ds == null || ds.getSocket() == null){
            Intent BTIntent = new Intent(getApplicationContext(), BTDeviceListActivity.class);
            this.startActivityForResult(BTIntent, BTDeviceListActivity.REQUEST_CONNECT_BT);
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
                        boolean ok;
                        try {
                            OrderPrinter.printOrder(ds.getSocket(), order);
                            order.incrPrintTimes();
                            ok = true;
                        } catch (Exception e) {
                            AppLogger.e("error IOException:" + e.getMessage(), e);
                            this.error = "打印错误:" + e.getMessage();

                            if (e instanceof IOException) {
                                ds.closeSocket();
                            }

                            return false;
                        }

                        if (ok) {
                            try {
                                new OrderActionDao(access_token).logOrderPrinted(order.getId());
                            } catch (ServiceException e) {
                                AppLogger.e("error Service Exception:" + e.getMessage());
                            }
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
            case Constants.WM_ORDER_STATUS_TO_SHIP:
                return getString(R.string.action_start_ship);
            case Constants.WM_ORDER_STATUS_TO_ARRIVE:
                return getString(R.string.action_set_arrived);
            case Constants.WM_ORDER_STATUS_TO_READY:
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
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.menu_user_feedback:
                UserFeedbackDialogFragment dlg = new UserFeedbackDialogFragment();
                dlg.show(getFragmentManager(), "userFeedbackDlg");
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
                chooseWorker(this, this.listType, fromStatus, ACTION_EDIT_PACK_WORKER);
                break;
            case R.id.menu_chg_ship_worker:
                if (ship_worker_id <= 0) {
                    Toast.makeText(this, "该订单尚未指定过配送员，请先打包出库", Toast.LENGTH_LONG).show();
                    return false;
                }
                chooseWorker(this, this.listType, fromStatus, ACTION_EDIT_SHIP_WORKER);
                break;
            case R.id.menu_refresh:
                refresh();
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
                    case Constants.WM_ORDER_STATUS_TO_SHIP:
                        oc = new OrderActionDao(token).startShip(Constants.Platform.find(oid), platformOid, workerId);
                        break;
                    case Constants.WM_ORDER_STATUS_TO_ARRIVE:
                        oc = new OrderActionDao(token).setArrived(Constants.Platform.find(oid), platformOid);
                        break;
                    case Constants.WM_ORDER_STATUS_TO_READY:
                        oc = new OrderActionDao(token).setReady(Constants.Platform.find(oid), platformOid, workerId);
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
                        return new OrderActionDao(token).confirmAccepted(Constants.Platform.find(platform), platformOid);
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

    private class EditShipWorkerTask extends MyAsyncTask<Integer, Void, Boolean> {
        private final int selectedWorker;
        private final Activity activity;

        public EditShipWorkerTask(int selectedWorker, Activity activity) {
            this.selectedWorker = selectedWorker;
            this.activity = activity;
        }

        @Override
        protected Boolean doInBackground(Integer... params) {
            String error = "";
            OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
            try {
                ResultBean result = dao.chg_ship_worker(orderId, ship_worker_id, selectedWorker);
                if (result.isOk()) {
                    showToast("修改配送员成功！", true);
                    ship_worker_id = selectedWorker;
                    return true;
                } else {
                    error = result.getDesc();
                }
            } catch (ServiceException e) {
                error = "错误：" + e.getMessage();
                AppLogger.e("error to edit ship worker:", e);
            }

            final String msg = "修改配送员失败:" + error;
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(activity, msg, Toast.LENGTH_LONG).show();
                }
            });
            return Boolean.FALSE;
        }

    }

    private class EditPackWorkerTask extends MyAsyncTask<Integer, Void, Boolean> {
        private final int selectedWorker;
        private final Activity activity;

        public EditPackWorkerTask(int selectedWorker, Activity activity) {
            this.selectedWorker = selectedWorker;
            this.activity = activity;
        }

        @Override
        protected Boolean doInBackground(Integer... params) {
            String error = "";
            OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
            try {
                ResultBean result = dao.order_chg_pack_worker(orderId, pack_worker_id, selectedWorker);
                if (result.isOk()) {
                    showToast("修改打包员成功！", true);
                    pack_worker_id = selectedWorker;
                    return true;
                } else {
                    error = result.getDesc();
                }
            } catch (ServiceException e) {
                error = "错误：" + e.getMessage();
                AppLogger.e("error to edit ship worker:", e);
            }

            showToast("修改打包员失败:" + error);
            return Boolean.FALSE;
        }
    }
}
