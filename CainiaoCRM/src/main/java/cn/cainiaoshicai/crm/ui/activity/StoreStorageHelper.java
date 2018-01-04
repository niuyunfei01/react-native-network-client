package cn.cainiaoshicai.crm.ui.activity;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.domain.ResultEditReq;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.util.AlertUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.utils.Utility;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import static cn.cainiaoshicai.crm.domain.StorageItem.STORE_PROD_OFF_SALE;

/**
 * Created by liuzhr on 10/31/16.
 */

public class StoreStorageHelper {

    static AlertDialog createSetOnSaleDlg(final Activity activity, final StorageItem item,
                                          final StoreStorageActivity.ItemStatusUpdated setOkCallback) {
        return createSetOnSaleDlg(activity, item, setOkCallback, false);
    }

    static AlertDialog createSetOnSaleDlg(final Activity activity, final StorageItem item,
                                          final StoreStorageActivity.ItemStatusUpdated setOkCallback, boolean selfProvided) {

        final int checked[] = new int[1];
        checked[0] = 0;

        final String[] items = new String[]{
                activity.getString(R.string.store_on_sale_after_off_work),
                activity.getString(R.string.store_on_sale_after_have_storage),
                activity.getString(R.string.store_on_sale_none)
        };

        return new AlertDialog.Builder(activity)
                .setTitle("选择恢复售卖的时间")
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
                        if (selected.equals(activity.getString(R.string.store_on_sale_after_off_work))) {
                            option = StorageItem.RE_ON_SALE_OFF_WORK;
                        } else if (selected.equals(activity.getString(R.string.store_on_sale_after_have_storage))) {
                            option = StorageItem.RE_ON_SALE_PROVIDED;
                        } else if (selected.equals(activity.getString(R.string.store_on_sale_none))) {
                            option = StorageItem.RE_ON_SALE_NONE;
                        } else {
                            throw new IllegalStateException("impossible selection:" + selected);
                        }
                        action_set_on_sale_again(activity, item, option, selected, setOkCallback);
                    }
                }).setNegativeButton(R.string.cancel, null)
                .create();
    }


    private static void action_set_on_sale_again(final Activity context,
                                                 final StorageItem item, final int option, final String optionLabel,
                                                 final StoreStorageActivity.ItemStatusUpdated setOkCallback) {
        new MyAsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                StorageActionDao sad = new StorageActionDao(GlobalCtx.app().token());
                ResultBean rb = sad.chg_item_when_on_sale_again(item.getId(), option);
                final String msg;
                Runnable uiCallback = null;
                final boolean ok = rb.isOk();
                if (ok) {
                    msg = "已将" + item.pidAndNameStr() + "设置为" + optionLabel + "!";
                    uiCallback = new Runnable() {
                        @Override
                        public void run() {
                            int before = item.getStatus();
                            item.setWhen_sale_again(option);
                            if (option == StorageItem.RE_ON_SALE_NONE) {
                                item.setStatus(STORE_PROD_OFF_SALE);
                            }
                            if (setOkCallback != null) {
                                setOkCallback.updated(before, item.getStatus());
                            }
                        }
                    };
                } else {
                    msg = "设置失败:" + rb.getDesc();
                }

                final Runnable finalUiCallback = uiCallback;
                context.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (ok) {
                            Utility.toast(msg, context, finalUiCallback);
                        } else {
                            AlertUtil.error(context, msg);
                        }
                    }
                });

                return null;
            }
        }.executeOnIO();
    }

    static void action_chg_status(final Activity context, final Store currStore,
                                  final StorageItem item, final int destStatus, final String desc,
                                  final StoreStorageActivity.ItemStatusUpdated clb) {
        if (item != null) {
            if (item.getStatus() == destStatus) {
                return;
            }

//            if (item.getLeft_since_last_stat() <= 1 ) {
//                AlertUtil.showAlert(context, R.string.tip_dialog_title, R.string.alert_msg_storage_empty_cannot_sold);
//                return;
//            }

            new MyAsyncTask<Void, Void, Void>() {
                @Override protected Void doInBackground(Void... params) {
                    ResultBean rb;
                    try {
                        StorageActionDao sad = new StorageActionDao(GlobalCtx.app().token());
                        rb = sad.chg_item_status(currStore.getId(), item.getProduct_id(), item.getStatus(), destStatus);
                    } catch (ServiceException e) {
                        rb = new ResultBean(false, "访问服务器出错");
                    }

                    final String msg;
                    final Runnable uiCallback;
                    final boolean ok = rb.isOk();
                    if (ok) {
                        msg = "已将" + item.pidAndNameStr() + "设置为" + desc + "!";
                        uiCallback = new Runnable() {
                            @Override
                            public void run() {
                                int before = item.getStatus();

                                item.setStatus(destStatus);
                                if (clb != null) {
                                    clb.updated(before, destStatus);
                                }
                            }
                        };
                    } else {
                        msg = "设置失败:" + rb.getDesc();
                        uiCallback = null;
                    }

                    Utility.runUIActionDelayed(new Runnable() {
                        @Override
                        public void run() {
                            if (ok) {
                                Utility.toast(msg, context, uiCallback);
                            } else {
                                AlertUtil.error(context,  msg);
                            }
                        }
                    }, 10);

                    return null;
                }
            }.executeOnIO();
        } else {
            Utility.toast("没有找到您指定的商品", context, null, Toast.LENGTH_LONG);
        }
    }

    public static AlertDialog createEditLeftNum(final Activity activity, final StorageItem item,
                                                LayoutInflater inflater, final Runnable succCallback) {
        View npView = inflater.inflate(R.layout.number_edit_left_number_layout, null);
        final EditText et = (EditText) npView.findViewById(R.id.number_edit_txt);
        et.setText(String.valueOf(item.getLeft_since_last_stat()));
        AlertDialog dlg = new AlertDialog.Builder(activity)
                .setTitle(String.format("设置库存数:(%s)", item.getName()))
                .setView(npView)
                .setPositiveButton(R.string.ok,
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int whichButton) {
                                String s = et.getText().toString();
                                if (TextUtils.isEmpty(s)) {
                                    AlertUtil.errorOnActivity(activity, "库存数不能为空");
                                    return;
                                }
                                final int lastStat = Integer.parseInt(s);
                                new MyAsyncTask<Void, Void, Void>() {
                                    @Override
                                    protected Void doInBackground(Void... params) {
                                        new PostLeftNum(lastStat, item, activity, succCallback).invoke();
                                        return null;
                                    }
                                }.execute();
                            }
                        })
                .setNegativeButton(R.string.cancel, null)
                .create();
        et.requestFocus();
        return dlg;
    }


    public static AlertDialog createEditPrice(final Activity activity, final StorageItem item,
                                                LayoutInflater inflater, final Runnable succCallback) {
        View npView = inflater.inflate(R.layout.number_edit_price, null);

        final EditText et = npView.findViewById(R.id.number_edit_txt);
        et.setText(String.valueOf(item.getPricePrecisionNoSymbol()));
        ((TextView)npView.findViewById(R.id.number_now_price)).setText("现价：" + item.getPricePrecision());

        AlertDialog dlg = new AlertDialog.Builder(activity)
                .setTitle(String.format("修改价格:(%s)", item.getName()))
                .setView(npView)
                .setPositiveButton(R.string.ok,
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int whichButton) {
                                String priceStr = et.getText().toString();
                                if (TextUtils.isEmpty(priceStr)) {
                                    AlertUtil.error(activity, "价格不能为空");
                                    return;
                                }
                                final int newCents = (int) (100 * Double.parseDouble(priceStr));
                                if (newCents < 1) {
                                    AlertUtil.error(activity, "价格不能低于1分钱");
                                    return;
                                }

                                Call<ResultBean> rb = GlobalCtx.app().dao.store_chg_price(item.getStore_id(),
                                        item.getProduct_id(), newCents, item.getPrice());
                                rb.enqueue(new Callback<ResultBean>() {
                                    @Override
                                    public void onResponse(Call<ResultBean> call, Response<ResultBean> response) {
                                        ResultBean body = response.body();
                                        if (body!=null&&body.isOk()) {
                                            item.setPrice(newCents);
                                            if (succCallback != null) {
                                                succCallback.run();
                                            }
                                            Toast.makeText(activity, "价格已修改为" + item.getPricePrecision(), Toast.LENGTH_SHORT).show();
                                        } else {
                                            AlertUtil.showAlert(activity, "错误提示", "保存失败：" + body.getDesc());
                                        }
                                    }

                                    @Override
                                    public void onFailure(Call<ResultBean> call, Throwable t) {
                                        AlertUtil.showAlert(activity, "错误提示", "无法连接服务器");
                                    }
                                });
                            }
                        })
                .setNegativeButton(R.string.cancel, null)
                .create();
        et.requestFocus();
        return dlg;
    }

    public static AlertDialog createApplyChangeSupplyPrice(final Activity activity, final StorageItem item,
                                                           final LayoutInflater inflater, final Runnable succCallback) {

        View npView = inflater.inflate(R.layout.apply_change_supply_price, null);

        final TextView label = npView.findViewById(R.id.now_price_label);
        label.setText("申请调整价格 (原价: " + item.getSupplyPricePrecision() + ")");

        final EditText input = npView.findViewById(R.id.number_apply_price);
        input.setText(item.getSupplyPricePrecisionNoSymbol());
        final EditText remarkInput = npView.findViewById(R.id.remark_edit_txt);

        final CheckBox checkBox = npView.findViewById(R.id.setAutoOnsale);
        checkBox.setVisibility (item.getStatus() != StorageItem.STORE_PROD_ON_SALE ? View.VISIBLE : View.GONE);

        AlertDialog dlg = new AlertDialog.Builder(activity)
                .setTitle(item.getName())
                .setView(npView)
                .setPositiveButton(R.string.ok,
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int whichButton) {
                                String priceStr = input.getText().toString();
                                if (TextUtils.isEmpty(priceStr)) {
                                    AlertUtil.error(activity, "价格不能为空");
                                    return;
                                }
                                final int newCents = (int) (100 * Double.parseDouble(priceStr));
                                if (newCents < 1) {
                                    AlertUtil.error(activity, "价格不能低于1分钱");
                                    return;
                                }
                                String remark = remarkInput.getText().toString();
                                int storeId = item.getStore_id();
                                int productId = item.getProduct_id();
                                int beforePrice = item.getSupplyPrice();
                                boolean autoOnSale = checkBox.isChecked();
                                Store store = GlobalCtx.app().findStore(storeId);
                                Call<ResultBean> rb = GlobalCtx.app().dao.store_apply_price(store.getType(), storeId, productId, beforePrice, newCents, remark, autoOnSale ? 1 : 0);
                                rb.enqueue(new Callback<ResultBean>() {
                                    @Override
                                    public void onResponse(Call<ResultBean> call, Response<ResultBean> response) {
                                        ResultBean body = response.body();
                                        if (body != null && body.isOk()) {
                                            item.setApplyingPrice(newCents);
                                            if (succCallback != null) {
                                                succCallback.run();
                                            }
                                            Toast.makeText(activity, "价格已修改申请已经提交", Toast.LENGTH_SHORT).show();
                                        } else {
                                            AlertUtil.showAlert(activity, "错误提示", "保存失败：" + (body != null ? body.getDesc() : ""));
                                        }
                                    }

                                    @Override
                                    public void onFailure(Call<ResultBean> call, Throwable t) {
                                        AlertUtil.showAlert(activity, "错误提示", "无法连接服务器");
                                    }
                                });
                            }
                        })
                .setNegativeButton(R.string.cancel, null)
                .create();
        input.requestFocus();
        return dlg;
    }


    static AlertDialog createEditProvideDlg(final StoreStorageActivity activity, final StorageItem item) {
        LayoutInflater inflater = (LayoutInflater) activity.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View npView = inflater.inflate(R.layout.storage_edit_provide_layout, null);
        final EditText totalReqTxt = (EditText) npView.findViewById(R.id.total_req);
        final EditText nowStatTxt = (EditText) npView.findViewById(R.id.now_stat);
        final EditText remark = (EditText) npView.findViewById(R.id.remark);

        int totalInReq = item.getTotalInReq();
        int defaultReq = Math.max(item.getRisk_min_stat() - Math.max(item.getLeft_since_last_stat(), 0), 1);
        totalReqTxt.setText(String.valueOf(totalInReq > 0 ? totalInReq : defaultReq));
        remark.setText(item.getReqMark());
//        nowStatTxt.setText(String.valueOf(item.getLeft_since_last_stat()));
        AlertDialog dlg = new AlertDialog.Builder(activity)
                .setTitle(String.format("订货:(%s)", item.getName()))
                .setView(npView)
                .setPositiveButton(R.string.ok,
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int whichButton) {
                                new MyAsyncTask<Void, Void, Void>() {
                                    @Override
                                    protected Void doInBackground(Void... params) {
                                        ResultEditReq rb;
                                        String s = totalReqTxt.getText().toString();
                                        String nowStatStr = nowStatTxt.getText().toString();

                                        if (TextUtils.isEmpty(nowStatStr)) {
                                            AlertUtil.errorOnActivity(activity, "订货前请盘点当前的库存，务必保持准确！");
                                            return null;
                                        }

                                        if (TextUtils.isEmpty(s)) {
                                            activity.runOnUiThread(new Runnable() {
                                                @Override
                                                public void run() {
                                                    AlertUtil.error(activity, "订货数和当前库存数不能为空串");
                                                }
                                            });
                                            return null;
                                        }

                                        final int total_req_no = Integer.parseInt(s);
                                        final int nowStat = Integer.parseInt(nowStatStr);
                                        final String remarkTxt = remark.getText().toString();
                                        try {
                                            StorageActionDao sad = new StorageActionDao(GlobalCtx.app().token());
                                            rb = sad.store_edit_provide_req(item.getProduct_id(), item.getStore_id(), total_req_no, remarkTxt, nowStat);
                                        } catch (ServiceException e) {
                                            rb = new ResultEditReq(false, "访问服务器出错");
                                        }
                                        final int total_req_cnt = rb.isOk() ? rb.getTotal_req_cnt() : -1;

                                        final ResultBean finalRb = rb;
                                        activity.runOnUiThread(new Runnable() {
                                            @Override
                                            public void run() {
                                                if (finalRb.isOk()) {
                                                    item.setLeft_since_last_stat(nowStat);
                                                    item.setTotalInReq(total_req_no);
                                                    item.setReqMark(remarkTxt);
                                                    activity.updateReqListBtn(total_req_cnt);
                                                    activity.listAdapterRefresh();
                                                    Toast.makeText(activity, "已保存", Toast.LENGTH_SHORT).show();
//                                                    activity.refreshData();
                                                } else {
                                                    AlertUtil.error(activity, "保存失败：" + finalRb.getDesc());
                                                }
                                            }
                                        });
                                        return null;
                                    }
                                }.executeOnIO();
                            }
                        })
                .setNegativeButton(R.string.cancel, null)
                .setNeutralButton("商品页", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        GeneralWebViewActivity.gotoWeb(activity, URLHelper.getStoresPrefix() + "/store_product/" + item.getId());
                    }
                })
                .create();
        dlg.show();
        totalReqTxt.requestFocus();
        return dlg;
    }

    private static class PostLeftNum {
        private final int lastStat;
        private final StorageItem item;
        private final Activity activity;
        private final Runnable succCallback;

        PostLeftNum(int lastStat, StorageItem item, Activity activity, Runnable succCallback) {
            this.lastStat = lastStat;
            this.item = item;
            this.activity = activity;
            this.succCallback = succCallback;
        }

        void invoke() {
            ResultBean rb;
            try {
                StorageActionDao sad = new StorageActionDao(GlobalCtx.app().token());
                rb = sad.store_status_reset_stat_num(item.getStore_id(), item.getProduct_id(), lastStat);
            } catch (ServiceException e) {
                rb = new ResultBean(false, "访问服务器出错");
            }

            final ResultBean finalRb = rb;
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (finalRb.isOk()) {
                        item.setTotal_last_stat(lastStat);
                        item.setTotal_sold(0);
                        item.setLeft_since_last_stat(lastStat);
                        if (succCallback != null) {
                            succCallback.run();
                        }
                        Toast.makeText(activity, "已保存", Toast.LENGTH_SHORT).show();
                        if (lastStat == 0 && item.getSelf_provided() == Cts.PROVIDE_COMMON.value) {
                            createEditProvideDlg((StoreStorageActivity) activity, item).show();
                        } else {
                            ((RefreshStorageData)activity).refreshData();
                        }
                    } else {
                        Toast.makeText(activity, "保存失败：" + finalRb.getDesc(), Toast.LENGTH_LONG).show();
                    }
                }
            });
        }
    }
}
