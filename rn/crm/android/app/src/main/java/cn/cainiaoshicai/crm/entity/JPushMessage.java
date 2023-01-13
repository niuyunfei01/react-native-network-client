package cn.cainiaoshicai.crm.entity;

public class JPushMessage {
    private String speak_word;
    private String type;
    private String order_id;
    private String store_id;
    private Integer platform;
    private String platform_oid;

    public String getSpeak_word() {
        return speak_word;
    }

    public void setSpeak_word(String speak_word) {
        this.speak_word = speak_word;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getOrder_id() {
        return order_id;
    }

    public void setOrder_id(String order_id) {
        this.order_id = order_id;
    }

    public String getStore_id() {
        return store_id;
    }

    public void setStore_id(String store_id) {
        this.store_id = store_id;
    }

    public Integer getPlatform() {
        return platform;
    }

    public void setPlatform(Integer platform) {
        this.platform = platform;
    }

    public String getPlatform_oid() {
        return platform_oid;
    }

    public void setPlatform_oid(String platform_oid) {
        this.platform_oid = platform_oid;
    }
}

