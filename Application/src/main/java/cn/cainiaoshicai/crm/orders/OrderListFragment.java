package cn.cainiaoshicai.crm.orders;

import android.app.Fragment;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v4.widget.SwipeRefreshLayout.OnRefreshListener;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.adapter.OrderAdapter;
import cn.cainiaoshicai.crm.orders.dao.OrdersDao;
import cn.cainiaoshicai.crm.orders.domain.MessageBean;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.orders.service.OrderService;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.database.table.MentionWeiboTimeLineDBTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

public class OrderListFragment extends Fragment {

	private SwipeRefreshLayout swipeRefreshLayout;
	private ListView listView;
	private OrderAdapter adapter;
	private ArrayList<Order> data = new ArrayList<Order>();;
    private OrderService orderService = GlobalCtx.getInstance().getOrderService();

    private int listType;
    private Date orderDay = new Date();

    public void setListType(final int listType) {
        this.listType = listType;
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
                openOrder.putExtra("order_id", ((Order)adapter.getItem(position)).getId());
                try {
                    getActivity().startActivity(openOrder);
                }catch (Exception e){
                    e.printStackTrace();
                }
            }
        });

        onListTypeChanged();

		swipeRefreshLayout = (SwipeRefreshLayout) v.findViewById(R.id.list_order_view);
		swipeRefreshLayout.setColorSchemeResources(android.R.color.holo_blue_bright,
				android.R.color.holo_green_light, android.R.color.holo_orange_light, android.R.color.holo_red_light);
			swipeRefreshLayout.setOnRefreshListener(new OnRefreshListener() {
                @Override
                public void onRefresh() {
                    new RefreshOrderListTask().executeOnNormal();
                }
            });

	}

    private void onListTypeChanged() {
        new RefreshOrderListTask().executeOnNormal();
    }


    private class RefreshOrderListTask
            extends MyAsyncTask<Void, List<Order>, List<Order>> {

//        List<String> msgIds;

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
//            msgIds = new ArrayList<String>();
//            List<Order> msgList = getList().getItemList();
//            for (MessageBean msg : msgList) {
//                if (msg != null) {
//                    msgIds.add(msg.getId());
//                }
//            }
        }

        @Override
        protected List<Order> doInBackground(Void... params) {
            try {
                OrderContainer oc = new OrdersDao(GlobalCtx.getInstance().getSpecialToken(),
                        orderDay, listType).get();
                ArrayList<Order> orders = new ArrayList<>();
                if (oc != null) {
                    orders.addAll(oc.getOrders());
                }
                 return orders;
            } catch (ServiceException e) {
                cancel(true);
                return null;
            }
        }

        @Override
        protected void onPostExecute(List<Order> value) {
            super.onPostExecute(value);
            if (getActivity() == null || value == null) {
                return;
            }

//            MentionWeiboTimeLineDBTask.asyncReplace(getList(), accountBean.getUid());
            data.addAll(value);
            getAdapter().notifyDataSetChanged();
            swipeRefreshLayout.setRefreshing(false);

            AppLogger.d("display data:" + data.size());
        }
    }

}
