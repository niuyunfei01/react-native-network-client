package cn.cainiaoshicai.crm.orders.dao;

import android.text.TextUtils;

import java.io.IOException;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.util.TextUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import retrofit2.Call;

/**
 */
public class OrdersDao {


    public OrderContainer get(int listType, long[] storeIds, int limit, int offset, int maxPastDays, boolean zitiMode) throws ServiceException {

        int zitiType = zitiMode ? 1 : 0;
        String store_id_str = TextUtil.join(",", storeIds);
        final String search = storeIds != null && storeIds.length > 0 ? String.format("store:%s", store_id_str) : "";

        Call<ResultBean<OrderContainer>> rc = GlobalCtx.app().dao.orders2(listType, limit, offset, maxPastDays, zitiType, search);

        ResultBean<OrderContainer> res;
        try {
            res = rc.execute().body();

            if (!res.isOk()) {
                throw new ServiceException("获取失败：" + res.getDesc());
            }
        } catch (IOException e) {
            throw new ServiceException("获取失败:" + e.getMessage());
        }

        return res.getObj();
    }

    public OrderContainer search(String searchTerm, int listType, long[] storeIds, int limit, int offset, int maxPastDays, boolean zitiMode)
            throws ServiceException {

        String store_id_str = TextUtil.join(",", storeIds);
        if (storeIds != null && storeIds.length > 0 ) {
            if (!TextUtils.isEmpty(searchTerm)) {
                searchTerm += "|||store:" + store_id_str;
            } else {
                searchTerm = store_id_str;
            }
        }

        int zitiType = -1;
        Call<ResultBean<OrderContainer>> rc = GlobalCtx.app().dao.orders2(listType, limit, offset, maxPastDays, zitiType, searchTerm);

        ResultBean<OrderContainer> res = null;
        try {
            res = rc.execute().body();

            if (!res.isOk()) {
                throw new ServiceException("获取失败：" + res.getDesc());
            }
        } catch (IOException e) {
            throw new ServiceException("获取失败:" + e.getMessage());
        }

        return res.getObj();
    }
}
