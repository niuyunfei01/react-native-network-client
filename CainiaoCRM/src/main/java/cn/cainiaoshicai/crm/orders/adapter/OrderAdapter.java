package cn.cainiaoshicai.crm.orders.adapter;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.text.TextUtils;
import android.text.format.DateUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;

import cn.cainiaoshicai.crm.Constants;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.domain.Order;
import cn.cainiaoshicai.crm.orders.util.DateTimeUtils;
import cn.cainiaoshicai.crm.support.debug.AppLogger;

/**
 */
public class OrderAdapter extends BaseAdapter {

    private final Activity activity;
    private ArrayList<Order> orders = new ArrayList<>();
    private static LayoutInflater inflater = null;

    public OrderAdapter(Activity activity, ArrayList<Order> orders) {
        this.activity = activity;
        this.orders = orders;
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
    public View getView(int i, View vi, ViewGroup viewGroup) {

        if (vi == null)
            vi = inflater.inflate(R.layout.order_list_one, null);

        TextView expect_time = (TextView) vi.findViewById(R.id.expect_time);
        TextView orderAddr = (TextView) vi.findViewById(R.id.address);
        TextView userName = (TextView) vi.findViewById(R.id.userName);
        TextView phone = (TextView) vi.findViewById(R.id.phone_text);
        TextView genderText = (TextView) vi.findViewById(R.id.gender_text);
        TextView orderMoney = (TextView) vi.findViewById(R.id.total_money);
        TextView orderTime = (TextView) vi.findViewById(R.id.orderTime);
        TextView dayNo = (TextView) vi.findViewById(R.id.dayNo);
        TextView sourcePlatform = (TextView) vi.findViewById(R.id.source_platform);


//        NetworkImageView thumb_image = (NetworkImageView) vi.findViewById(R.id.ivItemAvatar);

        try {
            final Order order = orders.get(i);

//        thumb_image.setImageUrl(order.getThumbnailUrl(), mImageLoader);

            DateTimeUtils instance = DateTimeUtils.getInstance(vi.getContext());

            Date expectTime = order.getExpectTime();
            expect_time.setText( TextUtils.isEmpty(order.getExpectTimeStr()) ? (expectTime == null ? "立即送餐" : DateTimeUtils.mdHourMinCh(expectTime)) : order.getExpectTimeStr());

            orderAddr.setText(order.getAddress());
            userName.setText(order.getUserName());
            phone.setText(order.getMobile());
            phone.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent callIntent = new Intent(Intent.ACTION_CALL);
                    callIntent.setData(Uri.parse("tel:" + order.getMobile()));
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
            });
            genderText.setText(order.getGenderText());
            orderMoney.setText(String.valueOf(order.getOrderMoney()));

            orderTime.setText(instance.getShortTime(order.getOrderTime()));
            dayNo.setText("#" + order.getId()%1000);

            String platformName = Constants.Platform.find(order.getPlatform()).name;
            String platformDayId = order.getPlatform_dayId();
            sourcePlatform.setText(platformName + (platformDayId != null && order.getPlatform() != Constants.PLAT_WX.id? String.format("#%s", platformDayId) : ""));

            if (order.getOrderStatus() != Constants.WM_ORDER_STATUS_TO_READY
                    && order.getOrderStatus() != Constants.WM_ORDER_STATUS_INVALID) {
                LinearLayout ll = (LinearLayout) vi.findViewById(R.id.order_status_state);

                TextView workerText = (TextView) vi.findViewById(R.id.ship_worker_text);
                if (!TextUtils.isEmpty(order.getShip_worker_name())) {
                    workerText.setText(order.getShip_worker_name());
                } else {
                    workerText.setVisibility(View.GONE);
                    vi.findViewById(R.id.start_ship_text).setVisibility(View.GONE);
                }

                TextView packTime = (TextView) vi.findViewById(R.id.start_ship_time);
                if (order.getTime_start_ship() != null) {
                    packTime.setText(DateTimeUtils.hourMin(order.getTime_start_ship()));
                } else {
                    packTime.setVisibility(View.GONE);
                }

                TextView shipTimeText = (TextView) vi.findViewById(R.id.ship_time_text);
                TextView text_ship_start = (TextView) vi.findViewById(R.id.text_ship_start);
                TextView text_ship_end = (TextView) vi.findViewById(R.id.text_ship_end);
                TextView shipTimeCost = (TextView) vi.findViewById(R.id.ship_time_cost);
                if (order.getTime_arrived() != null && order.getTime_start_ship() != null) {
                    shipTimeText.setText(DateTimeUtils.hourMin(order.getTime_arrived()));
                    int minutes = (int) ((order.getTime_arrived().getTime() - order.getOrderTime().getTime()) /(60 * 1000));
                    shipTimeCost.setText(String.valueOf(minutes));
                    int colorResource = minutes <= Constants.MAX_EXCELL_SPENT_TIME ? R.color.green : R.color.red;
                    shipTimeCost.setTextColor(ContextCompat.getColor(GlobalCtx.getApplication(), colorResource));
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
                    int gap_minutes = (int) ((order.getExpectTime().getTime() - order.getTime_arrived().getTime()) / (60 * 1000));
                    boolean good = gap_minutes >= 0;
                    inTimeView.setText(good ? (gap_minutes <= 5 ? "准时" : "提前") : ( gap_minutes >= -30 ? "延误":"严重延误") );
                    int colorResource = good ? R.color.green : R.color.red;
                    inTimeView.setTextColor(ContextCompat.getColor(GlobalCtx.getApplication(), colorResource));
                    inTimeView.setBackground(ContextCompat.getDrawable(GlobalCtx.getApplication(), good ? R.drawable.list_text_border_green : R.drawable.list_text_border_red));
                } else {
                    if (order.getOrderTime() != null) {
                        inTimeView.setText("已下单" + ((new Date().getTime() - order.getOrderTime().getTime())/(60 * 1000)) + "分钟");
                    }
                }
            } else {
                inTimeView.setText("");
            }

         }catch (Exception e) {
            AppLogger.e("display a row:" + i + ": " + e.getMessage(), e);
        }

