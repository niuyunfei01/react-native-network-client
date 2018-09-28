package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.ActionBar;
import android.support.v7.widget.Toolbar;
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
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.google.common.collect.Maps;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

import cn.cainiaoshicai.crm.Constants;
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
import cn.cainiaoshicai.crm.ui.helper.PicassoScrollListener;
import cn.cainiaoshicai.crm.ui.helper.StoreSpinnerHelper;

import static cn.cainiaoshicai.crm.Cts.PRICE_CONTROLLER_YES;
import static cn.cainiaoshicai.crm.Cts.RATE_PRICE_CONTROLLER_YES;
import static cn.cainiaoshicai.crm.domain.StorageItem.STORE_PROD_OFF_SALE;
import static cn.cainiaoshicai.crm.domain.StorageItem.STORE_PROD_ON_SALE;
import static cn.cainiaoshicai.crm.domain.StorageItem.STORE_PROD_SOLD_OUT;

public class StoreStorageActivity extends AbstractActionBarActivity implements StoreStorageChanged, RefreshStorageData {

    private static final int MENU_CONTEXT_DELETE_ID = 10992;
    private static final int MENU_CONTEXT_TO_SALE_ID = 10993;
    private static final int MENU_CONTEXT_TO_SOLD_OUT_ID = 10994;
    private static final int MENU_CONTEXT_EDIT_REQ = 10995;
    private static final int MENU_CONTEXT_TO_AUTO_ON_ID = 10996;
    private static final int MENU_CONTEXT_TO_LOSS = 10997;
    private static final int MENU_CONTEXT_VIEW_DETAIL = 10998;
    private static final int MENU_CONTEXT_TO_CHG_SUPPLY_PRICE = 10999;
    private StorageItemAdapter<StorageItem> listAdapter;
    private final StorageActionDao sad = new StorageActionDao(GlobalCtx.app().token());
    private ListView lv;
    private AutoCompleteTextView ctv;
    private Spinner tagFilterSpinner;
    private Spinner currStatusSpinner;
    private Button btnReqList;
    private Button btnEmptyList;
    private Button btnApplyPriceList;
    private LayoutInflater inflater;
    private int lastCategoryPos = 0;

    public static final int FILTER_ON_SALE = 1;
    public static final int FILTER_RISK = 2;
    public static final int FILTER_SOLD_OUT = 3;
    public static final int FILTER_OFF_SALE = 4;
    public static final int FILTER_SOLD_EMPTY = 5;
    public static final int FILTER_TO_SET_PRICE = 6;
    public static final int FILTER_SET_PROVIDE_PRICE = 7;
    public static final int FILTER_FREQ_PRODUCT = 8;

    public static final String SORT_BY_SOLD = "sold";
    public static final String SORT_BY_DEF = "defined";

    private int total_in_req;
    private StoreStatusStat stats;
    private Button addNewBtn;
    private ArrayAdapter<StatusItem> statusAdapter;
    private String sortBy = SORT_BY_SOLD;

    private static class StatusItem {

        static final StatusItem[] STATUS = new StatusItem[]{
                new StatusItem(FILTER_ON_SALE, "在售"),
                new StatusItem(FILTER_RISK, " 待订货"),
                new StatusItem(FILTER_SOLD_EMPTY, " 零库待订"),
                new StatusItem(FILTER_SOLD_OUT, " 缺货"),
                new StatusItem(FILTER_OFF_SALE, "已下架"),
                new StatusItem(FILTER_FREQ_PRODUCT, "平价品"),
        };

        static final StatusItem[] STATUS_PRICE_CONTROLLED = new StatusItem[]{
                new StatusItem(FILTER_ON_SALE, "在售"),
                new StatusItem(FILTER_SOLD_OUT, " 缺货"),
                new StatusItem(FILTER_SET_PROVIDE_PRICE, " 设置保底价"),
                new StatusItem(FILTER_OFF_SALE, "已下架"),
                new StatusItem(FILTER_FREQ_PRODUCT, "平价品"),
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

        public static StatusItem find(int filter, boolean isPriceControlled) {
            for (StatusItem item :
                    isPriceControlled ? STATUS_PRICE_CONTROLLED : STATUS) {
                if (item.status == filter) {
                    return item;
                }
            }

            return null;
        }

        static int findIdx(int filter, boolean isPriceControlled) {
            StatusItem[] ss = isPriceControlled ? STATUS_PRICE_CONTROLLED : STATUS;
            for (int i = 0; i < ss.length; i++) {
                if (ss[i].status == filter) {
                    return i;
                }
            }

            return -1;
        }
    }

