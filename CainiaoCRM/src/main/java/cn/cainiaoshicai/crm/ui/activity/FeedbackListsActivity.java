package cn.cainiaoshicai.crm.ui.activity;

import android.app.SearchManager;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.ActionBar;
import android.text.TextUtils;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.Spinner;

import java.util.ArrayList;
import java.util.HashMap;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.orders.dao.UserFeedbackDao;
import cn.cainiaoshicai.crm.orders.domain.Feedback;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultList;
import cn.cainiaoshicai.crm.orders.view.OrderSingleActivity;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.adapter.FeedbackAdapter;
import cn.cainiaoshicai.crm.ui.helper.StoreSpinnerHelper;
import cn.cainiaoshicai.crm.ui.helper.StoreSpinnerHelper.StoreChangeCallback;

public class FeedbackListsActivity extends AbstractActionBarActivity {

    private SwipeRefreshLayout swipeRefreshLayout;
    private FeedbackAdapter<Feedback> adapter;
    private ArrayList<Order> data = new ArrayList<Order>();

    private ListType listType = ListType.NONE;
    private String searchTerm = "";
    private Store currStore = null;

    @Override
    public void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);

        Intent gog = new Intent(this, GeneralWebViewActivity.class);
        String url = String.format("%s/vm/index.html?time=%d&access_token=%s#!/home", URLHelper.WEB_URL_ROOT, System.currentTimeMillis(), GlobalCtx.getApplication().getSpecialToken());
        gog.putExtra("url", url);
        startActivity(gog);
//
//
//        if (savedInstanceState == null) {
//            this.setContentView(R.layout.user_feedback_list_all);
//
//        ActionBar bar = this.getSupportActionBar();
//            bar.setDisplayShowHomeEnabled(false);
//            bar.setDisplayUseLogoEnabled(false);
//            bar.setDisplayHomeAsUpEnabled(false);
//
//            bar.setCustomView(R.layout.store_list_in_title);
//
//            Spinner currStoreSpinner = (Spinner) bar.getCustomView().findViewById(R.id.spinner_curr_store);
//            StoreSpinnerHelper.initStoreSpinner(this, null, new StoreChangeCallback(){
//                @Override
//                public void changed(Store newStore) {
//                }
//
//            },  true, currStoreSpinner);
//
//            bar.setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM
//                    | ActionBar.DISPLAY_SHOW_HOME);
//
//            ListView listView = (ListView) findViewById(R.id.user_feedback_list);
//            adapter = new FeedbackAdapter<>(this, android.R.layout.activity_list_item);
//            listView.setAdapter(adapter);
//
//            listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
//                @Override
//                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
//                    Feedback item = adapter.getItem(position);
//                    if (item != null) {
//                        Intent openFeedback = new Intent(FeedbackListsActivity.this, FeedbackWebViewActivity.class);
//                        openFeedback.putExtra("fb", item);
//                        openFeedback.putExtra("fb_id", item.getId());
//                        try {
//                            FeedbackListsActivity.this.startActivity(openFeedback);
//                        } catch (Exception e) {
//                            e.printStackTrace();
//                        }
//                    }
//                }
//            });
//
//            swipeRefreshLayout = (SwipeRefreshLayout) findViewById(R.id.list_order_view);
//            swipeRefreshLayout.setColorSchemeResources(android.R.color.holo_blue_bright,
//                    android.R.color.holo_green_light, android.R.color.holo_orange_light, android.R.color.holo_red_light);
//            swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
//                @Override
//                public void onRefresh() {
//                    onTypeChanged();
//                }
//            });
//
//            // Get the intent, verify the action and userTalkStatus the query
//            Intent intent = getIntent();
//
//            ListType foundType = ListType.findByType(intent.getIntExtra("list_type", 0));
//            if (foundType != null) {
//                this.listType = foundType;
//            }
//
//            if (Intent.ACTION_SEARCH.equals(intent.getAction())) {
//                this.searchTerm = intent.getStringExtra(SearchManager.QUERY);
//            } else {
//                String query = intent.getStringExtra("query");
//                if (!TextUtils.isEmpty(query)) {
//                    this.searchTerm = query;
//                }
//            }
//
//            onTypeChanged();
//            setTitle(String.format("%s客诉%s", this.listType.getName(), TextUtils.isEmpty(this.searchTerm)?"" : ("中搜索：" + searchTerm)));
//        }
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return super.onCreateOptionsMenu(menu);
    }

    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.menu_process:
                startActivity(new Intent(getApplicationContext(), MainActivity.class));
                return true;
            case R.id.menu_accept:
                GlobalCtx.getApplication().toTaskListActivity();
                return true;
            case R.id.menu_search:
                this.onSearchRequested();
                return true;
            case R.id.menu_mine:
                startActivity(new Intent(getApplicationContext(), MineActivity.class));
                return true;
            case R.id.menu_user_feedback:
                return true;
            default:
                return super.onOptionsItemSelected(item);
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