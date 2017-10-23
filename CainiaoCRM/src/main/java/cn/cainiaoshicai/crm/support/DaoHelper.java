package cn.cainiaoshicai.crm.support;

import android.text.TextUtils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

import cn.cainiaoshicai.crm.GlobalCtx;
import cn.cainiaoshicai.crm.dao.CRMService;
import cn.cainiaoshicai.crm.dao.URLHelper;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;
import cn.cainiaoshicai.crm.support.helper.SettingUtility;
import okhttp3.HttpUrl;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * Created by liuzhr on 4/19/17.
 */

public class DaoHelper {


    public static CRMService factory(final String agent, boolean isDebug) {

        HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
        if (isDebug) {
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);
        }

        OkHttpClient.Builder httpClient = new OkHttpClient.Builder();
        httpClient.addInterceptor(logging);
        httpClient.addInterceptor(new Interceptor() {
            @Override
            public Response intercept(Chain chain) throws IOException {
                Request originalRequest = chain.request();
                Request requestWithUserAgent = originalRequest.newBuilder()
                        .removeHeader("User-Agent")
                        .addHeader("User-Agent", agent)
                        .build();

                return chain.proceed(requestWithUserAgent);
            }
        }).addInterceptor(new Interceptor() {
            @Override
            public Response intercept(Chain chain) throws IOException {
                Request request = chain.request();
                String token = GlobalCtx.app().token();
                final long storeId = SettingUtility.getListenerStore();
                HttpUrl originUrl = request.url();
                HttpUrl.Builder b = originUrl.newBuilder();
                if(TextUtils.isEmpty(originUrl.queryParameter("access_token"))){
                    b = b.addQueryParameter("access_token", token);
                }

                HttpUrl url = b
                        .addQueryParameter("_sid", String.valueOf(storeId))
                        .build();
                request = request.newBuilder().url(url).build();
                return chain.proceed(request);
            }
        });

        GsonConverterFactory factory = GsonConverterFactory.create(gson());

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(URLHelper.PROTO + URLHelper.getHost())
                .client(httpClient.build())
                .addConverterFactory(factory)
                .build();

        return retrofit.create(CRMService.class);
    }

    public static <T> ResultBean<T> fromJson(String json) {
        Type type = new TypeToken<ResultBean<T>>() {
        }.getType();
        return gson().fromJson(json, type);
    }

    public static Gson gson() {
        GsonBuilder g = new GsonBuilder();
//        g.registerTypeAdapter(new TypeToken<ResultBean>(){}.getType(), new ResultBeanSerializer());
        return g.setDateFormat("yyyy-MM-dd HH:mm:ss").create();
    }

    public static class ResultBeanSerializer<T> implements JsonDeserializer<ResultBean<T>> {

        @Override
        public ResultBean<T> deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context)
                throws JsonParseException {
            JsonArray arr = json.getAsJsonArray();
            boolean status = arr.get(0).getAsJsonPrimitive().getAsBoolean();
            String info = arr.get(1).getAsJsonPrimitive().getAsString();
            JsonElement dataJson = arr.get(2);

            Type typeArgument = null;
            if (typeOfT instanceof ParameterizedType) {
                Type[] actualTypeArguments = ((ParameterizedType) typeOfT).getActualTypeArguments();
                if (actualTypeArguments.length > 0) {
                    typeArgument = actualTypeArguments[0];
                }
            }

            if (typeArgument == null) {
                typeArgument = new TypeToken<Object>(){}.getType();
            }

            final T data;
            if (status) {
                data = new Gson().fromJson(dataJson, typeArgument);
            } else {
                data = null;
            }

            ResultBean<T> rb = new ResultBean<>(status, info);
            rb.setObj(data);
            return rb;
        }
    }
}
