package cn.cainiaoshicai.crm.orders.view;

import android.app.Activity;
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

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.CartItem;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.print.BluetoothConnector;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;
import cn.cainiaoshicai.crm.support.print.GPrinterCommand;
import cn.cainiaoshicai.crm.ui.activity.BTDeviceListActivity;
import cn.cainiaoshicai.crm.ui.activity.RemindersActivity;

/**
 */
public class OrderSingleActivity extends Activity {
    private static final String HTTP_MOBILE_STORES = "http://www.cainiaoshicai.cn/stores";
    private static final String GBK = "gbk";
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
        final int status = intent.getIntExtra("order_status", Constants.WM_ORDER_STATUS_UNKNOWN);

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
            actionButton.setOnClickListener(new AccpetOrderButtonClicked(platform, platformOid, status, listType));
        } else {
            if (status == Constants.WM_ORDER_STATUS_ARRIVED) {
                actionButton.setVisibility(View.INVISIBLE);
            } else {
                actionButton.setText(getActionText(status));
                actionButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        new OrderActionOp(platform, platformOid, v, listType).executeOnNormal(status);
                    }
                });
            }
        }

        String url = String.format("%s/single_order/android/%s/%s.html", HTTP_MOBILE_STORES, platform, platformOid);
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
    }

    protected void connect(final int platform, final String platformOid) {
        final BluetoothConnector.BluetoothSocketWrapper btsocket = BluetoothPrinters.INS.getCurrentPrinterSocket();
        if(btsocket == null){
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
                        return printOrder(btsocket, order);
                    }
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

    private boolean printOrder(BluetoothConnector.BluetoothSocketWrapper btsocket, Order order) {
        try {
            OutputStream btos = btsocket.getOutputStream();

            btos.write(new byte[]{0x1B, 0x21, 1});
            byte[] newLine = "\n".getBytes();
            final byte[] starLine = "********************************".getBytes();

            btos.write(starLine);
            btos.write(newLine);
            btos.write(GPrinterCommand.center);
            btos.write(GPrinterCommand.text_big_size);
            btos.write(bytes("菜鸟食材"));
            btos.write(GPrinterCommand.text_normal_size);
            btos.write(GPrinterCommand.left);
            btos.write(newLine);

            btos.write(starLine);
            btos.write(newLine);
            btos.write(bytes(order.getUserName() + " " + order.getMobile()));

            btos.write(newLine);
            btos.write(bytes(order.getAddress()));
            btos.write(newLine);

            if (!TextUtils.isEmpty(order.getRemark())) {
                btos.write(starLine);
                btos.write(newLine);
                btos.write(bytes("用户备注"));
                btos.write(newLine);
                btos.write(bytes(order.getRemark()));
            }

            btos.write(starLine);
            btos.write(newLine);
            btos.write((bytes("期望送达时间：" + order.getExpectTime())));
            btos.write(newLine);
            btos.write(starLine);
            btos.write(bytes("订单编号：" + order.getPlatform() + "-" + order.getPlatform_oid()));

            btos.write(newLine);

            btos.write(bytes("下单时间：2016-03-26 15：52"));
            btos.write(newLine);
            btos.write(starLine);
            btos.write(newLine);

            btos.write(bytes("食材名称                数量"));
            btos.write(newLine);
            btos.write(bytes("---------------------------"));
            btos.write(newLine);

            for(CartItem item : order.getItems()) {
                btos.write(bytes(String.format("%s x%d", item.getProduct_name(), item.getNum())));
                btos.write(newLine);
            }

            btos.write(starLine);
            btos.write(newLine);
            btos.write(bytes(String.format("实付金额：%.2f", order.getOrderMoney())));
            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(0x0D);
            btos.write(GPrinterCommand.walkPaper((byte) 4));
            btos.flush();
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    private byte[] bytes(String msg) throws UnsupportedEncodingException {
        return msg.getBytes(GBK);
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

        public OrderActionOp(int oid, String platformOid, View v, int listType) {
            this.oid = oid;
            this.platformOid = platformOid;
            button = v;
            this.listType = listType;
        }

        @Override
        protected ResultBean doInBackground(Integer... params) {
            int status = params[0];
            String token = GlobalCtx.getInstance().getSpecialToken();
            ResultBean oc;
            try {
                switch (status) {
                    case Constants.WM_ORDER_STATUS_TO_SHIP:
                        oc = new OrderActionDao(token).startShip(Constants.Platform.find(oid), platformOid);
                        break;
                    case Constants.WM_ORDER_STATUS_TO_ARRIVE:
                        oc = new OrderActionDao(token).setArrived(Constants.Platform.find(oid), platformOid);
                        break;
                    case Constants.WM_ORDER_STATUS_TO_READY:
                        oc = new OrderActionDao(token).setReady(Constants.Platform.find(oid), platformOid);
                        break;
                    default:
                        throw new ServiceException("incorrect status:" + status);
                }
                return oc;
            } catch (Exception ex) {
                AppLogger.e("error on handle click action: status=" + status, ex);
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
