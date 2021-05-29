package cn.customer_serv.core.bean;

/**
 * Created by liuzhr on 9/29/16.
 */
public class MQMessage {
    public static final String TYPE_CONTENT_FILE = "file";
    public static final String TYPE_CONTENT_VOICE = "voice";
    public static final String TYPE_CONTENT_PHOTO = "photo";
    public static final String TYPE_CONTENT_TEXT = "text";
    public static final String TYPE_FROM_ROBOT = "from_robot";
    public static final String TYPE_FROM_CLIENT = "from_client";
    public static final String TYPE_CONTENT_RICH_TEXT = "richtext";
    private String status;
    private String content;
    private String content_type;
    private long id;
    private String type;
    private long conversation_id;
    private String agent_nickname;
    private long created_on;
    private String avatar;
    private boolean _read;
    private String media_url;
    private String extra;
    private String from_type;
    private String content_robot;
    private String sub_type;
    private long question_id;
    private boolean alreadyFeedback;

    public MQMessage(String contentType) {
        this.content_type = contentType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getContent_type() {
        return content_type;
    }

    public void setContent_type(String content_type) {
        this.content_type = content_type;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public long getConversation_id() {
        return conversation_id;
    }

    public void setConversation_id(long conversation_id) {
        this.conversation_id = conversation_id;
    }

    public String getAgent_nickname() {
        return agent_nickname;
    }

    public void setAgent_nickname(String agent_nickname) {
        this.agent_nickname = agent_nickname;
    }

    public long getCreated_on() {
        return created_on;
    }

    public void setCreated_on(long created_on) {
        this.created_on = created_on;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public boolean is_read() {
        return _read;
    }

    public void set_read(boolean _read) {
        this._read = _read;
    }

    public String getMedia_url() {
        return media_url;
    }

    public void setMedia_url(String media_url) {
        this.media_url = media_url;
    }

    public String getExtra() {
        return extra;
    }

    public void setExtra(String extra) {
        this.extra = extra;
    }

    public String getFrom_type() {
        return from_type;
    }

    public void setFrom_type(String from_type) {
        this.from_type = from_type;
    }

    public String getContent_robot() {
        return content_robot;
    }

    public void setContent_robot(String content_robot) {
        this.content_robot = content_robot;
    }

    public String getSub_type() {
        return sub_type;
    }

    public void setSub_type(String sub_type) {
        this.sub_type = sub_type;
    }

    public long getQuestion_id() {
        return question_id;
    }

    public void setQuestion_id(long question_id) {
        this.question_id = question_id;
    }

    public boolean isAlreadyFeedback() {
        return alreadyFeedback;
    }

    public void setAlreadyFeedback(boolean alreadyFeedback) {
        this.alreadyFeedback = alreadyFeedback;
    }
}
