package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
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
import android.widget.EditText;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Collection;

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

public class StoreStorageActivity extends AbstractActionBarActivity {

    private static final int MENU_CONTEXT_DELETE_ID = 10992;
    private static final int MENU_CONTEXT_TO_SALE_ID = 10993;
    private static final int MENU_CONTEXT_TO_SOLD_OUT_ID = 10994;
    private static final int MENU_CONTEXT_EDIT_REQ = 10995;
    private StorageItemAdapter<StorageItem> listAdapter;
    private final StorageActionDao sad = new StorageActionDao(GlobalCtx.getInstance().getSpecialToken());
    private ListView lv;
    private AutoCompleteTextView ctv;
    private Spinner currStoreSpinner;
    private Spinner tagFilterSpinner;
    private Spinner currStatusSpinner;

    private static final int FILTER_ON_SALE = 1;
    private static final int FILTER_RISK = 2;
    private static final int FILTER_SOLD_OUT = 3;
    private static final int FILTER_OFF_SALE = 4;


    private static class StatusItem {
        static final StatusItem[] STATUS = new StatusItem[]{
                new StatusItem(FILTER_ON_SALE, "在售"),
                new StatusItem(FILTER_RISK, " 安全库存"),
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


    private int filter = FILTER_ON_SALE;

    private Store currStore;
    private Tag currTag;

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

            ctv = (AutoCompleteTextView) findViewById(R.id.title_product_name);
            ctv.setThreshold(1);
            ctv.setOnFocusChangeListener(new View.OnFocusChangeListener() {
                @Override
                public void onFocusChange(View v, boolean hasFocus) {
                    AutoCompleteTextView view = (AutoCompleteTextView) v;
                    if (hasFocus) {
                        view.showDropDown();
                    }
                }
            });
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
            final ArrayAdapter<StatusItem> statusAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item);
            statusAdapter.addAll(StatusItem.STATUS);
            statusAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
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
            final ArrayAdapter<Tag> tagAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item);
            ArrayList<Tag> allTags = GlobalCtx.getInstance().listTags();
            tagAdapter.addAll(allTags);
            tagAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
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
                }, 2000);
            }

            currStoreSpinner = (Spinner) findViewById(R.id.spinner_curr_store);
            final ArrayAdapter<Store> arrAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_item);
            arrAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            currStoreSpinner.setAdapter(arrAdapter);
            currStoreSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
                @Override
                public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                    Store newStore = arrAdapter.getItem(position);
                    if (newStore != null) {
                        if (currStore == null || currStore.getId() != newStore.getId()) {
                            currStore = newStore;
                            refreshData();
                        }

                        SettingUtility.setCurrentStorageStore(newStore.getId());
                    }
                }

                @Override
                public void onNothingSelected(AdapterView<?> parent) {
                }
            });

            Collection<Store> stores = GlobalCtx.getInstance().listStores();
            if (stores == null || stores.isEmpty()) {
                Utility.toast("正在加载店铺列表，请重试...", this, null);
            }

            if (stores != null) {
                arrAdapter.addAll(stores);
            }
            if (currStore == null) {
                if (stores != null) {

                    int stoId = SettingUtility.getCurrentStorageStore();

                    for (Store next : stores) {
                        if (next.getId() == stoId) {
                            currStore = next;
                            break;
                        }
                    }
                }

                if (currStore == null) {
                    currStore = Cts.ST_HLG;
                }
            }
            currStoreSpinner.setSelection(arrAdapter.getPosition(currStore));

            updateFilterBtnLabels(0, 0, 0, 0);
            refreshData();
        }
    }

    private void resetListAdapter(ArrayList<StorageItem> storageItems) {

        lv.setAdapter(null);

        listAdapter = new StorageItemAdapter<>(this, storageItems);
        lv.setAdapter(listAdapter);
        listAdapter.notifyDataSetChanged();

        if (ctv != null) {
            ArrayAdapter<StorageItem> ctvAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1);
            ctvAdapter.addAll(storageItems);
            ctv.setAdapter(ctvAdapter);
        }

