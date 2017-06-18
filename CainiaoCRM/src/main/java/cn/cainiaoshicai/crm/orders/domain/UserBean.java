package cn.cainiaoshicai.crm.orders.domain;

import android.os.Parcel;
import android.os.Parcelable;

import cn.cainiaoshicai.crm.support.utils.ObjectToStringUtility;

/**
 */
public class UserBean implements Parcelable {

    private String cover_image;
    private String remark;
    private String sex;
    private String mobilephone;
    private String id;
    private String screen_name;
    private String name;
    private String province;
    private String city;
    private String location;
    private String description;
    private long prefer_store;

    public String getCover_image() {
        return cover_image;
    }

    public void setCover_image(String cover_image) {
        this.cover_image = cover_image;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public String getMobilephone() {
        return mobilephone;
    }

    public void setMobilephone(String mobilephone) {
        this.mobilephone = mobilephone;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getScreen_name() {
        return screen_name;
    }

    public void setScreen_name(String screen_name) {
        this.screen_name = screen_name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return ObjectToStringUtility.toString(this);
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(id);
        dest.writeString(screen_name);
        dest.writeString(name);
        dest.writeString(province);
        dest.writeString(city);
        dest.writeString(location);
        dest.writeString(description);
        dest.writeString(sex);
        dest.writeString(mobilephone);
        dest.writeString(cover_image);
        dest.writeString(remark);
        dest.writeLong(prefer_store);

//        dest.writeBooleanArray(new boolean[]{this.following, this.follow_me, this.verified});
    }

    public static final Parcelable.Creator<UserBean> CREATOR =
            new Parcelable.Creator<UserBean>() {
                public UserBean createFromParcel(Parcel in) {
                    UserBean userBean = new UserBean();
                    userBean.id = in.readString();
                    userBean.screen_name = in.readString();
                    userBean.name = in.readString();
                    userBean.province = in.readString();
                    userBean.city = in.readString();
                    userBean.location = in.readString();
                    userBean.description = in.readString();
                    userBean.sex = in.readString();
                    userBean.mobilephone = in.readString();
                    userBean.cover_image = in.readString();
                    userBean.remark = in.readString();
                    userBean.prefer_store = in.readLong();

//                    boolean[] booleans = new boolean[3];
//                    in.readBooleanArray(booleans);
//                    userBean.following = booleans[0];
//                    userBean.follow_me = booleans[1];
//                    userBean.verified = booleans[2];

                    return userBean;
                }

                public UserBean[] newArray(int size) {
                    return new UserBean[size];
                }
            };

    @Override
    public boolean equals(Object o) {
        return o instanceof UserBean && id.equals(((UserBean) o).getId());
    }

    @Override
    public int hashCode() {
        return getId().hashCode();
    }

    public long getPrefer_store() {
        return prefer_store;
    }

    public void setPrefer_store(long prefer_store) {
        this.prefer_store = prefer_store;
    }
}
