package cn.cainiaoshicai.crm.domain;

import cn.cainiaoshicai.crm.Cts;

/**
 * Created by liuzhr on 3/8/17.
 */
public class Worker {
    private String nickname;
    private String mobilephone;
    private int id;
    private int position;
    private int[] pos_list;

    public Worker(String nickname, String mobilephone, int userId) {
        this.nickname = nickname;
        this.mobilephone = mobilephone;
        this.id = userId;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getMobilephone() {
        return mobilephone;
    }

    public void setMobilephone(String mobilephone) {
        this.mobilephone = mobilephone;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public boolean isExtShipWorker() {
        return this.getPosition() == Cts.POSITION_EXT_SHIP;
    }

    public int[] getPos_list() {
        return pos_list;
    }

    public void setPos_list(int[] pos_list) {
        this.pos_list = pos_list;
    }
}
