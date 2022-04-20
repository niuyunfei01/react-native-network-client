package cn.cainiaoshicai.crm.ui.adapter;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import androidx.core.content.ContextCompat;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.google.gson.Gson;
import com.squareup.picasso.Picasso;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.Cts;
import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.domain.StorageItem;
import cn.cainiaoshicai.crm.domain.StorageStatusResults;
import cn.cainiaoshicai.crm.domain.Store;
import cn.cainiaoshicai.crm.domain.Vendor;
import cn.cainiaoshicai.crm.support.debug.AppLogger;
import cn.cainiaoshicai.crm.support.react.MyReactActivity;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageChanged;
import cn.cainiaoshicai.crm.ui.activity.StoreStorageHelper;

import static cn.cainiaoshicai.crm.Cts.PRICE_CONTROLLER_YES;

public class StorageItemAdapter<T extends StorageItem> extends ArrayAdapter<T> {
    public static final String PREFIX_NOT_FILTER = "@@";
    private List<StorageItem> backendData = new ArrayList<>();
    private Activity context;
    private Store store;

    public StorageItemAdapter(Activity context, ArrayList<T> objects) {
        super(context, R.layout.storage_status_row, objects);
        this.backendData.addAll(objects);
        this.context = context;
    }

    public Store getStore() {
        return store;
    }

    public void setStore(Store store) {
        this.store = store;
    }

