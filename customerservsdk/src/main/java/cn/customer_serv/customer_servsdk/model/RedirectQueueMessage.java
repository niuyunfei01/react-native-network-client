package cn.customer_serv.customer_servsdk.model;

public class RedirectQueueMessage extends BaseMessage {
    private int queueSize;

    public RedirectQueueMessage(int queueSize) {
        setItemViewType(TYPE_QUEUE_TIP);
        this.queueSize = queueSize;
    }

    public int getQueueSize() {
        return queueSize;
    }
}