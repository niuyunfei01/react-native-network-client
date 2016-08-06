package cn.cainiaoshicai.crm.ui.loader;

import android.support.v4.app.FragmentActivity;
import android.support.v4.widget.SwipeRefreshLayout;
import android.text.TextUtils;
import android.widget.Toast;

import java.util.List;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.dao.OrdersDao;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.ProgressFragment;

/**
 * Created by liuzhr on 8/3/16.
 */
public class RefreshOrderListTask
        extends MyAsyncTask<Void, List<Order>, OrderContainer> {

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

    public RefreshOrderListTask(FragmentActivity activity, String searchTerm,
                                ListType listType, SwipeRefreshLayout swipeRefreshLayout, OrderQueriedDone doneCallback) {
        this.activity = activity;
        this.searchTerm = searchTerm;
        this.listType = listType;
        this.swipeRefreshLayout = swipeRefreshLayout;

        this.doneCallback = doneCallback;
        if (!TextUtils.isEmpty(this.searchTerm)) {
            progressFragment = ProgressFragment.newInstance(R.string.searching);
        }
    }

    @Override
    protected void onPreExecute() {
        super.onPreExecute();

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
            String token = GlobalCtx.getInstance().getSpecialToken();
            OrdersDao ordersDao = new OrdersDao(token, this.listType.getValue());
            if (TextUtils.isEmpty(searchTerm)) {
                return ordersDao.get();
            } else {
                return ordersDao.search(searchTerm, this.listType.getValue());
            }
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
        if (progressFragment != null) {
            progressFragment.dismissAllowingStateLoss();
        }
        Toast.makeText(this.activity, "已取消：" + this.error, Toast.LENGTH_LONG).show();
    }

    @Override
    protected void onPostExecute(final OrderContainer value) {
        super.onPostExecute(value);
        swipeRefreshLayout.setRefreshing(false);
        if (progressFragment != null) {
            progressFragment.dismissAllowingStateLoss();
        }

        if (doneCallback != null) {
            doneCallback.done(value, this.error);
        }
    }
}
