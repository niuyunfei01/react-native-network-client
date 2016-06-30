package cn.cainiaoshicai.crm.domain;

import java.util.Date;

/**
 * Created by liuzhr on 6/30/16.
 */
public class Product {
    private int id;
    private String name;
    private Date created;
    private String coverImg;
    private float price;
    private int comment_nums;
    private float original_price;
    private String listimg;
    private int published;
    private String promote_name;

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

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public String getCoverImg() {
        return coverImg;
    }

    public void setCoverImg(String coverImg) {
        this.coverImg = coverImg;
    }

    public float getPrice() {
        return price;
    }

    public void setPrice(float price) {
        this.price = price;
    }

    public int getComment_nums() {
        return comment_nums;
    }

    public void setComment_nums(int comment_nums) {
        this.comment_nums = comment_nums;
    }

    public float getOriginal_price() {
        return original_price;
    }

    public void setOriginal_price(float original_price) {
        this.original_price = original_price;
    }

    public String getListimg() {
        return listimg;
    }

    public void setListimg(String listimg) {
        this.listimg = listimg;
    }

    public int getPublished() {
        return published;
    }

    public void setPublished(int published) {
        this.published = published;
    }

    public String getPromote_name() {
        return promote_name;
    }

    public void setPromote_name(String promote_name) {
        this.promote_name = promote_name;
    }

    //
//    "id": "979",
//            "name": "精选蒿子秆 1份（约350克）",
//            "created": "2015-12-28 19:34:18",
//            "brand_id": "206",
//            "coverimg": "https://dn-kdt-img.qbox.me/upload_files/2015/12/22/Fplb__YWqrm0QCuUMF7Yby4B7E8V.jpg",
//            "promote_name": "",
//            "comment_nums": "3",
//            "price": "2.99",
//            "original_price": null,
//            "slug": "yz_160443570_1yjzpihxjnlg1",
//            "specs": null,
//            "published": "1",
//            "listimg": "https://dn-kdt-img.qbox.me/upload_files/2015/12/22/Fplb__YWqrm0QCuUMF7Yby4B7E8V.jpg!120x120.jpg",
//            "product_alias": null
}
