package cn.cainiaoshicai.crm.domain;

import java.util.List;

public class SupplierOrder {

    private int id;

    private int supplierId;

    private String supplierName;

    private String date;

    private List<SupplierOrderItem> items;

    private String createName;


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(int supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<SupplierOrderItem> getItems() {
        return items;
    }

    public void setItems(List<SupplierOrderItem> items) {
        this.items = items;
    }

    public String getCreateName() {
        return createName;
    }

    public void setCreateName(String createName) {
        this.createName = createName;
    }
}
