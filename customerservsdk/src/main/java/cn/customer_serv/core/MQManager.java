package cn.customer_serv.core;

import android.content.Context;

import java.util.List;
import java.util.Map;

import cn.cainiaoshicai.crm.dao.IUserTalkDao;
import cn.cainiaoshicai.crm.service.ServiceException;
import cn.cainiaoshicai.crm.support.MyAsyncTask;
import cn.customer_serv.core.bean.MQAgent;
import cn.customer_serv.core.bean.MQEnterpriseConfig;
import cn.customer_serv.core.bean.MQMessage;
import cn.customer_serv.core.callback.OnClientInfoCallback;
import cn.customer_serv.core.callback.OnClientOnlineCallback;
import cn.customer_serv.core.callback.OnClientPositionInQueueCallback;
import cn.customer_serv.core.callback.OnEndConversationCallback;
import cn.customer_serv.core.callback.OnEvaluateRobotAnswerCallback;
import cn.customer_serv.core.callback.OnGetMQClientIdCallBackOn;
import cn.customer_serv.core.callback.OnGetMessageListCallback;
import cn.customer_serv.core.callback.OnInitCallback;
import cn.customer_serv.core.callback.OnMessageSendCallback;
import cn.customer_serv.core.callback.OnProgressCallback;
import cn.customer_serv.core.callback.SimpleCallback;
import cn.customer_serv.customer_servsdk.util.ErrorCode;
import cn.customer_serv.customer_servsdk.util.MQAsyncTask;
import cn.customer_serv.customer_servsdk.util.MQUtils;
import cn.customer_serv.customer_servsdk.util.RichText;

/**
 * Created by liuzhr on 9/29/16.
 */
public class MQManager {

    private static MQManager M = new MQManager();

    private MQAgent currentAgent;
    private MQEnterpriseConfig enterpriseConfig;
    private boolean forceRedirectHuman;
    private boolean isWaitingInQueue;
    private String currentClientId;
    private static boolean debugMode;
    private Context context;
    private IUserTalkDao dao;

    public static void init(Context context, String appKey, OnInitCallback onInitCallBack, IUserTalkDao dao) {
        M.context = context;
        M.dao = dao;
        MQAgent mqAgent = new MQAgent();
        mqAgent.setId("qingcaijun@cainiaoshicai_com");
        mqAgent.setNickname("青菜君");
        mqAgent.setOnLine(true);
        mqAgent.setStatus("接待中");
        M.currentAgent = mqAgent;
    }

    public static MQManager getInstance(Context context) {
        return M;
    }

    public static void setDebugMode(boolean debugMode) {
        MQManager.debugMode = debugMode;
    }

    public static boolean isDebugMode() {
        return debugMode;
    }

    public void sendMQTextMessage(final String content, final OnMessageSendCallback onMQMessageSendCallback) {
        MQUtils.runInThread(new Runnable() {
            @Override
            public void run() {
                MQManager.this.dao.talk_reply_text(currentAgent.getId(), MQManager.this.currentClientId, content);
                MQMessage mqMsg = new MQMessage(MQMessage.TYPE_CONTENT_TEXT);
                MQUtils.runInUIThread(new Runnable() {
                    @Override
                    public void run() {
                        onMQMessageSendCallback.onSuccess(mqMsg, 0);
                    }
                });
            }
        });
    }

    public void sendMQPhotoMessage(String localPath, OnMessageSendCallback onMQMessageSendCallback) {

    }

    public void sendMQVoiceMessage(String localPath, OnMessageSendCallback onMQMessageSendCallback) {

    }

    public void deleteMessage(long preId) {

    }

    public MQAgent getCurrentAgent() {
        return currentAgent;
    }

    public void setCurrentAgent(MQAgent currentAgent) {
        this.currentAgent = currentAgent;
    }

    public void getMQMessageFromService(long lastMessageCreateOn, int length, OnGetMessageListCallback onGetMessageListCallback) {
        try {
            IUserTalkDao.UserTalk userTalk = dao.userTalkStatus(currentAgent.getId(), 0, lastMessageCreateOn, length);
            onGetMessageListCallback.onSuccess(userTalk.getMessages());
        } catch (ServiceException e) {
            if (onGetMessageListCallback != null) {
                onGetMessageListCallback.onFailure(e.getError_code(), e.getMessage());
            }
        }
    }

    public void getMQMessageFromDatabase(long lastMessageCreateOn, int length, OnGetMessageListCallback onGetMessageListCallback) {

    }

