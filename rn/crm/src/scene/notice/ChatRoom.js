import React from "react";
import {
  Dimensions, FlatList, Image,
  InteractionManager, KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableHighlight, TouchableOpacity,
  View
} from "react-native";
import colors from "../../pubilc/styles/colors";
import {SvgXml} from "react-native-svg";
import {back, emoji, meme, no_message} from "../../svg/svg";
import {connect} from "react-redux";
import {hideModal, showModal, ToastShort} from "../../pubilc/util/ToastUtils";
import EmojiSelector, {Categories} from 'react-native-emoji-selector'
import BigImage from "../common/component/BigImage";
import {im_message_refresh} from "../../reducers/im/imActions";
import tool from "../../pubilc/util/tool";
import {getWithTplIm, postWithTplIm} from "../../pubilc/util/common";

const mapStateToProps = ({global, im}) => ({global: global, im: im})
const {width, height} = Dimensions.get("window");

class ChatRoom extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: false,
      messageInfo: props.route?.params?.info || {},
      isCanLoadMore: false,
      query: {
        page: 1,
        page_size: 10
      },
      isLastPage: false,
      messages: [],
      send_msg: '',
      showEmoji: false,
      modalImg: false,
      img_url: '',
      new_message_id: '',
      inverted: true,
      store_id: props.route?.params?.store_id
    }
  }

  componentDidMount = () => {
    let {im_config} = this.props.im
    this.fetchData()
    this.readMessage()
    if (im_config.im_store_status == 1)
      this.startPolling(im_config)
    tool.debounces(() => {
      this.msgInput.focus()
    }, 800)
  }

  componentWillUnmount() {
    if (this.dataPolling !== null)
      clearInterval(this.dataPolling);
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  startPolling = (im_config) => {
    const {accessToken} = this.props.global
    let {store_id} = this.state;
    const {dispatch} = this.props;
    this.dataPolling = setInterval(
      () => {
        const {new_message_id, messageInfo} = this.state;
        const {group_id} = messageInfo
        dispatch(im_message_refresh(accessToken, store_id, new_message_id, group_id, im_config.im_url, (ok, msg, obj) => {
          if (ok) {
            this.addInitMessage(obj[0])
          }
        }))
      },
      im_config.im_detail_second * 1000);
  }

  readMessage = () => {
    let {messageInfo} = this.state;
    const {accessToken} = this.props.global;
    const {im} = this.props;
    let params = {
      es_id: messageInfo.es_id,
      group_id: messageInfo.group_id
    }
    const api = `/im/im_message_read?access_token=${accessToken}`
    postWithTplIm(api, params, im.im_config.im_url, (json) => {
      if (!json.ok) {
        ToastShort(`${json.reason}`)
      }
    }, (error) => {
      this.setState({refreshing: false})
    })
  }

  addInitMessage = (res) => {
    let {messages, inverted} = this.state;
    if (inverted) {
      messages.unshift(res)
    } else {
      messages.push(res)
    }
    this.setState({
      messages,
      send_msg: '',
      new_message_id: res.id
    })
  }

  fetchData = () => {
    const {accessToken} = this.props.global;
    const {im} = this.props;
    const {query, isLastPage, messages, messageInfo, store_id} = this.state
    if (isLastPage)
      return
    let params = {
      page: query.page,
      page_size: query.page_size,
      group_id: messageInfo.group_id
    }
    showModal('加载中')
    this.setState({refreshing: true})
    const api = `/im/get_im_detail?store_id=${store_id}&access_token=${accessToken}`
    getWithTplIm(api, params, im.im_config.im_url, ({ok, obj, reason}) => {
      if (ok) {
        hideModal()
        let {lists, page, isLastPage} = obj
        let list = page > 1 ? messages.concat(lists) : lists
        if (page == 1) this.setState({new_message_id: list[0].id})
        this.setState({
          messages: list?.length > 5 ? list : list.reverse(),
          refreshing: false,
          isLastPage: isLastPage,
          inverted: list?.length > 5
        })
      } else {
        ToastShort(`${reason}`)
      }
    }, (error) => {
      hideModal()
      this.setState({refreshing: false})
    })
  }

  navigationToOrderDetail = (id) => {
    this.onPress('OrderNew', {orderId: id})
  }

  onEndReached() {
    const {query, isLastPage} = this.state;
    if (isLastPage) {
      return null
    }
    query.page += 1
    this.setState({query}, () => {
      this.fetchData()
    })
  }

  onMomentumScrollBegin = () => {
    this.setState({
      isCanLoadMore: true
    })
  }

  touchEmoji = () => {
    this.msgInput.blur()
    this.setState({showEmoji: !this.state.showEmoji})
  }

  enterEmoji = (e) => {
    let {send_msg} = this.state;
    send_msg = send_msg + e
    this.setState({
      send_msg: send_msg
    })
  }

  onToggleFullScreen = (img_url = '') => {
    let {modalImg} = this.state;
    this.setState({
      modalImg: !modalImg,
      img_url
    })
  }

  closeBigImage = () => {
    this.setState({
      modalImg: false
    })
  }

  sendMessage = () => {
    const {accessToken} = this.props.global;
    const {im} = this.props;
    let {messageInfo} = this.state;
    let params = {
      es_id: messageInfo.es_id,
      msg_type: 1,
      group_id: messageInfo.group_id,
      msg_content: this.state.send_msg
    }
    this.setState({refreshing: true})
    const api = `/im/im_send_message?access_token=${accessToken}`
    postWithTplIm(api, params, im.im_config.im_url, (json) => {
      if (json.ok) {
        this.addInitMessage(json.obj)
      } else {
        ToastShort(`${json.reason}`)
      }
    }, (error) => {
      this.setState({refreshing: false})
    })
  }

  getVerification = (field, value = '') => {
    return field == value
  }

  renderModalImg = () => {
    return (
      <BigImage
        visible={this.state.modalImg}
        urls={[{url: this.state.img_url}]}
        onClickModal={() => this.closeBigImage()}
        saveBtnLabel={'保存到相册'}
        cancelLabel={'取消'}
      />
    )
  }

  renderHead = () => {
    let {messageInfo} = this.state;
    let {
      userName = '',
      order_id = '',
      platform_name = '',
      real_mobile = '',
      orderStatusName = '',
      dayId = ''
    } = messageInfo
    return (
      <View style={styles.head}>
        <SvgXml onPress={() => this.props.navigation.goBack()} xml={back()}/>
        <If condition={userName === '匿名'}>
          <View style={styles.headLeft}>
            <Text style={styles.headLeftTitle}>匿名 </Text>
          </View>
        </If>
        <If condition={userName !== '匿名'}>
          <View style={styles.headLeft}>
            <Text style={styles.headLeftTitle}>{platform_name} {dayId !== '' ? `#${dayId}` : ''} </Text>
            <Text style={styles.headLeftUser}>{userName} {real_mobile !== '' ? `尾号${real_mobile}` : ''} </Text>
          </View>
          <Text style={styles.headRightTitle}
                onPress={() => this.navigationToOrderDetail(order_id)}>{orderStatusName} </Text>
        </If>
      </View>
    )
  }

  renderTab = () => {
    let {messageInfo} = this.state;
    let {orderMoney = '', orderTime = ''} = messageInfo
    return (
      <View style={styles.tab}>
        <SvgXml xml={meme()}/>
        <Text style={styles.orderMoney}>下单金额 {orderMoney}元 </Text>
        <Text style={styles.orderMoney}>下单时间 {orderTime}</Text>
      </View>
    )
  }

  listEmptyComponent = () => {
    return (
      <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, height: height}}>
        <SvgXml xml={no_message(120, 90)}/>
        <Text style={{fontSize: 15, color: colors.color999, marginTop: 10}}>
          暂无消息
        </Text>
      </View>
    )
  }

  renderMessage = () => {
    let {messages, isCanLoadMore, isLoading, inverted} = this.state;
    return (
      <FlatList
        ref={(flatList) => this._flatList = flatList}
        style={styles.message}
        data={messages}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        renderItem={this.renderList}
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          if (isCanLoadMore) {
            this.onEndReached();
            this.setState({isCanLoadMore: false})
          }
        }}
        inverted={inverted}
        onMomentumScrollBegin={this.onMomentumScrollBegin}
        refreshing={isLoading}
        keyExtractor={(item, index) => `${index}`}
        ListEmptyComponent={this.listEmptyComponent()}
        initialNumToRender={7}
      />
    )
  }

  renderList = (info) => {
    let {messageInfo} = this.state;
    let {userName = ''} = messageInfo
    let {item, index} = info
    let {im_config} = this.props.im
    return (
      <View style={styles.messageItem} key={index}>
        <View style={styles.messageTimeBox}>
          <Text style={styles.messageTime}>{tool._shortTimeIm(item.created_at * 1000)} </Text>
        </View>
        <If condition={this.getVerification(item.msg_source, '2') || this.getVerification(item.msg_source, '4')}>
          <View style={{flexDirection: "row"}}>
            <View style={styles.userProfile}>
              <Text
                style={styles.customerMsg}>{item.msg_source == '4' ? '骑手' : userName !== '匿名' ? userName.substring(0, 1) : '匿名'}</Text>
            </View>
            <If condition={this.getVerification(item.msg_type, '1')}>
              <View style={styles.customerContent}>
                <Text style={styles.messageText}>{item.msg_content} </Text>
              </View>
            </If>
            <If condition={this.getVerification(item.msg_type, '2')}>
              <TouchableHighlight style={styles.imageBox} onPress={() => this.onToggleFullScreen(item.msg_content)}>
                <Image source={{uri: item.msg_content}} style={styles.imageBox}/>
              </TouchableHighlight>
            </If>
          </View>
        </If>
        <If condition={this.getVerification(item.msg_source, '1') || this.getVerification(item.msg_source, '3')}>
          <View style={{flexDirection: "row", justifyContent: "flex-end"}}>
            <View style={{alignItems: "flex-end"}}>
              <If condition={this.getVerification(item.msg_type, '1')}>
                <View style={styles.customerContent}>
                  <Text style={styles.messageText}>{item.msg_content} </Text>
                </View>
              </If>
              <If condition={this.getVerification(item.msg_type, '2')}>
                <TouchableHighlight style={styles.imageBox} onPress={() => this.onToggleFullScreen(item.msg_content)}>
                  <Image source={{uri: item.msg_content}} style={styles.imageBox}/>
                </TouchableHighlight>
              </If>
              <If condition={item.platform == '1' || item.platform == '4'}>
                <Text style={styles.readStatus}>
                  {this.getVerification(item.is_read, '1') ? '已读' : '未读'}
                </Text>
              </If>
            </View>
            <View style={styles.merchantProfile}>
              <Text style={styles.merchantMsg}>
                {item.msg_source == '3' ? '系统' : im_config?.im_nick_name ? tool.jbbsubstr(im_config?.im_nick_name.substring(0, 1), 1) : '商'}
              </Text>
            </View>
          </View>
        </If>
      </View>
    )
  }

  renderMsgCard = () => {
    let {send_msg} = this.state;
    return (
      <View style={styles.msgCard}>
        <TextInput
          value={send_msg}
          ref={ref => this.msgInput = ref}
          returnKeyType={"send"}
          blurOnSubmit={true}
          style={styles.msgCardInput}
          onChangeText={text => this.setState({send_msg: text})}
          onFocus={() => this.setState({showEmoji: false})}
          placeholderTextColor={colors.color999}
          placeholder={'请在此输入内容回复客户'}
          onSubmitEditing={e => this.sendMessage()}
        />
        <TouchableOpacity onPress={this.touchEmoji} style={{flex: 1}}>
          <SvgXml xml={emoji(32, 32)} style={{marginLeft: 10}}/>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    let {messageInfo, showEmoji} = this.state;
    let {userName = '', orderMoney = '', orderTime = ''} = messageInfo
    return (
      <View style={styles.mainContainer}>
        {this.renderHead()}
        <If condition={userName !== '匿名' && orderMoney !== '' && orderTime !== ''}>
          {this.renderTab()}
        </If>
        {this.renderMessage()}
        <KeyboardAvoidingView behavior={Platform.select({android: 'height', ios: 'padding'})}
                              keyboardVerticalOffset={50}>
          {this.renderMsgCard()}
        </KeyboardAvoidingView>
        <If condition={showEmoji}>
          <EmojiSelector
            onEmojiSelected={emoji => this.enterEmoji(emoji)}
            category={Categories.emotion}
            showSearchBar={false}
            showSectionTitles={false}
            columns={9}
          />
        </If>
        {this.renderModalImg()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: colors.f5,
    flex: 1
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: colors.white,
    paddingHorizontal: 12
  },
  headLeft: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: "center",
    marginVertical: 2
  },
  headLeftTitle: {
    fontSize: 16,
    color: colors.color333,
    fontWeight: 'bold'
  },
  headRightTitle: {
    fontSize: 15,
    color: colors.color333
  },
  headLeftUser: {
    fontSize: 13,
    color: colors.color999,
    marginTop: 5
  },
  tab: {
    backgroundColor: '#FFF1E3',
    height: 30,
    width: width,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    height: 40
  },
  orderMoney: {
    color: '#FF862C',
    fontSize: 12,
    marginLeft: 10
  },
  message: {
    padding: 12,
    flex: 1,
  },
  messageItem: {
    marginVertical: 10
  },
  messageTime: {
    color: colors.color999,
    fontSize: 14,
  },
  messageTimeBox: {alignItems: "center", marginBottom: 10},
  userProfile: {
    width: 40,
    height: 40,
    backgroundColor: colors.white,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  customerMsg: {color: colors.main_color, fontSize: 16},
  customerContent: {padding: 10, backgroundColor: colors.white, borderRadius: 6},
  merchantProfile: {
    width: 40,
    height: 40,
    backgroundColor: colors.main_color,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10
  },
  messageText: {
    color: colors.color333,
    fontSize: 16,
    maxWidth: width * 0.7
  },
  imageBox: {width: 160, height: 160, borderRadius: 4},
  readStatus: {color: colors.color999, fontSize: 12, marginVertical: 5},
  merchantMessageBox: {padding: 10, backgroundColor: '#DBF5DE', borderRadius: 6},
  merchantMsg: {color: colors.white, fontSize: 15},
  messageMerchantText: {
    color: colors.color333,
    fontSize: 16
  },
  msgCard: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center"
  },
  msgCardInput: {flex: 5, padding: 8, backgroundColor: colors.f5, borderRadius: 18, fontSize: 16, paddingLeft: 20},
  modalWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
});

export default connect(mapStateToProps)(ChatRoom)
