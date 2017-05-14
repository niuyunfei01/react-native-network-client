package cn.cainiaoshicai.crm.domain;

import java.util.List;

/**
 * Created by liuzhr on 5/14/17.
 */
public class ShipOptions {
    private int store_id;
    List<String> names;
    List<String> values;

    public int getStore_id() {
        return store_id;
    }

    public void setStore_id(int store_id) {
        this.store_id = store_id;
    }

    public List<String> getNames() {
        return names;
    }

    public void setNames(List<String> names) {
        this.names = names;
    }

    public List<String> getValues() {
        return values;
    }

    public void setValues(List<String> values) {
        this.values = values;
    }

    @Override
    public String toString() {
        return "ShipOptions{" +
                "store_id=" + store_id +
                ", names=" + names +
                ", values=" + values +
                '}';
    }
}
