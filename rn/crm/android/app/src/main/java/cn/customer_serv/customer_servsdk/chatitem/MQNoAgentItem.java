package cn.customer_serv.customer_servsdk.chatitem;

import android.content.Context;
import android.view.View;

import cn.cainiaoshicai.crm.R;
import cn.customer_serv.customer_servsdk.callback.LeaveMessageCallback;
import cn.customer_serv.customer_servsdk.widget.MQBaseCustomCompositeView;

/**
 * 作者:王浩 邮件:bingoogolapple@gmail.com
 * 创建时间:16/4/22 上午10:23
 * 描述:当前没有客服在线，提示留言的提示消息item
 */
public class MQNoAgentItem extends MQBaseCustomCompositeView {

    private LeaveMessageCallback mCallback;

    public MQNoAgentItem(Context context) {
        super(context);
    }

    @Override
    protected int getLayoutId() {
        return R.layout.mq_item_no_agent;
    }

    @Override
    protected void initView() {
    }

    @Override
    protected void setListener() {
        getViewById(R.id.tv_no_agent_leave_msg).setOnClickListener(this);
    }

    @Override
    protected void processLogic() {
    }

    @Override
    public void onClick(View view) {
        if (mCallback != null) {
            mCallback.onClickLeaveMessage();
        }
    }

    public void setCallback(LeaveMessageCallback leaveMessageCallback) {
        mCallback = leaveMessageCallback;
    }
}
