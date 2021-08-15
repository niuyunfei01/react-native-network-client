package cn.cainiaoshicai.crm.ui.adapter;

import android.app.Activity;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.domain.Feedback;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;

/**
 * Created by liuzhr on 8/8/16.
 */
public class FeedbackAdapter<T> extends ArrayAdapter<T> {

    public FeedbackAdapter(Context context, int resource) {
        super(context, resource);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {

        ViewHolder v;
        if (convertView == null) {
            // inflate the layout
            LayoutInflater inflater = ((Activity) this.getContext()).getLayoutInflater();
            convertView = inflater.inflate(R.layout.user_feedback_one_row, parent, false);
            v = new ViewHolder();
            v.id = (TextView) convertView.findViewById(R.id.feedbackId);
            v.userName = (TextView) convertView.findViewById(R.id.fb_from_user);
            v.reportAt = (TextView) convertView.findViewById(R.id.fb_reported_at);
            v.statusTxt = (TextView) convertView.findViewById(R.id.fb_status);
            v.content = (TextView) convertView.findViewById(R.id.fb_content);

            convertView.setTag(v);
        } else {
            v = (ViewHolder) convertView.getTag();
        }

        // object item based on the position
        Feedback fb = (Feedback) this.getItem(position);

        v.id.setText("#" + fb.getId());
        v.userName.setText(fb.getFromUserName());
        v.reportAt.setText(DateTimeUtils.mdHourMinCh(fb.getReported_at()));
        v.statusTxt.setText(fb.getStatusTxt());
        v.content.setText(fb.getContent());

        return convertView;
    }


    class ViewHolder {
        public TextView id;
        public TextView userName;
        public TextView reportAt;
        public TextView statusTxt;
        public TextView content;
    }
}
