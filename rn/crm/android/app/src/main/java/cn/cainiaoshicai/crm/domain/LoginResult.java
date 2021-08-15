package cn.cainiaoshicai.crm.domain;

/**
 * Created by liuzhr on 3/8/17.
 */
public class LoginResult {
    private String error;
    private String access_token;
    private int expires_in;
    private String refresh_token;
    private String error_description;

    public String getError() {
        return error;
    }

    public String getAccess_token() {
        return access_token;
    }

    public int getExpires_in() {
        return expires_in;
    }

    public String getRefresh_token() {
        return refresh_token;
    }

    public String getError_description() {
        return error_description;
    }

    public boolean shouldRetry() {
        return "invalid_grant".equals(error);
    }

    public boolean loginOk() {
        return "".equals(error) || null == error;
    }
}
