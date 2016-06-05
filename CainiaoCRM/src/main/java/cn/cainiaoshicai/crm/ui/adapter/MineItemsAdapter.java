package cn.cainiaoshicai.crm.ui.adapter;

import android.app.Activity;
import android.app.SearchManager;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.ui.activity.MineActivity;

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


        T item = this.getItem(pos);
        label.setText(item.getName());

        TextView statusLabel = (TextView) row.findViewById(R.id.text_device_status);

        if (item.getType() == MineActivity.TYPE_ORDER_DELAYED) {
            View delayedOverview = row.findViewById(R.id.delayed_overview);
            delayedOverview.setVisibility(View.VISIBLE);
            statusLabel.setVisibility(View.GONE);

            ArrayList<Object> params = item.getParams();
            MineActivity.StatInTime statInTime = null;
            if (params != null && params.size() > 0) {
                statInTime = (MineActivity.StatInTime) params.get(0);
            }

            TextView lastWeekRatio = (TextView) row.findViewById(R.id.last_week_in_time_ratio);
            TextView toadyInTimeRatio = (TextView) row.findViewById(R.id.today_in_time_ratio);

            lastWeekRatio.setText("上周准点率: " + (statInTime != null && statInTime.inTimeRatioLastWeek != null ? String.format("%.1f%%", statInTime.inTimeRatioLastWeek * 100) : "-"));
            toadyInTimeRatio.setText("今日准点率: " + (statInTime != null && statInTime.inTimeRatioToday != null ? String.format("%.1f%%",  statInTime.inTimeRatioToday * 100) : "-"));

            TextView lastWeekReadyTime = (TextView) row.findViewById(R.id.last_week_avg_ready_time);
            TextView todayReadyTime = (TextView) row.findViewById(R.id.toady_avg_ready_time);
            lastWeekReadyTime.setText("上周20分出库率:" + (statInTime != null && statInTime.avgReadyTimeLastWeek != null ? String.format("%.1f%%", statInTime.avgReadyTimeLastWeek * 100) : "-"));
            todayReadyTime.setText("今日20分出库率:" + (statInTime != null && statInTime.avgReadyTimeToday != null ? String.format("%.1f%%", statInTime.avgReadyTimeToday * 100) : "-"));

            Button viewAllLate = (Button) row.findViewById(R.id.btn_view_all_late);
            Button viewAllSerious = (Button) row.findViewById(R.id.btn_view_all_serious);
            viewAllLate.setText("延误" + ((statInTime.getTotalLate() != null && statInTime.getTotalLate() > 0) ? String.format("%s单", statInTime.getTotalLate()) : "订单"));
            viewAllSerious.setText("严重延误" + ((statInTime.getTotalSeriousLate() != null && statInTime.getTotalSeriousLate() > 0) ? String.format("%s单", statInTime.getTotalSeriousLate()) : "订单"));

            viewAllLate.setOnClickListener(new ToSearchBtnListener("delayed:yes"));
            viewAllSerious.setOnClickListener(new ToSearchBtnListener("delayed:serious"));
        } else {
            if (item.getCount() >= 0) {
                statusLabel.setText(String.valueOf(item.getCount()));
            }

        }

        ImageView icon = (ImageView) row.findViewById(imageId);
        icon.setImageResource(R.drawable.arrow);

        return (row);
    }

    static public class PerformanceItem {
        private String name;
        private int count;
        private int type;

        private ArrayList<Object> params;

        public PerformanceItem(String name, int count, int type, ArrayList<Object> params) {
            this.name = name;
            this.count = count;
            this.type = type;
            this.params = params;
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

        public ArrayList<Object> getParams() {
            return params;
        }
    }

    private static class ToSearchBtnListener implements View.OnClickListener {

        private String searchQuery;

        public ToSearchBtnListener(String searchQuery) {
            this.searchQuery = searchQuery;
        }

        @Override
        public void onClick(View v) {
            Intent intent = new Intent(v.getContext(), MainActivity.class);
            intent.setAction(Intent.ACTION_SEARCH);
            intent.putExtra(SearchManager.QUERY, searchQuery);
            v.getContext().startActivity(intent);
        }
    }
}
