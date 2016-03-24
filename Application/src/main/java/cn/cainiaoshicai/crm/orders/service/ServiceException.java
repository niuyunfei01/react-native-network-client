package cn.cainiaoshicai.crm.orders.service;

import android.content.res.Resources;
import android.text.TextUtils;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.GlobalCtx;

/**
 */
public class ServiceException extends Exception {

    private Throwable ex;

    public ServiceException(Throwable ex) {
        this.ex = ex;
    }

    public ServiceException(String detailMessage, Throwable ex) {
        super(detailMessage);
        this.ex = ex;
        this.error = detailMessage;
    }

    public ServiceException(String detailMessage, Throwable throwable, Throwable ex) {
        this.error = detailMessage;
        this.ex = ex;
    }

    public ServiceException(Throwable throwable, Throwable ex) {
        super(throwable);
        this.ex = ex;
    }

    private String error;
    //this error string is from sina weibo request return
    private String oriError;
    private int error_code;

    public ServiceException() {

    }

    public String getError() {

        String result;

        if (!TextUtils.isEmpty(error)) {
            result = error;
        } else {

            String name = "code" + error_code;
            int i = GlobalCtx.getInstance().getResources()
                    .getIdentifier(name, "string", GlobalCtx.getInstance().getPackageName());

            try {
                result = GlobalCtx.getInstance().getString(i);

            } catch (Resources.NotFoundException e) {

                if (!TextUtils.isEmpty(oriError)) {
                    result = oriError;
                } else {

                    result = GlobalCtx.getInstance().getString(R.string.unknown_error_error_code) + error_code;
                }
            }
        }

        return result;
    }

    @Override
    public String getMessage() {
        return getError();
    }


    public void setError_code(int error_code) {
        this.error_code = error_code;
    }

    public int getError_code() {
        return error_code;
    }


    public ServiceException(String detailMessage) {
        error = detailMessage;
    }

    public void setOriError(String oriError) {
        this.oriError = oriError;
    }

}
