package cn.cainiaoshicai.crm.ui.activity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.common.api.GoogleApiClient;

import java.util.List;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.UserFeedbackDao;
import cn.cainiaoshicai.crm.orders.domain.Feedback;
import cn.cainiaoshicai.crm.orders.domain.FeedbackLog;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.support.MyAsyncTask;

/**
 * Created by liuzhr on 8/9/16.
 */
public class FeedbackViewActivity extends AbstractActionBarActivity {
    /**
     * ATTENTION: This was auto-generated to implement the App Indexing API.
     * See https://g.co/AppIndexing/AndroidStudio for more information.
     */
    private GoogleApiClient client;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        this.setContentView(R.layout.user_feedback_view);

        Button add_process_log = (Button) this.findViewById(R.id.add_process_log);

        final Feedback fb = (Feedback) getIntent().getSerializableExtra("fb");
        int fb_id = getIntent().getIntExtra("fb_id", 0);
        if (fb_id == 0 && fb != null) {
            fb_id = fb.getId();
        }

        final FeedbackLogAdapter<FeedbackLog> adapter = new FeedbackLogAdapter<>(this, android.R.layout.simple_list_item_1);
        if (fb != null) {
            adapter.addAll(fb.getLogs());
        }

        ListView lv = (ListView) this.findViewById(R.id.process_logs);
        lv.setAdapter(adapter);

        final FeedbackViewActivity act = FeedbackViewActivity.this;
        if (fb == null || fb.getLogs().isEmpty()) {
            new MyAsyncTask<Integer, Void, Feedback>() {

                @Override
                protected Feedback doInBackground(Integer... params) {
                    String token = GlobalCtx.app().getSpecialToken();
                    UserFeedbackDao dao = new UserFeedbackDao(token);
                    ResultBean<Feedback> fbx = dao.getFeedback(params[0]);
                    if (fbx.isOk()) {
                        if (fbx.getObj() != null) {
                            final List<FeedbackLog> logs = fbx.getObj().getLogs();
                            if (logs != null) {
                                act.runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        adapter.clear();
                                        adapter.addAll(logs);
                                        adapter.notifyDataSetChanged();
                                    }
                                });
                            }
                        }
                    }
                    return null;
                }

            }.executeOnNormal(fb_id);
        }

        if (fb != null) {
            init_view(fb);
        }

        final int feedback_id = fb_id;
        add_process_log.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                final FeedbackViewActivity activity = FeedbackViewActivity.this;
                FeedbackProcessDialogFragment newFragment = new FeedbackProcessDialogFragment();
                newFragment.setCallback(new FeedbackProcessDialogFragment.ProcessLogCallback() {
                    @Override
                    public FeedbackLog done(final String log) {
                        FeedbackLog fb = new FeedbackLog();
                        new MyAsyncTask<FeedbackLog, Void, ResultBean>(){
                            @Override
                            protected ResultBean doInBackground(final FeedbackLog... params) {

                                boolean success;

                                UserFeedbackDao dao = new UserFeedbackDao(GlobalCtx.app().getSpecialToken());
                                ResultBean rb = dao.saveFeedbackLog(feedback_id, log);
                                success = rb.isOk();
                                if (success) {
                                    activity.runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {
                                            adapter.add(params[0]);
                                            adapter.notifyDataSetChanged();
                                        }
                                    });
                                }
                                return null;
                            }
                        }.executeOnNormal(fb);
                        return null;
                    }

                    @Override
                    public FeedbackLog cancel() {
                        Toast.makeText(activity, "取消加入反馈", Toast.LENGTH_LONG).show();
                        return null;
                    }
                });
                newFragment.show(activity.getSupportFragmentManager(), "process_logs");
            }
        });

        // ATTENTION: This was auto-generated to implement the App Indexing API.
        // See https://g.co/AppIndexing/AndroidStudio for more information.
//        client = new GoogleApiClient.Builder(this).addApi(AppIndex.API).build();
    }

    private void init_view(final Feedback fb) {
        TextView fb_source = (TextView) this.findViewById(R.id.feedback_source);
        TextView fb_order_id = (TextView) this.findViewById(R.id.order_id);
        TextView fb_content = (TextView) this.findViewById(R.id.feedback);
        TextView fb_fromUserName = (TextView) this.findViewById(R.id.from_username);

        TextView curr_status = (TextView) this.findViewById(R.id.curr_status);
        TextView curr_processor = (TextView) this.findViewById(R.id.curr_processor);
        fb_order_id.setText(String.valueOf(fb.getFrom_order()));
        fb_order_id.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Intent intent = new Intent(FeedbackViewActivity.this, OrderSingleActivity.class);
                intent.putExtra("order_id", fb.getFrom_order());
                FeedbackViewActivity.this.startActivity(intent);

            }
        });
        fb_source.setText(fb.getSourceName());
        fb_content.setText(fb.getContent());
        fb_fromUserName.setText(fb.getFromUserName());
        curr_status.setText("处理中");
        curr_processor.setText("张蕾");
    }
}