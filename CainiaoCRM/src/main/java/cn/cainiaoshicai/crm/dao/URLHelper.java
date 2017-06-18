package cn.cainiaoshicai.crm.dao;

import cn.cainiaoshicai.crm.domain.Vendor;
import cn.cainiaoshicai.crm.support.helper.SettingHelper;
import cn.customer_serv.customer_servsdk.util.Utils;

/**
 * User: qii
 * Date: 12-7-28
 */
public class URLHelper {

    public static final String PROTO = "https://";

    public static String getHost() {
        return (SettingHelper.usePreviewHost() ? "preview" : "www")  + ".cainiaoshicai.cn";
    }

    public static final String WEB_URL_ROOT = "https://" + getHost();
    public static String API_ROOT() {
        return "https://" + getHost() + "/api";
    }

    public static final String OAUTH2_TOKEN() {
        return "https://" + getHost() + "/oauth/token";
    }

    public static final String USER_INFO = API_ROOT() + "/user_info";

    private static final String URL_SINA_WEIBO = "https://api.weibo.com/2/";

    //login
    public static final String UID = URL_SINA_WEIBO + "account/get_uid.json";
    public static final String URL_OAUTH2_ACCESS_AUTHORIZE = "https://api.weibo.com/oauth2/authorize";

    public static final String APP_KEY = Utils.rot47("`_edd``d`b");

    public static final String APP_SECRET = Utils.rot47("57cag6gg226g35b`7a_cg`5`ch4gde65");

    public static final String DIRECT_URL = Utils
            .rot47("9EEADi^^2A:]H6:3@]4@>^@2FE9a^5672F=E]9E>=");

    public static String getStoresPrefix() {
        return"https://" + getHost() + "/stores";
    }

    public static String getAutoSchedulesUrl(long storeId) {
        return getStoresPrefix() + "/shipping_status/"+storeId+".html";
    }

    public static String getForgotPasswd() {
        return WEB_URL_ROOT + "/users/forgot";
    }

    public static String getWorkerListUrl(Vendor vendor) {
        return getStoresPrefix() + "/worker_list/"+(vendor != null ? vendor.getId() : 0);
    }
}
