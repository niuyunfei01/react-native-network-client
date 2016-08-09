package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import org.w3c.dom.Text;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.UserFeedbackDao;
import cn.cainiaoshicai.crm.orders.domain.Feedback;
import cn.cainiaoshicai.crm.support.MyAsyncTask;

/**
 * Created by liuzhr on 8/9/16.
 */
public class FeedbackViewActivity extends AbstractActionBarActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        this.setContentView(R.layout.user_feedback_view);

        TextView fb_source = (TextView) this.findViewById(R.id.feedback_source);
        TextView fb_content = (TextView) this.findViewById(R.id.feedback);
        TextView fb_fromUserName = (TextView) this.findViewById(R.id.from_username);

        Feedback fb = (Feedback) getIntent().getSerializableExtra("fb");
        if (fb == null) {
            new MyAsyncTask<Integer, Void, Feedback>() {

                @Override
                protected Feedback doInBackground(Integer... params) {
                    String token = GlobalCtx.getInstance().getSpecialToken();
                    UserFeedbackDao dao = new UserFeedbackDao(token);
                    Feedback fb = dao.getFeedback(params[0]);
                    return fb;
                }

            }.executeOnNormal();
            return;
        }

        fb_source.setText(fb.getSourceName());
        fb_content.setText(fb.getContent());
        fb_fromUserName.setText(fb.getFromUserName());
    }
}