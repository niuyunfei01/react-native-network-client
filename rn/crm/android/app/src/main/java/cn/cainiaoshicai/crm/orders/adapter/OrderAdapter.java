package cn.cainiaoshicai.crm.orders.adapter;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.SearchManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.content.res.ColorStateList;
import android.graphics.Paint;
import android.net.Uri;
import androidx.core.content.ContextCompat;
import android.text.TextUtils;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.ListType;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.domain.ShipAcceptStatus;
import cn.cainiaoshicai.crm.domain.ShipOptions;
import cn.cainiaoshicai.crm.domain.Worker;
import cn.cainiaoshicai.crm.orders.dao.OrderActionDao;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.util.AlertUtil;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.ui.activity.OrderQueryActivity;

/**
 *
 */
public class OrderAdapter extends BaseAdapter {

    private final Activity activity;
    private ArrayList<Order> orders;
    private static LayoutInflater inflater = null;
    private final int listType;

    public OrderAdapter(Activity activity, ArrayList<Order> orders, int listType) {
        this.activity = activity;
        this.orders = orders;
        inflater = (LayoutInflater) activity.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        this.listType = listType;
    }

    @Override
    public int getCount() {
        return orders.size();
    }

    @Override
    public Object getItem(int i) {
        return orders.get(i);
    }

    @Override
    public long getItemId(int i) {
        return i;
    }