    private int filter = FILTER_ON_SALE;
    private String searchTerm = "";

    private Store currStore;
    private Tag currTag;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        final GlobalCtx app = GlobalCtx.app();
        if (!app.appEnabledGoodMgr()) {
            app.toGoodsMgrRN(StoreStorageActivity.this);
            return;
        }

        inflater = (LayoutInflater)
                getApplicationContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        this.setContentView(R.layout.storage_status);

        this.filter = this.getIntent().getIntExtra("filter", filter);
        final int storeId = this.getIntent().getIntExtra("store_id", -1);
        this.searchTerm = this.getIntent().getStringExtra("search");
        initCurrStore(storeId);

        ActionBar bar = getSupportActionBar();
        if (bar == null) {
            AlertUtil.error(this, "系统错误: no title bar!");
            return;
        }

        bar.setCustomView(R.layout.store_list_in_title);
        View titleBar = bar.getCustomView();
        bar.setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM
                | ActionBar.DISPLAY_SHOW_HOME);
        setTitle(R.string.title_storage_status);
        Toolbar parent = (Toolbar) titleBar.getParent();
        parent.setContentInsetsAbsolute(0, 0);

        Spinner currStoreSpinner = titleBar.findViewById(R.id.spinner_curr_store);
        StoreSpinnerHelper.initStoreSpinner(this, this.currStore, new StoreSpinnerHelper.StoreChangeCallback() {
            @Override
            public void changed(Store newStore) {
                if (newStore != null) {
                    if (currStore == null || currStore.getId() != newStore.getId()) {
                        currStore = newStore;
                        AppLogger.d("start refresh data:");
                        setHeadToolBar();
                        refreshData();
                    }
                }
            }
        }, false, currStoreSpinner);

        lv = findViewById(R.id.list_storage_status);
        registerForContextMenu(lv);

