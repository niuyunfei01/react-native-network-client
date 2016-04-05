package cn.cainiaoshicai.crm.orders.domain;

import android.os.Parcel;
import android.os.Parcelable;
import android.text.TextUtils;

import cn.cainiaoshicai.crm.support.utils.ObjectToStringUtility;

/**
 */
public class AccountBean implements Parcelable {

    private String access_token;
    private long expires_time;
    private UserBean info;
    private int navigationPosition;

    public String getUid() {
        return (info != null ? info.getId() : "");
    }

    public String getUsernick() {
        return (info != null ? info.getScreen_name() : "");
    }

    public String getAccess_token() {
        return access_token;
    }

    public void setAccess_token(String access_token) {
        this.access_token = access_token;
    }

    public long getExpires_time() {
        return expires_time;
    }

    public void setExpires_time(long expires_time) {
        this.expires_time = expires_time;
    }

    public UserBean getInfo() {
        return info;
    }

    public void setInfo(UserBean info) {
        this.info = info;
    }

    public int getNavigationPosition() {
        return navigationPosition;
    }

    public void setNavigationPosition(int navigationPosition) {
        this.navigationPosition = navigationPosition;
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
        dest.writeString(access_token);
        dest.writeLong(expires_time);
        dest.writeInt(navigationPosition);
        dest.writeParcelable(info, flags);
    }

    public static final Parcelable.Creator<AccountBean> CREATOR =
            new Parcelable.Creator<AccountBean>() {
                public AccountBean createFromParcel(Parcel in) {
                    AccountBean accountBean = new AccountBean();
                    accountBean.access_token = in.readString();
                    accountBean.expires_time = in.readLong();
                    accountBean.navigationPosition = in.readInt();
                    accountBean.info = in.readParcelable(UserBean.class.getClassLoader());

                    return accountBean;
                }

                public AccountBean[] newArray(int size) {
                    return new AccountBean[size];
                }
            };

    @Override
    public boolean equals(Object o) {

        return o instanceof AccountBean
                && !TextUtils.isEmpty(((AccountBean) o).getUid())
                && ((AccountBean) o).getUid().equalsIgnoreCase(getUid());
    }

    @Override
    public int hashCode() {
        return info.hashCode();
    }

    public CharSequence getAvatar_url() {
        return this.getInfo().getCover_image();
    }
}
