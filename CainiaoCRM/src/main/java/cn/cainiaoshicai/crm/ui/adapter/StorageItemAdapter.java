package cn.cainiaoshicai.crm.ui.adapter;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
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

        ViewHolder holder;
        if (convertView != null) {
            holder = (ViewHolder) convertView.getTag();
        } else {
            holder = new ViewHolder();
            LayoutInflater inflater = context.getLayoutInflater();
            View row = inflater.inflate(R.layout.storage_status_row, null);

            holder.label = (TextView) row.findViewById(R.id.product_name);
            holder.leftNumber = (TextView) row.findViewById(R.id.total_last_stat);
            holder.totalSold = (TextView) row.findViewById(R.id.total_sold);

            holder.prodStatus = (TextView) row.findViewById(R.id.store_prod_status);
            holder.provideType = (TextView) row.findViewById(R.id.product_provide_type);
            holder.riskNum = (TextView) row.findViewById(R.id.lowest_risk_num);

            convertView = row;
            convertView.setTag(holder);
        }

        StorageItem item = this.getItem(pos);
        holder.label.setText(item.getIdAndNameStr());

        holder.prodStatus.setText(item.getStatusText());
        holder.provideType.setText(item.getProvideTypeText());
        holder.riskNum.setText("安全库存: " + item.getRisk_min_stat());

        holder.leftNumber.setText(item.getLeft_since_last_stat() + "份");
        holder.totalSold.setText(item.getTotal_sold() + "份");

        return (convertView);
    }

    @Override
    public void clear() {
        super.clear();
    }


    class ViewHolder {
        TextView label;
        TextView leftNumber;
        TextView totalSold;

        TextView prodStatus;
        TextView provideType;
        TextView riskNum;
    }
}