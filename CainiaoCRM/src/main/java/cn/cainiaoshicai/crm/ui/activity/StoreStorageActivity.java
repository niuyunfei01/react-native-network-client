package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.content.ContextCompat;
import android.util.Pair;
import android.view.ContextMenu;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.adapter.StorageItemAdapter;

public class StoreStorageActivity extends AbstractActionBarActivity {

    private static final int MENU_CONTEXT_DELETE_ID = 10992;
    private StorageItemAdapter<StorageItem> listAdapter;
    private final StorageActionDao sad = new StorageActionDao(GlobalCtx.getInstance().getSpecialToken());
    private ListView lv;

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

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (savedInstanceState == null) {
            this.setContentView(R.layout.storage_status);

            setTitle(R.string.title_storage_status);
            this.getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            lv = (ListView) findViewById(R.id.list_storage_status);
            registerForContextMenu(lv);
            resetListAdapter(new ArrayList<StorageItem>());

            Spinner currStoreSpinner = (Spinner) findViewById(R.id.spinner_curr_store);
            final ArrayAdapter<Store> storeArrayAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item);
            storeArrayAdapter.addAll(Constants.ST_HLG, Constants.ST_YYC);
            storeArrayAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            currStoreSpinner.setAdapter(storeArrayAdapter);
            currStoreSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
                @Override
                public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                    Store newStore = storeArrayAdapter.getItem(position);
                    if (currStore == null || currStore.getStoreId() != newStore.getStoreId()) {
                        currStore = newStore;
                        refreshData();
                    }
                }

                @Override
                public void onNothingSelected(AdapterView<?> parent) {
                }
            });

            if (currStore == null) {
                currStore = Constants.ST_HLG;
            }

//        Spinner filterCategories = (Spinner) findViewById(R.id.filter_categories);
//        final ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,
//                R.array.storage_categories_array, android.R.layout.simple_spinner_item);
//        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
//        filterCategories.setAdapter(adapter);
//        filterCategories.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
//            @Override
//            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
//                String feedback_source = adapter.getItem(position).toString();
//            }
//
//            @Override
//            public void onNothingSelected(AdapterView<?> parent) {
//
//            }
//        });

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

//        lv.addFooterView(findViewById(R.id.paged_overview));

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

    private void refreshData() {
        new MyAsyncTask<Void, Void, Void>(){
            private ProgressFragment progressFragment = ProgressFragment.newInstance(R.string.refreshing);
            Pair<ArrayList<StorageItem>, StorageActionDao.StoreStatusStat> result;

            @Override
            protected void onPreExecute() {
                progressFragment.setAsyncTask(this);
                Utility.forceShowDialog(StoreStorageActivity.this, progressFragment);
            }

            @Override
            protected Void doInBackground(Void... params) {
                try {
                    result = sad.getStorageItems(currStore, filter);
                    return null;
                } catch (ServiceException e) {
                    e.printStackTrace();
                    AppLogger.e("error to get storage items:" + currStore, e);
                }

                cancel(true);
                return null;
            }

            @Override
            protected void onPostExecute(Void aVoid) {
//                if (progressFragment.isVisible()) {
                    progressFragment.dismissAllowingStateLoss();
//                }
                StoreStorageActivity.this.runOnUiThread(new Runnable() {
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
        String title = listAdapter.getItem(info.position).getIdAndNameStr();
        menu.setHeaderTitle(title);

        menu.add(Menu.NONE, MENU_CONTEXT_DELETE_ID, Menu.NONE, "设置库存");
    }

    @Override
    public boolean onContextItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case MENU_CONTEXT_DELETE_ID:
                AdapterView.AdapterContextMenuInfo info = (AdapterView.AdapterContextMenuInfo) item.getMenuInfo();
                 AppLogger.d("reset storage item pos=" + info.position);
                final StorageItem storageItem = this.listAdapter.getItem(info.position);
                LayoutInflater inflater = (LayoutInflater)
                        getApplicationContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                View npView = inflater.inflate(R.layout.number_edit_dialog_layout, null);
                final EditText et = (EditText) npView.findViewById(R.id.number_edit_txt);
                et.setText(String.valueOf(storageItem.getLeft_since_last_stat()));
                AlertDialog dlg = new AlertDialog.Builder(this)
                        .setTitle(String.format("设置库存数:(%s)", storageItem.getName()))
                        .setView(npView)
                        .setPositiveButton(R.string.ok,
                                new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int whichButton) {
                                        new MyAsyncTask<Void, Void, Void>(){
                                            @Override
                                            protected Void doInBackground(Void... params) {

                                                ResultBean rb;
                                                final int lastStat = Integer.parseInt(et.getText().toString());
                                                try {
                                                    rb = sad.store_status_reset_stat_num(currStore.getStoreId(), storageItem.getProduct_id(), lastStat);
                                                } catch (ServiceException e) {
                                                    rb = new ResultBean(false , "访问服务器出错");
                                                }

                                                final ResultBean finalRb = rb;
                                                StoreStorageActivity.this.runOnUiThread(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        if (finalRb.isOk()) {
                                                            storageItem.setTotal_last_stat(lastStat);
                                                            storageItem.setTotal_sold(0);
                                                            storageItem.setLeft_since_last_stat(lastStat);
                                                            listAdapter.notifyDataSetChanged();
                                                            Toast.makeText(StoreStorageActivity.this, "已保存", Toast.LENGTH_SHORT).show();
                                                        } else {
                                                            Toast.makeText(StoreStorageActivity.this, "保存失败：" + finalRb.getDesc(), Toast.LENGTH_LONG).show();
                                                        }
                                                    }
                                                });
                                                return null;
                                            }
                                        }.executeOnIO();
                                    }
                                })
                        .setNegativeButton(R.string.cancel,
                                new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int whichButton) {
                                    }
                                })
                        .create();
                dlg.show();
                et.requestFocus();
                return true;
            default:
                return super.onContextItemSelected(item);
        }
    }

    private class FilterButtonClicked implements View.OnClickListener {
        private int clicked;

        public FilterButtonClicked(int clicked) {
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