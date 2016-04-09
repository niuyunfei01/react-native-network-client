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

public class BluetoothItemAdapter<T extends BluetoothPrinters.DeviceStatus> extends ArrayAdapter<T> {
    Activity context;
    int layoutId;
    int textId;
    int imageId;

    public BluetoothItemAdapter(Activity context, int layoutId, int textId, int imageId) {
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

        BluetoothPrinters.DeviceStatus deviceStatus = this.getItem(pos);
        label.setText(deviceStatus.getName() + " " + deviceStatus.getAddr());

        String statusText = deviceStatus.isBound() ? (deviceStatus.isConnected() ? "已连接" : "未连接") : "未配对";
        statusLabel.setText(statusText);

        ImageView icon = (ImageView) row.findViewById(imageId);
        icon.setImageResource(R.drawable.arrow);

        return (row);
    }

    @Override
    public void clear() {
        super.clear();
    }

}