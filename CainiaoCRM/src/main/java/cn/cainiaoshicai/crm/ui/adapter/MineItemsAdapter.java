package cn.cainiaoshicai.crm.ui.adapter;

import android.app.Activity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.print.BluetoothPrinters;

public class MineItemsAdapter<T extends MineItemsAdapter.PerformanceItem> extends ArrayAdapter<T> {
    Activity context;
    int layoutId;
    int textId;
    int imageId;

    public MineItemsAdapter(Activity context, int layoutId, int textId, int imageId) {
        super(context, layoutId, new ArrayList<T>());

        this.context = context;
        this.layoutId = layoutId;
        this.textId = textId;
        this.imageId = imageId;
    }

    public View getView(int pos, View convertView, ViewGroup parent) {
        LayoutInflater inflater = context.getLayoutInflater();
        View row = inflater.inflate(layoutId, null);
        TextView label = (TextView) row.findViewById(textId);

        TextView statusLabel = (TextView) row.findViewById(R.id.text_device_status);

        T item = this.getItem(pos);
        label.setText(item.getName());

        if (item.getCount() >= 0) {
            statusLabel.setText(String.valueOf(item.getCount()));
        }

        ImageView icon = (ImageView) row.findViewById(imageId);
        icon.setImageResource(R.drawable.arrow);

        return (row);
    }

    @Override
    public void clear() {
        super.clear();
    }


    static public class PerformanceItem {
        private String name;
        private int count;
        private int type;

        public PerformanceItem(String name, int count, int type) {
            this.name = name;
            this.count = count;
            this.type = type;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }

        public int getType() {
            return type;
        }

        public void setType(int type) {
            this.type = type;
        }
    }
}
