package cn.cainiaoshicai.crm.ui.helper;

import android.app.Activity;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Spinner;

import java.util.ArrayList;
import java.util.Collection;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 */

public class StoreSpinnerHelper {


    public static void initStoreSpinner(Activity activity, Store currStore,
                                        final StoreChangeCallback storeChgCallback) {
        initStoreSpinner(activity, currStore, storeChgCallback, false);
    }

    public static void initStoreSpinner(Activity activity, Store currStore,
                                        final StoreChangeCallback storeChgCallback, boolean supportAll, Spinner currStoreSpinner) {
        init(activity, currStore, storeChgCallback, supportAll, currStoreSpinner);
    }

    public static void initStoreSpinner(Activity activity, Store currStore,
                                        final StoreChangeCallback storeChgCallback, boolean supportAll) {
        Spinner currStoreSpinner = (Spinner) activity.findViewById(R.id.spinner_curr_store);
        init(activity, currStore, storeChgCallback, supportAll, currStoreSpinner);
    }

    private static void init(Activity activity, Store currStore, final StoreChangeCallback storeChgCallback,
                             boolean supportAll, Spinner currStoreSpinner) {
        final ArrayAdapter<Store> arrAdapter = new ArrayAdapter<>(activity, R.layout.spinner_item_small);
        arrAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item_small);
        currStoreSpinner.setAdapter(arrAdapter);
        currStoreSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                Store newStore = arrAdapter.getItem(position);
                storeChgCallback.changed(newStore);
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
            }
        });

        Collection<Store> stores = new ArrayList<>();
        if (supportAll) {
            stores.add(Cts.ST_ALL);
        }
        Collection<Store> listStores = GlobalCtx.getInstance().listStores();
        if (listStores == null || listStores.isEmpty()) {
            Utility.toast("正在加载店铺列表，请重试...", activity, null);
        } else {
            stores.addAll(listStores);
        }

        arrAdapter.addAll(stores);
        if (currStore == null) {

            int storeId = SettingUtility.getCurrentStorageStore();
            for (Store next : stores) {
                if (next.getId() == storeId) {
                    currStore = next;
                    break;
                }
            }

            if (currStore == null) {
                currStore = supportAll ? Cts.ST_ALL : Cts.ST_HLG;
            }
        }
        currStoreSpinner.setSelection(arrAdapter.getPosition(currStore));
        storeChgCallback.changed(currStore);
    }

    public interface StoreChangeCallback {
        void changed(Store newStore);
    }
}
