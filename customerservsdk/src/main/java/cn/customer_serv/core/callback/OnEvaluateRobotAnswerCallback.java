package cn.customer_serv.core.callback;

/**
 * Created by liuzhr on 9/29/16.
 */
public interface OnEvaluateRobotAnswerCallback {
    void onFailure(int code, String message);

    void onSuccess(String message);
}
