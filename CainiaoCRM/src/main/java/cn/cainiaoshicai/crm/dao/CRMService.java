package cn.cainiaoshicai.crm.dao;

import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.domain.Config;
import cn.cainiaoshicai.crm.domain.FileBean;
import cn.cainiaoshicai.crm.domain.LoginResult;
import cn.cainiaoshicai.crm.domain.ProductProvideList;
import cn.cainiaoshicai.crm.domain.ProductTpl;
import cn.cainiaoshicai.crm.domain.ShipAcceptStatus;
import cn.cainiaoshicai.crm.orders.domain.OrderContainer;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.orders.domain.UserBean;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import retrofit2.http.Path;
import retrofit2.http.Query;

/**
 * Created by liuzhr on 4/24/17.
 */

public interface CRMService {

    @GET("/api/uploadfile/check_samefile")
    Call<ResultBean<FileBean>> checkSame(@Query("md5") String md5, @Query("totalBytes") long totalBytes,
                                         @Query("access_token") String token);

    @GET("/api/config_item?key=fn_complains")
    Call<ResultBean<Map<Integer, String>>> config_fn_complains();

    @GET("/api/monitor/record_status?count_unread=1&count_new=1")
    Call<ResultBean<StatusBean>> checkRecordStatus(@Query("access_token") String token);

    @POST("/api/oauth/token")
    Call<ResultBean<LoginResult>> login(@Query("username") String userName, @Query("password") String password);


    @Multipart
    @POST("/api/uploadfile/receive")
    Call<ResultBean<UploadRes>> uploadFile(@Part MultipartBody.Part file, @Part("name") RequestBody name,
                                          @Part("size") RequestBody size, @Query("access_token") String token);

    @POST("/api/provide_list_print/{req_id}")
    Call<ResultBean<ProductProvideList>> getProvideList(@Path("req_id") int req_id);

    @POST("/api/orders")
    Call<OrderContainer> orders(@Query("status") int listType);

    @POST("/api/store_chg_price/{store_id}/{product_id}/{newCents}/{oldCents}")
    Call<ResultBean> store_chg_price(@Path("store_id") int store_id, @Path("product_id") int product_id,
                               @Path("newCents") int newCents, @Path("oldCents") int nowPrice);

    @FormUrlEncoded
    @POST("/api/apply_store_price")
    Call<ResultBean> store_apply_price(@Field("vendor_id") int vendorId, @Field("store_id") int storeId,
                                       @Field("product_id") int productId, @Field("before_price") int beforePrice,
                                       @Field("apply_price") int applyPrice, @Field("remark") String remark, @Field("auto_on_sale") int autoOnSale);

    @POST("/api/shipping_start_accept/{storeId}")
    Call<ResultBean<ShipAcceptStatus>> shippingStartAccept(@Path("storeId") long storeId);
    @POST("/api/shipping_stop_accept/{storeId}")
    Call<ResultBean<ShipAcceptStatus>> shippingStopAccept(@Path("storeId") long storeId);
    @POST("/api/shipping_accept_status/{storeId}")
    Call<ResultBean<ShipAcceptStatus>> shippingAcceptStatus(@Path("storeId") long storeId);

    @POST("/api/common_config2")
    Call<ResultBean<Config>> commonConfig(@Query("client_status") String clientStatus);

    @GET("/api/user_info2")
    Call<ResultBean<UserBean>> userInfo(@Query("access_token") String token);

    @GET("/api/print_in_cloud/{orderId}")
    Call<ResultBean<Integer>> printInCloud(@Path("orderId") int orderId);

    @GET("/api/query_product_by_code/{code}")
    Call<ResultBean<List<ProductTpl>>> searchByBarCode(@Path("code") String code);

    @POST("/api/log_push_status")
    Call<ResultBean<String>> logPushStatus(@Body Map<String, Object> status);



    class UploadRes {
        private FileBean file;
        public FileBean getFile() {
            return file;
        }
        public void setFile(FileBean file) {
            this.file = file;
        }
    }

    class StatusBean {
        private int count_unread;
        private int count_new;

        public int getCount_unread() {
            return count_unread;
        }

        public void setCount_unread(int count_unread) {
            this.count_unread = count_unread;
        }

        public int getCount_new() {
            return count_new;
        }

        public void setCount_new(int count_new) {
            this.count_new = count_new;
        }
    }
}
