package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.app.LoaderManager;
import android.content.AsyncTaskLoader;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.Loader;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.ActionMode;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AbsListView;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.domain.AccountBean;
import cn.cainiaoshicai.crm.support.database.AccountDBTask;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.lib.changedialog.ChangeLogDialog;
import cn.cainiaoshicai.crm.support.utils.ThemeUtility;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.interfaces.AbstractAppActivity;

public class AccountActivity extends AbstractAppActivity
        implements LoaderManager.LoaderCallbacks<List<AccountBean>> {

    private static final String ACTION_OPEN_FROM_APP_INNER = "org.qii.weiciyuan:accountactivity";
    private static final String ACTION_OPEN_FROM_APP_INNER_REFRESH_TOKEN = "org.qii.weiciyuan:accountactivity_refresh_token";

    private static final String REFRESH_ACTION_EXTRA = "refresh_account";

    private final int ADD_ACCOUNT_REQUEST_CODE = 0;
    private final int LOADER_ID = 0;

    private ListView listView = null;
    private AccountAdapter listAdapter = null;
    private List<AccountBean> accountList = new ArrayList<AccountBean>();

    public static Intent newIntent() {
        Intent intent = new Intent(GlobalCtx.getInstance(), AccountActivity.class);
        intent.setAction(ACTION_OPEN_FROM_APP_INNER);
        return intent;
    }

    public static Intent newIntent(AccountBean refreshAccount) {
        Intent intent = new Intent(GlobalCtx.getInstance(), AccountActivity.class);
        intent.setAction(ACTION_OPEN_FROM_APP_INNER_REFRESH_TOKEN);
        intent.putExtra(REFRESH_ACTION_EXTRA, refreshAccount);
        return intent;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        String action = getIntent() != null ? getIntent().getAction() : null;

        if (ACTION_OPEN_FROM_APP_INNER.equals(action)) {
            //empty
        } else if (ACTION_OPEN_FROM_APP_INNER_REFRESH_TOKEN.equals(action)) {
            //empty
        } else {
            //finish current Activity
            jumpToMainTimeLineActivity();
        }

        super.onCreate(savedInstanceState);

        setContentView(R.layout.accountactivity_layout);
        getActionBar().setTitle(getString(R.string.app_name));
        listAdapter = new AccountAdapter();
        listView = (ListView) findViewById(R.id.listView);
        listView.setOnItemClickListener(new AccountListItemClickListener());
        listView.setAdapter(listAdapter);
        listView.setChoiceMode(AbsListView.CHOICE_MODE_MULTIPLE_MODAL);
        getLoaderManager().initLoader(LOADER_ID, null, this);

        if (SettingUtility.firstStart()) {
            showChangeLogDialog();
        }

        if (ACTION_OPEN_FROM_APP_INNER_REFRESH_TOKEN.equals(action)) {
            showAddAccountDialog();
            AccountBean accountBean = getIntent().getParcelableExtra(REFRESH_ACTION_EXTRA);
            Toast.makeText(this, String.format(getString(R.string.account_token_has_expired),
                    accountBean.getUsernick()), Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
    }

    private void showChangeLogDialog() {
        ChangeLogDialog changeLogDialog = new ChangeLogDialog(this);
        changeLogDialog.show();
    }

    private void jumpToMainTimeLineActivity() {
        String id = SettingUtility.getDefaultAccountId();

        if (!TextUtils.isEmpty(id)) {
            AccountBean bean = AccountDBTask.getAccount(id);
            if (bean != null) {
                Intent start = MainActivity.newIntent(bean);
                startActivity(start);
                finish();
            }
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        return true;
    }

    private void showAddAccountDialog() {
        final ArrayList<Class> activityList = new ArrayList<Class>();
        ArrayList<String> itemValueList = new ArrayList<String>();

//        activityList.add(OAuthActivity.class);
//        itemValueList.add(getString(R.string.oauth_login));

//        if (Utility.isCertificateFingerprintCorrect(AccountActivity.this) && Utility
//                .isSinaWeiboSafe(this)) {
//            activityList.add(SSOActivity.class);
//            itemValueList.add(getString(R.string.official_app_login));
//        }

//        if (SettingUtility.isBlackMagicEnabled()) {
//            activityList.add(BlackMagicActivity.class);
//            itemValueList.add(getString(R.string.hack_login));
//        }

        new AlertDialog.Builder(this)
                .setItems(itemValueList.toArray(new String[0]),
                        new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                Intent intent = new Intent(AccountActivity.this,
                                        activityList.get(which));
                                startActivityForResult(intent, ADD_ACCOUNT_REQUEST_CODE);
                            }
                        }).show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == ADD_ACCOUNT_REQUEST_CODE && resultCode == RESULT_OK) {
            refresh();
            if (data == null) {
                return;
            }
            String expires_time = data.getExtras().getString("expires_in");
            long expiresDays = TimeUnit.SECONDS.toDays(Long.valueOf(expires_time));

            String content = String
                    .format(getString(R.string.token_expires_in_time), String.valueOf(expiresDays));
            AlertDialog.Builder builder = new AlertDialog.Builder(this)
                    .setMessage(content)
                    .setPositiveButton(R.string.ok, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {

                        }
                    });

            builder.show();
        }
    }

    private void refresh() {
        getLoaderManager().getLoader(LOADER_ID).forceLoad();
    }

    @Override
    public Loader<List<AccountBean>> onCreateLoader(int id, Bundle args) {
        return new AccountDBLoader(AccountActivity.this, args);
    }

    @Override
    public void onLoadFinished(Loader<List<AccountBean>> loader, List<AccountBean> data) {
        accountList = data;
        listAdapter.notifyDataSetChanged();
    }

    @Override
    public void onLoaderReset(Loader<List<AccountBean>> loader) {
        accountList = new ArrayList<AccountBean>();
        listAdapter.notifyDataSetChanged();
    }

    private void remove() {
        Set<String> set = new HashSet<String>();
        long[] ids = listView.getCheckedItemIds();
        for (long id : ids) {
            set.add(String.valueOf(id));
        }
        accountList = AccountDBTask.removeAndGetNewAccountList(set);
        listAdapter.notifyDataSetChanged();
    }

    private static class AccountDBLoader extends AsyncTaskLoader<List<AccountBean>> {

        public AccountDBLoader(Context context, Bundle args) {
            super(context);
        }

        @Override
        protected void onStartLoading() {
            super.onStartLoading();
            forceLoad();
        }

        public List<AccountBean> loadInBackground() {
            return AccountDBTask.getAccountList();
        }
    }

    private class AccountListItemClickListener implements AdapterView.OnItemClickListener {

        @Override
        public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
            if (!Utility.isTokenValid(accountList.get(i))) {
                showAddAccountDialog();
                return;
            }

            Intent intent = MainActivity.newIntent(accountList.get(i));
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
        }
    }

    private class AccountAdapter extends BaseAdapter {
        private int checkedBG;
        private int defaultBG;

        public AccountAdapter() {
            defaultBG = getResources().getColor(R.color.transparent);
        }
        @Override
        public int getCount() {
            return accountList.size();
        }

        @Override
        public Object getItem(int i) {
            return accountList.get(i);
        }

        @Override
        public long getItemId(int i) {
            return Long.valueOf(accountList.get(i).getUid());
        }

        @Override
        public boolean hasStableIds() {
            return true;
        }

        @Override
        public View getView(final int i, View view, ViewGroup viewGroup) {
            ViewHolder holder;
            if (view == null || view.getTag() == null) {
                LayoutInflater layoutInflater = getLayoutInflater();
                View mView = layoutInflater
                        .inflate(R.layout.accountactivity_listview_item_layout, viewGroup, false);
                holder = new ViewHolder();
                holder.root = mView.findViewById(R.id.listview_root);
                holder.name = (TextView) mView.findViewById(R.id.account_name);
                holder.avatar = (ImageView) mView.findViewById(R.id.imageView_avatar);
                holder.tokenInvalid = (TextView) mView.findViewById(R.id.token_expired);
                view = mView;
            } else {
                holder = (ViewHolder) view.getTag();
            }

            holder.root.setBackgroundColor(defaultBG);
            if (listView.getCheckedItemPositions().get(i)) {
                holder.root.setBackgroundColor(checkedBG);
            }

            if (accountList.get(i).getInfo() != null) {
                holder.name.setText(accountList.get(i).getInfo().getScreen_name());
            } else {
                holder.name.setText(accountList.get(i).getUsernick());
            }

            holder.tokenInvalid.setVisibility(!Utility.isTokenValid(accountList.get(i)) ? View.VISIBLE : View.GONE);
            return view;
        }
    }

    class ViewHolder {
        View root;
        TextView name;
        ImageView avatar;
        TextView tokenInvalid;
    }
}
