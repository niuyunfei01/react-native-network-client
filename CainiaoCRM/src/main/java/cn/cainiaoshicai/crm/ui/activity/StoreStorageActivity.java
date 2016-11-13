package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
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
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.Tag;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.adapter.StorageItemAdapter;
import cn.cainiaoshicai.crm.ui.helper.StoreSpinnerHelper;

public class StoreStorageActivity extends AbstractActionBarActivity implements StoreStorageChanged {

    private static final int MENU_CONTEXT_DELETE_ID = 10992;
    private static final int MENU_CONTEXT_TO_SALE_ID = 10993;
    private static final int MENU_CONTEXT_TO_SOLD_OUT_ID = 10994;
    private static final int MENU_CONTEXT_EDIT_REQ = 10995;
    private StorageItemAdapter<StorageItem> listAdapter;
    private final StorageActionDao sad = new StorageActionDao(GlobalCtx.getInstance().getSpecialToken());
    private ListView lv;
    private AutoCompleteTextView ctv;
    private Spinner tagFilterSpinner;
    private Spinner currStatusSpinner;
    private Button btnReqList;
    private LayoutInflater inflater;

    private static final int FILTER_ON_SALE = 1;
    private static final int FILTER_RISK = 2;
    private static final int FILTER_SOLD_OUT = 3;
    private static final int FILTER_OFF_SALE = 4;
    private int total_in_req;

    private static class StatusItem {
        static final StatusItem[] STATUS = new StatusItem[]{
                new StatusItem(FILTER_ON_SALE, "在售"),
                new StatusItem(FILTER_RISK, " 待订货"),
                new StatusItem(FILTER_SOLD_OUT, " 缺货"),
                new StatusItem(FILTER_OFF_SALE, "已下架"),
        };
        public final int status;
        public final String label;
        private int num;

        StatusItem(int status, String label) {
            this.status = status;
            this.label = label;
        }

        public int getNum() {
            return num;
        }

        void setNum(int num) {
            this.num = num;
        }

        @Override
        public String toString() {
            return String.format(this.label + "(%s)", num > 0 ? num :  "-");
        }

        public static StatusItem find(int filter) {
            for (StatusItem item :
                    STATUS) {
                if (item.status == filter) {
                    return item;
                }
            }

            throw new IllegalArgumentException("illegal filter:" + filter);
        }

        static int findIdx(int filter) {
            for (int i = 0; i < STATUS.length; i++) {
                if (STATUS[i].status == filter) {
                    return i;
                }
            }

            throw new IllegalArgumentException("illegal filter:" + filter);
        }
    }

    private int filter = FILTER_SOLD_OUT;

    private Store currStore;
    private Tag currTag;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        inflater = (LayoutInflater)
                getApplicationContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        if (savedInstanceState == null) {
            this.setContentView(R.layout.storage_status);


            setTitle(R.string.title_storage_status);
            this.getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            lv = (ListView) findViewById(R.id.list_storage_status);
            registerForContextMenu(lv);

            lv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    StorageItem item = listAdapter.getItem(position);
                    if (item != null && item.getStatus() != StorageItem.STORE_PROD_OFF_SALE) {
                        AlertDialog dlg = createEditProvideDlg(item, inflater);
                        dlg.show();
                    }
                }
            });

            this.btnReqList = (Button) findViewById(R.id.btn_req_list);
            this.btnReqList.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent intent = new Intent(StoreStorageActivity.this, StorageProvideActivity.class);
                    intent.putExtra("store_id", currStore.getId());
                    startActivity(intent);
                }
            });

            ctv = (AutoCompleteTextView) findViewById(R.id.title_product_name);
            ctv.setThreshold(1);
