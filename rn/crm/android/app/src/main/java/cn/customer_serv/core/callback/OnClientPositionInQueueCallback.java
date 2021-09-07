package cn.customer_serv.core.callback;

/**
 * Created by liuzhr on 9/29/16.
 */
public abstract class OnClientPositionInQueueCallback {
    public abstract void onSuccess(int position);

    public abstract void onFailure(int code, String message);
}