    public View getView(int pos, View convertView, ViewGroup parent) {

        ViewHolder holder;
        final LayoutInflater inflater = context.getLayoutInflater();
        if (convertView != null) {
            holder = (ViewHolder) convertView.getTag();
        } else {
            holder = new ViewHolder();
            View row = inflater.inflate(R.layout.storage_status_row, null);

            holder.label = row.findViewById(R.id.product_name);
            holder.leftNumber = row.findViewById(R.id.total_last_stat);
            holder.expect_check_time = row.findViewById(R.id.expect_check_time);
            holder.sold_5day = row.findViewById(R.id.sold_5day);
            holder.sold_weekend = row.findViewById(R.id.sold_weekend);
            holder.sold_latest = row.findViewById(R.id.sold_latest);

            holder.shelfNo = row.findViewById(R.id.shelf_no);
            holder.prodStatus = row.findViewById(R.id.store_prod_status);
            holder.req_total = row.findViewById(R.id.provide_total_req);
            holder.riskNum = row.findViewById(R.id.lowest_risk_num);
            holder.reOnSale = row.findViewById(R.id.re_on_sale_desc);
            holder.salePrice = row.findViewById(R.id.sale_price);
            holder.goodIcon = row.findViewById(R.id.good_icon);

            holder.applyingPrice = row.findViewById(R.id.applying_price);
            holder.supplyPrice = row.findViewById(R.id.supply_price);

            holder.wmBaidu = row.findViewById(R.id.wm_bd);
            holder.wmElema = row.findViewById(R.id.wm_elema);
            holder.wmJingdong = row.findViewById(R.id.wm_jd);
            holder.wmMeituan = row.findViewById(R.id.wm_mt);
            holder.wmMeituanSg = row.findViewById(R.id.wm_mt_sg);
            holder.wmInfoBar = row.findViewById(R.id.wm_info_bar);

            holder.sold_5day_fen = row.findViewById(R.id.sold_5day_fen);
            holder.sold_weekend_fen = row.findViewById(R.id.sold_weekend_fen);
            holder.sold_latest_fen = row.findViewById(R.id.sold_latest_fen);

            convertView = row;
            convertView.setTag(holder);
        }


        final StorageItem item = this.getItem(pos);
        if (item != null) {
            holder.label.setText(item.getName());
        }

        holder.prodStatus.setText(item.getStatusText(GlobalCtx.app().fnEnabledReqProvide()));
        if (item.getStatus() == StorageItem.STORE_PROD_SOLD_OUT) {
            holder.prodStatus.setBackground(ContextCompat.getDrawable(this.context, R.drawable.list_text_border_red_mini));
        } else {
            holder.prodStatus.setBackground(null);
        }

        if (!TextUtils.isEmpty(item.getShelfNo())) {
            holder.shelfNo.setText(item.getShelfNo());
            holder.shelfNo.setVisibility(View.VISIBLE);
        } else {
            holder.shelfNo.setVisibility(View.GONE);
        }

        if (store != null && store.getFn_price_controlled() == PRICE_CONTROLLER_YES) {
            holder.supplyPrice.setVisibility(View.VISIBLE);
            Vendor v = GlobalCtx.app().getVendor();
            if (v != null && v.isFnProviding() && item.getRefer_prod_id() == 0) {
                holder.leftNumber.setVisibility(View.VISIBLE);
                holder.leftNumber.setText(item.leftNumberStr());
            } else {
                holder.leftNumber.setVisibility(View.INVISIBLE);
            }
            holder.salePrice.setVisibility(View.INVISIBLE);
            holder.supplyPrice.setText(item.getSupplyPricePrecision());
            if (item.getApplyingPrice() > 0 && !GlobalCtx.app().isDirectVendor()) {
                holder.applyingPrice.setVisibility(View.VISIBLE);
                holder.applyingPrice.setText(item.getApplyingPricePrecision());
            } else {
                holder.applyingPrice.setVisibility(View.INVISIBLE);
            }
        } else {
            holder.supplyPrice.setVisibility(View.INVISIBLE);
            holder.applyingPrice.setVisibility(View.INVISIBLE);
            holder.salePrice.setVisibility(View.VISIBLE);
            if (item.getRefer_prod_id() > 0) {
                holder.leftNumber.setVisibility(View.INVISIBLE);
            } else {
                holder.leftNumber.setVisibility(View.VISIBLE);
                holder.leftNumber.setText(item.leftNumberStr());
            }
            holder.salePrice.setText(item.getPricePrecision());
            holder.salePrice.setOnClickListener(v -> {
                StoreStorageChanged ssc = (StoreStorageChanged) getContext();
                AlertDialog dlg = StoreStorageHelper.createEditPrice((Activity) getContext(), item, inflater, ssc.notifyDataSetChanged());
                dlg.show();
            });
        }

        holder.leftNumber.setOnClickListener(v -> {
            StoreStorageChanged ssc = (StoreStorageChanged) getContext();
//            AlertDialog dlg = StoreStorageHelper.createEditLeftNum((Activity) getContext(), item, inflater, ssc.notifyDataSetChanged());
//            dlg.show();
            int productId = item.getProduct_id();
            int storeId = item.getStore_id();
            String productName = item.getName();
            String shelfNo = item.getShelfNo();

            GlobalCtx.app().toStockCheck(context, productId, storeId,productName,shelfNo);
        });

        holder.supplyPrice.setOnClickListener(view -> {
            boolean auditPriceByCompetitor = store != null && store.isAuditPriceByCompetitor();
            if (auditPriceByCompetitor) {
                Gson gson = new Gson();
                String json = gson.toJson(item);
                GlobalCtx.app().toSupplyPriceApplyView(context, 2, item.getStore_id(), item.getProduct_id(), item.getSupplyPricePrecision(), json);
            } else {
                StoreStorageChanged ssc = (StoreStorageChanged) getContext();
                AlertDialog dlg = StoreStorageHelper.createApplyChangeSupplyPrice((Activity) getContext(), item, inflater, ssc.notifyDataSetChanged());
                dlg.show();
            }
        });

        if (item.getSelf_provided() == 0 && item.getTotalInReq() > 0) {
            holder.req_total.setText("订货:" + item.getTotalInReq());
            holder.req_total.setVisibility(View.VISIBLE);
        } else {
            holder.req_total.setVisibility(View.GONE);
        }
        if (item.getStatus() == StorageItem.STORE_PROD_SOLD_OUT) {
            holder.reOnSale.setVisibility(View.VISIBLE);
            int bg;
            if (item.getWhen_sale_again() > 0) {
                bg = R.drawable.list_text_border_green_mini;
            } else {
                bg = R.drawable.list_text_border_red_mini;
            }
            holder.reOnSale.setBackground(ContextCompat.getDrawable(this.getContext(), bg));
            holder.reOnSale.setText("再上架：" + StorageItem.getDesc(item.getWhen_sale_again()));
        } else {
            holder.reOnSale.setVisibility(View.GONE);
        }

        holder.riskNum.setText("最低库存: " + item.getRisk_min_stat());

        holder.wmBaidu.setVisibility(View.INVISIBLE);
        holder.wmJingdong.setVisibility(View.INVISIBLE);
        holder.wmMeituan.setVisibility(View.INVISIBLE);
        holder.wmElema.setVisibility(View.INVISIBLE);
        holder.wmMeituanSg.setVisibility(View.INVISIBLE);

        boolean allInvisible = true;
        for (Map.Entry<Integer, StorageStatusResults.WMPrice> en : item.getWm().entrySet()) {
            Button btn = null;
            if (en.getKey() == Cts.PLAT_BD.id) {
                btn = holder.wmBaidu;
            } else if (en.getKey() == Cts.PLAT_ELEME.id) {
                btn = holder.wmElema;
            } else if (en.getKey() == Cts.PLAT_JDDJ.id) {
                btn = holder.wmJingdong;
            } else if (en.getKey() == Cts.PLAT_MT.id) {
                btn = holder.wmMeituan;
            } else if (en.getKey() == Cts.PLAT_MTSG.id) {
                btn = holder.wmMeituanSg;
            } else if (en.getKey() == Cts.PLAT_SS.id) {
                btn = holder.wmBaidu;
            }

            if (btn != null) {
                String price = String.format("%.2f", (double) (en.getValue().getPrice() / 100.0));
                btn.setText(price);
                btn.setTextSize(10);
                final int color;
                color = en.getValue().getStatus() == StorageItem.STORE_PROD_OFF_SALE ? R.color.white : R.color.black;
                btn.setTextColor(ContextCompat.getColor(getContext(), color));
                btn.setVisibility(View.VISIBLE);
                allInvisible = false;
            }
        }
        holder.wmInfoBar.setVisibility(allInvisible ? View.GONE : View.VISIBLE);
        holder.sold_5day.setText(String.format("平日:%.1f", item.getSold_5day() / 5.0));
        holder.sold_weekend.setText(String.format("周末:%.1f", item.getSold_weekend() / 2.0));
        holder.sold_latest.setText("最近:" + item.getSold_latest());
        if (GlobalCtx.app().getVendor() != null && !GlobalCtx.app().getVendor().isFnProviding()) {
            holder.sold_5day.setVisibility(View.GONE);
            holder.sold_weekend.setVisibility(View.GONE);
            holder.sold_latest.setVisibility(View.GONE);

            holder.sold_weekend_fen.setVisibility(View.GONE);
            holder.sold_5day_fen.setVisibility(View.GONE);
            holder.sold_latest_fen.setVisibility(View.GONE);
        }

        if (!TextUtils.isEmpty(item.getExpect_check_time())) {
            holder.sold_5day.setVisibility(View.GONE);
            holder.sold_5day_fen.setVisibility(View.GONE);
            holder.sold_latest.setVisibility(View.GONE);
            holder.sold_latest_fen.setVisibility(View.GONE);
            holder.sold_weekend.setVisibility(View.GONE);
            holder.sold_weekend_fen.setVisibility(View.GONE);

            holder.expect_check_time.setText(item.getExpect_check_time()+"前盘点");
            holder.expect_check_time.setVisibility(View.VISIBLE);
        } else {
            holder.sold_5day.setVisibility(View.VISIBLE);
            holder.sold_5day_fen.setVisibility(View.VISIBLE);
            holder.sold_latest.setVisibility(View.VISIBLE);
            holder.sold_latest_fen.setVisibility(View.VISIBLE);
            holder.sold_weekend.setVisibility(View.VISIBLE);
            holder.sold_weekend_fen.setVisibility(View.VISIBLE);

            holder.expect_check_time.setVisibility(View.GONE);
        }

        holder.goodIcon.setOnClickListener(v -> {
            Context ctx = v.getContext();
            if (ctx == null) {
                return;
            }

            Intent openGoodsDetail = new Intent(ctx, MyReactActivity.class);
            openGoodsDetail.putExtra("product_id", item.getProduct_id());
            try {
                ctx.startActivity(openGoodsDetail);
            } catch (Exception e) {
                e.printStackTrace();
            }
        });

        // Trigger the download of the URL asynchronously into the image view.
        String thumbPicUrl = item.getThumbPicUrl();
        if (!TextUtils.isEmpty(thumbPicUrl)) {
            Picasso.with(context)
                    .load(thumbPicUrl)
                    .placeholder(R.drawable.placeholder)
//                .error(R.drawable.error)
                    .resizeDimen(R.dimen.list_good_image_size, R.dimen.list_good_image_size)
                    .centerInside()
                    .tag(context)
                    .into(holder.goodIcon);
        }

        return (convertView);
    }

