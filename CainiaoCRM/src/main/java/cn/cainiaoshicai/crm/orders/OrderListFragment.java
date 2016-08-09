package cn.cainiaoshicai.crm.orders;

import android.app.Fragment;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.Toast;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.adapter.OrderAdapter;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.ui.loader.RefreshOrderListTask;

public class OrderListFragment extends Fragment {

	private SwipeRefreshLayout swipeRefreshLayout;
    private OrderAdapter adapter;
	private ArrayList<Order> data = new ArrayList<Order>();

    private ListType listType;
    private String searchTerm;

    public void setDayAndType(final ListType listType) {
        this.listType = listType;
        this.searchTerm = "";
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
        ListView listView = (ListView) v.findViewById(R.id.orderListView);
        ListType listType = this.listType;
        if (listType == null) {
            AppLogger.e("null list type!");
            return;
        }
        adapter = new OrderAdapter(getActivity(), data, listType.getValue());
		listView.setAdapter(adapter);

        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent openOrder = new Intent(getActivity(), OrderSingleActivity.class);
                Order item = (Order) adapter.getItem(position);
                openOrder.putExtra("id", item.getId());
                openOrder.putExtra("list_type", OrderListFragment.this.listType.getValue());
                openOrder.putExtra("order", item);
                try {
                    getActivity().startActivity(openOrder);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });


		swipeRefreshLayout = (SwipeRefreshLayout) v.findViewById(R.id.list_order_view);
		swipeRefreshLayout.setColorSchemeResources(android.R.color.holo_blue_bright,
                android.R.color.holo_green_light, android.R.color.holo_orange_light, android.R.color.holo_red_light);
			swipeRefreshLayout.setOnRefreshListener(new OnRefreshListener() {
                @Override
                public void onRefresh() {
                    onTypeChanged();
                }
            });

        onTypeChanged();
	}

    private void onTypeChanged() {
        if (adapter != null) {
            FragmentActivity activity = (FragmentActivity) this.getActivity();
            RefreshOrderListTask task = new RefreshOrderListTask(activity, searchTerm, listType, swipeRefreshLayout, new QueryDoneCallback());
            task.executeOnNormal();
        }
    }

    public void executeSearch(ListType listType, String query) {
        this.listType = listType;
        this.searchTerm = query;
    }

    private class QueryDoneCallback implements RefreshOrderListTask.OrderQueriedDone {
        @Override
        public void done(final OrderContainer value, String error) {

            final OrderListFragment orderListFragment = OrderListFragment.this;

            if (OrderListFragment.this.getActivity() == null) {
                return;
            }

            if (value != null) {
                orderListFragment.data.clear();
                orderListFragment.data.addAll(value.getOrders());
                orderListFragment.getAdapter().notifyDataSetChanged();

                for (final Order order : value.getOrders()) {
                    if (order.shouldTryAutoPrint()
                            && order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_READY
                            && GlobalCtx.isAutoPrint(order.getStore_id())) {
                        OrderPrinter.printWhenNeverPrinted(order.getPlatform(), order.getPlatform_oid(), new OrderPrinter.PrintCallback() {
                            @Override
                            public void run(boolean result, String desc) {
                                orderListFragment.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        order.incrPrintTimes();
                                        orderListFragment.getAdapter().notifyDataSetChanged();
                                    }
                                });
                            }
                        });
                    }
                }

                final MainActivity context = (MainActivity) orderListFragment.getActivity();
                context.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        context.updateStatusCnt(value.getTotals(), orderListFragment.searchTerm != null);
                    }
                });

                AppLogger.d("display data:" + orderListFragment.data.size());
            } else {
                Toast.makeText(orderListFragment.getActivity(), "发生错误：" + error, Toast.LENGTH_LONG).show();
            }
        }
    }
}
