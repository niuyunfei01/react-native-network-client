package cn.customer_serv.core.bean;

/**
 * Created by liuzhr on 9/29/16.
 */
public class MQEnterpriseConfig {
    public MQEnterpriseConfig ticketConfig;
    private String intro;
    public MQEnterpriseConfig serviceEvaluationConfig;
    private String prompt_text;
    public RobotSetting robotSettings = new RobotSetting();

    public String getIntro() {
        return intro;
    }

    public void setIntro(String intro) {
        this.intro = intro;
    }

    public String getPrompt_text() {
        return prompt_text;
    }

    public void setPrompt_text(String prompt_text) {
        this.prompt_text = prompt_text;
    }

    static public class RobotSetting {

    private boolean show_switch;
    public boolean isShow_switch() {
        return show_switch;
    }

    public void setShow_switch(boolean show_switch) {
        this.show_switch = show_switch;
    }
    }
}

