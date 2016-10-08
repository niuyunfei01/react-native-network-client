package cn.cainiaoshicai.crm.dao;

import java.util.ArrayList;
import java.util.List;

import cn.cainiaoshicai.crm.service.ServiceException;
import cn.customer_serv.core.bean.MQMessage;

/**
 * Created by liuzhr on 9/30/16.
 */
public interface IUserTalkDao {
    UserTalk userTalkStatus(String openid, int uid, long latestTime, int limit) throws ServiceException;

    void talk_reply_text(String id, String currentClientId, String content);

    class UserTalk {

        private List<TalkMsg> talkMsgs;
        private String sessionId;

        public List<MQMessage> getMessages() {
            List<MQMessage> messages = new ArrayList<>();
            if (talkMsgs != null) {
                for (TalkMsg msg :
                        talkMsgs) {
                    MQMessage mqMessage = new MQMessage(msg.getType());
                    mqMessage.set_read(true);
                    mqMessage.setAgent_nickname("客服XXX");
                    mqMessage.setContent(msg.getContent());
                    mqMessage.setConversation_id(0L);
                    mqMessage.setCreated_on(msg.getTime());
                    messages.add(mqMessage);
                }
            }
            return messages;
        }

        public String getSessionId() {
            return sessionId;
        }

        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }

        public List<TalkMsg> getTalkMsgs() {
            return talkMsgs;
        }

        public void setTalkMsgs(List<TalkMsg> talkMsgs) {
            this.talkMsgs = talkMsgs;
        }
    }

    class TalkMsg {
        String content;
        String type;
        int oprcode;
        int time;
        String kf_account;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public int getOprcode() {
            return oprcode;
        }

        public void setOprcode(int oprcode) {
            this.oprcode = oprcode;
        }

        public int getTime() {
            return time;
        }

        public void setTime(int time) {
            this.time = time;
        }

        public String getKf_account() {
            return kf_account;
        }

        public void setKf_account(String kf_account) {
            this.kf_account = kf_account;
        }
    }
}
