package cn.cainiaoshicai.crm.ui.activity;

import android.app.SearchManager;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.text.TextUtils;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.UserFeedbackDao;
import cn.cainiaoshicai.crm.orders.domain.Feedback;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultList;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.ui.adapter.FeedbackAdapter;

public class FeedbackListsActivity extends AbstractActionBarActivity {

    private SwipeRefreshLayout swipeRefreshLayout;
    private FeedbackAdapter<Feedback> adapter;
    private ArrayList<Order> data = new ArrayList<Order>();

    private ListType listType = ListType.NONE;
    private String searchTerm = "";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (savedInstanceState == null) {
            this.setContentView(R.layout.order_list);

            this.getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            ListView listView = (ListView) findViewById(R.id.orderListView);
            adapter = new FeedbackAdapter<>(this, android.R.layout.activity_list_item);
            listView.setAdapter(adapter);

            listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    Intent openFeedback = new Intent(FeedbackListsActivity.this, FeedbackViewActivity.class);
                    Feedback item = adapter.getItem(position);
                    openFeedback.putExtra("fb", item);
                    try {
                        FeedbackListsActivity.this.startActivity(openFeedback);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });


            swipeRefreshLayout = (SwipeRefreshLayout) findViewById(R.id.list_order_view);
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
            setTitle(String.format("%s客诉%s", this.listType.getName(), TextUtils.isEmpty(this.searchTerm)?"" : ("中搜索：" + searchTerm)));
        }

    }

    private void onTypeChanged() {
        if (adapter != null) {
            new MyAsyncTask<Void, Void, Void>() {
                @Override
                protected Void doInBackground(Void... params) {
                    UserFeedbackDao dao = new UserFeedbackDao(GlobalCtx.getInstance().getSpecialToken());
                    final ResultList<Feedback> results = dao.getFeedbackList(Integer.MAX_VALUE);
                    if (results.isOk()) {
                        FeedbackListsActivity.this.runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                adapter.clear();
                                adapter.addAll(results.getList());
                                adapter.notifyDataSetChanged();
                            }
                        });
                    }

                    return null;
                }
            }.executeOnNormal();
        }
    }

}