package cn.cainiaoshicai.crm.ui.loader;

import android.content.Context;
import android.os.Bundle;
import androidx.loader.content.AsyncTaskLoader;

import cn.cainiaoshicai.crm.orders.domain.android.AsyncTaskLoaderResult;
import cn.cainiaoshicai.crm.service.ServiceException;

/**
 * User: qii
 * Date: 13-5-15
 */
public abstract class AbstractAsyncNetRequestTaskLoader<T>
        extends AsyncTaskLoader<AsyncTaskLoaderResult<T>> {

    private AsyncTaskLoaderResult<T> result;
    private Bundle args;

    public AbstractAsyncNetRequestTaskLoader(Context context) {
        super(context);
    }

    @Override
    protected void onStartLoading() {
        super.onStartLoading();
        if (result == null) {
            forceLoad();
        } else {
            deliverResult(result);
        }
    }

    @Override
    public AsyncTaskLoaderResult<T> loadInBackground() {
        T data = null;
        ServiceException exception = null;

        try {
            data = loadData();
        } catch (ServiceException e) {
            exception = e;
        }

        result = new AsyncTaskLoaderResult<T>();
        result.data = data;
        result.exception = exception;
        result.args = this.args;

        return result;
    }

    protected abstract T loadData() throws ServiceException;

    public void setArgs(Bundle args) {
        if (result != null) {
            throw new IllegalArgumentException("can't setArgs after loader executes");
        }
        this.args = args;
    }
}
