package cn.cainiaoshicai.crm.support.http;

import java.util.Map;

import cn.cainiaoshicai.crm.orders.service.ServiceException;
import cn.cainiaoshicai.crm.support.file.FileDownloaderHttpHelper;
import cn.cainiaoshicai.crm.support.file.FileUploaderHttpHelper;

public class HttpUtility {

    private static HttpUtility httpUtility = new HttpUtility();

    private HttpUtility() {
    }

    public static HttpUtility getInstance() {
        return httpUtility;
    }

    public String executeNormalTask(HttpMethod httpMethod, String url, Map<String, String> param)
            throws ServiceException {
        return new JavaHttpUtility().executeNormalTask(httpMethod, url, param);
    }

    public boolean executeDownloadTask(String url, String path,
            FileDownloaderHttpHelper.DownloadListener downloadListener) {
        return !Thread.currentThread().isInterrupted() && new JavaHttpUtility()
                .doGetSaveFile(url, path, downloadListener);
    }

    public boolean executeUploadTask(String url, Map<String, String> param, String path,
            String imageParamName, FileUploaderHttpHelper.ProgressListener listener)
            throws ServiceException {
        return !Thread.currentThread().isInterrupted() && new JavaHttpUtility()
                .doUploadFile(url, param, path, imageParamName, listener);
    }
}