        lv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                view.showContextMenu();
            }
        });

        this.btnReqList = titleBar.findViewById(R.id.btn_req_list);
        this.btnReqList.setVisibility(!app.fnEnabledReqProvide() ? View.GONE : View.VISIBLE);
        this.btnReqList.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                if (!app.fnEnabledReqProvide()) {
                    AlertUtil.error(StoreStorageActivity.this, "您使用的版本还没有开启销存模块");
                } else {
                    Intent intent = new Intent(StoreStorageActivity.this, StorageProvideActivity.class);
                    intent.putExtra("store_id", currStore.getId());
                    startActivity(intent);
                }
            }
        });

        this.btnEmptyList = titleBar.findViewById(R.id.btn_empty_list);
        this.btnEmptyList.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Store cs = StoreStorageActivity.this.currStore;
                boolean priceControlled = cs != null && cs.getFn_price_controlled() == Cts.PRICE_CONTROLLER_YES;

                if (!priceControlled) {
                    filter = StatusItem.find(FILTER_SOLD_EMPTY, priceControlled).status;
                    currStatusSpinner.setSelection(StatusItem.findIdx(filter, false));
                    searchTerm = "";
                    Tag tag = new Tag();
                    tag.setId(0);
                    currTag = tag;
                    AppLogger.d("start refresh data:");
                    refreshData();
                }
            }
        });

        ctv = findViewById(R.id.title_product_name);
        this.btnApplyPriceList = titleBar.findViewById(R.id.btn_apply_price_list);
        this.btnApplyPriceList.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //TODO redirect
                long storeId = StoreStorageActivity.this.currStore != null ? StoreStorageActivity.this.currStore.getId() : -1;
                GlobalCtx.app().toApplyChangePriceList(StoreStorageActivity.this, storeId);
            }
        });
        ImageButton searchBtn = findViewById(R.id.goods_search);
        addNewBtn = findViewById(R.id.add_new_prod);
        addNewBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                boolean isPriceControlled = currStore != null && currStore.getFn_price_controlled() == PRICE_CONTROLLER_YES;
                app.toGoodsNew(StoreStorageActivity.this, isPriceControlled, currStore != null ? currStore.getId() : 0L);
            }
        });

        ctv = findViewById(R.id.title_product_name);
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
                _do_search();
                return true;
            }
        });

        searchBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                _do_search();
            }
        });

        ctv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Object selected = parent.getAdapter().getItem(position);
                if (selected instanceof StorageItem) {
                    listAdapter.filter(String.valueOf(((StorageItem) selected).getProduct_id()));
                    InputMethodManager in = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                    if (in != null) {
                        in.hideSoftInputFromWindow(ctv.getApplicationWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
                    }
                } else {
                    Toast.makeText(StoreStorageActivity.this, "not a text item:" + selected, Toast.LENGTH_LONG).show();
                }
            }
        });

        //init first before loading done
        resetListAdapter(null, lv, ctv);

        currStatusSpinner = titleBar.findViewById(R.id.spinner_curr_status);
        statusAdapter = new ArrayAdapter<>(this, R.layout.spinner_item_small);
        boolean isPriceControlled = currStore != null && currStore.getFn_price_controlled() == PRICE_CONTROLLER_YES;

        statusAdapter.addAll(isPriceControlled ? StatusItem.STATUS_PRICE_CONTROLLED : StatusItem.STATUS);

        statusAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item_small);
        currStatusSpinner.setAdapter(statusAdapter);
        currStatusSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                StatusItem status = statusAdapter.getItem(position);
                if (status != null) {
                    filter = status.status;
                    AppLogger.d("start refresh data:");
                    refreshData();
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });
        currStatusSpinner.setSelection(StatusItem.findIdx(filter, isPriceControlled));

        final ListView categoryLv = findViewById(R.id.list_category);
        final ArrayAdapter<Tag> tagAdapter = new ArrayAdapter<>(this, R.layout.category_item_small);
        ArrayList<Tag> allTags = GlobalCtx.app().listTags(this.currStore != null ? this.currStore.getId() : 0);
        tagAdapter.addAll(allTags);
        categoryLv.setAdapter(tagAdapter);
        categoryLv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Tag tag = tagAdapter.getItem(position);
                if (tag != null) {
                    currTag = tag;
                    AppLogger.d("start refresh data:");
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
                    long currStoreId = currStore != null ? currStore.getId() : 0;
                    tagAdapter.addAll(GlobalCtx.app().listTags(currStoreId));
                    tagAdapter.notifyDataSetChanged();
                }
            }, 50);
        }

        final TextView sortBy = findViewById(R.id.title_total_last_stat);
        sortBy.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String _sort = StoreStorageActivity.this.sortBy;
                if (SORT_BY_DEF.equals(_sort)) {
                    StoreStorageActivity.this.sortBy = SORT_BY_SOLD;
                    sortBy.setText("排序：销量");
                } else {
                    StoreStorageActivity.this.sortBy = SORT_BY_DEF;
                    sortBy.setText("排序：默认");
                }

                refreshData();
            }
        });

        //Must after buttons initialized
        setHeadToolBar();
        updateFilterBtnLabels(0, 0, 0, 0, 0, 0);
    }

    public void _do_search() {
        String text = ctv.getText().toString();
        String term = !TextUtils.isEmpty(text) ? text : null;
        StoreStorageActivity.this.searchTerm = term != null ? term : "";
        listAdapter.filter(term);
        InputMethodManager in = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        if (in != null) {
            in.hideSoftInputFromWindow(ctv.getApplicationWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
        }
    }

    private void setHeadToolBar() {
        boolean isPriceControlled = currStore != null && currStore.getFn_price_controlled() == PRICE_CONTROLLER_YES;
        if (isPriceControlled) {
            this.btnReqList.setVisibility(View.INVISIBLE);
            this.btnEmptyList.setVisibility(View.INVISIBLE);
            this.btnApplyPriceList.setVisibility(View.VISIBLE);
            if (statusAdapter != null) {
                statusAdapter.clear();
                statusAdapter.addAll(StatusItem.STATUS_PRICE_CONTROLLED);
                statusAdapter.notifyDataSetChanged();
            }

            if (this.addNewBtn != null) {
                RelativeLayout.LayoutParams params = (RelativeLayout.LayoutParams) this.addNewBtn.getLayoutParams();
                params.removeRule(RelativeLayout.ALIGN_PARENT_END);
                this.addNewBtn.setLayoutParams(params);
            }
        } else {
            boolean fnEnabledReqProvide = GlobalCtx.app().fnEnabledReqProvide();
            this.btnReqList.setVisibility(fnEnabledReqProvide ? View.VISIBLE : View.GONE);
            this.btnEmptyList.setVisibility(fnEnabledReqProvide ? View.VISIBLE : View.GONE);

            this.btnApplyPriceList.setVisibility(View.INVISIBLE);

            if (statusAdapter != null) {
                statusAdapter.clear();
                statusAdapter.addAll(StatusItem.STATUS);
                statusAdapter.notifyDataSetChanged();
            }

            if (this.addNewBtn != null) {
                RelativeLayout.LayoutParams params = (RelativeLayout.LayoutParams) this.addNewBtn.getLayoutParams();
                params.addRule(RelativeLayout.ALIGN_PARENT_END);
                this.addNewBtn.setLayoutParams(params);
            }
        }
    }

    public void initCurrStore(long storeId) {
        if (storeId > 0) {
            Store store = GlobalCtx.app().findStore(storeId);
            if (store != null) {
                this.currStore = store;
            }
        }

        if (this.currStore == null) {
            storeId = SettingUtility.getListenerStore();
            Collection<Store> listStores = GlobalCtx.app().listStores();
            if (listStores == null || listStores.isEmpty()) {
                Utility.toast("正在加载店铺列表...", StoreStorageActivity.this, null, Toast.LENGTH_LONG);
            } else {
                for (Store next : listStores) {
                    if (next.getId() == storeId) {
                        currStore = next;
                        break;
                    }
                }
            }

            if (currStore == null) {
                currStore = Cts.ST_UNKNOWN;
            }
        }
    }

    private void resetListAdapter(ArrayList<StorageItem> storageItems, ListView lv, AutoCompleteTextView ctv) {

        if (storageItems == null) {
            storageItems = new ArrayList<>(0);
        }

        if (ctv != null) {
            this.searchTerm = ctv.getText().toString();
        }

        AppLogger.d("resetListAdapter:" + storageItems.size());

        if (listAdapter != null) {
            listAdapter.setStore(currStore);
            listAdapter.changeBackendData(storageItems);
            listAdapter.filter(this.searchTerm);
        } else {
            listAdapter = new StorageItemAdapter<>(this, storageItems);
            listAdapter.setStore(currStore);
            lv.setAdapter(listAdapter);
            lv.setOnScrollListener(new PicassoScrollListener(StoreStorageActivity.this));
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

    private void updateFilterBtnLabels(int totalOnSale, int totalRisk, int totalSoldOut, int totalOffSale,
                                       int total_in_req, int totalSoldEmpty) {

        boolean isPriceControlled = this.currStore.getFn_price_controlled() == Cts.PRICE_CONTROLLER_YES;

        updateFilterStatusNum(totalOnSale, totalSoldOut, totalOffSale, isPriceControlled);
        StatusItem riskItem = StatusItem.find(FILTER_RISK, isPriceControlled);
        if (riskItem != null) {
            riskItem.setNum(totalRisk);
        }
        StatusItem emptyItem = StatusItem.find(FILTER_SOLD_EMPTY, isPriceControlled);
        if (emptyItem != null) {
            emptyItem.setNum(totalSoldEmpty);
        }

        if(this.currStatusSpinner != null) {
            ((ArrayAdapter)this.currStatusSpinner.getAdapter()).notifyDataSetChanged();
        }

        updateReqListBtn(total_in_req);
        updateEmptyListBtn(totalSoldEmpty);
    }

    void updateFilterStatusNum(int totalOnSale, int totalSoldOut, int totalOffSale, boolean isPriceControlled) {
        StatusItem.find(FILTER_ON_SALE, isPriceControlled).setNum(totalOnSale);
        StatusItem.find(FILTER_SOLD_OUT, isPriceControlled).setNum(totalSoldOut);
        StatusItem.find(FILTER_OFF_SALE, isPriceControlled).setNum(totalOffSale);
        if(this.currStatusSpinner != null) {
            ((ArrayAdapter)this.currStatusSpinner.getAdapter()).notifyDataSetChanged();
        }
    }

    void updateReqListBtn(int total_in_req) {
        this.total_in_req = total_in_req;
        if (this.btnReqList != null) {
            this.btnReqList.setText("订货(" + total_in_req + ")");
        }
    }

    void updateEmptyListBtn(int total) {
        if (this.btnEmptyList != null) {
            this.btnEmptyList.setText("零库存(" +  total + ")");
        }
    }

    private void updateAdapterData(ArrayList<StorageItem> storageItems) {
        resetListAdapter(storageItems, lv, ctv);
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
                    result = sad.getStorageItems(currStore, filter, currTag, sortBy);
                    return null;
                } catch (final ServiceException e) {
                    AppLogger.e("error to refresh storage items:" + currStore, e);
                    StoreStorageActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            StoreStorageActivity activity = StoreStorageActivity.this;
                            if (!activity.isFinishing()) {
                                AlertUtil.showAlert(activity, "错误提示", e.getError());
                            }
                            cancel(true);
                        }
                    });
                    result = null;
                }

                cancel(true);
                return null;
            }

            @Override
            protected void onCancelled(Void aVoid) {
                super.onCancelled(aVoid);
                progressFragment.dismissAllowingStateLoss();
            }

            @Override
            protected void onPostExecute(Void aVoid) {
                try {
                    progressFragment.dismissAllowingStateLoss();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                if (result != null) {
                    StoreStorageActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            updateAdapterData(result.first);
                            StoreStatusStat sec = result.second;
                            if (sec != null) {
                                StoreStorageActivity.this.stats = sec;
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

        GlobalCtx app = GlobalCtx.app();

        AdapterView.AdapterContextMenuInfo info = (AdapterView.AdapterContextMenuInfo) menuInfo;
        StorageItem item = listAdapter.getItem(info.position);
        if (item != null) {
            String title = item.pidAndNameStr(false);
            menu.setHeaderTitle(title);

            if (item.getStatus() == StorageItem.STORE_PROD_SOLD_OUT) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_AUTO_ON_ID, Menu.NONE, "设置自动上架");
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SALE_ID, Menu.NONE, "恢复售卖");
            } else if (item.getStatus() == STORE_PROD_OFF_SALE) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SALE_ID, Menu.NONE, "上架(限店长)");
            } else if (item.getStatus() == StorageItem.STORE_PROD_ON_SALE) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_SOLD_OUT_ID, Menu.NONE, "暂停售卖");
            }

            if (app.fnEnabledLoss()) {
                if (item.getStatus() != STORE_PROD_OFF_SALE) {
                    menu.add(Menu.NONE, MENU_CONTEXT_EDIT_REQ, Menu.NONE, item.getTotalInReq() > 0 ? "编辑订货" : "订货");
                }
                menu.add(Menu.NONE, MENU_CONTEXT_TO_LOSS, Menu.NONE, "报损");
            }

            if (currStore != null && currStore.getFn_price_controlled() == PRICE_CONTROLLER_YES) {
                menu.add(Menu.NONE, MENU_CONTEXT_TO_CHG_SUPPLY_PRICE, Menu.NONE, "修改保底价");
            }

            menu.add(Menu.NONE, MENU_CONTEXT_VIEW_DETAIL, Menu.NONE, "修改历史");
        }
    }

    class ItemStatusUpdated {
        private Runnable additional;
        private final StoreStorageActivity activity;

        ItemStatusUpdated(StoreStorageActivity activity) {
            this.activity = activity;
        }

        void updated(int fromStatus, int destStatus) {
            StoreStatusStat st = activity.stats;
            if (st != null && fromStatus != destStatus) {
                switch (fromStatus) {
                    case STORE_PROD_OFF_SALE:
                        st.setTotal_off_sale(st.getTotal_off_sale() - 1);
                        break;
                    case STORE_PROD_ON_SALE:
                        st.setTotal_on_sale(st.getTotal_on_sale() - 1);
                        break;
                    case STORE_PROD_SOLD_OUT:
                        st.setTotal_sold_out(st.getTotal_sold_out() - 1);
                        break;

                }
                switch (destStatus) {
                    case STORE_PROD_OFF_SALE:
                        st.setTotal_off_sale(st.getTotal_off_sale() + 1);
                        break;
                    case STORE_PROD_ON_SALE:
                        st.setTotal_on_sale(st.getTotal_on_sale() + 1);
                        break;
                    case STORE_PROD_SOLD_OUT:
                        st.setTotal_sold_out(st.getTotal_sold_out() + 1);
                        break;
                }
                boolean isPriceControlled = currStore != null && currStore.getFn_price_controlled() == Cts.PRICE_CONTROLLER_YES;
                updateFilterStatusNum(st.getTotal_on_sale(), st.getTotal_sold_out(), st.getTotal_off_sale(), isPriceControlled);
            }
            if (additional != null) {
                additional.run();
            }
        }

        void setAdditional(Runnable additional) {
            this.additional = additional;
        }
    }

    @Override
    public boolean onContextItemSelected(MenuItem mi) {
        AdapterView.AdapterContextMenuInfo info = (AdapterView.AdapterContextMenuInfo) mi.getMenuInfo();
        AppLogger.d("reset storage item pos=" + info.position);
        final StorageItem item = this.listAdapter.getItem(info.position);
        final GlobalCtx app = GlobalCtx.app();
        ItemStatusUpdated changed = new ItemStatusUpdated(this);
        changed.setAdditional(new Runnable() {
            @Override
            public void run() {
                listAdapter.notifyDataSetChanged();
            }
        });

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
                if (item != null && item.getStatus() == STORE_PROD_OFF_SALE) {
                    changed.setAdditional(new Runnable() {
                        @Override
                        public void run() {
                            listAdapterRefresh();
                            refreshData();
                        }
                    });
                }
                StoreStorageHelper.action_chg_status(this, currStore, item, StorageItem.STORE_PROD_ON_SALE, "恢复售卖", changed);
                return true;
            case MENU_CONTEXT_TO_AUTO_ON_ID:
                StoreStorageHelper.createSetOnSaleDlg(this, item, changed, true).show();
                return true;

            case MENU_CONTEXT_TO_SOLD_OUT_ID:
                changed.setAdditional(new Runnable() {
                    @Override
                    public void run() {
                        listAdapterRefresh();
                        refreshData();
                    }
                });
                StoreStorageHelper.createSetOnSaleDlg(StoreStorageActivity.this, item, changed).show();
                return true;
            case MENU_CONTEXT_EDIT_REQ:
                AlertDialog dlg = StoreStorageHelper.createEditProvideDlg(this, item);
                dlg.show();
                return true;
            case MENU_CONTEXT_TO_LOSS:
                if (!app.fnEnabledLoss()) {
                    AlertUtil.error(this, "您使用的版本还没有开启报损模块");
                } else {
                    if (item != null) {
                        int itemId = item.getId();
                        GeneralWebViewActivity.gotoWeb(StoreStorageActivity.this, URLHelper.WEB_URL_ROOT + "/stores/prod_loss/" + itemId);
                    }
                }
                return true;
            case MENU_CONTEXT_VIEW_DETAIL:
                if (item != null) {
                    String url = URLHelper.getStoresPrefix() + "/store_product/" + item.getId();
                    GeneralWebViewActivity.gotoWeb(StoreStorageActivity.this, url);
                }
                return true;
            case MENU_CONTEXT_TO_CHG_SUPPLY_PRICE:
                if (item != null&&currStore.getFn_price_controlled() == PRICE_CONTROLLER_YES) {
                    Gson gson = new Gson();
                    Map<String, String> params = Maps.newHashMap();
                    params.put("pid", item.getProduct_id() + "");
                    params.put("storeId", item.getStore_id() + "");
                    params.put("storeProduct", gson.toJson(item));
                    if (currStore.getFn_rate_price_controlled() == RATE_PRICE_CONTROLLER_YES) {
                        GlobalCtx.app().toRNChgSupplyPriceView(this, Constants.CHG_PRICE_RATE_TYPE, params);
                    } else {
                        GlobalCtx.app().toRNChgSupplyPriceView(this, Constants.CHG_PRICE_SUPPLY_TYPE, params);
                    }
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