package cn.cainiaoshicai.crm.orders.domain;

/**
 * Created by liuzhr on 8/10/16.
 */
public class ResultObject<T> extends ResultBean {
    private T obj;

    public ResultObject(boolean b, String desc) {
        super(b, desc);
    }

    public ResultObject(ResultBean errBean) {
        this(errBean.isOk(), errBean.getDesc());
    }

    public T getObj() {
        return obj;
    }

    public void setObj(T obj) {
        this.obj = obj;
    }
}
