package cn.cainiaoshicai.crm.orders.domain;

/**
 * Created by liuzhr on 4/2/16.
 */
public class ResultBean {
    private boolean ok;
    private String desc;

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

    public static ResultBean exception() {
        return new ResultBean(false, "位置错误");
    }

    public static ResultBean networkException() {
        return new ResultBean(false, "网络异常");
    }

    public static ResultBean readingFailed() {
        return new ResultBean(false, "数据读取异常");
    }
}
