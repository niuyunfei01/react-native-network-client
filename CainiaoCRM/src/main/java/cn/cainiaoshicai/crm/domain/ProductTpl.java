package cn.cainiaoshicai.crm.domain;

import java.util.List;

/**
 * Created by shichaopeng on 16/03/2018.
 */

public class ProductTpl {
    private int id;
    private String name;
    private double price;
    private String upc;
    private String description;
    private String brand_id;
    private String brand_name;
    private int weight;
    private String first_category_id;
    private String second_category_id;
    private String third_category_id;
    private List<String> img;

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

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getUpc() {
        return upc;
    }

    public void setUpc(String upc) {
        this.upc = upc;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBrand_id() {
        return brand_id;
    }

    public void setBrand_id(String brand_id) {
        this.brand_id = brand_id;
    }

    public String getBrand_name() {
        return brand_name;
    }

    public void setBrand_name(String brand_name) {
        this.brand_name = brand_name;
    }

    public int getWeight() {
        return weight;
    }

    public void setWeight(int weight) {
        this.weight = weight;
    }

    public String getFirst_category_id() {
        return first_category_id;
    }

    public void setFirst_category_id(String first_category_id) {
        this.first_category_id = first_category_id;
    }

    public String getSecond_category_id() {
        return second_category_id;
    }

    public void setSecond_category_id(String second_category_id) {
        this.second_category_id = second_category_id;
    }

    public String getThird_category_id() {
        return third_category_id;
    }

    public void setThird_category_id(String third_category_id) {
        this.third_category_id = third_category_id;
    }

    public List<String> getImg() {
        return img;
    }

    public void setImg(List<String> img) {
        this.img = img;
    }
}
