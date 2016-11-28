package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.content.ContextCompat;
import android.text.TextUtils;
import android.util.Pair;
import android.view.ContextMenu;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.adapter.StorageItemAdapter;
import cn.cainiaoshicai.crm.ui.helper.StoreSpinnerHelper;

public class StoreSelfStorageActivity extends AbstractActionBarActivity implements StoreStorageChanged, RefreshStorageData {

    private static final int MENU_CONTEXT_DELETE_ID = 10992;
    private static final int MENU_CONTEXT_TO_SALE_ID = 10993;
    private static final int MENU_CONTEXT_TO_SOLD_OUT_ID = 10994;
    private static final int MENU_CONTEXT_TO_AUTO_ON_ID = 10995;

    private StorageItemAdapter<StorageItem> listAdapter;
    private final StorageActionDao sad = new StorageActionDao(GlobalCtx.getInstance().getSpecialToken());
    private ListView lv;
    private AutoCompleteTextView ctv;
    private Runnable listAdapterChanged;

    private static final int FILTER_ON_SALE = 1;
    private static final int FILTER_RISK = 2;
    private static final int FILTER_SOLD_OUT = 3;
    private static final int FILTER_OFF_SALE = 4;

    private int filter = FILTER_ON_SALE;

    private Store currStore;

