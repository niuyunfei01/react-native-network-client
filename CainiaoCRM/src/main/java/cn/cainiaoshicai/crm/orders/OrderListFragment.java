package cn.cainiaoshicai.crm.orders;

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
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.adapter.OrderAdapter;
import cn.cainiaoshicai.crm.orders.dao.OrdersDao;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

public class OrderListFragment extends Fragment {

	private SwipeRefreshLayout swipeRefreshLayout;
	private ListView listView;
	private OrderAdapter adapter;
	private ArrayList<Order> data = new ArrayList<Order>();

    private int listType;

    public void setDayAndType(final MainActivity.ListType listType) {
        this.listType = listType.getValue();
        onTypeChanged();
    }

    @Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
		View v = inflater.inflate(R.layout.order_list, container, false);
		init(v);
		return v;
	}

    public OrderAdapter getAdapter() {
        return adapter;
    }

    private void init(View v) {
		listView = (ListView) v.findViewById(R.id.orderListView);
		adapter = new OrderAdapter(getActivity(), data);
		listView.setAdapter(adapter);

        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Log.d(GlobalCtx.ORDERS_TAG, "list item view clicked");
                Intent openOrder = new Intent(getActivity(), OrderSingleActivity.class);
                Order item = (Order) adapter.getItem(position);
                openOrder.putExtra("platform_oid", item.getPlatform_oid());
                openOrder.putExtra("platform_id", item.getPlatform());
                openOrder.putExtra("order_status", item.getOrderStatus());
                openOrder.putExtra("ship_worker_name", item.getShip_worker_name());
                openOrder.putExtra("list_type", listType);
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
            extends MyAsyncTask<Void,List<Order>,OrderContainer> {

        private ListView listView;
        private String error;

        public RefreshOrderListTask(ListView listView) {
            this.listView = listView;
        }

        @Override
        protected OrderContainer doInBackground(Void... params) {
            try {
                String token = GlobalCtx.getInstance().getSpecialToken();
                return new OrdersDao(token, listType).get();
            } catch (ServiceException e) {
//                cancel(true);
                this.error = e.getMessage();
                return null;
            }
        }

        @Override
        protected void onCancelled(OrderContainer orderContainer) {
            this.onCancelled();
        }

        @Override
        protected void onCancelled() {
            swipeRefreshLayout.setRefreshing(false);
            Toast.makeText(getActivity(), "已取消：" + this.error, Toast.LENGTH_LONG).show();
        }

        @Override
        protected void onPostExecute(final OrderContainer value) {
            super.onPostExecute(value);
            if (getActivity() == null) {
                return;
            }

            if (value != null) {
                data.clear();
                data.addAll(value.getOrders());
                getAdapter().notifyDataSetChanged();

                final MainActivity context = (MainActivity) this.listView.getContext();
                context.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        context.updateStatusCnt(value.getTotals());
                    }
                });

                AppLogger.d("display data:" + data.size());
            } else {
                Toast.makeText(getActivity(), "发生错误：" + this.error, Toast.LENGTH_LONG).show();
            }
            swipeRefreshLayout.setRefreshing(false);
        }
    }

}