//            ctv.setOnFocusChangeListener(new View.OnFocusChangeListener() {
//                @Override
//                public void onFocusChange(View v, boolean hasFocus) {
//                    AutoCompleteTextView view = (AutoCompleteTextView) v;
//                    if (hasFocus) {
//                        view.showDropDown();
//                    }
//                }
//            });
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
                        listAdapter.filter(String.valueOf(((StorageItem) selected).getId()));
                        InputMethodManager in = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                        in.hideSoftInputFromWindow(ctv.getApplicationWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
                    } else {
                        Toast.makeText(StoreStorageActivity.this, "not a text item:" + selected, Toast.LENGTH_LONG).show();
                    }
                }
            });

            currStatusSpinner = (Spinner) findViewById(R.id.spinner_curr_status);
            final ArrayAdapter<StatusItem> statusAdapter = new ArrayAdapter<>(this, R.layout.spinner_item_small);
            statusAdapter.addAll(StatusItem.STATUS);
            statusAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item_small);
            currStatusSpinner.setAdapter(statusAdapter);
            currStatusSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
                @Override
                public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                    StatusItem status = statusAdapter.getItem(position);
                    if (status != null) {
                        filter = status.status;
                        refreshData();
                    }
                }

                @Override
                public void onNothingSelected(AdapterView<?> parent) {

                }
            });
            currStatusSpinner.setSelection(StatusItem.findIdx(filter));

            tagFilterSpinner = (Spinner) findViewById(R.id.filter_categories);
            final ArrayAdapter<Tag> tagAdapter = new ArrayAdapter<>(this, R.layout.spinner_item_small);
            ArrayList<Tag> allTags = GlobalCtx.getInstance().listTags();
            tagAdapter.addAll(allTags);
            tagAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item_small);
            tagFilterSpinner.setAdapter(tagAdapter);
            tagFilterSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
                @Override
                public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                    Tag tag = tagAdapter.getItem(position);
                    if (tag != null) {
                        currTag = tag;
                        refreshData();
                    }
                }

                @Override
                public void onNothingSelected(AdapterView<?> parent) {

                }
            });

            for(int i = 0; i < tagAdapter.getCount(); i++) {
                Tag t = tagAdapter.getItem(i);
                if (t != null && currTag != null && t.getId() == currTag.getId()) {
                    tagFilterSpinner.setSelection(i);
                    break;
                }
            }

            if (allTags.isEmpty()) {
                Utility.runUIActionDelayed(new Runnable() {
                    @Override
                    public void run() {
                        tagAdapter.addAll(GlobalCtx.getInstance().listTags());
                        tagAdapter.notifyDataSetChanged();
                    }
                }, 50);
            }

            StoreSpinnerHelper.initStoreSpinner(this, this.currStore, new StoreSpinnerHelper.StoreChangeCallback() {
                @Override
                public void changed(Store newStore) {
                    if (newStore != null) {
                        if (currStore == null || currStore.getId() != newStore.getId()) {
                            currStore = newStore;
                            refreshData();
                        }

                        SettingUtility.setCurrentStorageStore(newStore.getId());
                    }
                }
            });

            updateFilterBtnLabels(0, 0, 0, 0, 0);
            refreshData();
        }
    }

    private void resetListAdapter(ArrayList<StorageItem> storageItems) {

        if (storageItems == null) {
            storageItems = new ArrayList<>(0);
        }

        AppLogger.d("resetListAdapter:" + storageItems.toString());

        if (listAdapter != null) {
            listAdapter.changeBackendData(storageItems);
            listAdapter.filter("");
        } else {
            listAdapter = new StorageItemAdapter<>(this, storageItems);
            lv.setAdapter(listAdapter);
            listAdapter.notifyDataSetChanged();
        }

        if (ctv != null) {
            ArrayAdapter<StorageItem> ctvAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1);
            ctvAdapter.addAll(storageItems);
            ctv.setAdapter(ctvAdapter);
        }

    }

    private void updateFilterBtnLabels(int totalOnSale, int totalRisk, int totalSoldOut, int totalOffSale, int total_in_req) {
        StatusItem.find(FILTER_ON_SALE).setNum(totalOnSale);
        StatusItem.find(FILTER_OFF_SALE).setNum(totalOffSale);
        StatusItem.find(FILTER_RISK).setNum(totalRisk);
        StatusItem.find(FILTER_SOLD_OUT).setNum(totalSoldOut);

        if(this.currStatusSpinner != null) {
            ((ArrayAdapter)this.currStatusSpinner.getAdapter()).notifyDataSetChanged();
        }

        updateReqListBtn(total_in_req);
    }

    private void updateReqListBtn(int total_in_req) {
        this.total_in_req = total_in_req;
        if (this.btnReqList != null) {
            this.btnReqList.setText("订货单\n(" + total_in_req + ")");
        }
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
                    result = sad.getStorageItems(currStore, filter, Cts.PROVIDE_COMMON, currTag);
                    return null;
                } catch (ServiceException e) {
                    e.printStackTrace();
                    AppLogger.e("error to refresh storage items:" + currStore, e);
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
                        updateAdapterData(result.first);
                        StorageActionDao.StoreStatusStat sec = result.second;
                        if (sec != null) {
                            updateFilterBtnLabels(sec.getTotal_on_sale(), sec.getTotal_risk(),
                                    sec.getTotal_sold_out(), sec.getTotal_off_sale(), sec.getTotal_req_cnt());
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
            String title = item.getIdAndNameStr(false);
            menu.setHeaderTitle(title);

            if (item.getStatus() == StorageItem.STORE_PROD_SOLD_OUT) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SALE_ID, Menu.NONE, "设置何时重新上架");
            } else if (item.getStatus() == StorageItem.STORE_PROD_ON_SALE) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SOLD_OUT_ID, Menu.NONE, "暂停售卖");
            }

            if (item.getStatus() != StorageItem.STORE_PROD_OFF_SALE) {
                menu.add(Menu.NONE, MENU_CONTEXT_EDIT_REQ, Menu.NONE, item.getTotalInReq() > 0 ? "编辑订货" : "订货");
            }
        }
    }

    @Override
    public boolean onContextItemSelected(MenuItem item) {
        AdapterView.AdapterContextMenuInfo info = (AdapterView.AdapterContextMenuInfo) item.getMenuInfo();
        AppLogger.d("reset storage item pos=" + info.position);
        final StorageItem storageItem = this.listAdapter.getItem(info.position);

        switch (item.getItemId()) {
            case MENU_CONTEXT_DELETE_ID:
                if (storageItem != null) {
                    AlertDialog dlg = StoreStorageHelper.createEditLeftNum(this, storageItem, inflater, notifyDataSetChanged());
                    dlg.show();
                    return true;
                } else {
                    return false;
                }
            case MENU_CONTEXT_TO_SALE_ID:
                StoreStorageHelper.createSetOnSaleDlg(this, storageItem, this.currStore, notifyDataSetChanged()).show();
                return true;
            case MENU_CONTEXT_TO_SOLD_OUT_ID:
                StoreStorageHelper.action_chg_status(this, currStore, storageItem, StorageItem.STORE_PROD_SOLD_OUT, "暂停售卖", new Runnable() {
                    @Override
                    public void run() {
                        listAdapterRefresh();
                        StoreStorageHelper.createSetOnSaleDlg(StoreStorageActivity.this, storageItem, currStore, notifyDataSetChanged()).show();
                    }
                });
                return true;
            case MENU_CONTEXT_EDIT_REQ:
                AlertDialog dlg = createEditProvideDlg(storageItem, inflater);
                dlg.show();
                return true;
            default:
                return super.onContextItemSelected(item);
        }
    }

    private void listAdapterRefresh() {
        listAdapter.notifyDataSetChanged();
        listAdapter.filter("");
    }

    @NonNull
    public Runnable notifyDataSetChanged() {
        return new Runnable() {
            @Override
            public void run() {
                 listAdapterRefresh();
            }
        };
    }

    private AlertDialog createEditProvideDlg(final StorageItem item, LayoutInflater inflater) {
        View npView = inflater.inflate(R.layout.storage_edit_provide_layout, null);
        final EditText totalReqTxt = (EditText) npView.findViewById(R.id.total_req);
        final EditText remark = (EditText) npView.findViewById(R.id.remark);

        int totalInReq = item.getTotalInReq();
        int defaultReq = Math.max(item.getRisk_min_stat() - Math.max(item.getLeft_since_last_stat(), 0), 1);
        totalReqTxt.setText(String.valueOf(totalInReq > 0 ? totalInReq : defaultReq));
        remark.setText(item.getReqMark());
        AlertDialog dlg = new AlertDialog.Builder(this)
                .setTitle(String.format("订货:(%s)", item.getName()))
                .setView(npView)
                .setPositiveButton(R.string.ok,
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int whichButton) {
                                new MyAsyncTask<Void, Void, Void>() {
                                    @Override
                                    protected Void doInBackground(Void... params) {
                                        StorageActionDao.ResultEditReq rb;
                                        final int total_req_no = Integer.parseInt(totalReqTxt.getText().toString());
                                        final String remarkTxt = remark.getText().toString();
                                        try {
                                            rb = sad.store_edit_provide_req(item.getProduct_id(), currStore.getId(), total_req_no, remarkTxt);
                                        } catch (ServiceException e) {
                                            rb = new StorageActionDao.ResultEditReq(false, "访问服务器出错");
                                        }
                                        final int total_req_cnt = rb.isOk() ? rb.getTotal_req_cnt() : -1;

                                        final ResultBean finalRb = rb;
                                        StoreStorageActivity.this.runOnUiThread(new Runnable() {
                                            @Override
                                            public void run() {
                                                if (finalRb.isOk()) {
                                                    item.setTotalInReq(total_req_no);
                                                    item.setReqMark(remarkTxt);
                                                    updateReqListBtn(total_req_cnt);
                                                    listAdapterRefresh();
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
        totalReqTxt.requestFocus();
        return dlg;
    }

}