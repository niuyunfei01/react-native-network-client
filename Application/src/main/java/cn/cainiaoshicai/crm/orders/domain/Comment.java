package cn.cainiaoshicai.crm.orders.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Date;

public class Comment {

    @JsonProperty("uid")
    private int uid;

    @JsonProperty("commentTime")
    @JsonFormat(shape=JsonFormat.Shape.STRING, pattern="yyyy-MM-dd kk:mm:ss")
    private Date commentDate;

    @JsonProperty("rate")
    private int rate;

    @JsonProperty("comment")
    private String comment;

    public Comment() {
    }

    public Comment(int uid, String comment) {
        this.uid = uid;
        this.comment = comment;
        this.commentDate = new Date(); //应该以服务器时间为准
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Date getCommentDate() {
        return commentDate;
    }

    public void setCommentDate(Date commentDate) {
        this.commentDate = commentDate;
    }

    public int getRate() {
        return rate;
    }

    public void setRate(int rate) {
        this.rate = rate;
    }

    public int getUid() {
        return uid;
    }

    public void setUid(int uid) {
        this.uid = uid;
    }
}
