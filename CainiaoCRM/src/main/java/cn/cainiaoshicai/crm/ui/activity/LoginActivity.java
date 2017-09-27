package cn.cainiaoshicai.crm.ui.activity;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import java.lang.ref.WeakReference;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.OauthTokenDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.LoginResult;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.domain.UserBean;
import cn.cainiaoshicai.crm.orders.util.AlertUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.database.AccountDBTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.error.ErrorCode;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.react.MyReactActivity;
import cn.cainiaoshicai.crm.support.utils.Utility;


public class LoginActivity extends AbstractActionBarActivity {

    private static final String KEY_PREFIX = LoginActivity.class.getName() + '.';
    private static final int REQUEST_CODE_AUTH = 0;
    private static final String ACTION_OPEN_FROM_APP_INNER = "cn.cainiaoshicai.crm:accountactivity";
    private static final String ACTION_OPEN_FROM_APP_INNER_REFRESH_TOKEN = "cn.cainiaoshicai.crm:accountactivity_refresh_token";

    private static final String REFRESH_ACTION_EXTRA = "refresh_account";

    EditText mUsernameEdit;
    EditText mPasswordEdit;
    Button mLoginButton;

    private String mUsername;
    private String mPassword;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        boolean gotoMain = false;
        String action = getIntent() != null ? getIntent().getAction() : null;
        if (ACTION_OPEN_FROM_APP_INNER.equals(action)) {
            //empty
        } else if (ACTION_OPEN_FROM_APP_INNER_REFRESH_TOKEN.equals(action)) {
            //empty
        } else {
            //finish current Activity
            gotoMain = jumpToMainActivity();
        }

        if (!gotoMain) {
            Intent loginIntent = new Intent(this, MyReactActivity.class);
            loginIntent.putExtra("_action", "loginIntent");
            loginIntent.putExtra("_next_action", "orders");
            startActivity(loginIntent);
        }

        setContentView(R.layout.account_login);

        mUsernameEdit = (EditText) findViewById(R.id.username);
        mPasswordEdit = (EditText) findViewById(R.id.password);
        mLoginButton = (Button) findViewById(R.id.login);

        if (TextUtils.isEmpty(mUsername) && getIntent() != null) {
            String m = getIntent().getStringExtra("mobile");
            if (!TextUtils.isEmpty(m)) {
                mUsername = m;
            }
        }

