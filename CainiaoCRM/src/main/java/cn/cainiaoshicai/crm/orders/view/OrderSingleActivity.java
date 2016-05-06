package cn.cainiaoshicai.crm.orders.view;

import android.app.Activity;
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
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import java.io.IOException;
import java.io.OutputStream;
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
import cn.cainiaoshicai.crm.orders.domain.CartItem;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.orders.util.TextUtil;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.print.BluetoothConnector;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.GPrinterCommand;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.ui.activity.BTDeviceListActivity;
import cn.cainiaoshicai.crm.ui.activity.DelayFaqFragment;
import cn.cainiaoshicai.crm.ui.activity.RemindersActivity;
import cn.cainiaoshicai.crm.ui.basefragment.UserFeedbackDialogFragment;

/**
 */
public class OrderSingleActivity extends Activity implements DelayFaqFragment.NoticeDialogListener {
    private static final String HTTP_MOBILE_STORES = "http://www.cainiaoshicai.cn/stores";
    private static final int MAX_TITLE_PART = 16;
    private WebView mWebView;
    private DelayFaqFragment delayFaqFragment;
    private MenuItem refreshItem;

    private int orderId;
    private String platformOid;
    private String shipWorkerName;
    private int platform;
    private String url;

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
        platform = intent.getIntExtra("platform_id", 0);
        this.orderId = intent.getIntExtra("id", 0);
        platformOid = intent.getStringExtra("platform_oid");
        shipWorkerName = intent.getStringExtra("ship_worker_name");
        final int listType = intent.getIntExtra("list_type", 0);
        final int fromStatus = intent.getIntExtra("order_status", Constants.WM_ORDER_STATUS_UNKNOWN);
        final boolean isDelay = intent.getBooleanExtra("is_delay", false);
        Button printButton = (Button) findViewById(R.id.button1);
        printButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                connect(platform, platformOid);
            }
        });

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
                        AlertDialog.Builder adb = new AlertDialog.Builder(v.getContext());
                        if (fromStatus == Constants.WM_ORDER_STATUS_TO_ARRIVE) {
                            adb.setTitle("送达提醒")
                                .setMessage(String.format("您的食材已由快递小哥【%s】送到，如有缺漏、品质或其他问题请立即联系店长【%s(%s)】。春风十里，不如赐个好评就送个金菠萝给你 :)", shipWorkerName, "青青", "18910275329"))
                                .setPositiveButton("发送", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        OrderActionOp orderActionOp = new OrderActionOp(platform, platformOid, v, listType);
                                        orderActionOp.executeOnNormal(fromStatus);
                                    }
                                });
                        } else {
                            final ArrayList<CommonConfigDao.Worker> workerList = new ArrayList<>();
                            HashMap<Integer, CommonConfigDao.Worker> workers = GlobalCtx.getApplication().getWorkers();
                            if (workers != null && !workers.isEmpty()) {
                                workerList.addAll(workers.values());
                            }

                            AccountBean accountBean = GlobalCtx.getApplication().getAccountBean();
                            int currUid = Integer.parseInt(accountBean.getUid());
                            if (workerList.isEmpty()) {
                                workerList.add(new CommonConfigDao.Worker(accountBean.getUsernick(), "", currUid));
                            }

                            final int[] checkedIdx = {0};
                            List<String> items = new ArrayList<>();
                            for (int i = 0; i < workerList.size(); i++) {
                                CommonConfigDao.Worker worker = workerList.get(i);
                                items.add(worker.getNickname());
                                if (currUid == worker.getId()) {
                                    checkedIdx[0] = i;
                                }
                            }
                            adb.setSingleChoiceItems(items.toArray(new String[items.size()]), checkedIdx[0], new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    checkedIdx[0] = which;
                                }
                            });
                            adb.setTitle(fromStatus == Constants.WM_ORDER_STATUS_TO_READY ? "谁打包的？" : "选择快递小哥")
                                    .setPositiveButton(getString(R.string.ok), new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            OrderActionOp orderActionOp = new OrderActionOp(platform, platformOid, v, listType);
                                            orderActionOp.setWorkerId(workerList.get(checkedIdx[0]).getId());
                                            orderActionOp.executeOnNormal(fromStatus);
                                        }
                                    });
                        }
                        adb.setNegativeButton(getString(R.string.cancel), null);
                        adb.show();
                    }
                });
            }
        }

        url = String.format("%s/single_order/android/%s/%s.html", HTTP_MOBILE_STORES, platform, platformOid) + "?access_token=" + GlobalCtx.getInstance().getSpecialToken()+"&client_id="+GlobalCtx.getInstance().getCurrentAccountId();
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
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
                        try {
                            printOrder(ds.getSocket(), order);
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
                }
            }.executeOnNormal();
        }
    }

    private void printOrder(BluetoothConnector.BluetoothSocketWrapper btsocket, Order order) throws IOException {
        try {
            OutputStream btos = btsocket.getOutputStream();
            OrderPrinter printer = new OrderPrinter(btos);

            btos.write(new byte[]{0x1B, 0x21, 0});
            btos.write(GPrinterCommand.left);

            printer.starLine().highBigText("   菜鸟食材").newLine();

            printer.starLine().highText("支付状态：" + (order.isPaidDone() ? "在线支付" : "待付款(以平台为准)")).newLine();

            printer.starLine()
                    .highText(TextUtil.replaceWhiteStr(order.getUserName()) + " " + order.getMobile())
                            .newLine()
                            .highText(TextUtil.replaceWhiteStr(order.getAddress()))
                            .newLine();

            String expectedStr = order.getExpectTimeStr();
            if (expectedStr == null) {
                expectedStr = DateTimeUtils.mdHourMinCh(order.getExpectTime());
            }
            printer.starLine().highText("期望送达：" + expectedStr).newLine();
            if (!TextUtils.isEmpty(order.getRemark())) {
                        printer.highText("用户备注：" + order.getRemark())
                        .newLine();
            }

            printer.starLine()
                    .normalText("订单编号：" + Constants.Platform.find(order.getPlatform()).name + "-" + order.getPlatform_oid())
                    .newLine()
                    .normalText("下单时间：" + DateTimeUtils.shortYmdHourMin(order.getOrderTime()))
                    .newLine();

            printer.starLine().highText(String.format("食材名称%22s", "数量")).newLine().splitLine();

            int total = 0;
            for (CartItem item : order.getItems()) {
                String name = item.getProduct_name();
                for (int idx = 0; idx < name.length(); ) {

                    String text = name.substring(idx, Math.min(name.length(), idx + MAX_TITLE_PART));

                    boolean isEnd = idx + MAX_TITLE_PART >= name.length();
                    if (isEnd) {
                        String format = "%s%" + Math.max(32 - (printer.printWidth(text)), 1) + "s";
                        text = String.format(format, text, "x" + item.getNum());
                    }
                    printer.highText(text).newLine();
                    if (isEnd) {
                        printer.spaceLine();
                    }

                    idx += MAX_TITLE_PART;
                }
                total += item.getNum();
            }

            printer.highText(String.format("合计 %27s", "x" + total)).newLine();

            printer.starLine().highText(String.format("实付金额：%22.2f", order.getOrderMoney())).newLine();

            printer.starLine().normalText("我们承诺坏一赔二，请您放心买菜。").newLine().normalText("客服电话：400-018-6069");

            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(GPrinterCommand.walkPaper((byte) 4));
            btos.flush();
        } catch (Exception e) {
            AppLogger.e("error in printing order", e);
            throw e;
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

    static public class OrderActionOp extends MyAsyncTask<Integer, ResultBean, ResultBean> {
        final int oid;
        final String platformOid;
        private View button;
        private int listType;
        private int workerId;

        public OrderActionOp(int oid, String platformOid, View v, int listType) {
            this.oid = oid;
            this.platformOid = platformOid;
            button = v;
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
            final Activity activity = (Activity) button.getContext();
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
}
