package cn.cainiaoshicai.crm.orders.domain;

import java.util.List;

/**
 * Created by liuzhr on 4/2/16.
 */
public class ResultList<T> extends ResultBean {
    private List<T> list;

    public ResultList(boolean b, String desc) {
        super(b, desc);
    }

    public List<T> getList() {
        return list;
    }

    public void setList(List<T> list) {
        this.list = list;
    }
}
