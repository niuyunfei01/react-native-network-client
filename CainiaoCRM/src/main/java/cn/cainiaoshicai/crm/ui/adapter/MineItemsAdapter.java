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
import android.widget.RelativeLayout;
import android.widget.TextView;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.ui.activity.GeneralWebViewActivity;
import cn.cainiaoshicai.crm.ui.activity.MineActivity;
import cn.cainiaoshicai.crm.ui.activity.UserCommentsActivity;

public class MineItemsAdapter<T extends MineItemsAdapter.PerformanceItem> extends ArrayAdapter<T> {
    int layoutId;
    int textId;
    int imageId;

    public MineItemsAdapter(Activity context) {
        super(context, R.layout.mine_lists, new ArrayList<T>());
        this.layoutId = R.layout.mine_lists;
        this.textId = R.id.text1;
        this.imageId = R.id.storage_item_status;
    }

    public View getView(int pos, View convertView, ViewGroup parent) {
        LayoutInflater inflater = ((Activity)getContext()).getLayoutInflater();
        ViewHolder holder;

        if (convertView == null) {
            convertView = inflater.inflate(layoutId, null);

            holder = new ViewHolder();
            holder.text = (TextView) convertView.findViewById(textId);
            holder.icon = (ImageView) convertView.findViewById(this.imageId);
            holder.statusLabel = (TextView) convertView.findViewById(R.id.text_device_status);

            holder.delayedOverview = convertView.findViewById(R.id.delayed_overview);
            holder.lastWeekRatio = (TextView) convertView.findViewById(R.id.last_week_in_time_ratio);
            holder.toadyInTimeRatio = (TextView) convertView.findViewById(R.id.today_in_time_ratio);
            holder.lastWeekReadyTime = (TextView) convertView.findViewById(R.id.last_week_avg_ready_time);
            holder.todayReadyTime = (TextView) convertView.findViewById(R.id.toady_avg_ready_time);
            holder.viewAllLate = (Button) convertView.findViewById(R.id.btn_view_all_late);
            holder.viewManLate = (Button) convertView.findViewById(R.id.btn_view_man_late);
            holder.viewAllSerious = (Button) convertView.findViewById(R.id.btn_view_all_serious);

            holder.user_rst_overview = (RelativeLayout) convertView.findViewById(R.id.user_rst_overview);
            holder.week_new_user = (TextView)convertView.findViewById(R.id.week_new_user);
            holder.week_retent_user = (TextView)convertView.findViewById(R.id.week_retent_user);
            holder.total_complain_todo = (TextView) convertView.findViewById(R.id.total_complain_todo);
            holder.total_complain_done = (TextView) convertView.findViewById(R.id.total_complain_done);

            convertView.setTag(holder);
        } else {
            holder = (ViewHolder) convertView.getTag();
        }

        TextView label = holder.text;


        T item = this.getItem(pos);
        label.setText(item.getName());

        if (item.getType() == MineActivity.TYPE_ORDER_DELAYED) {
            holder.delayedOverview.setVisibility(View.VISIBLE);
            holder.statusLabel.setVisibility(View.GONE);

            ArrayList<Object> params = item.getParams();
            MineActivity.StatInTime statInTime = null;
            if (params != null && params.size() > 0) {
                statInTime = (MineActivity.StatInTime) params.get(0);
            }

            holder.lastWeekRatio.setText("上周准点率: " + (statInTime != null && statInTime.inTimeRatioLastWeek != null ? String.format("%.1f%%", statInTime.inTimeRatioLastWeek * 100) : "-"));
            holder.toadyInTimeRatio.setText("今日准点率: " + (statInTime != null && statInTime.inTimeRatioToday != null ? String.format("%.1f%%",  statInTime.inTimeRatioToday * 100) : "-"));

            holder.lastWeekReadyTime.setText("上周25分出库率:" + (statInTime != null && statInTime.avgReadyTimeLastWeek != null ? String.format("%.1f%%", statInTime.avgReadyTimeLastWeek * 100) : "-"));
            holder.todayReadyTime.setText("今日25分出库率:" + (statInTime != null && statInTime.avgReadyTimeToday != null ? String.format("%.1f%%", statInTime.avgReadyTimeToday * 100) : "-"));

            holder.viewAllLate.setText("延误" + ((statInTime.getTotalLate() != null && statInTime.getTotalLate() > 0) ? String.format("%s", statInTime.getTotalLate()) : "0"));
            holder.viewAllSerious.setText("严重" + ((statInTime.getTotalSeriousLate() != null && statInTime.getTotalSeriousLate() > 0) ? String.format("%s", statInTime.getTotalSeriousLate()) : "0"));

            holder.viewAllLate.setOnClickListener(new ToSearchBtnListener("delayed:yes"));
            holder.viewAllSerious.setOnClickListener(new ToSearchBtnListener("delayed:serious"));
            holder.viewManLate.setOnClickListener(new ToSearchBtnListener("delayed:yes|||ship:" + Cts.ID_DADA_MANUAL_WORKER));

            holder.delayedOverview.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent i = new Intent(v.getContext(), GeneralWebViewActivity.class);
                    i.putExtra("url", GlobalCtx.getInstance().getUrl("delay_analysis.main", true));
                    v.getContext().startActivity(i);
                }
            });
        } else if(item.getType() == MineActivity.TYPE_USER_ITEMS){
            holder.user_rst_overview.setVisibility(View.VISIBLE);
            holder.user_rst_overview.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    v.getContext().startActivity(new Intent(v.getContext(), UserCommentsActivity.class));
                }
            });
        }else {
            if (item.getCount() >= 0) {
                holder.statusLabel.setText(String.valueOf(item.getCount()));
            }
        }

        if (item.getType() != MineActivity.TYPE_ORDER_DELAYED) {
            holder.delayedOverview.setVisibility(View.GONE);
        }

        if (item.getType() != MineActivity.TYPE_USER_ITEMS) {
            holder.total_complain_done.setVisibility(View.GONE);
            holder.total_complain_todo.setVisibility(View.GONE);
            holder.week_new_user.setVisibility(View.GONE);
            holder.week_retent_user.setVisibility(View.GONE);
        }

        holder.icon.setImageResource(R.drawable.arrow);

        return (convertView);
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

    static class ViewHolder {
        TextView text;
        ImageView icon;
        TextView statusLabel;


        public View delayedOverview;
        public TextView lastWeekRatio;
        public TextView toadyInTimeRatio;
        public TextView lastWeekReadyTime;
        public TextView todayReadyTime;
        public Button viewAllLate;
        public Button viewAllSerious;
        public Button viewManLate;


        public RelativeLayout user_rst_overview;


        public TextView week_new_user;
        public TextView week_retent_user;
        public TextView total_complain_todo;
        public TextView total_complain_done;
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
