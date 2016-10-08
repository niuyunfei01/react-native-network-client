package cn.cainiaoshicai.crm.orders.domain.android;

import android.os.Bundle;

import cn.cainiaoshicai.crm.service.ServiceException;

/**
 * User: qii
 * Date: 13-4-16
 */
public class AsyncTaskLoaderResult<E> {
    public E data;
    public ServiceException exception;
    public Bundle args;
}
