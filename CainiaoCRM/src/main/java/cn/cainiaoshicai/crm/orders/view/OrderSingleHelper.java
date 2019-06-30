package cn.cainiaoshicai.crm.orders.view;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.SortedMap;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.domain.ResultEditReq;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.Worker;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.DadaCancelReason;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.util.AlertUtil;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageActivity;

/**
 * Created by liuzhr on 7/28/16.
 */
public class OrderSingleHelper {

    private OrderSingleActivity activity;
    private int orderId;
    private final long store_id;

    public OrderSingleHelper(OrderSingleActivity activity, int orderId, long store_id) {
        this.activity = activity;
        this.orderId = orderId;
        this.store_id = store_id;
    }

    public void chooseWorker(final Activity activity, final int orderListTypeToJump, final int fromStatus, final int action) {
        this.chooseWorker(activity, orderListTypeToJump, fromStatus, action, null);
    }

    public void chooseWorker(final Activity activity, final int orderListTypeToJump, final int fromStatus,
                             final int action, List<Integer> defaultWorker) {

        final boolean isWaitingReady = fromStatus == Cts.WM_ORDER_STATUS_TO_READY;
        AlertDialog.Builder adb = new AlertDialog.Builder(activity);
        final ArrayList<Worker> workerList = new ArrayList<>();
        boolean is_choosing_ship = !isWaitingReady && action != OrderSingleActivity.ACTION_EDIT_PACK_WORKER;

        int posType = isWaitingReady ? Cts.POSITION_PACK :  Cts.POSITION_ALL;
        final SortedMap<Integer, Worker> workers;
        GlobalCtx app = GlobalCtx.app();
        if (isWaitingReady) {
           workers = app.getStoreWorkers(posType, store_id);
        } else if (is_choosing_ship) {
           workers = app.getShipWorkers();
        } else {
            //Editing possible be past workers, so show full
            workers = app.getWorkers();
        }

        if (workers != null && !workers.isEmpty()) {
            for(Worker worker : workers.values()) {
                if (is_choosing_ship || !worker.isExtShipWorker()) {
                    workerList.add(worker);
                }
            }
        }

        String currUid = GlobalCtx.app().getCurrentAccountId();

        if (defaultWorker == null) {
            defaultWorker = new ArrayList<>();
            if (is_choosing_ship && action != OrderSingleActivity.ACTION_EDIT_SHIP_WORKER) {
                defaultWorker.add(Cts.ID_DADA_MANUAL_WORKER);
            } else {
                defaultWorker.add(currUid == null ? 0 : Integer.valueOf(currUid));
            }
        }

        final boolean[] checked = new boolean[workerList.size()];
        int checkedIdx = 0;
        List<String> items = new ArrayList<>();
        for (int i = 0; i < workerList.size(); i++) {
            Worker worker = workerList.get(i);
            items.add(worker.getNickname());
            if (defaultWorker.contains(worker.getId())) {
                checked[i] = true;
                checkedIdx = i;
            }
        }

        String[] workerNames = items.toArray(new String[items.size()]);
        if (is_choosing_ship) {
            adb.setSingleChoiceItems(workerNames, checkedIdx, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    checked[which] = true;
                    for(int i = 0; i < checked.length; i++) {
                        if (i != which) {
                            checked[i] = false;
                        }
                    }
                }
            });
        } else {
            adb.setMultiChoiceItems(workerNames, checked, new DialogInterface.OnMultiChoiceClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which, boolean isChecked) {
                    checked[which] = isChecked;
                }
            });
        }

        adb.setTitle(!is_choosing_ship ? "谁打包的？" : "选择快递小哥")
                .setPositiveButton(activity.getString(R.string.ok), (dialog, which) -> {
                    ArrayList<Integer> selected = new ArrayList<Integer>();
                    for(int i = 0 ; i < checked.length; i++) {
                        if (checked[i]) selected.add(workerList.get(i).getId());
                    }

                    if (selected.isEmpty()) {
                        AlertUtil.showAlert(OrderSingleHelper.this.activity, "错误提示", "请至少操作人员");
                        return;
                    }

                    if (action == OrderSingleActivity.ACTION_EDIT_SHIP_WORKER) {
                        new EditShipWorkerTask(selected).executeOnIO();
                    } else if (action == OrderSingleActivity.ACTION_EDIT_PACK_WORKER) {
                        new EditPackWorkerTask(selected).executeOnIO();
                    } else {
                        OrderSingleActivity.OrderActionOp orderActionOp = new OrderSingleActivity.OrderActionOp(orderId,
                                activity, orderListTypeToJump);
                        orderActionOp.setWorkerId(selected);
                        orderActionOp.executeOnNormal(fromStatus);
                    }
                });
        adb.setNegativeButton(activity.getString(R.string.cancel), null);
        AlertUtil.showDlg(adb);
    }

    public void updateUI(Runnable runnable) {
        this.activity.runOnUiThread(runnable);
    }

    public void updateDadaCallLabelUI(final int dadaStatus, final Button btnCallDada) {
        this.updateUI(new Runnable() {
            @Override
            public void run() {
                if (btnCallDada != null) {
                    btnCallDada.setText(CallDadaClicked.getDadaBtnLabel(dadaStatus));
                }
            }
        });
    }


    /**
     * 退款/加钱
     * @param activity
     * @param item
     * @return
     */
    static AlertDialog createRefundDialog(final StoreStorageActivity activity, final StorageItem item) {
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

 public static class DadaCancelTask extends MyAsyncTask<Integer, ResultBean, ResultBean> {

        private int orderId;
        private OrderSingleHelper helper;
     private int cancelCode = 1;
     private String cancelReason = "";

        public DadaCancelTask(int orderId, OrderSingleHelper helper, int cancelCode, String cancelReason) {
            this.orderId = orderId;
            this.helper = helper;
            this.cancelReason = cancelReason;
            this.cancelCode = cancelCode;
        }

     @Override
     protected ResultBean doInBackground(Integer... params) {
         OrderActionDao dao = new OrderActionDao(GlobalCtx.app().token());
         ResultBean resultBean;
         try {
             resultBean = dao.order_dada_cancel(orderId, this.cancelCode, this.cancelReason);
             if (resultBean.isOk()) { helper.showToast("取消完成：" + resultBean.getDesc()); }
             else { helper.showErrorInUI("取消失败:" + resultBean.getDesc()); }
         } catch (ServiceException e) {
             e.printStackTrace();
             helper.showErrorInUI("发生错误：" + e.getMessage());
         }
         return null;
     }
   }

 public static class DadaQueryTask extends MyAsyncTask<Integer, ResultBean, ResultBean> {

        private int orderId;
        private OrderSingleHelper helper;

        public DadaQueryTask(int orderId, OrderSingleHelper helper) {
            this.orderId = orderId;
            this.helper = helper;
        }

        @Override
       protected ResultBean doInBackground(Integer... params) {
            OrderActionDao dao = new OrderActionDao(GlobalCtx.app().token());
           ResultBean resultBean;
           try {
               resultBean = dao.orderDadaQuery(this.orderId);
               if (resultBean.isOk()) {
                    helper.showToast("查询结果：" + resultBean.getDesc());
               }else {
                    helper.showErrorInUI("查询失败:" + resultBean.getDesc());
               }
           } catch (ServiceException e) {
               e.printStackTrace();
               helper.showErrorInUI("发生错误：" + e.getMessage());
           }
           return null;
       }
   }

    public static class CallDadaClicked implements View.OnClickListener {
        private int dadaStatus;
        private int orderId;
        private OrderSingleHelper helper;
        private Button btnCallDada;

        public CallDadaClicked(int dadaStatus, int orderId, OrderSingleHelper helper, Button btnCallDada) {
            this.dadaStatus = dadaStatus;
            this.orderId = orderId;
            this.helper = helper;
            this.btnCallDada = btnCallDada;
        }


        @NonNull
        public static String getDadaBtnLabel(int dada_status) {
            String label;
            switch (dada_status) {
                case Cts.DADA_STATUS_TO_ACCEPT: label = "自动:待接单"; break;
                case Cts.DADA_STATUS_NEVER_START: label = "待呼叫配送"; break;
                case Cts.DADA_STATUS_SHIPPING: label = "自动:已在途"; break;
                case Cts.DADA_STATUS_ARRIVED: label = "自动:已送达"; break;
                case Cts.DADA_STATUS_CANCEL: label = "自动:已取消"; break;
                case Cts.DADA_STATUS_TO_FETCH: label = "自动:已接单"; break;
                case Cts.DADA_STATUS_ABNORMAL: label = "自动:配送异常"; break;
                case Cts.DADA_STATUS_TIMEOUT: label = "自动:呼叫超时"; break;
                default:
                    label = String.valueOf(dada_status);
            }
            return label;
        }

        @Override
        public void onClick(final View v) {

            new MyAsyncTask<Void, Void, Void>(){

                private Order _order;
                @Override
                protected Void doInBackground(Void... params) {
                    OrderActionDao dao = new OrderActionDao(GlobalCtx.app().token());
                    this._order = dao.getOrder(orderId, true);
                    return null;
                }

                @Override
                protected void onPostExecute(Void aVoid) {
                    final Context ctx = helper.activity;

                    if (_order == null) {
                        AlertUtil.error(helper.activity, "获取订单失败，请重试！");
                        return;
                    }

                    AlertDialog.Builder adb = new AlertDialog.Builder(ctx);

                    int _dadaStatus;
                    _dadaStatus = this._order.getDada_status();
                    helper.updateDadaCallLabelUI(_dadaStatus, btnCallDada);

                    if (_dadaStatus == Cts.DADA_STATUS_NEVER_START) {
                        callShipDlg(ctx);
                    } else if (_dadaStatus == Cts.DADA_STATUS_TO_ACCEPT) {
                        String msg;
                        if (_order != null) {
                            int minutes = (int) ((System.currentTimeMillis() - _order.getDada_call_at().getTime()) / (1000 * 60));
                            msg = String.format("%d分前已发单(%s米%.1f元)到%s, 等待接单中...", minutes, _order.getDada_distance(), _order.getDada_fee(), _order.getAuto_plat());
                        } else {
                            msg = "已自动发单，等待接单";
                        }
                        adb.setTitle("自动待接单")
                                .setMessage(msg)
                                .setPositiveButton("继续等待", null)
                                .setNeutralButton("刷新状态", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        new DadaQueryTask(orderId, helper).executeOnNormal();
                                    }
                                })
                                .setNegativeButton("撤回呼叫", new DadaCancelClicked(false));
                        AlertUtil.showDlg(adb);
                    } else if (_dadaStatus == Cts.DADA_STATUS_TO_FETCH) {
                        String dada_dm_name = _order == null ? "-" :  _order.getDada_dm_name();
                        final String dada_mobile = _order == null ? "-" : _order.getDada_mobile();
                        final String autoPlat = _order == null ? "-" : _order.getAuto_plat();
                        adb.setTitle("自动待取货")
                                .setMessage(String.format("%s %s (%s) 已接单，如强制取消扣2元费用", autoPlat, dada_dm_name, dada_mobile))
                                .setPositiveButton("知道了", null)
                                .setNegativeButton("强行撤单", new DadaCancelClicked(true));
                        if (_order != null && !TextUtils.isEmpty(_order.getDada_mobile())) {
                            adb.setNeutralButton("呼叫配送员", new CallDadaPhoneClicked(dada_mobile));
                        }
                        AlertUtil.showDlg(adb);
                    } else if (_dadaStatus == Cts.DADA_STATUS_CANCEL || _dadaStatus == Cts.DADA_STATUS_TIMEOUT) {
                        adb.setTitle("通过系统呼叫配送")
                                .setMessage("订单已"+(_dadaStatus == Cts.DADA_STATUS_TIMEOUT ? "超时":"取消")+"，重新发单？")
                                .setNegativeButton("重新发单", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        callShipDlg(ctx);
                                    }
                                }).setPositiveButton(R.string.cancel, null);
                        AlertUtil.showDlg(adb);
                    } else if (_dadaStatus == Cts.DADA_STATUS_SHIPPING || _dadaStatus == Cts.DADA_STATUS_ARRIVED) {
                        String dada_dm_name = _order == null ? "-" :  _order.getDada_dm_name();
                        final String dada_mobile = _order == null ? "-" : _order.getDada_mobile();
                        final String autoPlat = _order == null ? "-" : _order.getAuto_plat();
                        adb.setTitle("配送在途")
                                .setMessage(String.format("%s %s (%s) " + (_dadaStatus == Cts.DADA_STATUS_SHIPPING ? "配送中" : "已送达"), autoPlat, dada_dm_name, dada_mobile))
                                .setNegativeButton("呼叫配送员", new CallDadaPhoneClicked(dada_mobile))
                                .setNeutralButton("刷新状态", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        new DadaQueryTask(orderId, helper).executeOnNormal();
                                    }
                                })
                                .setPositiveButton("知道了", null);
                        AlertUtil.showDlg(adb);
                    }
                }

                private void callShipDlg(final Context ctx) {
                    String[] callOptions = _order.callOptions();

                    if (callOptions == null || callOptions.length == 0) {
                        AlertUtil.error(ctx, "此订单不支持自动呼叫，请使用其他配送方式");
                        return;
                    }

                    final int[] clicked = new int[]{_order.getSelectedCallOptionIdx()};
                    AlertDialog.Builder adbx = new AlertDialog.Builder(ctx);
                    adbx.setTitle("通过系统呼叫配送")
                            .setSingleChoiceItems(callOptions, clicked[0], new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    clicked[0] = which;
                                }
                            })
                            .setPositiveButton("立即呼叫", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    _order.setSelectedCallOptionIdx(clicked[0]);
                                    callDada(_order, ctx, _order.getSelected_way());
                                }
                            }).setNegativeButton("暂不呼叫", null);
                    AlertUtil.showDlg(adbx);
                }
            }.executeOnNormal();
        }

        private void callDada(Order _order, Context ctx, final int callOption) {
            if (_order.getPlatform() == Cts.PLAT_JDDJ.id) {
                AlertDialog.Builder adb = new AlertDialog.Builder(ctx);
                adb.setMessage("这是京东到家订单通常由京东到家配送！确定要发单吗？")
                        .setPositiveButton("确定呼叫", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                new DadaCallTask(orderId, helper, callOption).executeOnNormal();
                            }
                        }).setNegativeButton("取消", null);
                AlertUtil.showDlg(adb);
            } else {
                new DadaCallTask(orderId, helper, callOption).executeOnNormal();
            }
        }

        private class DadaCallTask extends MyAsyncTask<Integer, ResultBean, ResultBean> {

            private final int callOption;
            private int orderId;
            private OrderSingleHelper helper;

            public DadaCallTask(int orderId, OrderSingleHelper helper, int callOption) {
                this.orderId = orderId;
                this.helper = helper;
                this.callOption = callOption;
            }

            @Override
            protected ResultBean doInBackground(Integer... params) {
                OrderActionDao dao = new OrderActionDao(GlobalCtx.app().token());
                ResultBean resultBean;
                try {
                    resultBean = dao.order_dada_start(orderId, callOption);
                    if (resultBean != null && resultBean.isOk()) {
                        helper.showTipsInUI("已发出，等待接单:" + resultBean.getDesc());
                        dadaStatus = Cts.DADA_STATUS_TO_ACCEPT;
                        helper.updateDadaCallLabelUI(dadaStatus, btnCallDada);
                    }else {
                        helper.showErrorInUI("呼叫失败:" + (resultBean != null ? resultBean.getDesc() : "未知"));
                    }
                } catch (ServiceException e) {
                    e.printStackTrace();
                    helper.showErrorInUI("发生错误：" + e.getMessage());
                }
                return null;
            }

        }

        private class DadaCancelClicked implements DialogInterface.OnClickListener {
            private final boolean force;

            public DadaCancelClicked(boolean force) {
                this.force = force;
            }

            @Override
            public void onClick(DialogInterface dialog, int which) {
                new MyAsyncTask<Void, Void, Void>() {
                    List<DadaCancelReason> reasonList = null;
                    @Override
                    protected Void doInBackground(Void... params) {
                        OrderActionDao dao = new OrderActionDao(GlobalCtx.app().token());
                        reasonList = dao.getDadaCancelReasons(orderId);
                        return null;
                    }

                    @Override
                    protected void onPostExecute(Void aVoid) {
                        if (reasonList == null) {
                            helper.showErrorInUI("获取自动订单取消理由列表失败！");
                        } else {
                            helper.updateUI(new Runnable() {
                                @Override
                                public void run() {
                                    AlertDialog.Builder build = new AlertDialog.Builder(helper.activity);
                                    final HashMap<String, Integer> reasons = new HashMap<>(reasonList.size());
                                    for(DadaCancelReason re : reasonList) {
                                        reasons.put(re.getInfo(), re.getId());
                                    }
                                    final int[] checkedItem = new int[]{0};
                                    final String[] items = reasons.keySet().toArray(new String[reasons.size()]);
                                    build.setTitle("撤回自动发单")
                                            .setSingleChoiceItems(items, checkedItem[0], new DialogInterface.OnClickListener() {
                                                @Override
                                                public void onClick(DialogInterface dialog, int which) {
                                                    checkedItem[0] = which;
                                                }
                                            });
                                    build.setPositiveButton("确定撤回", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            String reasonTxt = items[checkedItem[0]];
                                            new DadaCancelTask(orderId, helper, reasons.get(reasonTxt), reasonTxt).executeOnNormal();
                                        }
                                    })
                                        .setNegativeButton("不撤回", null);

                                    AlertUtil.showDlg(build);
                                }
                            });
                        }

                    }
                }.executeOnNormal();
            }
        }

        private class CallDadaPhoneClicked implements DialogInterface.OnClickListener {
            private final String dada_mobile;

            public CallDadaPhoneClicked(String dada_mobile) {
                this.dada_mobile = dada_mobile;
            }

            @Override
            public void onClick(DialogInterface dialog, int which) {
                Intent callIntent = new Intent(Intent.ACTION_DIAL);
                callIntent.setData(Uri.parse("tel:" + dada_mobile));
                OrderSingleActivity ctx = helper.activity;
                if (ActivityCompat.checkSelfPermission(ctx, Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
                    Toast.makeText(ctx, "没有呼叫权限", Toast.LENGTH_SHORT).show();
                    return;
                }
                ctx.startActivity(callIntent);
            }
        }
    }


    private class EditShipWorkerTask extends MyAsyncTask<Integer, Void, Boolean> {
        private final List<Integer> selectedWorker;

        EditShipWorkerTask(List<Integer> selectedWorker) {
            this.selectedWorker = selectedWorker;
        }

        @Override
        protected Boolean doInBackground(Integer... params) {
            String error;
            OrderActionDao dao = new OrderActionDao(GlobalCtx.app().token());
            try {
                ResultBean result = dao.chg_ship_worker(orderId, activity.getShip_worker_id(), selectedWorker);
                if (result.isOk()) {
                    showToast("修改配送员成功！", true);
                    activity.setShip_worker_id(selectedWorker.get(0));
                    return true;
                } else {
                    error = result.getDesc();
                }
            } catch (ServiceException e) {
                error = "错误：" + e.getMessage();
                AppLogger.e("error to edit ship worker:", e);
            }

            final String msg = "修改配送员失败:" + error;
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(activity, msg, Toast.LENGTH_LONG).show();
                }
            });
            return Boolean.FALSE;
        }

    }

    private class EditPackWorkerTask extends MyAsyncTask<Integer, Void, Boolean> {
        private final List<Integer> selectedWorker;

        public EditPackWorkerTask(List<Integer> selectedWorker) {
            this.selectedWorker = selectedWorker;
        }

        @Override
        protected Boolean doInBackground(Integer... params) {
            String error;
            String token = GlobalCtx.app().token();
            OrderActionDao dao = new OrderActionDao(token);
            try {
                ResultBean result = dao.order_chg_pack_worker(orderId, activity.getPack_worker_id(), selectedWorker);
                if (result.isOk()) {
                    showToast("修改打包员成功！", true);
                    activity.setPack_worker_id(selectedWorker.get(0));
                    return true;
                } else {
                    error = result.getDesc();
                }
            } catch (ServiceException e) {
                error = "错误：" + e.getMessage();
                AppLogger.e("error to edit ship worker:", e);
            }

            showErrorInUI(error);

            return Boolean.FALSE;
        }
    }

    public void showErrorInUI(final String error) {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AlertUtil.showAlert(activity, "错误提示", error);
            }
        });
    }

    public void showTipsInUI(final String msg) {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                AlertUtil.showAlert(activity, "消息提示", msg);
            }
        });
    }

    public void showToast(final String msg) {
        this.showToast(msg, false);
    }

    public void showToast(final String msg, final boolean refresh) {
        Utility.toast(msg, activity, new Runnable() {
            @Override
            public void run() {
                if (refresh) {
                    activity.refresh();
                }
            }
        }, Toast.LENGTH_LONG);
    }

}
