package cn.cainiaoshicai.crm.orders.view;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.Toast;

import com.example.BlueToothPrinterApp.BlueToothPrinterApp;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 */
public class OrderSingleActivity extends Activity {
    private static final String HTTP_MOBILE_STORES = "http://www.cainiaoshicai.cn/stores";
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.order_single);

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
                startActivity(new Intent(getApplicationContext(), BlueToothPrinterApp.class));
            }
        });



        final Button actionButton = (Button) findViewById(R.id.button2);
        actionButton.setText(getActionText(status));
        actionButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                new OrderActionOp(platform, platformOid, v, listType).executeOnNormal(status);
            }
        });

        String url = String.format("%s/single_order/android/%s/%s.html", HTTP_MOBILE_STORES, platform, platformOid);
        AppLogger.i("loading url:" + url);
        mWebView.loadUrl(url);
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
}