        /*
        long time = order.getCreatedAt().getTime();
        Log.d(GlobalCtx.ORDERS_TAG, "created at " + order.getCreatedAt());
        createdAtTxt.setText(DateUtils.getRelativeTimeSpanString(time, System.currentTimeMillis(), 0));
        ((TextView) vi.findViewById(R.id.post_address)).setText(order.getAddress());
        if (order.getAddress() != null && !"".equals(order.getAddress().trim())) {
            (vi.findViewById(R.id.post_address_pic)).setVisibility(View.VISIBLE);
        } else {
            (vi.findViewById(R.id.post_address_pic)).setVisibility(View.GONE);
        }*/

//        ExpandGridView grid = (ExpandGridView) vi.findViewById(R.id.mygallery);
//        if (order.getImages().size() > 0) {
//            ThumbnailsLoader adapter = new ThumbnailsLoader(this.activity, null);
//            adapter.addImageUrls(order.getImages());
//            adapter.addFullImages(order.fullImages());
//            ((BaseActivity) activity).getDaifanApplication().getImageLoader();
//            grid.setAdapter(adapter);
//            grid.setExpanded(true);
//            grid.setVisibility(View.VISIBLE);
//        } else {
//            grid.setVisibility(View.GONE);
//        }

        /*
        NetworkImageView imageV = (NetworkImageView) vi.findViewById(R.id.list_row_image);
        if (order.hasImage()) {
            imageV.setImageUrl(order.getImages().get(0), mImageLoader);
            imageV.setVisibility(View.VISIBLE);
        } else {
            imageV.setVisibility(View.GONE);
        }

        imageV.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent login = new Intent(activity.getApplicationContext(), ImagesActivity.class);
                login.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
                ArrayList<String> fullImages = order.fullImages();
                login.putExtra("images", fullImages.toArray(new String[0]));
                activity.startActivity(login);
            }
        });  */

