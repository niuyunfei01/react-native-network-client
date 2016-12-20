package cn.cainiaoshicai.crm.domain;

import java.util.List;

import static android.R.attr.id;

/**
 * Created by liuzhr on 10/27/16.
 */

public class ProductEstimate {

    static public class Item {
        private float sold_day_normal;
        private float sold_end;
        private int to_ready;
        private int product_id;
        private String name;

        public float getSold_day_normal() {
            return sold_day_normal;
        }

        public void setSold_day_normal(float sold_day_normal) {
            this.sold_day_normal = sold_day_normal;
        }

        public float getSold_end() {
            return sold_end;
        }

        public void setSold_end(float sold_end) {
            this.sold_end = sold_end;
        }

        public int getTo_ready() {
            return to_ready;
        }

        public void setTo_ready(int to_ready) {
            this.to_ready = to_ready;
        }

        public int getProduct_id() {
            return product_id;
        }

        public void setProduct_id(int product_id) {
            this.product_id = product_id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    private String day;
    private int store_id;
    private List<Item> lists;

    public int getStore_id() {
        return store_id;
    }

    public void setStore_id(int store_id) {
        this.store_id = store_id;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public List<Item> getLists() {
        return lists;
    }

    public void setLists(List<Item> lists) {
        this.lists = lists;
    }
}
