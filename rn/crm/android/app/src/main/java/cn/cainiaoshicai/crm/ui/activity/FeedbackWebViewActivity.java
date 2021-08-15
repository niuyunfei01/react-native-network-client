package cn.cainiaoshicai.crm.ui.activity;

import android.os.Bundle;
import android.widget.Toast;

import java.util.HashMap;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 * Created by liuzhr on 11/6/16.
 */

public class FeedbackWebViewActivity extends WebViewActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {

        this.contentViewRes = R.layout.user_feedback_web_view;

        super.onCreate(savedInstanceState);

        Integer fbId = getIntent().getIntExtra("fb_id", 0);

        HashMap<String, String> crmHeader = new HashMap<>();
        crmHeader.put("crm_version", "true");
        if (fbId > 0) {
            //TODO: 替换为oauth的方式去获得token，并且避免将 access_token 放在 queryString 里
            String token = GlobalCtx.app().token();
            this.mWebView.loadUrl(URLHelper.WEB_URL_ROOT + "/vm?access_token=" + token + "#!/feedback/" + fbId, crmHeader);
        } else {
            Utility.toast("参数错误：没有 fb_id", this, null, Toast.LENGTH_LONG);
        }
    }
}
