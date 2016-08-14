package cn.cainiaoshicai.crm.ui.activity;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.io.Serializable;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.UserFeedbackDao;
import cn.cainiaoshicai.crm.orders.domain.Feedback;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.domain.ResultObject;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 * Created by liuzhr on 6/23/16.
 */
public class FeedBackEditActivity extends AbstractActionBarActivity {

    private String feedback_source;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        this.setContentView(R.layout.user_feedback_add);

        this.getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        this.getSupportActionBar().setTitle(R.string.title_user_feedback);

        final TextView orderId = (TextView) findViewById(R.id.order_id);
        TextView platformWithId = (TextView) findViewById(R.id.order_platform_no);

        Intent intent = getIntent();
        final int order_id = intent.getIntExtra("order_id", 0);
        orderId.setText(String.valueOf(order_id));

        if (order_id > 0) {
            new MyAsyncTask<Integer, Void, Feedback>() {
                @Override
                protected Feedback doInBackground(Integer... params) {

                    String token = GlobalCtx.getInstance().getSpecialToken();
                    UserFeedbackDao dao = new UserFeedbackDao(token);
                    ResultObject<Feedback> fbObj = dao.findByOrderId(order_id);
                    if (fbObj.isOk() && fbObj.getObj() != null) {
                        Intent to = new Intent(FeedBackEditActivity.this, FeedbackViewActivity.class);
                        to.putExtra("fb", fbObj.getObj());
                        FeedBackEditActivity.this.startActivity(to);
                    }
                    return null;
                }
            }.executeOnNormal(order_id);
        }

        platformWithId.setText(intent.getStringExtra("platformWithId"));
        final int wmId = intent.getIntExtra("wm_id", 0);

        Spinner spinner = (Spinner) findViewById(R.id.feedback_source);
        final ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,
                R.array.feedback_source_array, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);
        spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                feedback_source = adapter.getItem(position).toString();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                feedback_source = "";
            }
        });

        final EditText et = (EditText)findViewById(R.id.feedback);

        final Intent resultIntent = new Intent(getApplicationContext(), OrderSingleActivity.class);
        Button saveBtn = (Button) findViewById(R.id.save_btn);
        saveBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                final String content = et.getText().toString();
                if (!TextUtils.isEmpty(content)) {
                    final ProgressFragment pf = ProgressFragment.newInstance(R.string.saving);
                    Utility.forceShowDialog(FeedBackEditActivity.this, pf);
                    new MyAsyncTask<Void, Void, Void>() {
                        private ResultBean resultBean;
                        @Override
                        protected Void doInBackground(Void... params) {
                            UserFeedbackDao fbDao = new UserFeedbackDao(GlobalCtx.getInstance().getSpecialToken());
                            try {
                                resultBean = fbDao.saveFeedbackForOrder(wmId, feedback_source, content);
                            } catch (ServiceException e) {
                                resultBean = ResultBean.serviceException("服务异常:" + e.getMessage());
                            }
                            return null;
                        }

                        @Override
                        protected void onPostExecute(Void aVoid) {
                            pf.dismissAllowingStateLoss();
                            if (resultBean.isOk()) {
                                FeedBackEditActivity.this.runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        resultIntent.putExtra("done", resultBean.isOk());
                                        showToast("已保存到服务器");
                                        setResult(Activity.RESULT_OK, resultIntent);
                                        finish();
                                    }
                                });
                            } else {
                                showToast("保存失败，请稍后重试！");
                            }
                        }
                    }.executeOnNormal();
                } else {
                    showToast("反馈信息不能为空");
                }
            }
        });

        Button cancelBtn = (Button) findViewById(R.id.cancel_btn);
        cancelBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                AlertDialog.Builder dlg = new AlertDialog.Builder(FeedBackEditActivity.this);
                dlg.setMessage("内容尚未保存，确定取消吗？");
                dlg.setPositiveButton("确定取消", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        setResult(Activity.RESULT_OK, resultIntent);
                        finish();
                    }
                }).setNegativeButton("继续编辑", null)
                        .show();

            }
        });
    }

    private void showToast(String msg) {
        Toast.makeText(FeedBackEditActivity.this, msg, Toast.LENGTH_SHORT).show();
    }
}
