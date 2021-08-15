package cn.cainiaoshicai.crm.orders.domain;

/**
 * Created by liuzhr on 4/2/16.
 */
public class ResultBean<T> {
    private boolean ok;
    private String desc;

    private T obj;

    private int errCode;
    private String errDetail;

    public ResultBean(boolean b, String desc) {
        this.ok = b;
        this.desc = desc;
    }

    public boolean isOk() {
        return ok;
    }

    public void setOk(boolean ok) {
        this.ok = ok;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public static <T> ResultBean<T> exception() {
        return new ResultBean<T>(false, "位置错误");
    }

    public static <T> ResultBean<T> serviceException(String msg) {
        return new ResultBean<T>(false, msg);
    }

    public static ResultBean networkException() {
        return new ResultBean(false, "网络异常");
    }

    public static <T> ResultBean<T> readingFailed() {
        return new ResultBean<T>(false, "数据读取异常");
    }

    public T getObj() {
        return obj;
    }

    public void setObj(T obj) {
        this.obj = obj;
    }

    public int getErrCode() {
        return errCode;
    }

    public void setErrCode(int errCode) {
        this.errCode = errCode;
    }

    public String getErrDetail() {
        return errDetail;
    }

    public void setErrDetail(String errDetail) {
        this.errDetail = errDetail;
    }
}
