package cn.cainiaoshicai.crm.ui.adapter;

import android.app.Activity;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.domain.StorageItem;

public class StorageItemAdapter<T extends StorageItem> extends ArrayAdapter<T> {
    private List<StorageItem> backendData = new ArrayList<>();
    Activity context;

    public StorageItemAdapter(Activity context, ArrayList<T> objects) {
        super(context, R.layout.storage_status_row, objects);
        this.backendData.addAll(objects);
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
            holder.sold_5day = (TextView) row.findViewById(R.id.sold_5day);
            holder.sold_weekend = (TextView) row.findViewById(R.id.sold_weekend);

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
        holder.sold_5day.setText("1-5:"+ (item.getSold_5day()/5));
        holder.sold_weekend.setText("末:"+ (item.getSold_weekend()/2));

        return (convertView);
    }

    @Override
    public void clear() {
        super.clear();
    }

    public void filter(String text) {
        this.clear();
        if (!TextUtils.isEmpty(text)) {

            int id = 0;
            if (text.indexOf("#") > 0) {
                id = Integer.parseInt(text.substring(0, text.indexOf("#")));
            } else {
                try {
                    id = Integer.parseInt(text);
                } catch (Exception e) {
                }
            }

            for (StorageItem item : this.backendData) {
                if (id > 0 && item.getId() == id) {
                    ((StorageItemAdapter<StorageItem>) this).add(item);
                    break;
                } else {
                    if (item.getIdAndNameStr().contains(text)) {
                        ((StorageItemAdapter<StorageItem>) this).add(item);
                    }
                }
            }
        } else {
            ((StorageItemAdapter<StorageItem>) this).addAll(this.backendData);
        }

        this.notifyDataSetChanged();
    }

    class ViewHolder {
        TextView label;
        TextView leftNumber;
        TextView sold_5day;
        TextView sold_weekend;

        TextView prodStatus;
        TextView provideType;
        TextView riskNum;
    }
}