package cn.cainiaoshicai.crm.ui.activity;

import android.app.Fragment;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.NewOrderDao;
import cn.cainiaoshicai.crm.orders.domain.NewOrderReminder;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.ui.adapter.NewOrderReminderAdapter;

public class NewOrderFragment extends Fragment {

	private SwipeRefreshLayout swipeRefreshLayout;
	private ListView listView;
	private NewOrderReminderAdapter adapter;
	private ArrayList<NewOrderReminder> data = new ArrayList<>();

    private int listType;

    public void setType(final RemindersActivity.ListType listType) {
        this.listType = listType.getValue();
        onTypeChanged();
    }

    @Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
		View v = inflater.inflate(R.layout.order_list, container, false);
		init(v);
		return v;
	}

    public NewOrderReminderAdapter getAdapter() {
        return adapter;
    }

    private void init(View v) {
		listView = (ListView) v.findViewById(R.id.orderListView);
		adapter = new NewOrderReminderAdapter(getActivity(), data);
		listView.setAdapter(adapter);

        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Log.d(GlobalCtx.ORDERS_TAG, "list item view clicked");
                Intent openOrder = new Intent(getActivity(), OrderSingleActivity.class);
                NewOrderReminder item = (NewOrderReminder) adapter.getItem(position);
                openOrder.putExtra("platform_oid", item.getPlatform_oid());
                openOrder.putExtra("platform_id", item.getPlatform());
                openOrder.putExtra("list_type", listType);
                openOrder.putExtra("from", "new_order");
                try {
                    getActivity().startActivity(openOrder);
                }catch (Exception e){
                    e.printStackTrace();
                }
            }
        });

        onTypeChanged();

		swipeRefreshLayout = (SwipeRefreshLayout) v.findViewById(R.id.list_order_view);
		swipeRefreshLayout.setColorSchemeResources(android.R.color.holo_blue_bright,
				android.R.color.holo_green_light, android.R.color.holo_orange_light, android.R.color.holo_red_light);
			swipeRefreshLayout.setOnRefreshListener(new OnRefreshListener() {
                @Override
                public void onRefresh() {
                    onTypeChanged();
                }
            });

	}

    private void onTypeChanged() {
        if (adapter != null) {
            new RefreshOrderListTask(this.listView).executeOnNormal();
        }
    }


    private class RefreshOrderListTask
            extends MyAsyncTask<Void,List<NewOrderReminder>,List<NewOrderReminder>> {

        private ListView listView;
        private String error;

        public RefreshOrderListTask(ListView listView) {

            this.listView = listView;
        }

        @Override
        protected List<NewOrderReminder> doInBackground(Void... params) {
            try {
                String token = GlobalCtx.getInstance().getSpecialToken();
                return new NewOrderDao(token).newOrders();
            } catch (ServiceException e) {
                cancel(true);
                this.error = e.getMessage();
                return null;
            }
        }

        @Override
        protected void onCancelled(List<NewOrderReminder> newOrderReminders) {
            swipeRefreshLayout.setRefreshing(false);
            if (error != null) {
                Toast.makeText(getActivity(), error, Toast.LENGTH_SHORT).show();
            }
        }

        @Override
        protected void onCancelled() {
            this.onCancelled(null);
        }

        @Override
        protected void onPostExecute(final List<NewOrderReminder> value) {
            super.onPostExecute(value);
            if (getActivity() == null) {
                return;
            }

            if (value != null) {
                data.clear();
                data.addAll(value);
                getAdapter().notifyDataSetChanged();
                AppLogger.d("display data:" + data.size());
            }

            swipeRefreshLayout.setRefreshing(false);
        }
    }

}