    private Button btnSoldOut;
    private Button btnRisk;
    private Button btnOnSale;
    private Button btnOffSale;
    private LayoutInflater inflater;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        inflater = (LayoutInflater)
                getApplicationContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        if (savedInstanceState == null) {
            this.setContentView(R.layout.storage_status_self);

            setTitle(R.string.title_storage_self_provided);
            this.getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            lv = (ListView) findViewById(R.id.list_storage_status);
            registerForContextMenu(lv);
            resetListAdapter(new ArrayList<StorageItem>());

            ctv = (AutoCompleteTextView) findViewById(R.id.title_product_name);

            ctv.setOnEditorActionListener(new TextView.OnEditorActionListener() {
                @Override
                public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                    CharSequence text = v.getText();
                    listAdapter.filter(!TextUtils.isEmpty(text) ? text.toString() : null);
                    InputMethodManager in = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                    in.hideSoftInputFromWindow(ctv.getApplicationWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
                    return true;
                }
            });

            ctv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    Object selected = parent.getAdapter().getItem(position);
                    if (selected instanceof StorageItem) {
                        listAdapter.filter(String.valueOf(((StorageItem) selected).getProduct_id()));
                        InputMethodManager in = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                        in.hideSoftInputFromWindow(ctv.getApplicationWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
                    } else {
                        Toast.makeText(StoreSelfStorageActivity.this, "not a text item:" + selected, Toast.LENGTH_LONG).show();
                    }
                }
            });

            StoreSpinnerHelper.initStoreSpinner(this, currStore, new StoreSpinnerHelper.StoreChangeCallback() {
                @Override
                public void changed(Store newStore) {
                    if (currStore == null || currStore.getId() != newStore.getId()) {
                        currStore = newStore;
                        refreshData();
                    }
                }
            });

            btnOnSale = (Button) findViewById(R.id.filter_btn_on_sale);
            btnRisk = (Button) findViewById(R.id.filter_btn_risk);
            btnSoldOut = (Button) findViewById(R.id.filter_btn_sold_out);
            btnOffSale = (Button) findViewById(R.id.filter_btn_Off_sale);

            btnOnSale.setOnClickListener(new FilterButtonClicked(FILTER_ON_SALE));
            btnRisk.setOnClickListener(new FilterButtonClicked(FILTER_RISK));
            btnSoldOut.setOnClickListener(new FilterButtonClicked(FILTER_SOLD_OUT));
            btnOffSale.setOnClickListener(new FilterButtonClicked(FILTER_OFF_SALE));

            updateFilterBtnLabels(0, 0, 0, 0);
            refreshData();
        }
    }

    private void resetListAdapter(ArrayList<StorageItem> storageItems) {

        lv.setAdapter(null);

        listAdapter = new StorageItemAdapter<>(this, storageItems);
        lv.setAdapter(listAdapter);

        if (ctv != null) {
            ArrayAdapter<StorageItem> ctvAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1);
            ctvAdapter.addAll(storageItems);
            ctv.setAdapter(ctvAdapter);
        }

    }

    private void updateFilterBtnLabels(int totalOnSale, int totalRisk, int totalSoldOut, int totalOffSale) {
        btnOnSale.setText(String.format("上架(%s)", totalOnSale > 0 ? totalOnSale : "-"));
        btnRisk.setText(String.format("告急(%s)", totalRisk > 0 ? totalRisk : "-"));
        btnSoldOut.setText(String.format("缺货(%s)", totalSoldOut > 0 ? totalSoldOut :  "-"));
        btnOffSale.setText(String.format("下架(%s)", totalOffSale > 0 ? totalOffSale :  "-"));

        int defColor = android.R.color.primary_text_dark;
        btnOnSale.setTextColor(ContextCompat.getColor(this, filter != FILTER_ON_SALE ? defColor : R.color.green));
        btnRisk.setTextColor(ContextCompat.getColor(this, filter != FILTER_RISK ? defColor : R.color.green));
        btnSoldOut.setTextColor(ContextCompat.getColor(this, filter != FILTER_SOLD_OUT ? defColor : R.color.green));
        btnOffSale.setTextColor(ContextCompat.getColor(this, filter != FILTER_OFF_SALE ? defColor : R.color.green));
    }

    private void updateAdapterData(ArrayList<StorageItem> storageItems) {
        resetListAdapter(storageItems);
    }

    public void refreshData() {
        new MyAsyncTask<Void, Void, Void>(){
            private ProgressFragment progressFragment = ProgressFragment.newInstance(R.string.refreshing);
            Pair<ArrayList<StorageItem>, StorageActionDao.StoreStatusStat> result;

            @Override
            protected void onPreExecute() {
                progressFragment.setAsyncTask(this);
                Utility.forceShowDialog(StoreSelfStorageActivity.this, progressFragment);
            }

            @Override
            protected Void doInBackground(Void... params) {
                try {
                    result = sad.getStorageItems(currStore, filter, Cts.PROVIDE_SLEF, null);
                    return null;
                } catch (ServiceException e) {
                    e.printStackTrace();
                    AppLogger.e("error to userTalkStatus storage items:" + currStore, e);
                }

                cancel(true);
                return null;
            }

            @Override
            protected void onPostExecute(Void aVoid) {
//                if (progressFragment.isVisible()) {
                    progressFragment.dismissAllowingStateLoss();
//                }
                StoreSelfStorageActivity.this.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (result.first != null) {
                            updateAdapterData(result.first);
                        }
                        StorageActionDao.StoreStatusStat sec = result.second;
                        if (sec != null) {
                            updateFilterBtnLabels(sec.getTotal_on_sale(), sec.getTotal_risk(),
                                    sec.getTotal_sold_out(), sec.getTotal_off_sale());
                        }
                    }
                });
            }
        }.executeOnIO();
    }

    @Override
    protected void onActivityResult(int reqCode, int resultCode, Intent intent) {
        super.onActivityResult(reqCode, resultCode, intent);
    }

    @Override
    public void onCreateContextMenu(ContextMenu menu, View v, ContextMenu.ContextMenuInfo menuInfo) {
        super.onCreateContextMenu(menu, v, menuInfo);
        AdapterView.AdapterContextMenuInfo info = (AdapterView.AdapterContextMenuInfo) menuInfo;
        StorageItem item = listAdapter.getItem(info.position);
        if (item != null) {
            String title = item.pidAndNameStr();
            menu.setHeaderTitle(title);
            if (item.getStatus() == StorageItem.STORE_PROD_SOLD_OUT) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_AUTO_ON_ID, Menu.NONE, "设置自动上架");
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SALE_ID, Menu.NONE, "恢复售卖");
            } else if (item.getStatus() == StorageItem.STORE_PROD_ON_SALE) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SOLD_OUT_ID, Menu.NONE, "暂停售卖");
            }
        }

    }


    @NonNull
    public Runnable notifyDataSetChanged() {
        return new Runnable() {
            @Override
            public void run() {
                listAdapter.notifyDataSetChanged();
            }
        };
    }

    @Override
    public boolean onContextItemSelected(MenuItem mi) {
        AdapterView.AdapterContextMenuInfo info = (AdapterView.AdapterContextMenuInfo) mi.getMenuInfo();
        AppLogger.d("reset storage menu item pos=" + info.position);
        listAdapterChanged = new Runnable() {
            @Override
            public void run() {
                listAdapter.notifyDataSetChanged();
            }
        };
        final StorageItem item = this.listAdapter.getItem(info.position);
        switch (mi.getItemId()) {
            case MENU_CONTEXT_DELETE_ID:
                if (item != null) {
                    AlertDialog dlg = StoreStorageHelper.createEditLeftNum(this, item, inflater, notifyDataSetChanged());
                    dlg.show();
                }
                return true;
            case MENU_CONTEXT_TO_SALE_ID:
                StoreStorageHelper.action_chg_status(this, currStore, item, StorageItem.STORE_PROD_ON_SALE, "暂停售卖", new Runnable() {
                    @Override
                    public void run() {
                        listAdapter.notifyDataSetChanged();
                    }
                });
                return true;
            case MENU_CONTEXT_TO_AUTO_ON_ID:
                StoreStorageHelper.createSetOnSaleDlg(this, item, listAdapterChanged, true).show();
                return true;
            case MENU_CONTEXT_TO_SOLD_OUT_ID:
                StoreStorageHelper.action_chg_status(this, currStore, item, StorageItem.STORE_PROD_SOLD_OUT, "暂停售卖", new Runnable() {
                    @Override
                    public void run() {
                        listAdapter.notifyDataSetChanged();
                        StoreStorageHelper.createSetOnSaleDlg(StoreSelfStorageActivity.this, item, listAdapterChanged, true).show();
                    }
                });
                return true;
            default:
                return super.onContextItemSelected(mi);
        }
    }

    private class FilterButtonClicked implements View.OnClickListener {
        private int clicked;

        FilterButtonClicked(int clicked) {
            this.clicked = clicked;
        }

        @Override
        public void onClick(View v) {
            if (filter != clicked) {
                filter = clicked;
                refreshData();
            }
        }
    }
}