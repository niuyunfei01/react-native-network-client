package cn.cainiaoshicai.crm.ui.adapter;

import android.app.Activity;
import android.support.v4.content.ContextCompat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.domain.StorageItem;

public class StorageItemAdapter<T extends StorageItem> extends ArrayAdapter<T> {
    Activity context;

    public StorageItemAdapter(Activity context, ArrayList<T> objects) {
        super(context, R.layout.storage_status_row, objects);

        this.context = context;
    }

    public View getView(int pos, View convertView, ViewGroup parent) {
        LayoutInflater inflater = context.getLayoutInflater();
        View row = inflater.inflate(R.layout.storage_status_row, null);

        TextView label = (TextView) row.findViewById(R.id.product_name);
        TextView statusLabel = (TextView) row.findViewById(R.id.total_last_stat);
        TextView totalSold = (TextView) row.findViewById(R.id.total_sold);

        StorageItem item = this.getItem(pos);
        label.setText(item.getIdAndNameStr());

        statusLabel.setText(item.getTotal_last_stat() + "份");
        totalSold.setText(item.getTotal_sold() + "份");

        return (row);
    }

    @Override
    public void clear() {
        super.clear();
    }

}