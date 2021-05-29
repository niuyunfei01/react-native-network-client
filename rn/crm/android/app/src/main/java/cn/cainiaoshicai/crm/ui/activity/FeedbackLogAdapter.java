package cn.cainiaoshicai.crm.ui.activity;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.domain.FeedbackLog;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;

/**
 * Created by liuzhr on 8/10/16.
 */
public class FeedbackLogAdapter<T extends FeedbackLog> extends ArrayAdapter {

    private final Activity activity;

    public FeedbackLogAdapter(Activity context, int resource) {
        super(context, resource);
        this.activity = context;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder holder;

        LayoutInflater inflater = this.activity.getLayoutInflater();

        if (convertView == null) {
            convertView = inflater.inflate(R.layout.user_feedback_one_log, parent, false);
            holder = new ViewHolder();
            convertView.setTag(holder);
            holder.content = (TextView) convertView.findViewById(R.id.log_content);
            holder.created = (TextView) convertView.findViewById(R.id.log_created);
            holder.userName = (TextView) convertView.findViewById(R.id.log_by_userName);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }

        FeedbackLog item = (FeedbackLog) getItem(position);
        holder.content.setText(item.getLog());
        holder.created.setText(DateTimeUtils.shortYmdHourMin(item.getCreated()));
        holder.userName.setText(item.getBy_userName());

        return convertView;
    }

    private class ViewHolder {
        TextView userName;
        TextView created;
        TextView content;
    }
}
