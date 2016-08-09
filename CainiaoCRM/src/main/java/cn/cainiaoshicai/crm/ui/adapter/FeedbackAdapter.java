package cn.cainiaoshicai.crm.ui.adapter;

import android.app.Activity;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import cn.cainiaoshicai.crm.orders.domain.Feedback;

/**
 * Created by liuzhr on 8/8/16.
 */
public class FeedbackAdapter<T> extends ArrayAdapter<T> {

    public FeedbackAdapter(Context context, int resource) {
        super(context, resource);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
/*
         * The convertView argument is essentially a "ScrapView" as described is Lucas post
         * http://lucasr.org/2012/04/05/performance-tips-for-androids-listview/
         * It will have a non-null value when ListView is asking you recycle the row layout.
         * So, when convertView is not null, you should simply update its contents instead of inflating a new row layout.
         */
        if (convertView == null) {
            // inflate the layout
            LayoutInflater inflater = ((Activity) this.getContext()).getLayoutInflater();
            convertView = inflater.inflate(android.R.layout.simple_list_item_1, parent, false);
        }

        // object item based on the position
        Feedback fb = (Feedback) this.getItem(position);

        // get the TextView and then set the text (item name) and tag (item ID) values
        TextView textViewItem = (TextView) convertView.findViewById(android.R.id.text1);
        textViewItem.setText(fb.getContent());
        textViewItem.setTag(fb.getId());

        return convertView;
    }
}
