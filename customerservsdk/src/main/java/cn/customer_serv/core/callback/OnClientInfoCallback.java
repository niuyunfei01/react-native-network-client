package cn.customer_serv.core.callback;

/**
 * Created by liuzhr on 9/29/16.
 */
public interface OnClientInfoCallback {
    void onSuccess();

    void onFailure(int code, String message);
}