        /*
        TextView postTotalNum = (TextView) vi.findViewById(R.id.post_total_num);
        postTotalNum.setText(String.valueOf(order.getCount()));

        final TextView postLeftNumTxt = (TextView) vi.findViewById(R.id.post_left_num);

        final LinearLayout orderLayout = (LinearLayout) vi.findViewById(R.id.subOrderLayout);
        final TextView bookedUNameTxt = (TextView) vi.findViewById(R.id.booked_uname_txts);
        final ImageView bookedNamePic = (ImageView) vi.findViewById(R.id.book_pic);
        final ImageButton bookBtn = (ImageButton) vi.findViewById(R.id.btnBooked);
        reLayoutBooked(order, bookedUNameTxt, orderLayout, postLeftNumTxt, bookBtn);

        final RelativeLayout commentContainers = (RelativeLayout) vi.findViewById(R.id.list_row_comments_container);
        commentContainers.removeViews(0, commentContainers.getChildCount());

        if (order.getComments().size() > 0) {
            View pre = bookedNamePic;
            for (Comment cm : order.getComments()) {
                pre = appendComment(commentContainers, cm, pre);
            }
            commentContainers.setVisibility(View.VISIBLE);
        }

        final User currU = GlobalCtx.getInstance().getCurrUser();
        boolean booked = (currU == null ? false : order.booked(currU.getId()));
        if (booked) {
            // bookBtn.setImageDrawable(R.d);
            // TODO: 需要已经订阅的提示
        }

        bookBtn.setOnClickListener(new View.OnClickListener() {

            private boolean doing = false;

            @Override
            public void onClick(View v) {

                if (doing) {
                    Log.d(GlobalCtx.ORDERS_TAG, "canceling a duplicated clicked.");
                    return;
                }

                if (order.isInactive()) {
                    Toast.makeText(activity, R.string.not_active_any_more, Toast.LENGTH_LONG).show();
                    return;
                }

                if (order.outofOrder() && !order.booked(currU.getId())) {
                    Toast.makeText(activity, R.string.out_of_order, Toast.LENGTH_LONG).show();
                    bookBtn.setImageDrawable(activity.getResources().getDrawable(R.drawable.book_outoforder));
                    return;
                }

                if (currU == null) {
                    Toast.makeText(activity, R.string.login_required, Toast.LENGTH_LONG).show();
                    return;
                }

                boolean isUndo = false;
                if (order.booked(currU.getId())) {
                    order.undoBook(currU);
                    Toast.makeText(activity, R.string.book_undo_op, Toast.LENGTH_LONG).show();
                    isUndo = true;
                } else {
                    order.addBooked(currU);
                    Toast.makeText(activity, R.string.book_book_op, Toast.LENGTH_LONG).show();
                }


                final boolean nowBooked = order.booked(currU.getId());
//                bookBtn.setHint(nowBooked ? R.string.bookBtn_cancel : R.string.bookBtn_book);
                if (order.outofOrder())
                    bookBtn.setImageDrawable(activity.getResources().getDrawable(R.drawable.book_outoforder));

                reLayoutBooked(order, bookedUNameTxt, orderLayout, postLeftNumTxt, bookBtn);

                new AsyncTask<Void, Void, Boolean>() {
                    @Override
                    protected void onPreExecute() {
                        doing = true;
                    }

                    @Override
                    protected Boolean doInBackground(Void... params) {
                        PostService postService = GlobalCtx.getInstance().getOrderService();
                        return nowBooked ?
                                postService.book(order)
                                : postService.undoBook(order);
                    }

                    @Override
                    protected void onPostExecute(Boolean result) {
                        Log.i(GlobalCtx.ORDERS_TAG, "onPostExecute of book:" + result);
                        doing = false;
                        if (result) {
//                            order.removeComment(currU.getId());
                            OrderAdapter.this.notifyDataSetChanged();
                        }
                    }

                    @Override
                    protected void onCancelled(Boolean aBoolean) {
                        doing = false;
                    }
                }.execute();
            }
        });

        final ImageButton commentBtn = (ImageButton) vi.findViewById(R.id.btnComment);

        commentBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Log.d(GlobalCtx.ORDERS_TAG, "accepted commentBtn onclick event");

                //if (!order.booked(GlobalCtx.getInstance().getCurrUid())) {
//                    AlertUtil.showAlert(activity, R.string.comment_block_title, R.string.comment_block_error);
                // Toast.makeText(activity, R.string.comment_block_error, Toast.LENGTH_LONG).show();
                //return;
                //}

                commentComp.showForPost(order, OrderAdapter.this);
            }
        });
        */

