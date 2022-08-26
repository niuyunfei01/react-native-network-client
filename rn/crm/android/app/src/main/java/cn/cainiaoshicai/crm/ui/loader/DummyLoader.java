package cn.cainiaoshicai.crm.ui.loader;

import android.content.Context;

import androidx.loader.content.AsyncTaskLoader;

import cn.cainiaoshicai.crm.orders.domain.android.AsyncTaskLoaderResult;

/**
 * User: qii
 * Date: 13-5-15
 */
public class DummyLoader<T> extends AsyncTaskLoader<AsyncTaskLoaderResult<T>> {
    public DummyLoader(Context context) {
        super(context);
    }

    @Override
    protected void onStartLoading() {
        super.onStartLoading();
        forceLoad();
    }

    @Override
    public AsyncTaskLoaderResult<T> loadInBackground() {
        return null;
    }
}
