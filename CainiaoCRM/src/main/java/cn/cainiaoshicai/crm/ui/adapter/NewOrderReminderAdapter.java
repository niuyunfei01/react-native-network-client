package cn.cainiaoshicai.crm.ui.adapter;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.Date;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.domain.NewOrderReminder;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 */
public class NewOrderReminderAdapter extends BaseAdapter {

    private final Activity activity;
    private ArrayList<NewOrderReminder> orders = new ArrayList<>();
    private static LayoutInflater inflater = null;

    public NewOrderReminderAdapter(Activity activity, ArrayList<NewOrderReminder> orders) {
        this.activity = activity;
        this.orders = orders;
        inflater = (LayoutInflater) activity.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
    }

    @Override
    public int getCount() {
        return orders.size();
    }

    @Override
    public Object getItem(int i) {
        return orders.get(i);
    }

    @Override
    public long getItemId(int i) {
        return i;
    }

    @SuppressLint("SetTextI18n")
    @Override
    public View getView(int i, View vi, ViewGroup viewGroup) {

        if (vi == null)
            vi = inflater.inflate(R.layout.order_list_one, null);

        TextView expect_time = (TextView) vi.findViewById(R.id.expect_time);
        TextView orderAddr = (TextView) vi.findViewById(R.id.address);
        TextView userName = (TextView) vi.findViewById(R.id.userName);
        TextView phone = (TextView) vi.findViewById(R.id.phone_text);
        TextView genderText = (TextView) vi.findViewById(R.id.gender_text);
        TextView orderMoney = (TextView) vi.findViewById(R.id.total_money);
        TextView orderTime = (TextView) vi.findViewById(R.id.orderTime);
        TextView dayNo = (TextView) vi.findViewById(R.id.dayNo);
        TextView sourcePlatform = (TextView) vi.findViewById(R.id.source_platform);


        try {
            final NewOrderReminder order = orders.get(i);

            DateTimeUtils instance = DateTimeUtils.getInstance(vi.getContext());

            expect_time.setText(order.getExpectTimeStr());

            orderAddr.setText(order.getConsignee_address());
            userName.setText(order.getConsignee_name());
            phone.setText(order.getConsignee_mobilephone());
            genderText.setText("");
            orderMoney.setText(String.format("%.2f", order.getTotal_all_price()));

            orderTime.setText(instance.getShortTime(order.getPay_time()));

            String platformName = Constants.Platform.find(order.getPlatform()).name;
            sourcePlatform.setText(platformName);
        }catch (Exception e) {
            AppLogger.e("display a row:" + i + ": " + e.getMessage(), e);
        }
        return vi;
    }
}
