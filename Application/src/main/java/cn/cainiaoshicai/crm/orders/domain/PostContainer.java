package cn.cainiaoshicai.crm.orders.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.HashMap;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PostContainer extends ApiInvokeResult {

    @JsonProperty("orders")
    private ArrayList<Order> posts;

    @JsonProperty("bookedUidNames")
    private HashMap<Integer, String> bookedUidNames = new HashMap<Integer, String>(0);

    public ArrayList<Order> getPosts() {
        return posts;
    }

    public void setPosts(ArrayList<Order> posts) {
        this.posts = posts;
    }

    public HashMap<Integer, String> getBookedUidNames() {
        return bookedUidNames;
    }

    public void setBookedUidNames(HashMap<Integer, String> bookedUidNames) {
        this.bookedUidNames = bookedUidNames;
    }

    @Override
    public String toString() {
        return "OrderContainer{" +
                "bookedUidNames=" + bookedUidNames +
                ", success=" + success +
                ", error=" + error +
                ", posts=" + posts +
                '}';
    }
}