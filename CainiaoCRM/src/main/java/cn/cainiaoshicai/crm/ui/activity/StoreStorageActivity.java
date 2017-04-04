package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.ActionBar;
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
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.StoreStatusStat;
import cn.cainiaoshicai.crm.domain.Tag;
import cn.cainiaoshicai.crm.orders.util.AlertUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.adapter.StorageItemAdapter;
import cn.cainiaoshicai.crm.ui.helper.StoreSpinnerHelper;

public class StoreStorageActivity extends AbstractActionBarActivity implements StoreStorageChanged, RefreshStorageData {

    private static final int MENU_CONTEXT_DELETE_ID = 10992;
    private static final int MENU_CONTEXT_TO_SALE_ID = 10993;
    private static final int MENU_CONTEXT_TO_SOLD_OUT_ID = 10994;
    private static final int MENU_CONTEXT_EDIT_REQ = 10995;
    private static final int MENU_CONTEXT_TO_AUTO_ON_ID = 10996;
    private static final int MENU_CONTEXT_TO_LOSS = 10997;
    private StorageItemAdapter<StorageItem> listAdapter;
    private final StorageActionDao sad = new StorageActionDao(GlobalCtx.getInstance().getSpecialToken());
    private ListView lv;
    private AutoCompleteTextView ctv;
    private Spinner tagFilterSpinner;
    private Spinner currStatusSpinner;
    private Button btnReqList;
    private Button btnEmptyList;
    private LayoutInflater inflater;
    private int lastCategoryPos = 0;

    public static final int FILTER_ON_SALE = 1;
    public static final int FILTER_RISK = 2;
    public static final int FILTER_SOLD_OUT = 3;
    public static final int FILTER_OFF_SALE = 4;
    public static final int FILTER_SOLD_EMPTY = 5;

    private int total_in_req;

    private static class StatusItem {
        static final StatusItem[] STATUS = new StatusItem[]{
                new StatusItem(FILTER_ON_SALE, "在售"),
                new StatusItem(FILTER_RISK, " 待订货"),
                new StatusItem(FILTER_SOLD_EMPTY, " 零库待订"),
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
    private String searchTerm = "";

    private Store currStore;
    private Tag currTag;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        inflater = (LayoutInflater)
                getApplicationContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        if (savedInstanceState == null) {
            this.setContentView(R.layout.storage_status);

            this.filter = this.getIntent().getIntExtra("filter", filter);
            int storeId = this.getIntent().getIntExtra("store_id", -1);
            this.searchTerm = this.getIntent().getStringExtra("search");
            if (storeId > 0) {
                Store store = GlobalCtx.getInstance().findStore(storeId);
                if (store != null) {
                    this.currStore = store;
                }
            }

            setTitle(R.string.title_storage_status);
            this.getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            lv = (ListView) findViewById(R.id.list_storage_status);
            registerForContextMenu(lv);

            lv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    StorageItem item = listAdapter.getItem(position);
                    if (item != null) {
                        String url = URLHelper.getStoresPrefix() + "/store_product/" + item.getId();
                        GeneralWebViewActivity.gotoWeb(StoreStorageActivity.this, url);
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

            this.btnEmptyList = (Button) findViewById(R.id.btn_empty_list);
            this.btnEmptyList.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    filter = StatusItem.find(FILTER_SOLD_EMPTY).status;
                    currStatusSpinner.setSelection(StatusItem.findIdx(filter));
                    searchTerm = "";
                    Tag tag = new Tag();
                    tag.setId(0);
                    currTag = tag;
                    refreshData();
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
                    String term = !TextUtils.isEmpty(text) ? text.toString() : null;
                    StoreStorageActivity.this.searchTerm = term != null ? term : "";
                    listAdapter.filter(term);
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

            final ListView categoryLv = (ListView) findViewById(R.id.list_category);
            final ArrayAdapter<Tag> tagAdapter = new ArrayAdapter<>(this, R.layout.category_item_small);
            ArrayList<Tag> allTags = GlobalCtx.getInstance().listTags();
            tagAdapter.addAll(allTags);
            categoryLv.setAdapter(tagAdapter);
            categoryLv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    Tag tag = tagAdapter.getItem(position);
                    if (tag != null) {
                        currTag = tag;
                        refreshData();
                        view.setBackgroundColor(getResources().getColor(R.color.white));

                        int lastPos = StoreStorageActivity.this.lastCategoryPos;
                        StoreStorageActivity.this.lastCategoryPos = position;

                        View lastView = getViewByPosition(lastPos, categoryLv);
                        lastView.setBackgroundColor(ContextCompat.getColor(StoreStorageActivity.this, R.color.lightgray));
                    }


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


            ActionBar bar = getSupportActionBar();
            bar.setCustomView(R.layout.store_list_in_title);

            Spinner currStoreSpinner = (Spinner) bar.getCustomView().findViewById(R.id.spinner_curr_store);
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
            }, false, currStoreSpinner);

            bar.setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM
                    | ActionBar.DISPLAY_SHOW_HOME);


