package cn.cainiaoshicai.crm.orders;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.Fragment;
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
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.print.BasePrinter;
import cn.cainiaoshicai.crm.support.print.OrderPrinter;
import cn.cainiaoshicai.crm.support.react.MyReactActivity;
import cn.cainiaoshicai.crm.ui.loader.RefreshOrderListTask;

public class OrderListFragment extends Fragment {

    public static final String ARG_TYPE = "ARG_TYPE";
    public static final String ARG_STORE_ID = "ARG_STORE_ID";

	private SwipeRefreshLayout swipeRefreshLayout;
    private OrderAdapter adapter;
	private ArrayList<Order> data = new ArrayList<Order>();

    private ListType listType;
    public static OrderListFragment newInstance(final ListType listType) {
        Bundle args = new Bundle();
        args.putInt(ARG_TYPE, listType.getValue());

        AppLogger.d("OrderListFragment newInstance " + listType);

        OrderListFragment fragment = new OrderListFragment();
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        int listTypeInt = getArguments().getInt(ARG_TYPE);
        listType = ListType.findByType(listTypeInt);

        AppLogger.i("create OrderListFragment with: listType=" + listTypeInt);
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
        if (this.listType == null) {
            AppLogger.e("null list type!");
            return;
        }
        adapter = new OrderAdapter(getActivity(), data, this.listType.getValue());
		listView.setAdapter(adapter);

        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                FragmentActivity act = getActivity();
                if (act != null) {
                    Intent openOrder = new Intent(act, MyReactActivity.class);
                    Order item = (Order) adapter.getItem(position);
                    openOrder.putExtra("order_id", Long.valueOf(item.getId()));
                    openOrder.putExtra("list_type", OrderListFragment.this.listType.getValue());
                    openOrder.putExtra("order", item);
                    try {
                        act.startActivity(openOrder);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
        });


		swipeRefreshLayout = (SwipeRefreshLayout) v.findViewById(R.id.list_order_view);
		swipeRefreshLayout.setColorSchemeResources(android.R.color.holo_blue_bright,
                android.R.color.holo_green_light, android.R.color.holo_orange_light, android.R.color.holo_red_light);
			swipeRefreshLayout.setOnRefreshListener(new OnRefreshListener() {
                @Override
                public void onRefresh() {
                    refresh(true);
                }
            });

        refresh();
	}

    public void refresh() {
        this.refresh(false);
    }

    public void refresh(boolean byPassCache) {
        AppLogger.d("do refresh..., byPassCache= " + byPassCache + ", adapter=" + adapter);
        if (adapter != null) {
            FragmentActivity activity = this.getActivity();
            RefreshOrderListTask task = new RefreshOrderListTask(activity, SettingUtility.listenStoreIds(), listType,
                   0,  swipeRefreshLayout, new QueryDoneCallback(this), byPassCache);
            task.executeOnNormal();
        }
    }

    private static class QueryDoneCallback implements RefreshOrderListTask.OrderQueriedDone {
        private final OrderListFragment fragment;

        QueryDoneCallback(OrderListFragment fragment) {
            this.fragment = fragment;
        }

        @Override
        public void done(final OrderContainer value, String error) {

            if (fragment.getActivity() == null) {
                return;
            }

            if (value != null) {
                for (final Order order : value.getOrders()) {
                    if (order.shouldTryAutoPrint()
                            && order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_READY
                            && GlobalCtx.isAutoPrint(order.getStore_id())) {
                        OrderPrinter.printWhenNeverPrinted(order.getPlatform(), order.getPlatform_oid(), new BasePrinter.PrintCallback() {
                            @Override
                            public void run(boolean result, String desc) {
                                fragment.getActivity().runOnUiThread(new Runnable() {
                                    @Override
                                    public void run() {
                                        order.incrPrintTimes();
                                        fragment.getAdapter().notifyDataSetChanged();
                                    }
                                });
                            }
                        });
                    }
                }

                final MainActivity context = (MainActivity) fragment.getActivity();

                //notify reset on main thread
                context.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        fragment.data.clear();
                        fragment.data.addAll(value.getOrders());
                        fragment.getAdapter().notifyDataSetChanged();
                        context.updateStatusCnt(value.getTotals());
                    }
                });

                AppLogger.d("display data: type=" + fragment.listType.getValue() + ", size=" + fragment.data.size());
            } else {
                Toast.makeText(fragment.getActivity(), "发生错误：" + error, Toast.LENGTH_LONG).show();
            }
        }
    }
}