//        lv.addFooterView(findViewById(R.id.paged_overview));

    }

    private void updateFilterBtnLabels(int totalOnSale, int totalRisk, int totalSoldOut, int totalOffSale) {
        StatusItem.find(FILTER_ON_SALE).setNum(totalOnSale);
        StatusItem.find(FILTER_OFF_SALE).setNum(totalOffSale);
        StatusItem.find(FILTER_RISK).setNum(totalRisk);
        StatusItem.find(FILTER_SOLD_OUT).setNum(totalSoldOut);

        if(this.currStatusSpinner != null) {
            ((ArrayAdapter)this.currStatusSpinner.getAdapter()).notifyDataSetChanged();
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
        StorageItem item = listAdapter.getItem(info.position);
        if (item != null) {
            String title = item.getIdAndNameStr(false);
            menu.setHeaderTitle(title);

            menu.add(Menu.NONE, MENU_CONTEXT_DELETE_ID, Menu.NONE, "设置库存");

            if (item.getStatus() == StorageItem.STORE_PROD_SOLD_OUT) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SALE_ID, Menu.NONE, "开始售卖");
            } else if (item.getStatus() == StorageItem.STORE_PROD_ON_SALE) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SOLD_OUT_ID, Menu.NONE, "暂停售卖");
            }

            if (item.getStatus() != StorageItem.STORE_PROD_OFF_SALE) {
                menu.add(Menu.NONE, MENU_CONTEXT_EDIT_REQ, Menu.NONE, hasReqNumber() ? "编辑调货" : "加入调货");
            }
        }
    }

    private boolean hasReqNumber() {
        return false;
    }

    @Override
    public boolean onContextItemSelected(MenuItem item) {
        AdapterView.AdapterContextMenuInfo info = (AdapterView.AdapterContextMenuInfo) item.getMenuInfo();
        AppLogger.d("reset storage item pos=" + info.position);
        final StorageItem storageItem = this.listAdapter.getItem(info.position);

        switch (item.getItemId()) {
            case MENU_CONTEXT_DELETE_ID:
                LayoutInflater inflater = (LayoutInflater)
                        getApplicationContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
                View npView = inflater.inflate(R.layout.number_edit_dialog_layout, null);
                final EditText et = (EditText) npView.findViewById(R.id.number_edit_txt);
                if (storageItem != null) {
                    et.setText(String.valueOf(storageItem.getLeft_since_last_stat()));
                    AlertDialog dlg = new AlertDialog.Builder(this)
                            .setTitle(String.format("设置库存数:(%s)", storageItem.getName()))
                            .setView(npView)
                            .setPositiveButton(R.string.ok,
                                    new DialogInterface.OnClickListener() {
                                        public void onClick(DialogInterface dialog, int whichButton) {
                                            new MyAsyncTask<Void, Void, Void>() {
                                                @Override
                                                protected Void doInBackground(Void... params) {

                                                    ResultBean rb;
                                                    final int lastStat = Integer.parseInt(et.getText().toString());
                                                    try {
                                                        rb = sad.store_status_reset_stat_num(currStore.getId(), storageItem.getProduct_id(), lastStat);
                                                    } catch (ServiceException e) {
                                                        rb = new ResultBean(false, "访问服务器出错");
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
                } else {
                    return false;
                }
            case MENU_CONTEXT_TO_SALE_ID:
                action_chg_status(storageItem, StorageItem.STORE_PROD_ON_SALE, "开始售卖");
                return true;
            case MENU_CONTEXT_TO_SOLD_OUT_ID:
                action_chg_status(storageItem, StorageItem.STORE_PROD_SOLD_OUT, "暂停售卖");
                return true;
            case MENU_CONTEXT_EDIT_REQ:
                Utility.toast("还没有开放", StoreStorageActivity.this, null);
                return true;
            default:
                return super.onContextItemSelected(item);
        }
    }

    private void action_chg_status(final StorageItem storageItem, final int destStatus, final String desc) {
        if (storageItem != null) {
            if (storageItem.getStatus() == destStatus) {
                return;
            }
            new MyAsyncTask<Void, Void, Void>() {
                @Override
                protected Void doInBackground(Void... params) {
                    ResultBean rb;
                    try {
                        rb = sad.chg_item_status(currStore.getId(), storageItem.getProduct_id(), storageItem.getStatus(), destStatus);
                    } catch (ServiceException e) {
                        rb = new ResultBean(false, "访问服务器出错");
                    }

                    String msg;
                    Runnable uiCallback = null;
                    if (rb.isOk()) {
                        msg = "已将" + storageItem.getIdAndNameStr() + "设置为" + desc + "!";
                        uiCallback = new Runnable() {
                            @Override
                            public void run() {
                                storageItem.setStatus(destStatus);
                                listAdapter.notifyDataSetChanged();
                            }
                        };
                    } else {
                        msg = "设置失败:" + rb.getDesc();
                    }
                    Utility.toast(msg, StoreStorageActivity.this, uiCallback);
                    return null;
                }
            }.executeOnIO();
        } else {
            Utility.toast("没有找到您指定的商品", this, null);
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