        if (!TextUtils.isEmpty(mUsername)) {
            mUsernameEdit.setText(mUsername);
        }
        if (!TextUtils.isEmpty(mPassword)) {
            mPasswordEdit.setText(mPassword);
        }
        mPasswordEdit.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView textView, int id, KeyEvent keyEvent) {
                if (id == R.id.ime_login || id == EditorInfo.IME_ACTION_DONE
                        || id == EditorInfo.IME_NULL) {
                    attemptStartAuth();
                    return true;
                }
                return false;
            }
        });

        mLoginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptStartAuth();
            }
        });


        ((TextView)findViewById(R.id.link_register)).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                GeneralWebViewActivity.gotoWeb(LoginActivity.this, URLHelper.getRigsterForCRM());
            }
        });

        ((TextView)findViewById(R.id.link_reset)).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                GeneralWebViewActivity.gotoWeb(LoginActivity.this, URLHelper.getForgotPasswd());
            }
        });

        AppLogger.e("display login activity");
    }

    protected boolean jumpToMainActivity() {
        String id = SettingUtility.getDefaultAccountId();

        if (!TextUtils.isEmpty(id)) {
            AccountBean bean = AccountDBTask.getAccount(id);
            if (bean != null) {
                Intent start = MainActivity.newIntent(bean);
                startActivity(start);
                finish();
                return true;
            }
        }

        return false;
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
    }

    private void attemptStartAuth() {

        // Store values at the time of login attempt.
        mUsername = mUsernameEdit.getText().toString();
        mPassword = mPasswordEdit.getText().toString();

        boolean cancel = false;
        View errorView = null;

        if (TextUtils.isEmpty(mUsername)) {
            showErrorToast(getString(R.string.auth_error_empty_username));
            errorView = mUsernameEdit;
            cancel = true;
        }
        if (TextUtils.isEmpty(mPassword)) {
            showErrorToast(getString(R.string.auth_error_empty_password));
            if (errorView == null) {
                errorView = mPasswordEdit;
            }
            cancel = true;
        }

        if (cancel) {
            errorView.requestFocus();
        } else {
            onStartAuth();
        }
    }

    private void onStartAuth() {
        mLoginButton.setEnabled(false);
        new OAuthTask(this).execute(mUsername, mPassword);
    }

    private void showErrorToast(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
    }

    public static Intent newIntent() {
        return newIntent("");
    }

    public static Intent newIntent(String mobile) {
        Intent intent = new Intent(GlobalCtx.app(), LoginActivity.class);
        if (TextUtils.isEmpty(mobile)) {
            intent.putExtra("mobile", mobile);
        }
        return intent;
    }

    public enum DBResult {
        add_successfuly, update_successfully
    }

    private static class OAuthTask extends MyAsyncTask<String, UserBean, DBResult> {

        private ServiceException e;
        private ProgressFragment progressFragment = ProgressFragment.newInstance(R.string.oauthing);
        private WeakReference<LoginActivity> oAuthActivityWeakReference;

        private OAuthTask(LoginActivity activity) {
            oAuthActivityWeakReference = new WeakReference<>(activity);
        }

        @Override
        protected void onPreExecute() {
            progressFragment.setAsyncTask(this);
            LoginActivity activity = oAuthActivityWeakReference.get();
            if (activity != null) {
                Utility.forceShowDialog(activity, progressFragment);
            }
        }

        @Override
        protected LoginActivity.DBResult doInBackground(String... params) {

            String userName = params[0];
            String password = params[1];

            try {
                LoginResult loginResult = new OauthTokenDao().login(userName, password);
                if (loginResult != null && loginResult.loginOk()) {
                    final String token = loginResult.getAccess_token();
                    final long expiresInSeconds = loginResult.getExpires_in();
                    final GlobalCtx app = GlobalCtx.app();
                    ResultBean<UserBean> uiRb = app.dao.userInfo(token).execute().body();
                    if (uiRb != null && uiRb.isOk() && !TextUtils.isEmpty(uiRb.getObj().getId())) {
                        UserBean user = uiRb.getObj();
                        AccountBean account = new AccountBean();
                        account.setAccess_token(token);
                        account.setExpires_time(System.currentTimeMillis() + expiresInSeconds * 1000);
                        account.setInfo(user);
                        AppLogger.e("token expires in " + Utility.calcTokenExpiresInDays(account) + " days");
                        DBResult dbResult = AccountDBTask.addOrUpdateAccount(account, false);
                        if (TextUtils.isEmpty(SettingUtility.getDefaultAccountId())) {
                            SettingUtility.setDefaultAccountId(account.getUid());
                        }

                        long prefer_store = user.getPrefer_store();
                        if (prefer_store > 0) {
                            SettingUtility.setListenerStores(prefer_store);
                        } else {
                            SettingUtility.removeListenerStores();
                        }

                        app.updateCfgInterval();
                        return dbResult;
                    } else {
                        boolean denied = uiRb != null && String.valueOf(ErrorCode.CODE_ACCESS_DENIED).equals(uiRb.getDesc());
                        String msg = denied ? "账户没有授权，请联系店长开通" : "获取不到账户相关信息";
                        this.e = new ServiceException(msg);
                    }
                } else {
                    AppLogger.e("login error:" + (loginResult == null ? "" : loginResult.getError()) );
                }
            } catch (ServiceException e) {
                AppLogger.e(e.getError());
                this.e = e;
            } catch (Exception e) {
                AppLogger.e("error to login", e);
            }

            cancel(true);
            return null;
        }

        @Override
        protected void onCancelled(DBResult dbResult) {
            super.onCancelled(dbResult);
            if (progressFragment != null) {
                progressFragment.dismissAllowingStateLoss();
            }

            final LoginActivity activity = oAuthActivityWeakReference.get();
            if (activity == null) {
                return;
            }

            if (e != null) {
                if (Cts.ERR_INVALID_GRANT.equals(e.getError())) {
                    AlertUtil.showAlert(activity, R.string.tip_dialog_title, R.string.auth_error_invalid_grant,
                            "知道了", null,
                            "重置密码", new DialogInterface.OnClickListener(){
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    GeneralWebViewActivity.gotoWeb(activity, URLHelper.getForgotPasswd());
                                }
                            });
                } else {
                    AlertUtil.error(activity, e.getError());
                }
            }

            activity.mLoginButton.setEnabled(true);
        }

        @Override
        protected void onPostExecute(DBResult dbResult) {
            if (progressFragment.isVisible()) {
                progressFragment.dismissAllowingStateLoss();
            }
            LoginActivity activity = oAuthActivityWeakReference.get();
            if (activity == null) {
                return;
            }
            switch (dbResult) {
                case add_successfuly:
                    Toast.makeText(activity, activity.getString(R.string.login_success),
                            Toast.LENGTH_SHORT).show();
                    break;
                case update_successfully:
                    Toast.makeText(activity, activity.getString(R.string.update_account_success),
                            Toast.LENGTH_SHORT).show();
                    break;
            }
            activity.jumpToMainActivity();
        }
    }

}
