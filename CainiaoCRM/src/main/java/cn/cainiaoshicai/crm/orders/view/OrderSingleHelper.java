package cn.cainiaoshicai.crm.orders.view;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.support.annotation.NonNull;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.CommonConfigDao;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.DadaCancelReason;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

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

        final boolean isWaitingReady = fromStatus == Cts.WM_ORDER_STATUS_TO_READY;
        AlertDialog.Builder adb = new AlertDialog.Builder(activity);
        final ArrayList<CommonConfigDao.Worker> workerList = new ArrayList<>();
        HashMap<Integer, CommonConfigDao.Worker> workers = GlobalCtx.getApplication().getWorkers();
        if (workers != null && !workers.isEmpty()) {
            for(CommonConfigDao.Worker worker : workers.values()) {
                if (!(isWaitingReady || action == OrderSingleActivity.ACTION_EDIT_PACK_WORKER) || !worker.isExtShipWorker()) {
                    workerList.add(worker);
                }
            }
        }

        String currUid = GlobalCtx.getInstance().getCurrentAccountId();
        int iCurrUid = currUid != null ? Integer.parseInt(currUid) : 0;
        final int[] checkedIdx = {0};
        List<String> items = new ArrayList<>();
        for (int i = 0; i < workerList.size(); i++) {
            CommonConfigDao.Worker worker = workerList.get(i);
            items.add(worker.getNickname());
            if (iCurrUid == worker.getId()) {
                checkedIdx[0] = items.size() - 1;
            }
        }

        adb.setSingleChoiceItems(items.toArray(new String[items.size()]), checkedIdx[0], new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                checkedIdx[0] = which;
            }
        });
        adb.setTitle((isWaitingReady || action == OrderSingleActivity.ACTION_EDIT_PACK_WORKER) ? "谁打包的？" : "选择快递小哥")
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


 public static class DadaCancelTask extends MyAsyncTask<Integer, ResultBean, ResultBean> {

        private int orderId;
        private OrderSingleHelper helper;

        public DadaCancelTask(int orderId, OrderSingleHelper helper) {
            this.orderId = orderId;
            this.helper = helper;
        }

        @Override
       protected ResultBean doInBackground(Integer... params) {
           OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
           ResultBean resultBean;
           try {
               resultBean = dao.order_dada_cancel(orderId, 1, "");
               if (resultBean.isOk()) {
                    helper.showToast("呼叫完成");
               }else {
                    helper.showToast("呼叫失败:" + resultBean.getDesc());
               }
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
               resultBean = dao.order_dada_start(orderId);
               if (resultBean.isOk()) {
                    helper.showToast("呼叫完成");
               }else {
                    helper.showToast("呼叫失败:" + resultBean.getDesc());
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
                case Cts.DADA_STATUS_TO_ACCEPT:
                    label = "达达待接单";
                    break;
                case Cts.DADA_STATUS_NEVER_START:
                    label = "呼叫达达";
                    break;
                case Cts.DADA_STATUS_SHIPPING:
                    label = "达达已接单";
                    break;
                default:
                    label = String.valueOf(dada_status);
            }
            return label;
        }

        @Override
        public void onClick(View v) {
            final Activity ctx = (Activity) v.getContext();
            AlertDialog.Builder adb = new AlertDialog.Builder(ctx);
            if (dadaStatus == Cts.DADA_STATUS_NEVER_START) {
                adb.setTitle("呼叫达达")
                        .setMessage("现在呼叫达达...")
                        .setPositiveButton("呼叫达达", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                new DadaCallTask(orderId, helper).executeOnNormal();
                            }
                        }).setNegativeButton("暂不呼叫", null);
                adb.show();
            } else if (dadaStatus == Cts.DADA_STATUS_TO_ACCEPT) {
                adb.setTitle("呼叫达达")
                        .setMessage("等待达达接单中...")
                        .setPositiveButton("继续等待", null)
                        .setNegativeButton("撤回呼叫", new DadaCancelClicked(false));
                adb.show();
            } else if (dadaStatus == Cts.DADA_STATUS_TO_FETCH) {
                adb.setTitle("呼叫达达")
                        .setMessage("达达已接单。如强制取消扣1元费用，影响达达配送员...")
                        .setPositiveButton(R.string.ok, null).setNegativeButton("强行取消", new DadaCancelClicked(true));
                adb.show();
            }
        }

        private class CallDadaListener implements DialogInterface.OnClickListener {
            private final Activity ctx;

            public CallDadaListener(Activity ctx) {
                this.ctx = ctx;
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
                            AlertDialog.Builder build = new AlertDialog.Builder(ctx);
                            String[] reasons = new String[reasonList.size()];
                            final int[] checkedItem = new int[]{0};
                            build.setTitle("取消达达订单")
                                    .setSingleChoiceItems(reasons, checkedItem[0], new DialogInterface.OnClickListener() {
                                        @Override
                                        public void onClick(DialogInterface dialog, int which) {
                                            checkedItem[0] = which;
                                        }
                                    });
                        }

                    }
                }.executeOnNormal();

            }
        }

        private class DadaCallTask extends MyAsyncTask<Integer, ResultBean, ResultBean> {

            private int orderId;
            private OrderSingleHelper helper;

            public DadaCallTask(int orderId, OrderSingleHelper helper) {
                this.orderId = orderId;
                this.helper = helper;
            }

            @Override
            protected ResultBean doInBackground(Integer... params) {
                OrderActionDao dao = new OrderActionDao(GlobalCtx.getInstance().getSpecialToken());
                ResultBean resultBean;
                try {
                    resultBean = dao.order_dada_start(orderId);
                    if (resultBean.isOk()) {
                        helper.showToast("呼叫完成:" + resultBean.getDesc());
                        dadaStatus = Cts.DADA_STATUS_TO_ACCEPT;
                        helper.updateDadaCallLabelUI(dadaStatus, btnCallDada);
                    }else {
                        helper.showToast("呼叫失败:" + resultBean.getDesc());
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
                new DadaCancelTask(orderId, helper).executeOnNormal();
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
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(activity, msg, Toast.LENGTH_LONG).show();
                if (refresh) {
                    activity.refresh();
                }
            }
        });
    }

}
