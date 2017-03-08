package cn.cainiaoshicai.crm.service;

import android.text.TextUtils;

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


                if (!TextUtils.isEmpty(oriError)) {
                    result = oriError;
                } else {

                    result = "UNKNOWN ERROR:" + error_code;
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
