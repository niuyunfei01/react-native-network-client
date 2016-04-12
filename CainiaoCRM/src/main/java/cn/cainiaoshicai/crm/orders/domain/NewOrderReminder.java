package cn.cainiaoshicai.crm.orders.domain;

import java.util.Date;

/**
 */
public class NewOrderReminder {

    private int platform;
    private String platform_oid;
    private String consignee_name;
    private String consignee_mobilephone;
    private String consignee_address;
    private Date pay_time;
    private double total_all_price;
    private String expectTimeStr;

    public int getPlatform() {
        return platform;
    }

    public void setPlatform(int platform) {
        this.platform = platform;
    }

    public String getPlatform_oid() {
        return platform_oid;
    }

    public void setPlatform_oid(String platform_oid) {
        this.platform_oid = platform_oid;
    }

    public String getConsignee_name() {
        return consignee_name;
    }

    public void setConsignee_name(String consignee_name) {
        this.consignee_name = consignee_name;
    }

    public String getConsignee_mobilephone() {
        return consignee_mobilephone;
    }

    public void setConsignee_mobilephone(String consignee_mobilephone) {
        this.consignee_mobilephone = consignee_mobilephone;
    }

    public String getConsignee_address() {
        return consignee_address;
    }

    public void setConsignee_address(String consignee_address) {
        this.consignee_address = consignee_address;
    }

    public Date getPay_time() {
        return pay_time;
    }

    public void setPay_time(Date pay_time) {
        this.pay_time = pay_time;
    }

    public double getTotal_all_price() {
        return total_all_price;
    }

    public void setTotal_all_price(double total_all_price) {
        this.total_all_price = total_all_price;
    }

    public String getExpectTimeStr() {
        return expectTimeStr;
    }

    public void setExpectTimeStr(String expectTimeStr) {
        this.expectTimeStr = expectTimeStr;
    }
}