        return vi;
    }

//    private long spentInMilliSeconds(Order order) {
//        if (DateTimeUtils.sameDay(order.getOrderTime().getTime(), order.getExpectTime().getTime())) {
//            return order.getTime_arrived().getTime() - order.getOrderTime().getTime();
//        } else {
//            Calendar cal = Calendar.getInstance();
//        }
//    }

//    private void reLayoutBooked(Post post, TextView bookedUNameTxt, LinearLayout orderLayout, TextView postLeftNumTxt, ImageButton bookBtn) {
//
//        Log.d(GlobalCtx.ORDERS_TAG, "relayoutBooked" + post);
//
//        postLeftNumTxt.setText(String.valueOf(post.getLeft()));
//        if (post.outofOrder()) {
//            bookBtn.setImageDrawable(activity.getResources().getDrawable(R.drawable.book_outoforder));
//        } else {
//            bookBtn.setImageDrawable(activity.getResources().getDrawable(R.drawable.book_go));
//        }
//
//        if (bookedUNameTxt == null) {
//            Log.e(GlobalCtx.ORDERS_TAG, "booked name text view is null");
//            return;
//        }
//
//        if (post.getBookedUids().length > 0) {
//            bookedUNameTxt.setText(post.getBookedUNames());
//            orderLayout.setVisibility(View.VISIBLE);
//        } else {
//            bookedUNameTxt.setText("");
//            orderLayout.setVisibility(View.GONE);
//        }
//    }
//
//    private TextView appendComment(RelativeLayout commentContainers, Comment cm, View pre) {
//        TextView textLabel = (TextView) new TextView(activity);
//        TextView textView = new TextView(activity);
//        textLabel.setId(pre != null ? pre.getId() + 2 : 1);
//        textView.setId(textLabel.getId() + 1);
//
//        LayoutParams p1 = new LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
//        p1.addRule(RelativeLayout.BELOW, pre != null ? pre.getId() : R.id.book_pic);
//        p1.addRule(RelativeLayout.ALIGN_BOTTOM, textView.getId());
//        p1.addRule(RelativeLayout.ALIGN_TOP, textView.getId());
//
//        textLabel.setLayoutParams(p1);
//        textLabel.setTextColor(activity.getResources().getColor(R.color.post_anota_num_color));
//        textLabel.setPadding(5, 2, 5, 2);
//        textLabel.setGravity(Gravity.CENTER_VERTICAL);
//
//        LayoutParams p2 = new LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
//        p2.addRule(RelativeLayout.BELOW, pre != null ? pre.getId() : R.id.book_pic);
//        p2.addRule(RelativeLayout.RIGHT_OF, textLabel.getId());
//        textView.setLayoutParams(p2);
//        textView.setPadding(0, 2, 0, 2);
//
//        textLabel.setText(GlobalCtx.getInstance().getUNameById(String.valueOf(cm.getUid())) + ": ");
//        textView.setText(cm.getComment());
//        commentContainers.addView(textLabel);
//        commentContainers.addView(textView);
//        return textLabel;
//    }
}
