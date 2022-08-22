import React, {PureComponent} from "react";
import {Alert, FlatList, InteractionManager, Pressable, StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import tool from "../../../pubilc/util/tool";
import {JumpMiniProgram} from "../../../pubilc/util/WechatUtils";
import {connect} from "react-redux";
import {showError} from "../../../pubilc/util/ToastUtils";

import {CheckBox} from 'react-native-elements'

const CONTENT = {
  title: '请根据您的情况选择绑定方式',
  actions: [
    {
      id: 0,
      title: '咨询客服',
      wrapStyle: {
        backgroundColor: '#D3D3D3',
        borderRadius: 4,
        padding: 8
      },
      textStyle: {
        fontSize: 16,
        color: '#FFFFFF'
      }
    },
    {
      id: 1,
      title: '开始绑定',
      wrapStyle: {
        backgroundColor: '#59B26A',
        borderRadius: 4,
        padding: 8
      },
      textStyle: {
        fontSize: 16,
        color: '#FFFFFF'
      }
    }
  ]
}

class BindShunfeng extends PureComponent {

  state = {
    selectItem: 'login',
  }

  onChange = (selectItem) => {
    this.setState({selectItem: selectItem})
  }

  renderItem = ({item}) => {
    const {alert_msg, way, way_name} = item
    const {selectItem} = this.state
    return (
      <Pressable style={styles.itemWrap} onPress={() => this.onChange(way)}>
        <View style={styles.itemTextWrap}>
          <Text style={styles.itemTitle}>
            {way_name}
          </Text>
          <CheckBox center
                    type={'material'}
                    color={'green'}
                    size={16}
                    checkedIcon={'dot-circle-o'}
                    uncheckedIcon={'circle-o'}
                    checked={selectItem === way}
                    onPress={() => this.onChange(way)}
          />
        </View>
        <Text style={styles.itemText}>
          {alert_msg}
        </Text>
      </Pressable>
    )
  }

  onPress(route, params = {}, callback = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params, callback);
    });
  }

  find = () => {
    try {
      const {currVendorId} = tool.vendor(this.props.global)
      const data = {
        v: currVendorId,
        s: this.props.global.currStoreId,
        u: this.props.global.currentUser,
        m: this.props.global.currentUserProfile.mobilephone,
        place: 'mine'
      }
      JumpMiniProgram("/pages/service/index", data);
    } catch (e) {
      showError('打开小程序失败')
    }

  }

  handleAction = (id) => {
    const {res} = this.props.route.params
    const {selectItem} = this.state
    switch (id) {
      case 0:
        this.find()
        break
      case 1:
        switch (selectItem) {
          case 'login':
            this.onPress('Web', {url: res.auth_url})
            break
          case 'bind':
            Alert.alert('绑定' + res.name, res.alert_msg, [
              {text: '取消', style: 'cancel'},
              {
                text: '去绑定', onPress: () => {

                  if (res.route === 'BindDelivery') {
                    this.onPress(res.route, {id: res.type, name: res.name});
                    return null;
                  }

                  this.onPress(res.route, {url: res.auth_url});
                }
              },
            ])
            break
          case 'register':
            this.onPress('RegisterShunfeng')
            break
        }
        break
    }
  }

  listFooterComponent = () => {
    return (
      <View style={styles.footComponentWrap}>
        {
          CONTENT.actions.map((action, index) => {
            const {id, wrapStyle, textStyle, title} = action
            return (
              <Pressable key={index} style={wrapStyle} onPress={() => this.handleAction(id)}>
                <Text style={textStyle}>
                  {title}
                </Text>
              </Pressable>
            )
          })
        }
      </View>
    )
  }

  render() {
    const {res} = this.props.route.params
    return (
      <SafeAreaView style={styles.content}>
        <Text style={styles.title}>
          {CONTENT.title}
        </Text>
        <FlatList data={res.bind_way}
                  renderItem={this.renderItem}
                  keyExtractor={(item) => item.way}
                  initialNumToRender={3}
        />
        {
          this.listFooterComponent()
        }
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#F7F7F7'
  },
  title: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 12,
    width: 170,
    alignSelf: 'center',
    color: '#999999',
    fontWeight: '400',
    paddingLeft: 4,
    paddingRight: 6,
    lineHeight: 17,
    borderRadius: 4,
    backgroundColor: '#E7E7E7'
  },
  itemWrap: {
    borderRadius: 4,
    paddingTop: 13,
    paddingBottom: 18,
    paddingLeft: 8,
    paddingRight: 15,
    marginRight: 9,
    marginLeft: 11,
    marginTop: 6,
    marginBottom: 6,
    backgroundColor: '#FFFFFF'
  },
  itemTextWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#333333',
    lineHeight: 20
  },
  itemText: {
    fontSize: 14,
    paddingRight: 35,
    fontWeight: '400',
    lineHeight: 26,
    color: '#333333'
  },
  footComponentWrap: {
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: 49
  }
})

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

export default connect(mapStateToProps)(BindShunfeng)