    public void setClientOnlineWithClientId(final String clientId, final OnClientOnlineCallback onlineCallback) {

        new MyAsyncTask<Void, Void, Void>(){

            @Override
            protected Void doInBackground(Void... params) {
                Runnable runnable;
                try {
                    final IUserTalkDao.UserTalk userTalk = MQManager.this.dao.userTalkStatus(clientId, 0, Integer.MAX_VALUE, 100);
                    runnable = new Runnable() {
                        @Override
                        public void run() {
                            if (userTalk != null) {
                                onlineCallback.onSuccess(MQManager.this.currentAgent, userTalk.getSessionId(), userTalk.getMessages());
                            } else {
                                onlineCallback.onFailure(-1, "获取会话信息失败！");
                            }
                        }
                    };

                } catch (final ServiceException e) {
                    e.printStackTrace();
                    runnable = new Runnable(){
                        @Override
                        public void run() {
                            onlineCallback.onFailure(e.getError_code(), "获取回话信息失败！");
                        }
                    };
                }

                MQUtils.runInUIThread(runnable);

                return null;
            }
        }.execute();
    }

    public void setClientOnlineWithCustomizedId(String customizedId, OnClientOnlineCallback onlineCallback) {

    }

    public void setCurrentClientOnline(OnClientOnlineCallback onlineCallback) {

    }

    public void setClientInfo(Map<String, String> clientInfo, OnClientInfoCallback onClientInfoCallback) {

    }

    public void sendClientInputtingWithContent(String content) {

    }

    public void executeEvaluate(String conversationId, int level, String content, SimpleCallback simpleCallback) {

    }

    public void updateMessage(long messageId, boolean isRead) {

    }

    public void saveConversationOnStopTime(long stopTime) {

    }

    public void downloadFile(MQMessage message, OnProgressCallback onProgressCallback) {

    }

    public void cancelDownload(String url) {

    }

    public void onConversationClose() {


    }

    public void onConversationOpen() {

    }

    public void closecustomer_servService() {

    }

    public void opencustomer_servService() {


    }

    public void submitMessageForm(String message, List<String> pictures, Map<String, String> customInfoMap, SimpleCallback simpleCallback) {

    }

    public void refreshEnterpriseConfig(SimpleCallback simpleCallback) {

    }

    public MQEnterpriseConfig getEnterpriseConfig() {
        if(this.enterpriseConfig == null) {
            this.enterpriseConfig = new MQEnterpriseConfig();
//            String var1 = this.enterpriseConfig.m();
//            if(!TextUtils.isEmpty(var1)) {
//                try {
//                    JSONObject var2 = new JSONObject(var1);
//                    com.meiqia.core.b.c.a(this.h, var2);
//                } catch (Exception var4) {
//                    ;
//                }
//            }
        }

        return this.enterpriseConfig;
    }

    public void setEnterpriseConfig(MQEnterpriseConfig enterpriseConfig) {
        this.enterpriseConfig = enterpriseConfig;
    }

    public void evaluateRobotAnswer(long messageId, long questionId, int useful, OnEvaluateRobotAnswerCallback onEvaluateRobotAnswerCallback) {

    }

    public void setForceRedirectHuman(boolean forceRedirectHuman) {
        this.forceRedirectHuman = forceRedirectHuman;
    }

    public boolean isForceRedirectHuman() {
        return forceRedirectHuman;
    }

    public void getClientPositionInQueue(OnClientPositionInQueueCallback onClientPositionInQueueCallback) {

    }

    public boolean getIsWaitingInQueue() {
        return isWaitingInQueue;
    }

    public boolean isWaitingInQueue() {
        return isWaitingInQueue;
    }

    public void setWaitingInQueue(boolean isWaitingInQueue) {
        this.isWaitingInQueue = isWaitingInQueue;
    }

    public String getCurrentClientId() {
        return currentClientId;
    }

    public void setCurrentClientId(String currentClientId) {
        this.currentClientId = currentClientId;
    }

    public void setScheduledAgentOrGroupWithId(String mAgentId, String mGroupId, MQScheduleRule mScheduleRule) {

    }

    public void getUnreadMessages(OnGetMessageListCallback onGetMessageListCallback) {

    }

    public void setClientOffline() {


    }

    public void endCurrentConversation(OnEndConversationCallback onEndConversationCallback) {

    }

    public void createMQClient(OnGetMQClientIdCallBackOn mq_content) {

    }
}
