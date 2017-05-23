package cn.cainiaoshicai.crm.domain;

import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 * Created by liuzhr on 6/29/16.
 */
public class StorageItem {

    public static final int STORE_SELF_PROVIDED = 1;
    public static final int STORE_COMMON_PROVIDED = 0;

    public static final int STORE_PROD_ON_SALE = 1;
    public static final int STORE_PROD_OFF_SALE = 3;
    public static final int STORE_PROD_SOLD_OUT = 2;

    public static final int RE_ON_SALE_OFF_WORK = 1;
    public static final int RE_ON_SALE_PROVIDED = 2;
    public static final int RE_ON_SALE_MANUAL = 3;
    public static final int RE_ON_SALE_NONE = 4; //长期下架

    private int id;
    private String name;
    private int total_last_stat;
    private int total_sold;
    private int left_since_last_stat;
    private int product_id;
    private int status;
    private int self_provided;
    private int risk_min_stat;
    private int sold_5day;
    private int sold_weekend;
    private int store_id;

    private int totalInReq;
    private String reqMark;

    private int when_sale_again;
    private String tag_code;
    private int price;

    public int getProduct_id() {
        return product_id;
    }

    public void setProduct_id(int product_id) {
        this.product_id = product_id;
    }

    public StorageItem() {
    }

    public StorageItem(int id, String name, int total_last_stat, int total_sold) {
        this.id = id;
        this.name = name;
        this.total_last_stat = total_last_stat;
        this.total_sold = total_sold;
    }

    public int getWhen_sale_again() {
        return when_sale_again;
    }

    public void setWhen_sale_again(int when_sale_again) {
        this.when_sale_again = when_sale_again;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getTotal_last_stat() {
        return total_last_stat;
    }

    public void setTotal_last_stat(int total_last_stat) {
        this.total_last_stat = total_last_stat;
    }

    public int getTotal_sold() {
        return total_sold;
    }

    public void setTotal_sold(int total_sold) {
        this.total_sold = total_sold;
    }

    public String pidAndNameStr() {
        return this.pidAndNameStr(true);
    }

    public String pidAndNameStr(boolean limit) {
        String name = getName();

        if (name == null) {
            AppLogger.e("name is null, pid=" + this.getProduct_id() + ", store_id=" + this.getStore_id());
        }

        if (name != null && limit){
            int maxLen = 12;
            if (name.length() > maxLen) {
                name = name.substring(0, maxLen);
            }
        }
        return String.format("%s#%s", product_id, name);
    }

    public String nameAndPidStr() {
        String name = getName();
        return String.format("%s#%s", name, product_id);
    }

    public int getLeft_since_last_stat() {
        return left_since_last_stat;
    }

    public void setLeft_since_last_stat(int left_since_last_stat) {
        this.left_since_last_stat = left_since_last_stat;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public int getSelf_provided() {
        return self_provided;
    }

    public void setSelf_provided(int self_provided) {
        this.self_provided = self_provided;
    }

    public int getRisk_min_stat() {
        return risk_min_stat;
    }

    public void setRisk_min_stat(int risk_min_stat) {
        this.risk_min_stat = risk_min_stat;
    }

    public  String getStatusText() {
        if (this.status == STORE_PROD_ON_SALE) {
            return (this.getLeft_since_last_stat() >= this.risk_min_stat)? "正常" : "告急";
        }
        return this.status == STORE_PROD_OFF_SALE? "下架" : (this.status == STORE_PROD_SOLD_OUT? "缺货" : "不明");
    }

    public String getProvideTypeText() {
        return (self_provided>0 ? "自采" : "直供");
    }

    @Override
    public String toString() {
        return pidAndNameStr();
    }

    public int getSold_5day() {
        return sold_5day;
    }

    public void setSold_5day(int sold_5day) {
        this.sold_5day = sold_5day;
    }

    public int getSold_weekend() {
        return sold_weekend;
    }

    public void setSold_weekend(int sold_weekend) {
        this.sold_weekend = sold_weekend;
    }

    public int getTotalInReq() {
        return totalInReq;
    }

    public void setTotalInReq(int totalInReq) {
        this.totalInReq = totalInReq;
    }

    public String getReqMark() {
        return reqMark;
    }

    public void setReqMark(String reqMark) {
        this.reqMark = reqMark;
    }

    public static String getDesc(int when_sale_again) {
        if (when_sale_again == RE_ON_SALE_OFF_WORK) {
            return "下班后";
        } else if (when_sale_again == RE_ON_SALE_PROVIDED) {
            return "来货后";
        } else if (when_sale_again == RE_ON_SALE_MANUAL) {
            return "手动";
        } else if (when_sale_again == RE_ON_SALE_NONE) {
            return "-";
        }
        return "未设置";
    }

    public int getStore_id() {
        return store_id;
    }

    public void setStore_id(int store_id) {
        this.store_id = store_id;
    }

    public String getTag_code() {
        return tag_code;
    }

    public void setTag_code(String tag_code) {
        this.tag_code = tag_code;
    }

    public String getPricePrecision() {
        return String.format("￥%.2f", (double)this.price/100);
    }

    public void setPrice(int price) {
        this.price = price;
    }
}
