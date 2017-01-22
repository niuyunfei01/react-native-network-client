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
import cn.cainiaoshicai.crm.dao.CommonConfigDao;
import cn.cainiaoshicai.crm.dao.StorageActionDao;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.DadaCancelReason;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.utils.Utility;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageActivity;

/**
 * Created by liuzhr on 7/28/16.
 */
public class OrderSingleHelper {

    private int platform;
    private String platformOid;
    private OrderSingleActivity activity;
    private int orderId;

    public OrderSingleHelper(int platform, String platformOid, OrderSingleActivity activity, int orderId) {
        this.platform = platform;
        this.platformOid = platformOid;
        this.activity = activity;
        this.orderId = orderId;
    }

    public void chooseWorker(final Activity activity, final int orderListTypeToJump, final int fromStatus, final int action) {
        this.chooseWorker(activity, orderListTypeToJump, fromStatus, action, null);
    }

    public void chooseWorker(final Activity activity, final int orderListTypeToJump, final int fromStatus, final int action, Integer defaultWorker) {

        final boolean isWaitingReady = fromStatus == Cts.WM_ORDER_STATUS_TO_READY;
        AlertDialog.Builder adb = new AlertDialog.Builder(activity);
        final ArrayList<CommonConfigDao.Worker> workerList = new ArrayList<>();
        SortedMap<Integer, CommonConfigDao.Worker> workers = GlobalCtx.getApplication().getWorkers();
        boolean is_choosing_ship = !isWaitingReady && action != OrderSingleActivity.ACTION_EDIT_PACK_WORKER;

        if (workers != null && !workers.isEmpty()) {
            for(CommonConfigDao.Worker worker : workers.values()) {
                if (is_choosing_ship || !worker.isExtShipWorker()) {
                    workerList.add(worker);
                }
            }
        }

        String currUid = GlobalCtx.getInstance().getCurrentAccountId();

        int defUid;
        if (defaultWorker == null) {
            defUid = currUid == null ? 0 : Integer.valueOf(currUid);
            if (is_choosing_ship && action != OrderSingleActivity.ACTION_EDIT_SHIP_WORKER) {
                defUid = Cts.ID_DADA_MANUAL_WORKER;
            }
        } else {
            defUid = defaultWorker;
        }

        final int[] checkedIdx = {0};
        List<String> items = new ArrayList<>();
        for (int i = 0; i < workerList.size(); i++) {
            CommonConfigDao.Worker worker = workerList.get(i);
            items.add(worker.getNickname());
            if (defUid == worker.getId()) {
                checkedIdx[0] = items.size() - 1;
            }
        }

        adb.setSingleChoiceItems(items.toArray(new String[items.size()]), checkedIdx[0], new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                checkedIdx[0] = which;
            }
        });
        adb.setTitle(!is_choosing_ship ? "谁打包的？" : "选择快递小哥")
                .setPositiveButton(activity.getString(R.string.ok), new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {

                        final int selectedWorker = workerList.get(checkedIdx[0]).getId();
                        if (action == OrderSingleActivity.ACTION_EDIT_SHIP_WORKER) {
                            new EditShipWorkerTask(selectedWorker).executeOnIO();
                        } else if (action == OrderSingleActivity.ACTION_EDIT_PACK_WORKER) {
                            new EditPackWorkerTask(selectedWorker).executeOnIO();
                        } else {
                            OrderSingleActivity.OrderActionOp orderActionOp = new OrderSingleActivity.OrderActionOp(platform, platformOid, activity, orderListTypeToJump);
                            orderActionOp.setWorkerId(selectedWorker);
                            orderActionOp.executeOnNormal(fromStatus);
                        }
                    }
                });
        adb.setNegativeButton(activity.getString(R.string.cancel), null);
        adb.show();
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
         OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
         ResultBean resultBean;
         try {
             resultBean = dao.order_dada_cancel(orderId, this.cancelCode, this.cancelReason);
             helper.showToast((resultBean.isOk() ? "取消完成：" : "取消失败:") + resultBean.getDesc());
         } catch (ServiceException e) {
             e.printStackTrace();
             helper.showToast("发生错误：" + e.getMessage());
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
           OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
           ResultBean resultBean;
           try {
               resultBean = dao.orderDadaQuery(this.orderId);
               if (resultBean.isOk()) {
                    helper.showToast("查询结果：" + resultBean.getDesc());
               }else {
                    helper.showToast("查询结果:" + resultBean.getDesc());
               }
           } catch (ServiceException e) {
               e.printStackTrace();
               helper.showToast("发生错误：" + e.getMessage());
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
                case Cts.DADA_STATUS_TO_ACCEPT: label = "达达待接单"; break;
                case Cts.DADA_STATUS_NEVER_START: label = "呼叫达达"; break;
                case Cts.DADA_STATUS_SHIPPING: label = "达达在途"; break;
                case Cts.DADA_STATUS_ARRIVED: label = "达达已送达"; break;
                case Cts.DADA_STATUS_CANCEL: label = "达达已取消"; break;
                case Cts.DADA_STATUS_TO_FETCH: label = "达达已接单"; break;
                case Cts.DADA_STATUS_TIMEOUT: label = "超时未接单"; break;
                default:
                    label = String.valueOf(dada_status);
            }
            return label;
        }

        @Override
        public void onClick(final View v) {

            new MyAsyncTask<Void, Void, Void>(){

                private int _dadaStatus;
                private Order _order;
                @Override
                protected Void doInBackground(Void... params) {
                    OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
                    this._order = dao.getOrder(orderId);
                    this._dadaStatus = this._order.getDada_status();
                    return null;
                }

                @Override
                protected void onPostExecute(Void aVoid) {
                    final Activity ctx = (Activity) v.getContext();
                    AlertDialog.Builder adb = new AlertDialog.Builder(ctx);

                    helper.updateDadaCallLabelUI(_dadaStatus, btnCallDada);

                    double dadaPrice = Math.max(_order.getOrderMoney() * 0.08, 6);

                    if (_dadaStatus == Cts.DADA_STATUS_NEVER_START) {
                        adb.setTitle("呼叫达达")
                                .setMessage(dadaPrice > 7.0 ? String.format("起步价约 %.1f 元，每公里加1元，三公里以上每公里加2元，没有别的办法了吗？", dadaPrice) : "现在呼叫达达..." )
                                .setPositiveButton("呼叫达达", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        callDada(_order, ctx);
                                    }
                                }).setNegativeButton("暂不呼叫", null);
                        adb.show();
                    } else if (_dadaStatus == Cts.DADA_STATUS_TO_ACCEPT) {
                        String msg;
                        if (_order != null) {
                            int minutes = (int) ((System.currentTimeMillis() - _order.getDada_call_at().getTime()) / (1000 * 60));
                            msg = String.format("%d分前已发单(%s米%.1f元)，等待接单中...", minutes, _order.getDada_distance(), _order.getDada_fee());
                        } else {
                            msg = "达达已发单，等待接单";
                        }
                        adb.setTitle("达达待接单")
                                .setMessage(msg)
                                .setPositiveButton("继续等待", null)
                                .setNeutralButton("刷新状态", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        new DadaQueryTask(orderId, helper).executeOnNormal();
                                    }
                                })
                                .setNegativeButton("撤回呼叫", new DadaCancelClicked(false));
                        adb.show();
                    } else if (_dadaStatus == Cts.DADA_STATUS_TO_FETCH) {
                        String dada_dm_name = _order == null ? "-" :  _order.getDada_dm_name();
                        final String dada_mobile = _order == null ? "-" : _order.getDada_mobile();
                        adb.setTitle("达达待取货")
                                .setMessage(String.format("达达%s (%s) 已接单，如强制取消扣1元费用", dada_dm_name, dada_mobile))
                                .setPositiveButton("知道了", null)
                                .setNegativeButton("强行撤单", new DadaCancelClicked(true));
                        if (_order != null && !TextUtils.isEmpty(_order.getDada_mobile())) {
                            adb.setNeutralButton("呼叫配送员", new CallDadaPhoneClicked(dada_mobile));
                        }
                        adb.show();
                    } else if (_dadaStatus == Cts.DADA_STATUS_CANCEL || _dadaStatus == Cts.DADA_STATUS_TIMEOUT) {
                        adb.setTitle("呼叫达达")
                                .setMessage("订单已"+(_dadaStatus == Cts.DADA_STATUS_TIMEOUT ? "超时":"取消")+"，重新发单？")
                                .setNegativeButton("重新发单", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        callDada(_order, ctx, true);
                                    }
                                }).setPositiveButton(R.string.cancel, null);
                        adb.show();
                    } else if (_dadaStatus == Cts.DADA_STATUS_SHIPPING || _dadaStatus == Cts.DADA_STATUS_ARRIVED) {
                        String dada_dm_name = _order == null ? "-" :  _order.getDada_dm_name();
                        final String dada_mobile = _order == null ? "-" : _order.getDada_mobile();
                        adb.setTitle("达达在途")
                                .setMessage(String.format("达达%s (%s) " + (_dadaStatus == Cts.DADA_STATUS_SHIPPING ? "配送中" : "已送达"), dada_dm_name, dada_mobile))
                                .setNegativeButton("呼叫配送员", new CallDadaPhoneClicked(dada_mobile))
                                .setPositiveButton("知道了", null);
                        adb.show();
                    }
                }
            }.executeOnNormal();

        }

        private void callDada(Order _order, Context ctx, final boolean restart) {
            if (_order.getPlatform() == Cts.PLAT_JDDJ.id) {
                AlertDialog.Builder adb = new AlertDialog.Builder(ctx);
                adb.setMessage("这是京东到家订单！确定要使用达达发单吗？")
                        .setPositiveButton("确定呼叫", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                new DadaCallTask(orderId, helper, restart).executeOnNormal();
                            }
                        }).setNegativeButton("取消", null);
            } else {
                new DadaCallTask(orderId, helper, restart).executeOnNormal();
            }
        }

        private void callDada(Order _order, Context ctx) {
            this.callDada(_order, ctx, false);
        }

        private class DadaCallTask extends MyAsyncTask<Integer, ResultBean, ResultBean> {

            private final boolean restart;
            private int orderId;
            private OrderSingleHelper helper;

            public DadaCallTask(int orderId, OrderSingleHelper helper) {
                this(orderId, helper, false);
            }

            public DadaCallTask(int orderId, OrderSingleHelper helper, boolean restart) {
                this.orderId = orderId;
                this.helper = helper;
                this.restart = restart;
            }

            @Override
            protected ResultBean doInBackground(Integer... params) {
                OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
                ResultBean resultBean;
                try {
                    resultBean = restart ? dao.order_dada_restart(orderId) : dao.order_dada_start(orderId);
                    if (resultBean != null && resultBean.isOk()) {
                        helper.showToast("达达已收到请求:" + resultBean.getDesc());
                        dadaStatus = Cts.DADA_STATUS_TO_ACCEPT;
                        helper.updateDadaCallLabelUI(dadaStatus, btnCallDada);
                    }else {
                        helper.showToast("呼叫失败:" + (resultBean != null ? resultBean.getDesc() : "未知"));
                    }
                } catch (ServiceException e) {
                    e.printStackTrace();
                    helper.showToast("发生错误：" + e.getMessage());
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
                        OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
                        reasonList = dao.getDadaCancelReasons(orderId);
                        return null;
                    }

                    @Override
                    protected void onPostExecute(Void aVoid) {
                        if (reasonList == null) {
                            helper.showToast("获取达达订单取消理由列表失败！");
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
                                    build.setTitle("撤回达达订单")
                                            .setSingleChoiceItems(items, checkedItem[0], new DialogInterface.OnClickListener() {
                                                @Override
                                                public void onClick(DialogInterface dialog, int which) {
                                                    checkedItem[0] = which;
                                                }
                                            });
                                    build.setPositiveButton("确定撤回达达", new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            String reasonTxt = items[checkedItem[0]];
                                            new DadaCancelTask(orderId, helper, reasons.get(reasonTxt), reasonTxt).executeOnNormal();
                                        }
                                    })
                                        .setNegativeButton("不撤回", null);
                                    build.show();
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
                Intent callIntent = new Intent(Intent.ACTION_CALL);
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
        private final int selectedWorker;

        public EditShipWorkerTask(int selectedWorker) {
            this.selectedWorker = selectedWorker;
        }

        @Override
        protected Boolean doInBackground(Integer... params) {
            String error;
            OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
            try {
                ResultBean result = dao.chg_ship_worker(orderId, activity.getShip_worker_id(), selectedWorker);
                if (result.isOk()) {
                    showToast("修改配送员成功！", true);
                    activity.setShip_worker_id(selectedWorker);
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
        private final int selectedWorker;

        public EditPackWorkerTask(int selectedWorker) {
            this.selectedWorker = selectedWorker;
        }

        @Override
        protected Boolean doInBackground(Integer... params) {
            String error;
            OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
            try {
                ResultBean result = dao.order_chg_pack_worker(orderId, activity.getPack_worker_id(), selectedWorker);
                if (result.isOk()) {
                    showToast("修改打包员成功！", true);
                    activity.setPack_worker_id(selectedWorker);
                    return true;
                } else {
                    error = result.getDesc();
                }
            } catch (ServiceException e) {
                error = "错误：" + e.getMessage();
                AppLogger.e("error to edit ship worker:", e);
            }

            showToast("修改打包员失败:" + error);
            return Boolean.FALSE;
        }
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
