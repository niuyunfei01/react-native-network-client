package cn.cainiaoshicai.crm.support.asyncdrawable;

import android.graphics.drawable.ColorDrawable;

import java.lang.ref.WeakReference;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.support.utils.ThemeUtility;

/**
 * User: qii
 * Date: 12-9-5
 */
public class PictureBitmapDrawable extends ColorDrawable {
    private final WeakReference<IPictureWorker> bitmapDownloaderTaskReference;

    public PictureBitmapDrawable(IPictureWorker bitmapDownloaderTask) {
        super(ThemeUtility.getColor(R.attr.listview_pic_bg));
        bitmapDownloaderTaskReference =
                new WeakReference<IPictureWorker>(bitmapDownloaderTask);
    }

    public IPictureWorker getBitmapDownloaderTask() {
        return bitmapDownloaderTaskReference.get();
    }
}
