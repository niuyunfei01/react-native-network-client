package cn.cainiaoshicai.crm.domain;

import cn.cainiaoshicai.crm.dao.IUserTalkDao;
import cn.cainiaoshicai.crm.orders.domain.ResultBean;

/**
 * Created by liuzhr on 3/8/17.
 */
public class UserTalkBean extends ResultBean {

    private IUserTalkDao.UserTalk talk;

    public UserTalkBean(boolean b, String desc) {
        super(b, desc);
    }

    public IUserTalkDao.UserTalk getTalk() {
        return talk;
    }

    public void setTalk(IUserTalkDao.UserTalk talk) {
        this.talk = talk;
    }
}
