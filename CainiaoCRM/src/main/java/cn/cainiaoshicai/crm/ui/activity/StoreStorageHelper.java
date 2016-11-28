package cn.cainiaoshicai.crm.ui.activity;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 * Created by liuzhr on 10/31/16.
 */

public class StoreStorageHelper {

    static AlertDialog createSetOnSaleDlg(final Activity activity, final StorageItem item, final Runnable setOkCallback) {
        return createSetOnSaleDlg(activity, item, setOkCallback, false);
    }

    static AlertDialog createSetOnSaleDlg(final Activity activity, final StorageItem item, final Runnable setOkCallback, boolean selfProvided) {

        final int checked[] = new int[1];
        checked[0] = 0;

        final String[] items = new String[]{activity.getString(R.string.store_on_sale_after_off_work),
                activity.getString(R.string.store_on_sale_after_have_storage)};

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
                        }  else {
                            throw new IllegalStateException("impossible selection:" + selected);
                        }
                        action_set_on_sale_again(activity, item, option, selected, setOkCallback);
                    }
                }).setNegativeButton(R.string.cancel, null)
                .create();
    }


    private static void action_set_on_sale_again(final Activity context,
                                                 final StorageItem item, final int option, final String optionLabel, final Runnable setOkCallback) {
        new MyAsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                StorageActionDao sad = new StorageActionDao(GlobalCtx.getApplication().getSpecialToken());
                ResultBean rb = sad.chg_item_when_on_sale_again(item.getId(), option);
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
                Utility.toast(msg, context, uiCallback, Toast.LENGTH_SHORT);
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
                    Utility.toast(msg, context, uiCallback, Toast.LENGTH_LONG);
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
                                final int lastStat = Integer.parseInt(et.getText().toString());
                                new MyAsyncTask<Void, Void, Void>() {
                                    @Override
                                    protected Void doInBackground(Void... params) {
                                        new PostLeftNum(lastStat, item, activity, succCallback).invoke();
                                        return null;
                                    }
                                }.execute();
                            }
                        })
                .setNegativeButton(R.string.cancel,
                        new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int whichButton) {
                            }
                        })
                .create();
        et.requestFocus();
        return dlg;
    }

    static AlertDialog createEditProvideDlg(final StoreStorageActivity activity, final StorageItem item) {
        LayoutInflater inflater = (LayoutInflater) activity.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View npView = inflater.inflate(R.layout.storage_edit_provide_layout, null);
        final EditText totalReqTxt = (EditText) npView.findViewById(R.id.total_req);
        final EditText remark = (EditText) npView.findViewById(R.id.remark);

        int totalInReq = item.getTotalInReq();
        int defaultReq = Math.max(item.getRisk_min_stat() - Math.max(item.getLeft_since_last_stat(), 0), 1);
        totalReqTxt.setText(String.valueOf(totalInReq > 0 ? totalInReq : defaultReq));
        remark.setText(item.getReqMark());
        AlertDialog dlg = new AlertDialog.Builder(activity)
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
                                            StorageActionDao sad = new StorageActionDao(GlobalCtx.getInstance().getSpecialToken());
                                            rb = sad.store_edit_provide_req(item.getProduct_id(), item.getStore_id(), total_req_no, remarkTxt);
                                        } catch (ServiceException e) {
                                            rb = new StorageActionDao.ResultEditReq(false, "访问服务器出错");
                                        }
                                        final int total_req_cnt = rb.isOk() ? rb.getTotal_req_cnt() : -1;

                                        final ResultBean finalRb = rb;
                                        activity.runOnUiThread(new Runnable() {
                                            @Override
                                            public void run() {
                                                if (finalRb.isOk()) {
                                                    item.setTotalInReq(total_req_no);
                                                    item.setReqMark(remarkTxt);
                                                    activity.updateReqListBtn(total_req_cnt);
                                                    activity.listAdapterRefresh();
                                                    Toast.makeText(activity, "已保存", Toast.LENGTH_SHORT).show();
                                                    activity.refreshData();
                                                } else {
                                                    Toast.makeText(activity, "保存失败：" + finalRb.getDesc(), Toast.LENGTH_LONG).show();
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
                StorageActionDao sad = new StorageActionDao(GlobalCtx.getInstance().getSpecialToken());
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
