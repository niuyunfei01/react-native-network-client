package cn.cainiaoshicai.crm.ui.activity;

import android.app.SearchManager;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.text.TextUtils;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ListView;
import android.widget.RadioButton;
import android.widget.RadioGroup;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.adapter.OrderAdapter;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.ui.loader.RefreshOrderListTask;

public class OrderQueryActivity extends AbstractActionBarActivity {

    private SwipeRefreshLayout swipeRefreshLayout;
    private OrderAdapter adapter;
    private ArrayList<Order> data = new ArrayList<Order>();

    private ListType listType = ListType.NONE;
    private String searchTerm = "";
    private int selected_store = Cts.STORE_ALL;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (savedInstanceState == null) {
            this.setContentView(R.layout.order_query);

            this.getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            RadioGroup rg = (RadioGroup) findViewById(R.id.order_q_store_filter);
            Button queryBtn = (Button) findViewById(R.id.order_query_search);
            queryBtn.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    onTypeChanged();
                }
            });

            ListView listView = (ListView) findViewById(R.id.order_query_list_view);
            adapter = new OrderAdapter(this, data, this.listType.getValue());
            listView.setAdapter(adapter);

            listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    Intent openOrder = new Intent(OrderQueryActivity.this, OrderSingleActivity.class);
                    Order item = (Order) adapter.getItem(position);
                    openOrder.putExtra("id", item.getId());
                    openOrder.putExtra("list_type", listType);
                    openOrder.putExtra("order", item);
                    try {
                        OrderQueryActivity.this.startActivity(openOrder);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });

            swipeRefreshLayout = (SwipeRefreshLayout) findViewById(R.id.order_query_swipe);
            swipeRefreshLayout.setColorSchemeResources(android.R.color.holo_blue_bright,
                    android.R.color.holo_green_light, android.R.color.holo_orange_light, android.R.color.holo_red_light);
            swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
                @Override
                public void onRefresh() {
                    onTypeChanged();
                }
            });

            // Get the intent, verify the action and get the query
            Intent intent = getIntent();

            ListType foundType = ListType.findByType(intent.getIntExtra("list_type", 0));
            if (foundType != null) {
                this.listType = foundType;
            }

            if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
                this.searchTerm = intent.getStringExtra(SearchManager.QUERY);
            } else {
                String query = intent.getStringExtra("query");
                if (!TextUtils.isEmpty(query)) {
                    this.searchTerm = query;
                }
            }

            onTypeChanged();
            setTitle(String.format("%s订单%s", this.listType.getName(), TextUtils.isEmpty(this.searchTerm)?"" : ("中搜索：" + searchTerm)));
        }
    }

    public void onStoreFilterClicked(View view) {
        // Is the button now checked?
        boolean checked = ((RadioButton) view).isChecked();

        // Check which radio button was clicked
        switch(view.getId()) {
            case R.id.order_q_store_all:
                if (checked)
                    selected_store = Cts.STORE_ALL;
                    break;
            case R.id.order_q_store_hlg:
                if (checked)
                    selected_store = Cts.STORE_HLG;
                    break;
            case R.id.order_q_store_yyc:
                if (checked)
                    selected_store = Cts.STORE_YYC;
                    break;
            case R.id.order_q_store_unknown:
                if (checked)
                    selected_store = Cts.STORE_UNKNOWN;
                    break;
        }
    }

    private void onTypeChanged() {
        if (adapter != null) {
            RefreshOrderListTask.OrderQueriedDone callback = new RefreshOrderListTask.OrderQueriedDone() {
                @Override
                public void done(OrderContainer value, String error) {
                    if (value != null) {
                        OrderQueryActivity.this.data.clear();
                        OrderQueryActivity.this.data.addAll(value.getOrders());
                        adapter.notifyDataSetChanged();
                    }
                }
            };

            ListType lt = listType;
            String term = this.searchTerm;
            if (this.selected_store != Cts.STORE_ALL) {
                term = "store:" + selected_store;
                lt = ListType.NONE;
            }
            new RefreshOrderListTask(this, term, lt, this.swipeRefreshLayout, callback).executeOnNormal();
        }
    }

}