    @SuppressLint("SetTextI18n")
    @Override
    public View getView(int i, View vi, final ViewGroup viewGroup) {

        if (vi == null)
            vi = inflater.inflate(R.layout.order_list_one, null);

        TextView expect_time = vi.findViewById(R.id.fb_reported_at);
        TextView orderAddr = vi.findViewById(R.id.fb_content);
        TextView userName = vi.findViewById(R.id.userName);
        TextView phone = vi.findViewById(R.id.phone_text);
        TextView genderText = vi.findViewById(R.id.gender_text);
        TextView orderMoney = vi.findViewById(R.id.total_money);
        TextView orderTime = vi.findViewById(R.id.orderTime);
        TextView dayNo = vi.findViewById(R.id.feedbackId);
        TextView sourcePlatform = vi.findViewById(R.id.source_platform);
        TextView orderTimesTxt = vi.findViewById(R.id.user_order_times);
        TextView viewMoreTimes = vi.findViewById(R.id.view_more_details);
        TextView paidWayTxt = vi.findViewById(R.id.fb_status);
        TextView packAssigned = vi.findViewById(R.id.pack_assigned);
        TextView labelExpectTxt = vi.findViewById(R.id.fb_from_user);

        TextView ship_schedule = vi.findViewById(R.id.ship_schedule);
        ship_schedule.setVisibility(View.GONE);

        GlobalCtx ctx = GlobalCtx.app();
        ColorStateList defTextColor = labelExpectTxt.getTextColors();
        int redTextColor = ContextCompat.getColor(ctx, R.color.red);
        int lightBlue = ContextCompat.getColor(activity, R.color.light_blue);

//        NetworkImageView thumb_image = (NetworkImageView) vi.findViewById(R.id.ivItemAvatar);

        try {
            final Order order = orders.get(i);

            boolean isDirect = GlobalCtx.app().isDirectVendor();

//        thumb_image.setImageUrl(order.getThumbnailUrl(), mImageLoader);

            DateTimeUtils instance = DateTimeUtils.getInstance(vi.getContext());

            Date expectTime = order.getExpectTime();
            boolean notTimeToShip = expectTime != null && (expectTime.getTime() - System.currentTimeMillis() > 90 * 60 * 1000);

            viewMoreTimes.setTextColor(lightBlue);

            String expectTimeTxt = TextUtils.isEmpty(order.getExpectTimeStr()) ? (expectTime == null ? "立即送餐" : DateTimeUtils.dHourMinCh(expectTime)) : order.getExpectTimeStr();
            expect_time.setText(expectTimeTxt);

            if (notTimeToShip) {
                expect_time.setBackgroundColor(ContextCompat.getColor(activity, R.color.green));
                expect_time.setTextColor(ContextCompat.getColor(activity, R.color.white));
            } else {
                expect_time.setBackgroundColor(0);
                expect_time.setTextColor(lightBlue);
            }

            if ((!TextUtils.isEmpty(order.getPack_assign_name()) || !TextUtils.isEmpty(order.getPack_1st_worker())) &&
                    (order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_READY || order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_SHIP)) {
                if (!TextUtils.isEmpty(order.getPack_assign_name())) {
                    packAssigned.setText("派:" + order.getPack_assign_name());
                } else {
                    packAssigned.setText("领:" + order.getPack_1st_worker());
                }
                packAssigned.setVisibility(View.VISIBLE);
                packAssigned.setOnClickListener(new OrderAllotListener(order.getPack_assign_name(), order.getId(), order.getStore_id()));
            } else {
                packAssigned.setVisibility(View.GONE);
            }

            boolean paid_done = order.isPaidDone();
            if (!paid_done) {
                paidWayTxt.setText("货到付款");
                paidWayTxt.setTextColor(redTextColor);
                paidWayTxt.setBackground(ContextCompat.getDrawable(activity, R.drawable.list_text_border_red));
            } else {
                paidWayTxt.setText("在线支付");
                paidWayTxt.setTextColor(defTextColor);
                paidWayTxt.setBackground(null);
                paidWayTxt.setVisibility(View.GONE);
            }

            boolean isInvalid = order.getOrderStatus() == Cts.WM_ORDER_STATUS_INVALID;

            if (isInvalid) {
                addStrikeThrough(dayNo);
                addStrikeThrough(labelExpectTxt);
                addStrikeThrough(expect_time);
                addStrikeThrough(paidWayTxt);
                addStrikeThrough(orderAddr);
            } else {
                cancelStrikeThrough(dayNo);
                cancelStrikeThrough(labelExpectTxt);
                cancelStrikeThrough(expect_time);
                cancelStrikeThrough(paidWayTxt);
                cancelStrikeThrough(orderAddr);
            }

            final String direction;
            if (order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_SHIP
                    || order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_READY
                    || "未知".equals(order.getDirection())
                    || TextUtils.isEmpty(order.getDirection())) {
                direction = "";
            } else {
                direction = " [ " + order.getDirection() + " ]";
            }
            orderAddr.setText((isInvalid ? "[已无效]" : "") + (listType == ListType.NONE.getValue() ? "[" + order.getStore_name() + "]" : "") + order.getAddress() + direction);
            userName.setText(order.getUserName());
            String tipMobile = order.getMobile();
            if (tipMobile != null) {
                tipMobile = tipMobile.replaceAll(",", "转");
            }
            phone.setText(tipMobile);
            phone.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    callMobilePhone(v, order.getMobile());
                }
            });

            genderText.setText(order.getGenderText());
            if (!isDirect && order.getSupplyMoney() > 0) {
                orderMoney.setText(String.valueOf(order.getSupplyMoney()));
            } else {
                orderMoney.setText(String.valueOf(order.getOrderMoney()));
            }
            orderTimesTxt.setText(order.getOrder_times() > 1 ? "第" + order.getOrder_times() + "次" : "新用户");

            orderTimesTxt.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent intent = new Intent(v.getContext(), OrderQueryActivity.class);
                    intent.setAction(Intent.ACTION_SEARCH);
                    String searchTerm = "@@" + order.getReal_mobile() + "|||store:" + order.getStore_id();
                    intent.putExtra(SearchManager.QUERY, searchTerm);
                    intent.putExtra("max_past_day", 10000);
                    v.getContext().startActivity(intent);
                }
            });

            orderTime.setText(instance.getShortFullTime(order.getOrderTime()));

            if (isDirect) {
                dayNo.setText("#" + order.getDayId());
                dayNo.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f);
            } else {
                dayNo.setText(order.platformWithId() + "总#" + order.getDayId());
                dayNo.setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f);
            }

            if (isDirect) {
                sourcePlatform.setText(order.platformWithId());
                sourcePlatform.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        Intent intent = new Intent(v.getContext(), OrderQueryActivity.class);
                        intent.setAction(Intent.ACTION_SEARCH);
                        intent.putExtra(SearchManager.QUERY, "pl:" + order.getPlatform());
                        v.getContext().startActivity(intent);
                    }
                });
                sourcePlatform.setVisibility(View.VISIBLE);
            } else {
                sourcePlatform.setVisibility(View.INVISIBLE);
            }

            if (order.getOrderStatus() != Cts.WM_ORDER_STATUS_INVALID) {
                LinearLayout ll = vi.findViewById(R.id.order_status_state);
                ShipWorkerOnClickListener shipWorkerClicked = new ShipWorkerOnClickListener(order);

                TextView workerText = vi.findViewById(R.id.ship_worker_text);
                TextView shipTextView = vi.findViewById(R.id.start_ship_text);
                if (!TextUtils.isEmpty(order.getShip_worker_name())) {
                    workerText.setText(order.getShip_worker_name());
                    workerText.setOnClickListener(shipWorkerClicked);
                    workerText.setVisibility(View.VISIBLE);
                    shipTextView.setText(order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_READY || order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_SHIP ? "接单" : "出发");
                    shipTextView.setVisibility(View.VISIBLE);
                } else {
                    workerText.setVisibility(View.GONE);
                    shipTextView.setVisibility(View.GONE);
                }

                TextView packTime = vi.findViewById(R.id.start_ship_time);
                if (order.getTime_start_ship() != null) {
                    packTime.setText(DateTimeUtils.hourMin(order.getTime_start_ship()));
                    packTime.setVisibility(View.VISIBLE);
                } else {
                    packTime.setVisibility(View.GONE);
                }
                packTime.setOnClickListener(shipWorkerClicked);

                TextView shipTimeText = vi.findViewById(R.id.ship_time_text);
                TextView text_ship_start = vi.findViewById(R.id.text_ship_start);
                TextView text_ship_end = vi.findViewById(R.id.text_ship_end);
                TextView shipTimeCost = vi.findViewById(R.id.ship_time_cost);

                shipTimeCost.setOnClickListener(shipWorkerClicked);
                text_ship_start.setOnClickListener(shipWorkerClicked);
                text_ship_end.setOnClickListener(shipWorkerClicked);
                shipTimeCost.setOnClickListener(shipWorkerClicked);

                if (order.getTime_arrived() != null && order.getTime_start_ship() != null) {
                    shipTimeText.setText(DateTimeUtils.hourMin(order.getTime_arrived()));
                    int minutes = (int) ((order.getTime_arrived().getTime() - order.getOrderTime().getTime()) / (60 * 1000));
                    shipTimeCost.setText(String.valueOf(minutes));
//                    int colorResource = minutes <= Cts.MAX_EXCELL_SPENT_TIME ? R.color.green : R.color.red;
//                    shipTimeCost.setTextColor(ContextCompat.getColor(GlobalCtx.app(), colorResource));
                    shipTimeCost.setVisibility(View.VISIBLE);
                    shipTimeText.setVisibility(View.VISIBLE);
                    text_ship_start.setVisibility(View.VISIBLE);
                    text_ship_end.setVisibility(View.VISIBLE);
                } else {
                    shipTimeCost.setVisibility(View.GONE);
                    shipTimeText.setVisibility(View.GONE);
                    text_ship_start.setVisibility(View.GONE);
                    text_ship_end.setVisibility(View.GONE);
                }

                ll.setVisibility(View.VISIBLE);
            }

            TextView inTimeView = vi.findViewById(R.id.is_in_time);
            TextView print_times = vi.findViewById(R.id.print_times);
            TextView readyDelayWarn = vi.findViewById(R.id.ready_delay_warn);
            if (order.getExpectTime() != null) {
                if (order.getTime_arrived() != null) {
                    Cts.DeliverReview reviewDeliver = Cts.DeliverReview.find(order.getReview_deliver());
                    int colorResource = (reviewDeliver.isGood()) ? R.color.green : R.color.red;
                    inTimeView.setText(reviewDeliver.name);
                    if (reviewDeliver.value != Cts.DELIVER_UNKNOWN.value) {
                        inTimeView.setTextColor(ContextCompat.getColor(ctx, colorResource));
                        inTimeView.setBackground(ContextCompat.getDrawable(ctx, reviewDeliver.isGood() ? R.drawable.list_text_border_green : R.drawable.list_text_border_red));
                    }
                    readyDelayWarn.setVisibility(View.GONE);
                    print_times.setVisibility(View.GONE);
                } else {

                    readyDelayWarn.setTextColor(defTextColor);
                    readyDelayWarn.setBackground(null);

                    if ((order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_READY
                            || order.getOrderStatus() == Cts.WM_ORDER_STATUS_TO_SHIP)) {
                        int leftMin = order.getReadyLeftMin();
                        if (leftMin < 10) {
                            readyDelayWarn.setBackground(ContextCompat.getDrawable(activity, R.drawable.list_text_border_red));
                            readyDelayWarn.setTextColor(ContextCompat.getColor(activity, R.color.red));
                        }
//                        else if (leftMin < 30) {
//                            readyDelayWarn.setBackground(ContextCompat.getDrawable(activity, R.drawable.list_text_border_green));
//                        }
                        String delayHints = leftMin > 0 ? leftMin + "分后出库延误" : "已延误" + Math.abs(leftMin) + "分钟";

                        readyDelayWarn.setText(delayHints);
                        readyDelayWarn.setVisibility(View.VISIBLE);

                        if (order.getPlatform() != Cts.PLAT_JDDJ.id) {
                            ship_schedule.setText(order.getShip_sch_desc());
                            ship_schedule.setVisibility(View.VISIBLE);
                            ship_schedule.setOnClickListener(new ScheClickedListener(order.getShip_sch(), order.getId(), order.getStore_id()));
                        }

                        print_times.setText(order.getPrint_times() > 0 ? ("打印" + order.getPrint_times() + "次") : "未打印");
                        print_times.setVisibility(View.VISIBLE);
                    } else {
                        readyDelayWarn.setVisibility(View.GONE);
                        print_times.setVisibility(View.GONE);
                    }

                    inTimeView.setVisibility(View.GONE);

                }
            } else {
                inTimeView.setText("");
            }

        } catch (Exception e) {
            AppLogger.e("display a row:" + i + ": " + e.getMessage(), e);
        }

        return vi;
    }

    private void addStrikeThrough(TextView textView) {
        textView.setPaintFlags(textView.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
    }

    private void cancelStrikeThrough(TextView textView) {
        textView.setPaintFlags(textView.getPaintFlags() & (~Paint.STRIKE_THRU_TEXT_FLAG));
    }

    private void callMobilePhone(View v, String mobile) {

        if (mobile.indexOf(",") > 0) {
            String[] parts = mobile.split(",");
            AlertUtil.showAlert(v.getContext(), R.string.tip_dialog_title, String.format("如提示输入分机号，请输入：%s", parts[1]),
                    "拨打", (dialogInterface, i) -> OrderAdapter.this.callMobilePhoneDirectly(v, mobile),
                    "关闭", (dialogInterface, i) -> { }
                    );
        } else {
            callMobilePhoneDirectly(v, mobile);
        }
    }

    private void callMobilePhoneDirectly(View v, String mobile) {
        Intent callIntent = new Intent(Intent.ACTION_DIAL);
        callIntent.setData(Uri.parse("tel:" + mobile));
        Context context = v.getContext();
        if (context == null) {
            return;
        }
        if (!isCallingSupported(v.getContext(), callIntent)) {
            return;
        }
        context.startActivity(callIntent);
    }

    private boolean isCallingSupported(Context context, Intent intent) {
        boolean result = true;
        PackageManager manager = context.getPackageManager();
        List<ResolveInfo> infos = manager.queryIntentActivities(intent, 0);
        if (infos.size() <= 0) {
            result = false;
        }
        return result;
    }

    private class ShipWorkerOnClickListener implements View.OnClickListener {
        private final Order order;

        public ShipWorkerOnClickListener(Order order) {
            this.order = order;
        }

        @Override
        public void onClick(View v) {
            String mobilephone = null;
            if (order.getShip_worker_id() == Cts.ID_AUTO_SHIP_WORKER) {
                mobilephone = order.getDada_mobile();
            } else if (!TextUtils.isEmpty(order.getShip_worker_mobile())) {
                mobilephone = order.getShip_worker_mobile();
            } else {
                SortedMap<Integer, Worker> workers = GlobalCtx.app().getWorkers();
                if (workers != null) {
                    Worker worker = workers.get(order.getShip_worker_id());
                    if (worker != null) {
                        mobilephone = worker.getMobilephone();
                    }
                }

            }
            if (mobilephone != null) {
                callMobilePhone(v, mobilephone);
            } else {
                Toast.makeText(activity, "未找到配送员电话", Toast.LENGTH_LONG).show();
            }
        }
    }


    private class OrderAllotListener implements View.OnClickListener {
        private final String initOption;
        private final long orderId;
        private final long storeId;


        public OrderAllotListener(String initOption, long orderId, long storeId) {
            this.initOption = initOption;
            this.orderId = orderId;
            this.storeId = storeId;
        }

        public Object getKeyFromValue(Map hm, Object value) {
            for (Object o : hm.keySet()) {
                if (hm.get(o).equals(value)) {
                    return o;
                }
            }
            return null;
        }

        @Override
        public void onClick(View v) {
            GlobalCtx app = GlobalCtx.app();
            ShipAcceptStatus acceptStatus = null;
            if (app.getAccountBean() != null) {
                acceptStatus = app.getAccountBean().shipAcceptStatus(storeId);
            }

            if (acceptStatus == null) {
                AlertUtil.showAlert(activity, "错误提示", "查询不到店铺派单信息");
                return;
            }
            Map<String, String> users = acceptStatus.getUsers();

            if (users == null) {
                AlertUtil.showAlert(activity, "错误提示", "查询不到店铺接单人员信息");
                return;
            }

            final String[] selectedOption = {initOption};

            String[] names = new String[users.size()];
            int idx = 0;
            for (Map.Entry<String, String> e : users.entrySet()) {
                names[idx] = e.getValue();
                idx++;
            }
            int checkedIdx = Arrays.binarySearch(names, initOption);

            AlertDialog.Builder adb = new AlertDialog.Builder(activity);
            adb.setTitle("改派订单");

            adb.setSingleChoiceItems(names, checkedIdx, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    String checkedName = names[which];
                    selectedOption[0] = checkedName;
                }
            });

            adb.setPositiveButton("确定", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {

                    if (TextUtils.isEmpty(initOption) || !initOption.equals(selectedOption[0])) {
                        final OrderActionDao oad = new OrderActionDao(GlobalCtx.app().token());
                        new MyAsyncTask<Void, Void, Void>() {
                            ResultBean rb;

                            @Override
                            protected Void doInBackground(Void... params) {
                                try {
                                    String userId = (String) getKeyFromValue(users, selectedOption[0]);
                                    rb = oad.order_re_assign(orderId + "", userId, storeId + "");
                                } catch (ServiceException e) {
                                    e.printStackTrace();
                                    rb = ResultBean.serviceException(e.getMessage());
                                }
                                return null;
                            }

                            @Override
                            protected void onPostExecute(Void aVoid) {
                                if (rb != null) {
                                    if (!rb.isOk()) {
                                        AlertUtil.showAlert(activity, "改派失败", rb.getDesc());
                                    } else {
                                        Toast.makeText(activity, "改派成功", Toast.LENGTH_LONG).show();
                                        ((TextView) v).setText(rb.getDesc());
                                    }
                                }
                            }
                        }.execute();
                    }
                }
            });
            adb.setNegativeButton("取消", null);
            adb.show();
        }
    }

    private class ScheClickedListener implements View.OnClickListener {

        private final String initOption;
        private final long orderId;
        private long storeId;

        private ScheClickedListener(String initOption, long orderId, long storeId) {
            this.initOption = initOption;
            this.orderId = orderId;
            this.storeId = storeId;
        }

        @Override
        public void onClick(final View v) {

            final ShipOptions options = GlobalCtx.app().getShipOptions(storeId);
            if (options == null || options.getValues() == null || options.getNames() == null) {
                AlertUtil.showAlert(activity, "错误提示", "该订单所在店铺暂无自动排单功能");
                return;
            }

            final String[] selectedOption = new String[]{initOption};
            final int checkedIdx = options.getValues().indexOf(initOption);
            String[] names = options.getNames().toArray(new String[0]);

            AlertDialog.Builder adb = new AlertDialog.Builder(activity);
            adb.setTitle("修改排单");
            adb.setSingleChoiceItems(names, checkedIdx, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    selectedOption[0] = options.getValues().get(which);
                }
            });

            adb.setPositiveButton("保存", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {

                    if (TextUtils.isEmpty(initOption) || !initOption.equals(selectedOption[0])) {
                        final OrderActionDao oad = new OrderActionDao(GlobalCtx.app().token());
                        new MyAsyncTask<Void, Void, Void>() {

                            ResultBean rb;

                            @Override
                            protected Void doInBackground(Void... params) {
                                try {
                                    rb = oad.order_edit_group(orderId, selectedOption[0], initOption);
                                } catch (ServiceException e) {
                                    e.printStackTrace();
                                    rb = ResultBean.serviceException(e.getMessage());
                                }
                                return null;
                            }

                            @Override
                            protected void onPostExecute(Void aVoid) {
                                if (rb != null) {
                                    if (!rb.isOk()) {
                                        AlertUtil.showAlert(activity, "排单失败", rb.getDesc());
                                    } else {
                                        Toast.makeText(activity, "排单成功", Toast.LENGTH_LONG).show();
                                        ((TextView) v).setText(rb.getDesc());
                                    }
                                }
                            }
                        }.execute();
                    }
                }
            });
            adb.setNegativeButton("取消", null);
            adb.show();
        }
    }
}
