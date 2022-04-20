package cn.cainiaoshicai.crm.ui.activity;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.widget.Toolbar;
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
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.google.common.collect.Maps;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.MainOrdersActivity;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.StoreStatusStat;
import cn.cainiaoshicai.crm.domain.Tag;
import cn.cainiaoshicai.crm.domain.Vendor;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.util.AlertUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.adapter.StorageItemAdapter;
import cn.cainiaoshicai.crm.ui.helper.PicassoScrollListener;
import retrofit2.Callback;
import retrofit2.Response;

import static cn.cainiaoshicai.crm.Cts.PRICE_CONTROLLER_YES;
import static cn.cainiaoshicai.crm.Cts.STORE_UNKNOWN;
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
    private static final int MENU_CONTEXT_ADD_BUY_RECORD = 11000;
    private static final int MENU_CONTEXT_WAREHOUSE = 11001;
    private static final int MENU_CONTEXT_INVENTORY_DETAIL = 11003;
    private static final int MENU_CONTEXT_STOCK_CHECK = 11002;
    private StorageItemAdapter<StorageItem> listAdapter;
    private final StorageActionDao sad = new StorageActionDao(GlobalCtx.app().token());
    private ListView lv;
    private AutoCompleteTextView ctv;
    private Spinner tagFilterSpinner;
    private Spinner currStatusSpinner;
    private Button btnReqList;
    private Button btnRefillList;
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
    public static final int FILTER_FREQ_PRODUCT = 20;
    public static final int FILTER_NO_CODE = 21;
    public static final int FILTER_NO_SHELF = 22;
    public static final int FILTER_SALES_TIME = 23;
    public static final int FILTER_BY_SHELF = 24;
    public static final int FILTER_ = 8;

    public static final String SORT_BY_SOLD = "sold";
    public static final String SORT_BY_DEF = "defined";
    public static final String SORT_BY_UPDATE = "update";
    public static final String SORT_BY_STORAGE = "storage";

    private int total_in_req;
    private StoreStatusStat stats;
    private Button addNewBtn;
    private ArrayAdapter<StatusItem> statusAdapter;
    private String sortBy = SORT_BY_SOLD;

    private static class StatusItem {

        static final StatusItem[] STATUS = new StatusItem[]{
                new StatusItem(FILTER_ON_SALE, "在售"),
                new StatusItem(FILTER_SOLD_OUT, "缺货"),
                new StatusItem(FILTER_OFF_SALE, "已下架"),
        };

        static final StatusItem[] STATUS_PROVIDING = new StatusItem[]{
                new StatusItem(FILTER_ON_SALE, "在售"),
                new StatusItem(FILTER_SOLD_OUT, "缺货"),
                new StatusItem(FILTER_OFF_SALE, "已下架"),
                new StatusItem(FILTER_RISK, "待补货"),
                new StatusItem(FILTER_SOLD_EMPTY, "零库存"),
                new StatusItem(FILTER_FREQ_PRODUCT, "待盘点"),
        };

        static final StatusItem[] STATUS_PRICE_CONTROLLED = new StatusItem[]{
                new StatusItem(FILTER_ON_SALE, "在售"),
                new StatusItem(FILTER_SOLD_OUT, "缺货"),
                new StatusItem(FILTER_OFF_SALE, "已下架"),
        };

        static final StatusItem[] STATUS_PRICE_CTRL_PROVIDING = new StatusItem[]{
                new StatusItem(FILTER_ON_SALE, "在售"),
                new StatusItem(FILTER_SOLD_OUT, "缺货"),
                new StatusItem(FILTER_OFF_SALE, "已下架"),
                new StatusItem(FILTER_RISK, "待补货"),
                new StatusItem(FILTER_SOLD_EMPTY, "零库存"),
                new StatusItem(FILTER_FREQ_PRODUCT, "待盘点"),
                new StatusItem(FILTER_NO_CODE, "无编号"),
                new StatusItem(FILTER_NO_SHELF, "无货架"),
                new StatusItem(FILTER_SALES_TIME, "有限时"),
                new StatusItem(FILTER_BY_SHELF, "按货架"),
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
            Vendor v = GlobalCtx.app().getVendor();
            boolean fnProviding = v == null ? false : v.isFnProviding();
            for (StatusItem item : getSs(isPriceControlled, fnProviding)) {
                if (item.status == filter) {
                    return item;
                }
            }

            return new StatusItem(0, "-");
        }

        static int findIdx(int filter, boolean isPriceControlled) {
            Vendor v = GlobalCtx.app().getVendor();
            boolean fnProviding = v != null && v.isFnProviding();
            StatusItem[] ss = getSs(isPriceControlled, fnProviding);
            for (int i = 0; i < ss.length; i++) {
                if (ss[i].status == filter) {
                    return i;
                }
            }

            return -1;
        }

        private static StatusItem[] getSs(boolean isPriceControlled, boolean fnProviding) {
            return isPriceControlled ? (fnProviding ? STATUS_PRICE_CTRL_PROVIDING : STATUS_PRICE_CONTROLLED)
                    : (fnProviding ? STATUS_PROVIDING : STATUS);
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
//        if (!app.appEnabledGoodMgr()) {
//            app.toGoodsMgrRN(StoreStorageActivity.this);
//            return;
//        }

        inflater = (LayoutInflater)
                getApplicationContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        this.setContentView(R.layout.storage_status);

        this.filter = this.getIntent().getIntExtra("filter", filter);
        int storeId = this.getIntent().getIntExtra("store_id", 0);
        if (storeId == 0) {
            storeId = (int) SettingUtility.getListenerStore();
        }
        if (storeId == 0) {
            storeId = STORE_UNKNOWN;
        }
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

        lv = findViewById(R.id.list_storage_status);
        registerForContextMenu(lv);

        lv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                view.showContextMenu();
            }
        });

        this.btnReqList = titleBar.findViewById(R.id.btn_req_list);
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

        this.btnRefillList = titleBar.findViewById(R.id.btn_refill_list);
        this.btnRefillList.setOnClickListener(v -> {
            //Store cs = StoreStorageActivity.this.currStore;
            //boolean priceControlled = cs != null && cs.getFn_price_controlled() == Cts.PRICE_CONTROLLER_YES;
            final Vendor vendor = GlobalCtx.app().getVendor();
            final boolean fnProviding = v != null && vendor.isFnProviding();
            if (fnProviding) {
                filter = StatusItem.find(FILTER_RISK, false).status;
                currStatusSpinner.setSelection(StatusItem.findIdx(filter, false));
                searchTerm = "";
                Tag tag = new Tag();
                tag.setId(0);
                currTag = tag;
                AppLogger.d("start refresh data:");
                refreshData();
            }
        });

        this.btnApplyPriceList = titleBar.findViewById(R.id.btn_apply_price_list);
        this.btnApplyPriceList.setOnClickListener(view -> {
            //TODO redirect
            long storeId1 = StoreStorageActivity.this.currStore != null ? StoreStorageActivity.this.currStore.getId() : -1;
            GlobalCtx.app().toApplyChangePriceList(StoreStorageActivity.this, storeId1);
        });
        ImageButton searchBtn = findViewById(R.id.goods_search);
        addNewBtn = findViewById(R.id.add_new_prod);
        addNewBtn.setOnClickListener(v -> {
            //boolean isPriceControlled = currStore != null && currStore.getFn_price_controlled() == PRICE_CONTROLLER_YES;
            app.toGoodsNew(StoreStorageActivity.this, filterBtnControlled(), currStore != null ? currStore.getId() : 0L);
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

        searchBtn.setOnClickListener(v -> _do_search());

        ctv.setOnItemClickListener((parent1, view, position, id) -> {
            Object selected = parent1.getAdapter().getItem(position);
            if (selected instanceof StorageItem) {
                listAdapter.filter(String.valueOf(((StorageItem) selected).getProduct_id()));
                InputMethodManager in = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
                if (in != null) {
                    in.hideSoftInputFromWindow(ctv.getApplicationWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
                }
            } else {
                Toast.makeText(StoreStorageActivity.this, "not a text item:" + selected, Toast.LENGTH_LONG).show();
            }
        });

        //init first before loading done
        resetListAdapter(null, lv, ctv);

        currStatusSpinner = titleBar.findViewById(R.id.spinner_curr_status);
        statusAdapter = new ArrayAdapter<>(this, R.layout.spinner_item_small);

        Vendor v = GlobalCtx.app().getVendor();
        boolean fnProviding = v != null && v.isFnProviding();
        statusAdapter.addAll(StatusItem.getSs(filterBtnControlled(), fnProviding));

        statusAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item_small);
        currStatusSpinner.setAdapter(statusAdapter);
        currStatusSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            private void cancel(DialogInterface dlg) {
                filter = FILTER_ON_SALE;
                currStatusSpinner.setSelection(StatusItem.findIdx(filter, filterBtnControlled()));
                if (dlg != null) {
                    dlg.dismiss();
                }
            }

            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                StatusItem status = statusAdapter.getItem(position);
                if (status != null) {

                    if (status.status == FILTER_BY_SHELF) {
                        AlertDialog.Builder adb = new AlertDialog.Builder(StoreStorageActivity.this);
                        ArrayList<StorageItem> shelfItems = getShelfItems();
                        CharSequence[] items = new String[shelfItems.size()];
                        for(int i = 0; i < items.length; i++) {
                            items[i] = shelfItems.get(i).getName();
                        }
                        adb.setSingleChoiceItems(items, items.length - 1, (dlg, i) -> {
                            searchTerm = items[i].toString();
                            cancel(dlg);
                            AppLogger.d("start refresh data:");
                            refreshData();
                        }).setCancelable(true).setOnCancelListener(this::cancel);

                        AlertUtil.showDlg(adb);
                    } else {
                        filter = status.status;
                        AppLogger.d("start refresh data:");
                        refreshData();
                    }
                }
            }
            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });
        currStatusSpinner.setSelection(StatusItem.findIdx(filter, filterBtnControlled()));

        final ListView categoryLv = findViewById(R.id.list_category);
        final ArrayAdapter<Tag> tagAdapter = new ArrayAdapter<>(this, R.layout.category_item_small);
        ArrayList<Tag> allTags = GlobalCtx.app().listTags(this.currStore != null ? this.currStore.getId() : 0);
        tagAdapter.addAll(allTags);
        categoryLv.setAdapter(tagAdapter);
        categoryLv.setOnItemClickListener((parent12, view, position, id) -> {
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

//        final TextView sortBy = findViewById(R.id.title_total_last_stat);
//        sortBy.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View v) {
//                String _sort = StoreStorageActivity.this.sortBy;
//                if (SORT_BY_DEF.equals(_sort)) {
//                    StoreStorageActivity.this.sortBy = SORT_BY_SOLD;
//                    sortBy.setText("排序：销量");
//                } else if (SORT_BY_UPDATE.equals(_sort)) {
//                    StoreStorageActivity.this.sortBy = SORT_BY_UPDATE;
//                    sortBy.setText("排序: 更新");
//                } else {
//                    StoreStorageActivity.this.sortBy = SORT_BY_DEF;
//                    sortBy.setText("排序：默认");
//                }
//                refreshData();
//            }
//        });

        final Spinner sortBy = findViewById(R.id.prods_sort_spinner);

        final List<String> sortList = new ArrayList<>(Arrays.asList("按:默认", "按:销量", "按:更新", "按:库存"));
        final ArrayAdapter<String> sortArrayAdapter = new ArrayAdapter<String>(
                this, R.layout.spinner_item_small, sortList);
        sortBy.setAdapter(sortArrayAdapter);

        sortBy.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int i, long l) {
                StoreStorageActivity.this.sortBy = getSortType(sortArrayAdapter.getItem(i));
                refreshData();
            }

            @Override
            public void onNothingSelected(AdapterView<?> adapterView) {
            }
        });
        initStoreProdQuota();
        //Must after buttons initialized
        setHeadToolBar();
        updateFilterBtnLabels(0, 0, 0, 0, 0,
                0, 0, 0, 0, 0);
    }

    private String getSortType(String label) {
        if (label.equals("按:默认")) {
            return SORT_BY_DEF;
        }
        if (label.equals("按:销量")) {
            return SORT_BY_SOLD;
        }
        if (label.equals("按:更新")) {
            return SORT_BY_UPDATE;
        }
        if (label.equals("按:库存")) {
            return SORT_BY_STORAGE;
        }
        return SORT_BY_DEF;
    }

    public void _do_search() {
        String text = ctv.getText().toString();
        String term = !TextUtils.isEmpty(text) ? text : null;
        StoreStorageActivity.this.searchTerm = term != null ? term : "";

        if (!TextUtils.isEmpty(term) && term.startsWith(StorageItemAdapter.PREFIX_NOT_FILTER)) {
            refreshData();
        } else {
            listAdapter.filter(term);
        }

        InputMethodManager in = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        if (in != null) {
            in.hideSoftInputFromWindow(ctv.getApplicationWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
        }
    }

    private void initStoreProdQuota() {
        final LinearLayout storeProdQuota = findViewById(R.id.store_prod_quota);
        storeProdQuota.setVisibility(View.INVISIBLE);
        if (currStore != null && currStore.getFn_show_quota() == 1) {
            final TextView storeProdPriceScore = findViewById(R.id.store_prod_price_score);
            final TextView storeProdScoreDetail = findViewById(R.id.store_prod_score_detail);
            try {
                retrofit2.Call<ResultBean<Map<String, String>>> resultBean = GlobalCtx.app().dao.getStoreQuota(currStore.getId());
                resultBean.enqueue(new Callback<ResultBean<Map<String, String>>>() {
                    @Override
                    public void onResponse(retrofit2.Call<ResultBean<Map<String, String>>> call, Response<ResultBean<Map<String, String>>> response) {
                        ResultBean<Map<String, String>> r = response.body();
                        if (r != null && r.isOk()) {
                            Map<String, String> obj = r.getObj();
                            double score = Double.parseDouble(obj.get("score"));
                            String color = obj.get("color");
                            storeProdQuota.setBackgroundColor(Color.parseColor(color));
                            storeProdPriceScore.setText(new StringBuilder().append("价格: ").append(score).append(" 分").toString());
                            storeProdScoreDetail.setText(obj.get("highRate") + " 高于同行");
                            storeProdQuota.setVisibility(View.VISIBLE);
                            storeProdQuota.setOnClickListener(new View.OnClickListener() {
                                @Override
                                public void onClick(View view) {
                                    Map<String, String> params = Maps.newHashMap();
                                    GlobalCtx.app().toStoreProductIndex(StoreStorageActivity.this, params);
                                }
                            });
                        }
                    }

                    @Override
                    public void onFailure(retrofit2.Call<ResultBean<Map<String, String>>> call, Throwable t) {

                    }
                });
            } catch (Exception e) {
                AppLogger.e(e.getMessage(), e);
            }
        }
    }

    private void setHeadToolBar() {
//        boolean isPriceControlled = currStore != null && currStore.getFn_price_controlled() == PRICE_CONTROLLER_YES;
//        boolean isDirect = currStore != null &&  currStore.getType() == Cts.STORE_VENDOR_CN;
        Vendor v = GlobalCtx.app().getVendor();
        boolean fnEnabledReqProvide = v != null && v.isFnProviding();
        if (filterBtnControlled()) {

            this.btnReqList.setVisibility(fnEnabledReqProvide ? View.VISIBLE : View.GONE);
            this.btnRefillList.setVisibility(fnEnabledReqProvide ? View.VISIBLE : View.GONE);

            this.btnApplyPriceList.setVisibility(View.VISIBLE);
            if (this.addNewBtn != null) {
                RelativeLayout.LayoutParams params = (RelativeLayout.LayoutParams) this.addNewBtn.getLayoutParams();
                params.removeRule(RelativeLayout.ALIGN_PARENT_END);
                this.addNewBtn.setLayoutParams(params);
            }
        } else {
            this.btnReqList.setVisibility(fnEnabledReqProvide ? View.VISIBLE : View.GONE);
            this.btnRefillList.setVisibility(fnEnabledReqProvide ? View.VISIBLE : View.GONE);

            this.btnApplyPriceList.setVisibility(View.INVISIBLE);

            if (this.addNewBtn != null) {
                RelativeLayout.LayoutParams params = (RelativeLayout.LayoutParams) this.addNewBtn.getLayoutParams();
                params.addRule(RelativeLayout.ALIGN_PARENT_END);
                this.addNewBtn.setLayoutParams(params);
            }
        }

        if (statusAdapter != null) {
            statusAdapter.clear();
            statusAdapter.addAll(StatusItem.getSs(filterBtnControlled(), fnEnabledReqProvide));
            statusAdapter.notifyDataSetChanged();
        }

    }

    public void initCurrStore(long storeId) {
        if (storeId > 0) {
            Store store = GlobalCtx.app().findStore(storeId);
            if (store != null) {
                this.currStore = store;
            }
        }

        if (currStore == null) {
            currStore = Cts.ST_UNKNOWN;
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
            GlobalCtx.app().storageItemAdapterRef.set(new WeakReference<>(listAdapter));
        }

        if (ctv != null) {
            ArrayAdapter<StorageItem> ctvAdapter = new ArrayAdapter<>(this, android.R.layout.simple_list_item_1);
            ctvAdapter.addAll(storageItems);
            ctvAdapter.addAll(getShelfItems());
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

    private ArrayList<StorageItem> getShelfItems() {
        String[] shelfList = new String[]{"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "I", "S", "T", "U", "V", "W", "X", "Y", "Z"};
        ArrayList<StorageItem> items = new ArrayList<>();
        for (String prefix : shelfList) {
            items.add(new StorageItem(0, "@@" + prefix));
        }
        return items;
    }

    private void updateFilterBtnLabels(int totalOnSale, int totalRisk, int totalSoldOut, int totalOffSale,
                                       int total_in_req, int totalSoldEmpty, int totalNeedCheck,
                                       int total_no_code, int total_no_shelf, int total_sales_time) {

        //boolean isPriceControlled = this.currStore.getFn_price_controlled() == Cts.PRICE_CONTROLLER_YES;

        updateFilterStatusNum(totalOnSale, totalSoldOut, totalOffSale, totalNeedCheck, filterBtnControlled(),
                total_no_code, total_no_shelf, total_sales_time);
        StatusItem riskItem = StatusItem.find(FILTER_RISK, filterBtnControlled());
        if (riskItem != null) {
            riskItem.setNum(totalRisk);
        }
        StatusItem emptyItem = StatusItem.find(FILTER_SOLD_EMPTY, filterBtnControlled());
        if (emptyItem != null) {
            emptyItem.setNum(totalSoldEmpty);
        }

        if(this.currStatusSpinner != null) {
            ((ArrayAdapter)this.currStatusSpinner.getAdapter()).notifyDataSetChanged();
        }

        updateReqListBtn(total_in_req);
        updateRefillListBtn(totalRisk);
    }

    boolean filterBtnControlled() {
        return currStore != null && currStore.getFn_price_controlled() == PRICE_CONTROLLER_YES;
    }

    void updateFilterStatusNum(int totalOnSale, int totalSoldOut, int totalOffSale, int totalNeedCheck,
                               boolean isPriceControlled, int totalNoCode, int totalNoShelf, int totalSalesTime) {
        StatusItem.find(FILTER_ON_SALE, isPriceControlled).setNum(totalOnSale);
        StatusItem.find(FILTER_SOLD_OUT, isPriceControlled).setNum(totalSoldOut);
        StatusItem.find(FILTER_OFF_SALE, isPriceControlled).setNum(totalOffSale);
        StatusItem.find(FILTER_FREQ_PRODUCT, isPriceControlled).setNum(totalNeedCheck);
        StatusItem.find(FILTER_NO_CODE, isPriceControlled).setNum(totalNoCode);
        StatusItem.find(FILTER_NO_SHELF, isPriceControlled).setNum(totalNoShelf);
        StatusItem.find(FILTER_SALES_TIME, isPriceControlled).setNum(totalSalesTime);
        if (this.currStatusSpinner != null) {
            ((ArrayAdapter) this.currStatusSpinner.getAdapter()).notifyDataSetChanged();
        }
    }

    void updateReqListBtn(int total_in_req) {
        this.total_in_req = total_in_req;
        if (this.btnReqList != null) {
            this.btnReqList.setText("订货(" + total_in_req + ")");
        }
    }

    void updateRefillListBtn(int total) {
        if (this.btnRefillList != null) {
            this.btnRefillList.setText("待补货(" +  total + ")");
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
                    result = sad.getStorageItems(currStore.getId(), filter, currTag, sortBy, searchTerm);
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
                    StoreStorageActivity.this.runOnUiThread(() -> {
                        updateAdapterData(result.first);
                        StoreStatusStat sec = result.second;
                        if (sec != null) {
                            StoreStorageActivity.this.stats = sec;
                            updateFilterBtnLabels(sec.getTotal_on_sale(), sec.getTotal_risk(),
                                    sec.getTotal_sold_out(), sec.getTotal_off_sale(),
                                    sec.getTotal_req_cnt(), sec.getTotal_sold_empty(), sec.getTotal_need_check(),
                                    sec.getTotal_no_code(), sec.getTotal_no_shelf(), sec.getTotal_sales_time());
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
                if (item.getRefer_prod_id() == 0) {
                    menu.add(Menu.NONE, MENU_CONTEXT_ADD_BUY_RECORD, Menu.NONE, "入库");
                    menu.add(Menu.NONE, MENU_CONTEXT_STOCK_CHECK, Menu.NONE, "盘点");
                }
                menu.add(Menu.NONE, MENU_CONTEXT_TO_LOSS, Menu.NONE, "报损");
                menu.add(Menu.NONE, MENU_CONTEXT_WAREHOUSE, Menu.NONE, "库管");
                menu.add(Menu.NONE, MENU_CONTEXT_INVENTORY_DETAIL, Menu.NONE, "商品出入库明细");
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
                //boolean isPriceControlled = currStore != null && currStore.getFn_price_controlled() == Cts.PRICE_CONTROLLER_YES;
                updateFilterStatusNum(st.getTotal_on_sale(), st.getTotal_sold_out(), st.getTotal_off_sale(),
                        st.getTotal_need_check(), filterBtnControlled(), st.getTotal_no_code(), st.getTotal_no_shelf(), st.getTotal_sales_time());
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
        if (info.position >= this.listAdapter.getCount()) {
            return false;
        }
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
                    //alertDialog dlg = StoreStorageHelper.createEditLeftNum(this, item, inflater, notifyDataSetChanged());
                    //dlg.show();
                    int productId = item.getProduct_id();
                    int storeId = item.getStore_id();
                    String productName = item.getName();

                    GlobalCtx.app().toReportLoss(StoreStorageActivity.this, productId, storeId,productName);
                    return  true;
                } else {
                    return false;
                }
            case MENU_CONTEXT_TO_SALE_ID:
                Runnable after;
                if (item != null && item.getStatus() == STORE_PROD_OFF_SALE) {
                    changed.setAdditional(() -> {
                        listAdapterRefresh();
                        refreshData();
                    });
                }
                StoreStorageHelper.action_chg_status(this, currStore, item, StorageItem.STORE_PROD_ON_SALE, "恢复售卖", changed);
                return true;
            case MENU_CONTEXT_TO_AUTO_ON_ID:
                StoreStorageHelper.createSetOnSaleDlg(this, item, changed, true).show();
                return true;

            case MENU_CONTEXT_TO_SOLD_OUT_ID:
                changed.setAdditional(() -> {
                    listAdapterRefresh();
                    refreshData();
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
//                        int itemId = item.getId();
//                        GeneralWebViewActivity.gotoWeb(StoreStorageActivity.this, URLHelper.WEB_URL_ROOT + "/stores/prod_loss/" + itemId);

                        int productId = item.getProduct_id();
                        int storeId = item.getStore_id();
                        String productName = item.getName();

                        GlobalCtx.app().toReportLoss(StoreStorageActivity.this, productId, storeId,productName);
                    }
                }
                return true;
            case MENU_CONTEXT_VIEW_DETAIL:
                if (item != null) {
                    String url = URLHelper.getStoresPrefix() + "/store_product/" + item.getId();
                    GeneralWebViewActivity.gotoWeb(StoreStorageActivity.this, url);
                }
                return true;
            case MENU_CONTEXT_ADD_BUY_RECORD:
                if (item != null) {
                    int productId = item.getProduct_id();
                    String name = item.getName();
                    int storeId = item.getStore_id();
                    GlobalCtx.app().toAddBuyRecordView(StoreStorageActivity.this, productId, name, storeId);
                }
                return true;
            case MENU_CONTEXT_WAREHOUSE:
                if (item != null) {
                    int productId = item.getProduct_id();
                    GlobalCtx.app().toWarehouseManage(StoreStorageActivity.this, productId);
                }
                return true;
            case MENU_CONTEXT_INVENTORY_DETAIL:
                if (item != null) {
                    int productId = item.getProduct_id();
                    int storeId = item.getStore_id();
                    GlobalCtx.app().toInventoryDetail(StoreStorageActivity.this, productId,storeId);
                }
                return true;
            case MENU_CONTEXT_STOCK_CHECK:
                if (item != null) {
                    int productId = item.getProduct_id();
                    int storeId = item.getStore_id();
                    String productName = item.getName();
                    String shelfNo = item.getShelfNo();

                    GlobalCtx.app().toStockCheck(StoreStorageActivity.this, productId, storeId,productName,shelfNo);
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

    @Override
    public void onBackPressed() {
        startActivity(new Intent(getApplicationContext(), MainOrdersActivity.class));
    }
}