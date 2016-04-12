package cn.cainiaoshicai.crm.orders.view;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.Toast;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.WorkersDao;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.CartItem;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.print.BluetoothConnector;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.Constant;
import cn.cainiaoshicai.crm.support.print.GPrinterCommand;
import cn.cainiaoshicai.crm.ui.activity.BTDeviceListActivity;
import cn.cainiaoshicai.crm.ui.activity.RemindersActivity;

/**
 */
public class OrderSingleActivity extends Activity {
    private static final String HTTP_MOBILE_STORES = "http://www.cainiaoshicai.cn/stores";
    private static final String GBK = "gbk";
    private static final int MAX_TITLE_PART = 16;
    private WebView mWebView;

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
        final int platform = intent.getIntExtra("platform_id", 0);
        final String platformOid = intent.getStringExtra("platform_oid");
        final int listType = intent.getIntExtra("list_type", 0);
        final int fromStatus = intent.getIntExtra("order_status", Constants.WM_ORDER_STATUS_UNKNOWN);

        Button printButton = (Button) findViewById(R.id.button1);
        printButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                connect(platform, platformOid);
            }
        });


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
                            adb.setTitle("确认已经送达，提醒用户验货评价吗？");
                            adb.setPositiveButton("确认送达", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    OrderActionOp orderActionOp = new OrderActionOp(platform, platformOid, v, listType);
                                    orderActionOp.executeOnNormal(fromStatus);
                                }
                            });
                        } else {
                            final ArrayList<WorkersDao.Worker> workerList = new ArrayList<>();
                            HashMap<Integer, WorkersDao.Worker> workers = GlobalCtx.getApplication().getWorkers();
                            if (workers != null && !workers.isEmpty()) {
                                workerList.addAll(workers.values());
                            }

                            AccountBean accountBean = GlobalCtx.getApplication().getAccountBean();
                            int currUid = Integer.parseInt(accountBean.getUid());
                            if (workerList.isEmpty()) {
                                workerList.add(new WorkersDao.Worker(accountBean.getUsernick(), "", currUid));
                            }

                            int selected = 0;
                            List<String> items = new ArrayList<>();
                            for (int i = 0; i < workerList.size(); i++) {
                                WorkersDao.Worker worker = workerList.get(i);
                                items.add(worker.getNickname());
                                if (currUid == worker.getId()) {
                                    selected = i;
                                }
                            }
                            adb.setSingleChoiceItems(items.toArray(new String[items.size()]), selected, new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    OrderActionOp orderActionOp = new OrderActionOp(platform, platformOid, v, listType);
                                    orderActionOp.setWorkerId(workerList.get(which).getId());
                                    orderActionOp.executeOnNormal(fromStatus);
                                }
                            });
                            adb.setTitle(fromStatus == Constants.WM_ORDER_STATUS_TO_READY ? "谁打包的？" : "标记发货并给用户发送配送员联系信息吗？");
                        }
                        adb.setNegativeButton("取消", null);
                        adb.show();
                    }
                });
            }
        }

        String url = String.format("%s/single_order/android/%s/%s.html", HTTP_MOBILE_STORES, platform, platformOid);
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
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


    static public class OrderPrinter {
        private final OutputStream btos;
        private byte[] newLine = "\n".getBytes();
        private final byte[] starLine = "********************************".getBytes();
        private final String split_line = "--------------------------------";
        private final String space_line = "                                ";

        public OrderPrinter(OutputStream btos) {
            this.btos = btos;
        }

        public OrderPrinter newLine() throws IOException {
            btos.write(newLine);
            return this;
        }

        public OrderPrinter starLine() throws IOException {
            btos.write(GPrinterCommand.text_normal_size);
            btos.write(starLine);
            btos.write(newLine);

            return this;
        }

        public OrderPrinter highText(String s) throws IOException {
            btos.write(GPrinterCommand.text_big_height);
            btos.write(bytes(s));
            return this;
        }

        public OrderPrinter highBigText(String s) throws IOException {
            btos.write(GPrinterCommand.text_big_size);
            btos.write(bytes(s));
            return this;
        }


        byte[] bytes(String msg) throws UnsupportedEncodingException {
            return msg.getBytes(GBK);
        }

        public OrderPrinter normalText(String text) throws IOException {
            btos.write(GPrinterCommand.text_normal_size);
            btos.write(bytes(text));
            return this;
        }

        public OrderPrinter splitLine() throws IOException {
            btos.write(GPrinterCommand.text_normal_size);
            btos.write(bytes(split_line));
            this.newLine();
            return this;
        }

        public OrderPrinter spaceLine() throws IOException {
            btos.write(GPrinterCommand.text_normal_size);
            btos.write(bytes(space_line));
            this.newLine();
            return this;
        }

        public int printWidth(String text) {
            if (text == null) return 0;
            int width = 0;
            for(int idx = 0; idx < text.length(); idx++) {
                char c = text.charAt(idx);
                if (c < 256) {
                    width++;
                } else {
                    width += 2;
                }
            }
            return width;
        }
    }

    private void printOrder(BluetoothConnector.BluetoothSocketWrapper btsocket, Order order) throws IOException {
        try {
            OutputStream btos = btsocket.getOutputStream();
            OrderPrinter printer = new OrderPrinter(btos);

            btos.write(new byte[]{0x1B, 0x21, 1});
            btos.write(GPrinterCommand.left);

            printer.starLine().highBigText("   菜鸟食材").newLine();

            printer.starLine()
                    .highText(order.getUserName() + " " + order.getMobile())
                    .newLine()
                    .highText(order.getAddress())
                    .newLine();

            printer.starLine().highText("期望送达：" + DateTimeUtils.mdHourMinCh(order.getExpectTime())).newLine();
            if (!TextUtils.isEmpty(order.getRemark())) {
                        printer.highText("用户备注：" + order.getRemark())
                        .newLine();
            }

            printer.starLine()
                    .normalText("订单编号：" + order.getPlatform() + "-" + order.getPlatform_oid())
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
