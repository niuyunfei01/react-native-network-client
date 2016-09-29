package cn.customer_serv.core;

import android.content.Context;
import android.text.TextUtils;

import org.json.JSONObject;

import java.util.List;
import java.util.Map;

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

    public static MQManager getInstance(Context context) {
        return M;
    }

    public static void setDebugMode(boolean debugMode) {
        MQManager.debugMode = debugMode;
    }

    public static boolean isDebugMode() {
        return debugMode;
    }

    public void sendMQTextMessage(String content, OnMessageSendCallback onMQMessageSendCallback) {

    }

    public void sendMQPhotoMessage(String localPath, OnMessageSendCallback onMQMessageSendCallback) {

    }

    public void sendMQVoiceMessage(String localPath, OnMessageSendCallback onMQMessageSendCallback) {

    }

    public void deleteMessage(long preId) {

    }

    public static void init(Context context, String appKey, OnInitCallback onInitCallBack) {

    }

    public MQAgent getCurrentAgent() {
        return currentAgent;
    }

    public void setCurrentAgent(MQAgent currentAgent) {
        this.currentAgent = currentAgent;
    }

    public void getMQMessageFromService(long lastMessageCreateOn, int length, OnGetMessageListCallback onGetMessageListCallback) {

    }

    public void getMQMessageFromDatabase(long lastMessageCreateOn, int length, OnGetMessageListCallback onGetMessageListCallback) {

    }

    public void setClientOnlineWithClientId(String clientId, OnClientOnlineCallback onlineCallback) {

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