            updateFilterBtnLabels(0, 0, 0, 0, 0, 0);
            refreshData();
        }
    }

    private void resetListAdapter(ArrayList<StorageItem> storageItems) {

        if (storageItems == null) {
            storageItems = new ArrayList<>(0);
        }

        if (ctv != null) {
            this.searchTerm = ctv.getText().toString();
        }

        AppLogger.d("resetListAdapter:" + storageItems.toString());

        if (listAdapter != null) {
            listAdapter.changeBackendData(storageItems);
            listAdapter.filter(this.searchTerm);
        } else {
            listAdapter = new StorageItemAdapter<>(this, storageItems);
            lv.setAdapter(listAdapter);
            listAdapter.filter(this.searchTerm);
            listAdapter.notifyDataSetChanged();
        }

        if (ctv != null) {
            ArrayAdapter<StorageItem> ctvAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1);
            ctvAdapter.addAll(storageItems);
            ctv.setAdapter(ctvAdapter);
        }
    }

    public View getViewByPosition(int pos, ListView listView) {
        final int firstListItemPosition = listView.getFirstVisiblePosition();
        final int lastListItemPosition = firstListItemPosition + listView.getChildCount() - 1;

        if (pos < firstListItemPosition || pos > lastListItemPosition ) {
            return listView.getAdapter().getView(pos, null, listView);
        } else {
            final int childIndex = pos - firstListItemPosition;
            return listView.getChildAt(childIndex);
        }
    }

    private void updateFilterBtnLabels(int totalOnSale, int totalRisk, int totalSoldOut, int totalOffSale, int total_in_req, int totalSoldEmpty) {
        StatusItem.find(FILTER_ON_SALE).setNum(totalOnSale);
        StatusItem.find(FILTER_OFF_SALE).setNum(totalOffSale);
        StatusItem.find(FILTER_RISK).setNum(totalRisk);
        StatusItem.find(FILTER_SOLD_OUT).setNum(totalSoldOut);
        StatusItem.find(FILTER_SOLD_EMPTY).setNum(totalSoldEmpty);

        if(this.currStatusSpinner != null) {
            ((ArrayAdapter)this.currStatusSpinner.getAdapter()).notifyDataSetChanged();
        }

        updateReqListBtn(total_in_req);
        updateEmptyListBtn(totalSoldEmpty);
    }

    void updateReqListBtn(int total_in_req) {
        this.total_in_req = total_in_req;
        if (this.btnReqList != null) {
            this.btnReqList.setText("订货单(" + total_in_req + ")");
        }
    }

    void updateEmptyListBtn(int total) {
        if (this.btnEmptyList != null) {
            this.btnEmptyList.setText("零库存(" +  total + ")");
        }
    }

    private void updateAdapterData(ArrayList<StorageItem> storageItems) {
        resetListAdapter(storageItems);
    }

    public void refreshData() {
        new MyAsyncTask<Void, Void, Void>(){
            private ProgressFragment progressFragment = ProgressFragment.newInstance(R.string.refreshing);
            Pair<ArrayList<StorageItem>, StoreStatusStat> result;

            @Override
            protected void onPreExecute() {
                progressFragment.setAsyncTask(this);
                Utility.forceShowDialog(StoreStorageActivity.this, progressFragment);
            }

            @Override
            protected Void doInBackground(Void... params) {
                try {
                    result = sad.getStorageItems(currStore, filter, currTag);
                    return null;
                } catch (final ServiceException e) {
                    e.printStackTrace();
                    AppLogger.e("error to refresh storage items:" + currStore, e);
                    StoreStorageActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            AlertUtil.showAlert(StoreStorageActivity.this, "错误提示", e.getError());
                            cancel(true);
                        }
                    });
                }

                cancel(true);
                return null;
            }

            @Override
            protected void onPostExecute(Void aVoid) {
                if (result != null) {
//                if (progressFragment.isVisible()) {
                    progressFragment.dismissAllowingStateLoss();
//                }
                    StoreStorageActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            updateAdapterData(result.first);
                            StoreStatusStat sec = result.second;
                            if (sec != null) {
                                updateFilterBtnLabels(sec.getTotal_on_sale(), sec.getTotal_risk(),
                                        sec.getTotal_sold_out(), sec.getTotal_off_sale(),
                                        sec.getTotal_req_cnt(), sec.getTotal_sold_empty());
                            }
                        }
                    });
                }
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
            String title = item.pidAndNameStr(false);
            menu.setHeaderTitle(title);

            if (item.getStatus() == StorageItem.STORE_PROD_SOLD_OUT) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_AUTO_ON_ID, Menu.NONE, "设置自动上架");
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SALE_ID, Menu.NONE, "恢复售卖");
            } else if (item.getStatus() == StorageItem.STORE_PROD_OFF_SALE) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SALE_ID, Menu.NONE, "上架(限店长)");
            } else if (item.getStatus() == StorageItem.STORE_PROD_ON_SALE) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SOLD_OUT_ID, Menu.NONE, "暂停售卖");
            }

            if (item.getStatus() != StorageItem.STORE_PROD_OFF_SALE) {
                menu.add(Menu.NONE, MENU_CONTEXT_EDIT_REQ, Menu.NONE, item.getTotalInReq() > 0 ? "编辑订货" : "订货");
            }

            menu.add(Menu.NONE, MENU_CONTEXT_TO_LOSS, Menu.NONE, "报损");
        }
    }

    @Override
    public boolean onContextItemSelected(MenuItem mi) {
        AdapterView.AdapterContextMenuInfo info = (AdapterView.AdapterContextMenuInfo) mi.getMenuInfo();
        AppLogger.d("reset storage item pos=" + info.position);
        final StorageItem item = this.listAdapter.getItem(info.position);
        Runnable changed = new Runnable() {
            @Override
            public void run() {
                listAdapter.notifyDataSetChanged();
            }
        };

        switch (mi.getItemId()) {
            case MENU_CONTEXT_DELETE_ID:
                if (item != null) {
                    AlertDialog dlg = StoreStorageHelper.createEditLeftNum(this, item, inflater, notifyDataSetChanged());
                    dlg.show();
                    return true;
                } else {
                    return false;
                }
            case MENU_CONTEXT_TO_SALE_ID:
                Runnable after;
                if (item != null && item.getStatus() == StorageItem.STORE_PROD_OFF_SALE) {
                    after = new Runnable() {
                        @Override
                        public void run() {
                            listAdapterRefresh();
                            refreshData();
                        }
                    };
                } else {
                    after = changed;
                }
                StoreStorageHelper.action_chg_status(this, currStore, item, StorageItem.STORE_PROD_ON_SALE, "恢复售卖", after);
                return true;
            case MENU_CONTEXT_TO_AUTO_ON_ID:
                StoreStorageHelper.createSetOnSaleDlg(this, item, changed, true).show();
                return true;

            case MENU_CONTEXT_TO_SOLD_OUT_ID:
                StoreStorageHelper.createSetOnSaleDlg(StoreStorageActivity.this, item, new Runnable() {
                    @Override
                    public void run() {
                        listAdapterRefresh();
                        refreshData();
                    }
                }).show();
                return true;
            case MENU_CONTEXT_EDIT_REQ:
                AlertDialog dlg = StoreStorageHelper.createEditProvideDlg(this, item);
                dlg.show();
                return true;
            case MENU_CONTEXT_TO_LOSS:
                if (item != null) {
                    int itemId = item.getId();
                    GeneralWebViewActivity.gotoWeb(StoreStorageActivity.this, URLHelper.WEB_URL_ROOT + "/stores/prod_loss/" + itemId);
                }
                return true;
            default:
                return super.onContextItemSelected(mi);
        }
    }

    void listAdapterRefresh() {
        listAdapter.notifyDataSetChanged();
        listAdapter.filter(this.searchTerm);
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

}