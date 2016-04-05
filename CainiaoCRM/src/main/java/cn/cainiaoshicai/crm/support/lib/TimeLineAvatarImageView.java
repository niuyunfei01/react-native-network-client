package cn.cainiaoshicai.crm.support.lib;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.drawable.Drawable;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.widget.ImageView;
import android.widget.ProgressBar;

import cn.cainiaoshicai.crm.R;
import cn.cainiaoshicai.crm.orders.domain.UserBean;
import cn.cainiaoshicai.crm.support.asyncdrawable.IWeiciyuanDrawable;
import cn.cainiaoshicai.crm.support.utils.Utility;

/**
 * User: qii
 * Date: 12-12-19
 */
public class TimeLineAvatarImageView extends PerformanceImageView implements IWeiciyuanDrawable {

    private Paint paint = new Paint();

    private boolean showPressedState = true;
    private boolean pressed = false;

    public TimeLineAvatarImageView(Context context) {
        this(context, null);
    }

    public TimeLineAvatarImageView(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public TimeLineAvatarImageView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        initLayout(context);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        Bitmap bitmap;
                bitmap = BitmapFactory.decodeResource(getResources(), R.drawable.avatar_vip);
                canvas.drawBitmap(bitmap, getWidth() - bitmap.getWidth(),
                        getHeight() - bitmap.getHeight(), paint);

        if (pressed) {
            canvas.drawColor(getResources().getColor(R.color.transparent_cover));
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {

        if (!showPressedState || !isClickable() || !isLongClickable()) {
            return super.onTouchEvent(event);
        }

        switch (event.getActionMasked()) {
            case MotionEvent.ACTION_DOWN:
                pressed = true;
                invalidate();
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
                pressed = false;
                invalidate();
                break;
        }
        return super.onTouchEvent(event);
    }

    protected void initLayout(Context context) {
        setPadding(Utility.dip2px(5), Utility.dip2px(5), Utility.dip2px(5), Utility.dip2px(5));
    }

    @Override
    public void setImageDrawable(Drawable drawable) {
        super.setImageDrawable(drawable);
    }

    @Override
    public void setImageBitmap(Bitmap bm) {
        super.setImageBitmap(bm);
    }

    @Override
    public ImageView getImageView() {
        return this;
    }

    @Override
    public void setProgress(int value, int max) {

    }

    @Override
    public ProgressBar getProgressBar() {
        return null;
    }

    @Override
    public void setGifFlag(boolean value) {

    }

    public void checkVerified(UserBean user) {
    }

    @Override
    public void setPressesStateVisibility(boolean value) {
        if (showPressedState == value) {
            return;
        }
        showPressedState = value;
        invalidate();
    }
}
