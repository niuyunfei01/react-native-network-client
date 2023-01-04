import React from "react";
import {
  Dimensions,
  InteractionManager, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from "react-native";
import colors from "../../pubilc/styles/colors";
import {SvgXml} from "react-native-svg";
import {back} from "../../svg/svg";
import tool from "../../pubilc/util/tool";
import {connect} from "react-redux";
import {Button, Switch} from "react-native-elements";
import {TextArea} from "../../weui";
import AlertModal from "../../pubilc/component/AlertModal";
import HttpUtils from "../../pubilc/util/http";
import {ToastShort} from "../../pubilc/util/ToastUtils";
import {getStoreImConfig} from "../../reducers/im/imActions";

const mapStateToProps = ({global, im}) => ({global: global, im: im})
const {width} = Dimensions.get("window");

class ImSetting extends React.PureComponent {
  constructor(props) {
    super(props)
    let {im_config} = props.im
    this.state = {
      isLoading: false,
      confirmModal: false,
      store_im_config: im_config,
      autoInputVal: im_config.im_auto_content,
      nickName: ''
    }
  }

  onPress = (route, params) => {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  setConfig = (field, value) => {
    let {store_im_config} = this.state;
    store_im_config[field] = value
    this.setState({
      store_im_config
    })
    if (typeof (value) === 'boolean') {
      value = value ? 1 : 2
    }
    tool.debounces(() => {
      const {store_id, accessToken} = this.props.global;
      const {dispatch} = this.props;
      const api = `/api/im_save_config?access_token=${accessToken}`
      const params = {
        store_id: store_id,
        [field]: value
      }
      HttpUtils.post.bind(this.props)(api, params).then(() => {
        ToastShort("设置成功");
        dispatch(getStoreImConfig(accessToken, store_id))
      }).catch(e => ToastShort(e.reason))
    })
  }

  closeModal = () => {
    this.setState({
      confirmModal: false
    })
  }

  renderHead = () => {
    return (
      <View style={styles.head}>
        <SvgXml onPress={() => this.props.navigation.goBack()} xml={back()}/>
        <View style={styles.headLeft}>
          <Text style={styles.headLeftTitle}>消息设置 </Text>
        </View>
      </View>
    )
  }

  renderImSetting = () => {
    let {store_im_config, autoInputVal, nickName} = this.state;
    return (
      <View style={styles.content}>
        <TouchableOpacity style={[styles.itemRow, {borderColor: colors.f5, borderBottomWidth: 0.5}]}>
          <View style={styles.itemRowLeft}>
            <Text style={styles.row_label}>开启IM </Text>
            <Text style={styles.row_label_desc}>开启后，您可以和用户进行即时沟通 </Text>
          </View>
          <Switch onValueChange={(val) => this.setConfig('im_store_status', val)}
                  color={colors.main_color}
                  value={store_im_config.im_store_status == 1}
          />
        </TouchableOpacity>
        <View style={styles.itemRow}>
          <View style={styles.itemRowLeft}>
            <Text style={styles.row_label}>自动回复设置 </Text>
            <Text style={styles.row_label_desc}>开启后，三分钟内未回复客户，系统自动回复 </Text>
          </View>
          <Switch onValueChange={(val) => {
            if (!val) {
              this.setState({
                confirmModal: true
              })
            } else {
              this.setConfig('im_auto_reply_status', 1)
            }
          }}
                  color={colors.main_color}
                  value={store_im_config.im_auto_reply_status == 1}
          />
        </View>
        <View style={styles.inputAreaBox}>
          <TextArea
            showCounter={false}
            style={styles.inputArea}
            multiline={true}
            maxLength={300}
            numberOfLines={4}
            textAlignVertical={'top'}
            placeholder={"当您在繁忙时可在这里填写自动回复信息安抚客户，最多不超过300字。"}
            placeholderTextColor={colors.color999}
            onChange={value => this.setState({autoInputVal: value})}
            value={autoInputVal}
            underlineColorAndroid={"transparent"}
          />
          <Button title={'保存'}
                  onPress={() => this.setConfig('im_auto_content', autoInputVal)}
                  containerStyle={styles.autoBtn}
                  buttonStyle={{backgroundColor: colors.main_color}}
                  titleStyle={styles.autoBtnTitle}/>
        </View>
        <View style={{paddingVertical: 15}}>
          <Text style={styles.row_label}>显示客服昵称 </Text>
          <TextInput
            returnKeyType={'done'}
            underlineColorAndroid="transparent"
            style={styles.input}
            placeholderTextColor={colors.color999}
            placeholder={"请填写客服昵称"}
            value={nickName}
            onChangeText={text => this.setState({nickName: text})}
          />
          <Text style={styles.changeBtn} onPress={() => this.setConfig('im_nick_name', nickName)}>修改 </Text>
        </View>
      </View>
    )
  }

  renderConfirmModal = () => {
    let {confirmModal} = this.state;
    return (
      <AlertModal
        visible={confirmModal}
        onClose={this.closeModal}
        onPressClose={this.closeModal}
        onPress={() => {
          this.closeModal()
          this.setConfig('im_auto_reply_status', 2)
        }}
        title={'关闭后，系统不再自动回复客户，确认关闭吗？'}
        actionText={'确认'}
        closeText={'取消'}/>
    )
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        {this.renderHead()}
        <ScrollView
          automaticallyAdjustContentInsets={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{flex: 1, marginTop: 10}}>
          {this.renderImSetting()}
          {this.renderConfirmModal()}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: colors.f5,
    flex: 1,
    alignItems :"center",
    justifyContent: "center"
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
    alignItems: 'center',
    justifyContent: "center"
  },
  headLeftTitle: {
    fontSize: 16,
    color: colors.color333,
    fontWeight: 'bold'
  },
  content: {
    width: width * 0.94,
    backgroundColor: colors.white,
    borderRadius: 6,
    paddingHorizontal: 12
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15
  },
  itemRowLeft: {

  },
  row_label: {
    color: colors.color333,
    fontSize: 15
  },
  row_label_desc: {
    color: colors.color999,
    fontSize: 13,
    marginTop: 5
  },
  inputAreaBox: {
    borderColor: colors.f5,
    borderBottomWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 15
  },
  inputArea: {
    width: width * 0.88,
    height: 117,
    fontSize: 14,
    padding: 10,
    borderRadius: 6,
    backgroundColor: colors.f5,
  },
  autoBtn: {
    borderRadius: 15,
    width: 52,
    height: 30,
    position: 'relative',
    top: 30,
    right: 60,
    justifyContent: "center"
  },
  autoBtnTitle: {
    color: colors.white,
    fontSize: 12
  },
  changeBtn: {
    color: colors.main_color,
    fontSize: 14,
    position: "absolute",
    top: 55,
    right: 10
  },
  input: {
    height: 40,
    flex: 1,
    backgroundColor: colors.f5,
    borderRadius: 6,
    marginTop: 10,
    padding: 10,
    fontSize: 14
  }
});

export default connect(mapStateToProps)(ImSetting)
