package cn.cainiaoshicai.crm.orders.domain.android;

import cn.cainiaoshicai.crm.orders.domain.MessageListBean;

/**
 * User: qii
 * Date: 13-4-8
 */
public class MentionTimeLineData {

    public MessageListBean msgList;
    public TimeLinePosition position;

    public MentionTimeLineData(MessageListBean msgList, TimeLinePosition position) {
        this.msgList = msgList;
        this.position = position;
    }
}
