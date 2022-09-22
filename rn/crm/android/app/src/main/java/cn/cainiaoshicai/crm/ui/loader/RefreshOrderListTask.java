package cn.cainiaoshicai.crm.ui.loader;

import android.text.TextUtils;
import android.widget.Toast;

import androidx.fragment.app.FragmentActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.facebook.react.bridge.UiThreadUtil;

import java.util.List;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.OrdersDao;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.ProgressFragment;

/**
 * Created by liuzhr on 8/3/16.
 */
public class RefreshOrderListTask
        extends MyAsyncTask<Void, List<Order>, OrderContainer> {

    private final int maxPastDays;
    private final long[] storeIds;

    public interface OrderQueriedDone {
        void done(OrderContainer value, String error);
    }

    private FragmentActivity activity;
    private String error;
    private ProgressFragment progressFragment;
    private String searchTerm;
    private final ListType listType;
    private SwipeRefreshLayout swipeRefreshLayout;
    private OrderQueriedDone doneCallback;
    private final boolean byPassCache;
    private boolean zitiMode = false;

    public RefreshOrderListTask(FragmentActivity activity, long[] storeIds,
                                ListType listType, int maxPastDays, SwipeRefreshLayout swipeRefreshLayout, OrderQueriedDone doneCallback, boolean byPassCache, boolean zitiMode) {
        this(activity, "", listType, maxPastDays, swipeRefreshLayout, doneCallback, storeIds, byPassCache, zitiMode);
    }

    public RefreshOrderListTask(FragmentActivity activity, String searchTerm,
                                ListType listType, int maxPastDays, SwipeRefreshLayout swipeRefreshLayout, OrderQueriedDone doneCallback, boolean byPassCache) {
        this(activity, searchTerm, listType, maxPastDays, swipeRefreshLayout, doneCallback, null, byPassCache, false);
    }

    private RefreshOrderListTask(FragmentActivity activity, String searchTerm,
                                 ListType listType, int maxPastDays, SwipeRefreshLayout swipeRefreshLayout, OrderQueriedDone doneCallback, long[] storeIds,
                                 boolean byPassCache, boolean zitiMode) {
        this.activity = activity;
        this.searchTerm = searchTerm;
        this.maxPastDays = maxPastDays;
        this.storeIds = storeIds;
        this.listType = listType;
        this.swipeRefreshLayout = swipeRefreshLayout;

        this.doneCallback = doneCallback;
        this.byPassCache = byPassCache;
        this.zitiMode = zitiMode;
        if (this.byPassCache) {
            progressFragment = ProgressFragment.newInstance(R.string.searching);
        }
    }


    @Override
    protected void onPreExecute() {
        super.onPreExecute();
        swipeRefreshLayout.setRefreshing(true);
        if (progressFragment != null) {
            if (this.activity != null) {
                Utility.forceShowDialog(this.activity, progressFragment);
            }
            progressFragment.setAsyncTask(this);
        }
    }

    @Override
    protected OrderContainer doInBackground(Void... params) {
        try {
            String token = GlobalCtx.app().token();
            OrdersDao ordersDao = new OrdersDao(token);
            int listValue = this.listType.getValue();
            int limit = listValue == ListType.DONE.getValue() ? 100 : 1000000;
            int offset = 0;
            if (TextUtils.isEmpty(searchTerm)) {
                return ordersDao.get(listValue, storeIds, !this.byPassCache, limit, offset, this.maxPastDays, this.zitiMode);
            } else {
                return ordersDao.search(searchTerm, listValue, storeIds, limit, offset, this.maxPastDays, this.zitiMode);
            }
        } catch (ServiceException e) {
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
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                swipeRefreshLayout.setRefreshing(false);
                if (progressFragment != null) {
                    progressFragment.dismissAllowingStateLoss();
                }
                Toast.makeText(RefreshOrderListTask.this.activity, "已取消刷新", Toast.LENGTH_LONG).show();
            }
        });
    }

    @Override
    protected void onPostExecute(final OrderContainer value) {
        super.onPostExecute(value);

        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                swipeRefreshLayout.setRefreshing(false);
                if (progressFragment != null) {
                    try {
                        progressFragment.dismissAllowingStateLoss();
                    } catch (Exception e) {
                        AppLogger.e("exception:" + e.getMessage(), e);
                    }
                }
            }
        });

        if (doneCallback != null) {
            doneCallback.done(value, this.error);
        }
    }
}
