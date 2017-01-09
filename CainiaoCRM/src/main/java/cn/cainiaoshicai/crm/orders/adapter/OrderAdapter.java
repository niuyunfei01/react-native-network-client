package cn.cainiaoshicai.crm.orders.adapter;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.SearchManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.Paint;
import android.net.Uri;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Date;
import java.util.SortedMap;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.dao.CommonConfigDao;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.ui.activity.OrderQueryActivity;

/**
 */
public class OrderAdapter extends BaseAdapter {

    private final Activity activity;
    private ArrayList<Order> orders = new ArrayList<>();
    private final int listType;
    private static LayoutInflater inflater = null;

    public OrderAdapter(Activity activity, ArrayList<Order> orders, int listType) {
        this.activity = activity;
        this.orders = orders;
        this.listType = listType;
        inflater = (LayoutInflater) activity.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
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

        TextView expect_time = (TextView) vi.findViewById(R.id.fb_reported_at);
        TextView orderAddr = (TextView) vi.findViewById(R.id.fb_content);
        TextView userName = (TextView) vi.findViewById(R.id.userName);
        TextView phone = (TextView) vi.findViewById(R.id.phone_text);
        TextView genderText = (TextView) vi.findViewById(R.id.gender_text);
        TextView orderMoney = (TextView) vi.findViewById(R.id.total_money);
        TextView orderTime = (TextView) vi.findViewById(R.id.orderTime);
        TextView dayNo = (TextView) vi.findViewById(R.id.feedbackId);
        TextView sourcePlatform = (TextView) vi.findViewById(R.id.source_platform);
        TextView orderTimesTxt = (TextView)vi.findViewById(R.id.user_order_times);
        TextView paidWayTxt = (TextView)vi.findViewById(R.id.fb_status);
        TextView labelExpectTxt = (TextView)vi.findViewById(R.id.fb_from_user);

        GlobalCtx ctx = GlobalCtx.getApplication();
        ColorStateList defTextColor = labelExpectTxt.getTextColors();
        int redTextColor = ContextCompat.getColor(ctx, R.color.red);
        int lightBlue = ContextCompat.getColor(activity, R.color.light_blue);

//        NetworkImageView thumb_image = (NetworkImageView) vi.findViewById(R.id.ivItemAvatar);

        try {
            final Order order = orders.get(i);

//        thumb_image.setImageUrl(order.getThumbnailUrl(), mImageLoader);

            DateTimeUtils instance = DateTimeUtils.getInstance(vi.getContext());

            Date expectTime = order.getExpectTime();
            boolean notTimeToShip = expectTime != null && (expectTime.getTime() - System.currentTimeMillis() > 90 * 60 * 1000);

            String expectTimeTxt = TextUtils.isEmpty(order.getExpectTimeStr()) ? (expectTime == null ? "立即送餐" : DateTimeUtils.dHourMinCh(expectTime)) : order.getExpectTimeStr();
            expect_time.setText(expectTimeTxt);

            if(notTimeToShip) {
                expect_time.setBackgroundColor(ContextCompat.getColor(activity, R.color.green));
                expect_time.setTextColor(ContextCompat.getColor(activity, R.color.white));
            } else {
                expect_time.setBackgroundColor(0);
                expect_time.setTextColor(lightBlue);
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
            }

            boolean isInvalid = order.getOrderStatus() == Cts.WM_ORDER_STATUS_INVALID;

            if (isInvalid) {
                addStrikeThrough(dayNo);
                addStrikeThrough(labelExpectTxt);
                addStrikeThrough(expect_time);
                addStrikeThrough(paidWayTxt);
            } else {
                cancelStrikeThrough(dayNo);
                cancelStrikeThrough(labelExpectTxt);
                cancelStrikeThrough(expect_time);
                cancelStrikeThrough(paidWayTxt);
            }

            final String direction;
            if ("未知".equals(order.getDirection())) {
                direction = "";
            } else {
                direction = " [ " + order.getDirection() + " ]";
            }
            orderAddr.setText((isInvalid ? "[已无效]" : "") + order.getAddress() + direction);
            userName.setText(order.getUserName());
            phone.setText(order.getMobile());
            phone.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    callMobilePhone(v, order.getMobile());
                }
            });
            genderText.setText(order.getGenderText());
            orderMoney.setText(String.valueOf(order.getOrderMoney()));
            orderTimesTxt.setText(order.getOrder_times() > 1 ? "第" + order.getOrder_times() + "次" : "新用户");

            orderTimesTxt.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent intent = new Intent(v.getContext(), OrderQueryActivity.class);
                    intent.setAction(Intent.ACTION_SEARCH);
                    intent.putExtra(SearchManager.QUERY, order.getMobile());
                    v.getContext().startActivity(intent);
                }
            });

            orderTime.setText(instance.getShortFullTime(order.getOrderTime()));
            dayNo.setText("#" + order.getSimplifiedId());

            sourcePlatform.setText(order.platformWithId());

            if (order.getOrderStatus() != Cts.WM_ORDER_STATUS_INVALID) {
                LinearLayout ll = (LinearLayout) vi.findViewById(R.id.order_status_state);
                ShipWorkerOnClickListener shipWorkerClicked = new ShipWorkerOnClickListener(order);

                TextView workerText = (TextView) vi.findViewById(R.id.ship_worker_text);
                if (!TextUtils.isEmpty(order.getShip_worker_name())) {
                    workerText.setText(order.getShip_worker_name());
                    workerText.setOnClickListener(shipWorkerClicked);
                } else {
                    workerText.setVisibility(View.GONE);
                    View shipTextView = vi.findViewById(R.id.start_ship_text);
                    shipTextView.setVisibility(View.GONE);
                }

                TextView packTime = (TextView) vi.findViewById(R.id.start_ship_time);
                if (order.getTime_start_ship() != null) {
                    packTime.setText(DateTimeUtils.hourMin(order.getTime_start_ship()));
                } else {
                    packTime.setVisibility(View.GONE);
                }
                packTime.setOnClickListener(shipWorkerClicked);

                TextView shipTimeText = (TextView) vi.findViewById(R.id.ship_time_text);
                TextView text_ship_start = (TextView) vi.findViewById(R.id.text_ship_start);
                TextView text_ship_end = (TextView) vi.findViewById(R.id.text_ship_end);
                TextView shipTimeCost = (TextView) vi.findViewById(R.id.ship_time_cost);

                shipTimeCost.setOnClickListener(shipWorkerClicked);
                text_ship_start.setOnClickListener(shipWorkerClicked);
                text_ship_end.setOnClickListener(shipWorkerClicked);
                shipTimeCost.setOnClickListener(shipWorkerClicked);

                if (order.getTime_arrived() != null && order.getTime_start_ship() != null) {
                    shipTimeText.setText(DateTimeUtils.hourMin(order.getTime_arrived()));
                    int minutes = (int) ((order.getTime_arrived().getTime() - order.getOrderTime().getTime()) /(60 * 1000));
                    shipTimeCost.setText(String.valueOf(minutes));
//                    int colorResource = minutes <= Cts.MAX_EXCELL_SPENT_TIME ? R.color.green : R.color.red;
//                    shipTimeCost.setTextColor(ContextCompat.getColor(GlobalCtx.getApplication(), colorResource));
                } else {
                    shipTimeCost.setVisibility(View.GONE);
                    shipTimeText.setVisibility(View.GONE);
                    text_ship_start.setVisibility(View.GONE);
                    text_ship_end.setVisibility(View.GONE);
                }

                ll.setVisibility(View.VISIBLE);
            }

            TextView inTimeView = (TextView) vi.findViewById(R.id.is_in_time);
            if (order.getExpectTime() != null ) {
                if (order.getTime_arrived() != null) {
                    Cts.DeliverReview reviewDeliver = Cts.DeliverReview.find(order.getReview_deliver());
                    int colorResource = (reviewDeliver.isGood()) ? R.color.green : R.color.red;
                    inTimeView.setText(reviewDeliver.name);
                    if (reviewDeliver.value != Cts.DELIVER_UNKNOWN.value) {
                        inTimeView.setTextColor(ContextCompat.getColor(ctx, colorResource));
                        inTimeView.setBackground(ContextCompat.getDrawable(ctx, reviewDeliver.isGood() ? R.drawable.list_text_border_green : R.drawable.list_text_border_red));
                    }
                } else {
                    inTimeView.setVisibility(View.GONE);
                    TextView print_times = (TextView) vi.findViewById(R.id.print_times);
                    TextView readyDelayWarn = (TextView) vi.findViewById(R.id.ready_delay_warn);
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
                        readyDelayWarn.setText(leftMin > 0 ? leftMin + "分后出库延误" : "已延误" + Math.abs(leftMin) + "分钟");
                        readyDelayWarn.setVisibility(View.VISIBLE);
                        print_times.setText(order.getPrint_times() > 0 ? ("打印"+order.getPrint_times()+"次") : "未打印");
                        print_times.setVisibility(View.VISIBLE);
                    } else {
                        readyDelayWarn.setVisibility(View.GONE);
                        print_times.setVisibility(View.GONE);
                    }
                }
            } else {
                inTimeView.setText("");
            }

         }catch (Exception e) {
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
        Intent callIntent = new Intent(Intent.ACTION_CALL);
        callIntent.setData(Uri.parse("tel:" + mobile));
        Context context = v.getContext();
        if (context == null) {
            return;
        }
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            Toast.makeText(context, "没有呼叫权限", Toast.LENGTH_SHORT).show();
            return;
        }
        context.startActivity(callIntent);
    }

    private class ShipWorkerOnClickListener implements View.OnClickListener {
        private final Order order;

        public ShipWorkerOnClickListener(Order order) {
            this.order = order;
        }

        @Override
        public void onClick(View v) {
            String mobilephone = null;
            if (order.getShip_worker_id() == Cts.ID_DADA_SHIP_WORKER) {
                mobilephone = order.getDada_mobile();
            } else {
                SortedMap<Integer, CommonConfigDao.Worker> workers = GlobalCtx.getInstance().getWorkers();
                if (workers != null) {
                    CommonConfigDao.Worker worker = workers.get(order.getShip_worker_id());
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
}
