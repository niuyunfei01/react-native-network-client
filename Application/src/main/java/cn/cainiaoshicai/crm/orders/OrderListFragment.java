package cn.cainiaoshicai.crm.orders;

import android.app.Fragment;
import android.os.Bundle;
import android.os.Handler;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;

import java.util.ArrayList;
import java.util.Random;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.adapter.OrderAdapter;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.service.OrderService;

public class OrderListFragment extends Fragment {

	private SwipeRefreshLayout swipeRefreshLayout;
	private ListView listView;
	private OrderAdapter adapter;
	private ArrayList<Order> data;
    private OrderService orderService = Singleton.getInstance().getOrderService();

    private int listType;

    public void setListType(final int listType) {
        this.listType = listType;
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                data = orderService.getOrders(listType);

                adapter.notifyDataSetChanged();
            }
        }, 100);
    }

    @Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
		View v = inflater.inflate(R.layout.order_list, container, false);
		init(v);
		return v;
	}

	private void init(View v) {
		listView = (ListView) v.findViewById(R.id.orderListView);
		data = new ArrayList<Order>();
		adapter = new OrderAdapter(getActivity(), data);
		listView.setAdapter(adapter);
		
		swipeRefreshLayout = (SwipeRefreshLayout) v.findViewById(R.id.list_order_view);
		swipeRefreshLayout.setColorSchemeResources(android.R.color.holo_blue_bright,
				android.R.color.holo_green_light, android.R.color.holo_orange_light, android.R.color.holo_red_light);
			swipeRefreshLayout.setOnRefreshListener(new OnRefreshListener() {
			@Override
			public void onRefresh() {
				new Handler().postDelayed(new Runnable() {
					public void run() {
						adapter.notifyDataSetChanged();

						swipeRefreshLayout.setRefreshing(false);
					}
				}, 3000);
			}
		});

	}
}
