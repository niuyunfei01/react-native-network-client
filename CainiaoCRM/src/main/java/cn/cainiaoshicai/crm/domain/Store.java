package cn.cainiaoshicai.crm.domain;

/**
 * Created by liuzhr on 6/30/16.
 */
public class Store {
    private String storeName;
    private int storeId;

    public Store() {
    }

    public Store(String storeName, int storeId) {
        this.storeName = storeName;
        this.storeId = storeId;
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public int getStoreId() {
        return storeId;
    }

    public void setStoreId(int storeId) {
        this.storeId = storeId;
    }

    @Override
    public String toString() {
        return storeName;
    }
}
