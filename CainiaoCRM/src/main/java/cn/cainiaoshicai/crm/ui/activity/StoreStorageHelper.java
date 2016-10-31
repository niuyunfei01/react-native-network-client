package cn.cainiaoshicai.crm.ui.activity;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Spinner;

import java.util.Collection;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 * Created by liuzhr on 10/31/16.
 */

public class StoreStorageHelper {

    public static void initStoreSpinner(Activity activity, Store currStore,
                                        final StoreStorageActivity.StoreChangeCallback storeChgCallback) {
        Spinner currStoreSpinner = (Spinner) activity.findViewById(R.id.spinner_curr_store);
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

        Collection<Store> stores = GlobalCtx.getInstance().listStores();
        if (stores == null || stores.isEmpty()) {
            Utility.toast("正在加载店铺列表，请重试...", activity, null);
        }

        if (stores != null) {
            arrAdapter.addAll(stores);
        }
        if (currStore == null) {
            if (stores != null) {

                int storeId = SettingUtility.getCurrentStorageStore();
                for (Store next : stores) {
                    if (next.getId() == storeId) {
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
        storeChgCallback.changed(currStore);
    }

    static AlertDialog createSetOnSaleDlg(final Activity activity, final StorageItem item, final Store currStore, final Runnable setOkCallback) {
        return createSetOnSaleDlg(activity, item, currStore, setOkCallback, false);
    }

    static AlertDialog createSetOnSaleDlg(final Activity activity, final StorageItem item, final Store currStore, final Runnable setOkCallback, boolean selfProvided) {

        final int checked[] = new int[1];
        checked[0] = 0;

        final String[] items = new String[selfProvided ? 3 : 4];
        items[0] = activity.getString(R.string.store_on_sale_now);
        items[1] = activity.getString(R.string.store_on_sale_after_off_work);
        items[2] = activity.getString(R.string.store_on_sale_manual);

        if (items.length >= 4) {
            items[3] = activity.getString(R.string.store_on_sale_after_provided);
        }

        return new AlertDialog.Builder(activity)
                .setTitle("选择重新恢复售卖的时间")
                .setSingleChoiceItems(items, checked[0], new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        checked[0] = which;
                    }
                })
                .setPositiveButton(R.string.ok, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        String selected = items[checked[0]];
                        final int option;
                        if (selected.equals(activity.getString(R.string.store_on_sale_now))) {
                            action_chg_status(activity, currStore, item, StorageItem.STORE_PROD_ON_SALE, "现在开始售卖, 请注意设置库存");
                            return;
                        } else if (selected.equals(activity.getString(R.string.store_on_sale_after_off_work))) {
                            option = StorageItem.RE_ON_SALE_OFF_WORK;
                        } else if (selected.equals(activity.getString(R.string.store_on_sale_after_provided))) {
                            option = StorageItem.RE_ON_SALE_PROVIDED;
                        } else if (selected.equals(activity.getString(R.string.store_on_sale_manual))) {
                            option = StorageItem.RE_ON_SALE_MANUAL;
                        } else {
                            throw new IllegalStateException("impossible selection:" + selected);
                        }
                        action_set_on_sale_again(activity, currStore, item, option, selected, setOkCallback);
                    }
                }).setNegativeButton(R.string.cancel, null)
                .create();
    }


    private static void action_set_on_sale_again(final Activity context, final Store currStore,
                                                 final StorageItem item, final int option, final String optionLabel, final Runnable setOkCallback) {
        new MyAsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                StorageActionDao sad = new StorageActionDao(GlobalCtx.getApplication().getSpecialToken());
                ResultBean rb = sad.chg_item_when_on_sale_again(currStore.getId(), item.getProduct_id(), option);
                String msg;
                Runnable uiCallback = null;
                if (rb.isOk()) {
                    msg = "已将" + item.getIdAndNameStr() + "设置为" + optionLabel + "!";
                    uiCallback = new Runnable() {
                        @Override
                        public void run() {
                            item.setWhen_sale_again(option);
                            if (setOkCallback != null) {
                                setOkCallback.run();
                            }
                        }
                    };
                } else {
                    msg = "设置失败:" + rb.getDesc();
                }
                Utility.toast(msg, context, uiCallback);
                return null;
            }
        }.executeOnIO();
    }

    private static void action_chg_status(final Activity context, final Store currStore,
                                          final StorageItem item, final int destStatus, final String desc) {
        action_chg_status(context, currStore, item, destStatus, desc, null);
    }

    static void action_chg_status(final Activity context, final Store currStore,
                                  final StorageItem item, final int destStatus, final String desc, final Runnable clb) {
        if (item != null) {
            if (item.getStatus() == destStatus) {
                return;
            }
            new MyAsyncTask<Void, Void, Void>() {
                @Override protected Void doInBackground(Void... params) {
                    ResultBean rb;
                    try {
                        StorageActionDao sad = new StorageActionDao(GlobalCtx.getApplication().getSpecialToken());
                        rb = sad.chg_item_status(currStore.getId(), item.getProduct_id(), item.getStatus(), destStatus);
                    } catch (ServiceException e) {
                        rb = new ResultBean(false, "访问服务器出错");
                    }

                    String msg;
                    Runnable uiCallback = null;
                    if (rb.isOk()) {
                        msg = "已将" + item.getIdAndNameStr() + "设置为" + desc + "!";
                        uiCallback = new Runnable() {
                            @Override
                            public void run() {
                                item.setStatus(destStatus);
                                if (clb != null) {
                                    clb.run();
                                }
                            }
                        };
                    } else {
                        msg = "设置失败:" + rb.getDesc();
                    }
                    Utility.toast(msg, context, uiCallback);
                    return null;
                }
            }.executeOnIO();
        } else {
            Utility.toast("没有找到您指定的商品", context, null);
        }
    }
}