    public boolean updateItemStorage(int pid, float newStorage) {
        for (StorageItem item : this.backendData) {
            if (pid > 0 && item.getProduct_id() == pid) {
                item.setLeft_since_last_stat(newStorage);
                return true;
            }
        }
        return false;
    }

    public boolean updateItemApplyPrice(int pid, int applyPrice) {
        for (StorageItem item : this.backendData) {
            if (pid > 0 && item.getProduct_id() == pid) {
                item.setApplyingPrice(applyPrice);
                return true;
            }
        }

        return false;
    }

    public void filter(String text) {
        this.clear();

        for (int i = 0; i < this.getCount(); i++) {
            this.remove(this.getItem(i));
        }

        AppLogger.d("items count after clear:" + this.getCount());

        if (!TextUtils.isEmpty(text) && !text.startsWith(PREFIX_NOT_FILTER)) {
            int id = 0;
            if (text.indexOf("#") > 0) {
                try {
                    id = Integer.parseInt(text.substring(0, text.indexOf("#")));
                }catch (Exception ex) {
                    AppLogger.e("exception parse int1:" + text, ex);
                }
            } else {
                try {
                    id = Integer.parseInt(text);
                } catch (Exception e) {
                    AppLogger.e("exception parse int2:" + text, e);
                }
            }

            for (StorageItem item : this.backendData) {
                if (id > 0 && item.getProduct_id() == id) {
                    ((StorageItemAdapter<StorageItem>) this).add(item);
                    break;
                } else {
                    if (text.equals(item.getTag_code()) || item.pidAndNameStr().contains(text)) {
                        ((StorageItemAdapter<StorageItem>) this).add(item);
                    }
                }
            }
        }  else {
            ((StorageItemAdapter<StorageItem>) this).addAll(this.backendData);
        }

        AppLogger.d("filter done:" + this.backendData.size());
    }

    public void changeBackendData(ArrayList<StorageItem> storageItems) {
        this.backendData.clear();
        this.backendData.addAll(storageItems);
    }

    private class ViewHolder {
        TextView label;
        TextView leftNumber;
        TextView expect_check_time;
        TextView sold_5day;
        TextView sold_5day_fen;
        TextView sold_weekend;
        TextView sold_weekend_fen;
        TextView sold_latest;
        TextView sold_latest_fen;

        TextView prodStatus;
        TextView req_total;
        TextView riskNum;
        TextView shelfNo;

        TextView supplyPrice;
        TextView applyingPrice;

        TextView reOnSale;
        TextView salePrice;
        ImageView goodIcon;

        Button wmWeixin;
        Button wmBaidu;
        Button wmElema;
        Button wmMeituan;
        Button wmJingdong;
        Button wmMeituanSg;

        LinearLayout wmInfoBar;
    }
}