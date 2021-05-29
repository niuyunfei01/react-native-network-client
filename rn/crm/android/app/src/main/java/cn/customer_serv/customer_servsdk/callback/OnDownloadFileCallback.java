package cn.customer_serv.customer_servsdk.callback;

import java.io.File;

/**
 * OnePiece
 * Created by xukq on 3/30/16.
 */
public interface OnDownloadFileCallback extends OnFailureCallBack {

    void onSuccess(File file);

    void onProgress(int progress);

}
