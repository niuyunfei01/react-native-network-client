package cn.customer_serv.core.callback;

/**
 * Created by liuzhr on 9/29/16.
 */
public interface OnGetMQClientIdCallBackOn {
    void onSuccess(String mqClientId);

    void onFailure(int code, String message);
}
