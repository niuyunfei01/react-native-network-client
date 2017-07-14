package cn.cainiaoshicai.crm.domain;

/**
 * Created by liuzhr on 7/6/17.
 */

public class ShipCallOption {
    private int way;
    private String name;
    private String estimate;

    public int getWay() {
        return way;
    }

    public void setWay(int way) {
        this.way = way;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEstimate() {
        return estimate;
    }

    public void setEstimate(String estimate) {
        this.estimate = estimate;
    }

    public String desc() {
        return this.name + "(" + estimate + ")";
    }
}
