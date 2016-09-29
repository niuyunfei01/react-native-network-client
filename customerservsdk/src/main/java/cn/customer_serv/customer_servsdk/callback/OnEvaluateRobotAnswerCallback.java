package cn.customer_serv.customer_servsdk.callback;

/**
 * 作者:王浩 邮件:bingoogolapple@gmail.com
 * 创建时间:16/7/21 下午2:46
 * 描述:
 */
public interface OnEvaluateRobotAnswerCallback extends OnFailureCallBack {

    void onSuccess(String message);

}