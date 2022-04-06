import React, {PureComponent} from 'react'
import {RefreshControl, ScrollView, StyleSheet, Text, View,} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../util/pxToDp";
import {Cell, CellBody, CellFooter, Cells} from "../../../weui";
import {Switch} from "@ant-design/react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../../reducers/mine/mineActions";
import HttpUtils from "../../../pubilc/util/http";
import {hideModal, showModal, showSuccess} from "../../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchUserCount,
      fetchWorkers,
      ...globalActions
    }, dispatch)
  }
}

class PushSetting extends PureComponent {

  constructor(props) {
    super(props);

    this.getUserNotifySetting = this.getUserNotifySetting.bind(this);
    this.state = {
      isRefreshing: false,
      grouped: []
    }
  }

  getUserNotifySetting() {
    const {accessToken, currStoreId} = this.props.global;
    showModal("加载中");
    const api = `api/read_user_notify_settings/${currStoreId}?access_token=${accessToken}`
    HttpUtils.get.bind(this.props)(api).then((res) => {
      hideModal()
      this.setState({
        grouped: res.grouped,
        ...res.is_enabled
      })
    })
  }

  componentDidMount() {
    this.getUserNotifySetting()
  }

  componentWillUnmount() {
  }

  onHeaderRefresh() {
  }

  onChangeSwitch(type, change) {
    let {currStoreId, accessToken} = this.props.global;
    showModal("加载中");
    let url = `/api/update_user_notify_settings/${currStoreId}/${type}/${change}?access_token=${accessToken}`;
    HttpUtils.get.bind(this.props)(url).then(res => {
      let data = this.state;
      data[type] = change
      this.setState({data})
      showSuccess('设置成功！')
    }, (error) => {
      showSuccess('设置失败' + error)
    })
  }

  renderCellItems(arr) {
    let items = []
    for (let i in arr) {
      const itemTypes = arr[i]
      let type = itemTypes.notify_type;
      items.push(
          <Cell customStyle={[styles.cell_row]}>
            <CellBody style={styles.cell_body}>
              <Text style={[styles.cell_body_text]}>{itemTypes.name} </Text>
              <Text style={[styles.cell_body_text_bottom]}>{itemTypes.user_intro} </Text>
            </CellBody>
            <CellFooter>
              <Switch checked={this.state[type] == 1}
                      color="#59b26a"
                      onChange={(res) => {
                        let change = res === true ? 1 : 0;
                        this.onChangeSwitch(type, change)
                      }}
              />
            </CellFooter>
          </Cell>
      )
    }
    return <View>
      {items}
    </View>
  }

  renderCellItem() {
    const groupedArr = this.state.grouped
    return (
        <ScrollView
            refreshControl={
              <RefreshControl
                  refreshing={this.state.isRefreshing}
                  onRefresh={() => this.onHeaderRefresh()}
                  tintColor='gray'
              />
            }
            style={{backgroundColor: colors.main_back}}
        >
          {
            groupedArr.map(item => {
              return <Cells style={[styles.cell_box]}>
                <Cell customStyle={[styles.cell_rowTitle]}>
                  <CellBody>
                    <Text style={[styles.cell_rowTitleText]}>{item.name} </Text>
                  </CellBody>
                </Cell>
                {this.renderCellItems(item.types)}
              </Cells>
            })
          }
        </ScrollView>
    )
  }

  render() {
    return (
        this.renderCellItem()
    );
  }
}

const styles = StyleSheet.create({
  cell_box: {
    margin: 10,
    borderRadius: pxToDp(20),
    backgroundColor: colors.white,
    borderTopColor: colors.white,
    borderBottomColor: colors.white
  },
  cell_rowTitle: {
    height: pxToDp(90),
    justifyContent: 'center',
    paddingRight: pxToDp(10),
    borderTopColor: colors.white,
    borderBottomColor: "#EBEBEB",
    borderBottomWidth: pxToDp(1)
  },
  cell_row: {
    height: pxToDp(100),
    justifyContent: 'center',
    paddingRight: pxToDp(10),
    borderTopColor: colors.white
  },
  cell_rowTitleText: {
    fontSize: pxToDp(30),
    color: colors.title_color
  },
  cell_body_text: {
    fontSize: pxToDp(26),
    color: colors.color666
  },
  cell_body_text_bottom: {
    fontSize: pxToDp(24),
    color: colors.color999
  },
  cell_body_comment: {
    fontSize: pxToDp(24),
    fontWeight: 'bold',
    color: colors.color999,
  },
  cell_body: {
    paddingVertical: pxToDp(5)
  },
  body_status: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    color: colors.main_color,
  },
  status_err: {
    fontSize: pxToDp(30),
    fontWeight: 'bold',
    backgroundColor: colors.main_color,
    borderRadius: pxToDp(15),
    padding: pxToDp(3),
    color: colors.f7,
  },
  right_box: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: pxToDp(60),
    paddingTop: pxToDp(10),
  },
  right_btn: {
    fontSize: pxToDp(25),
    paddingTop: pxToDp(8),
    marginLeft: pxToDp(10),
  },
});


export default connect(mapStateToProps, mapDispatchToProps)(PushSetting)
