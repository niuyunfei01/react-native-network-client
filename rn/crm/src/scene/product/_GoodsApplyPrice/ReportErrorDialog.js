import React from 'react'
import PropTypes from 'prop-types'
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import colors from "../../../pubilc/styles/colors";
import {connect} from "react-redux";
import ConfirmDialog from "../../common/component/ConfirmDialog";
import GoodsBaseItem from '../../../pubilc/component/goods/BaseItem'
import {Toast} from '@ant-design/react-native'
import pxToDp from "../../../util/pxToDp";
import HttpUtils from "../../../pubilc/util/http";
import {Cell, CellBody, Input, TextArea} from "../../../weui"
import {ToastShort} from "../../../pubilc/util/ToastUtils";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}


class ReportErrorDialog extends React.Component {
  static propTypes = {
    productId: PropTypes.any,
    storeId: PropTypes.any,
    productName: PropTypes.any,
    productImg: PropTypes.any
  }

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      access_token: this.props.global.accessToken,
      price: '',
      remark: ''
    }
  }

  onClickConfirm() {
    const self = this
    const {storeId, productId} = this.props
    const {price, remark, access_token} = this.state
    if (!price) {
      ToastShort('请输入市场单价')
      return
    }
    HttpUtils.post.bind(this.props)(`/api/report_track_product_err/${storeId}/${productId}?access_token=${access_token}`, {
      price, remark
    }).then(res => {
      Toast.success('提交成功')
      self.setState({visible: false})
    })
  }

  onClickCancel() {
    this.setState({visible: false})
  }

  renderDialog() {
    const self = this
    return (
      <ConfirmDialog
        visible={this.state.visible}
        onClickCancel={() => this.onClickCancel()}
        onClickConfirm={() => this.onClickConfirm()}
      >
        <ScrollView>
          <GoodsBaseItem
            image={this.props.productImg}
            name={this.props.productName}
            newPrice={false}
          />

          <View>
            <Cell customStyle={{borderTopWidth: 0}}>
              <CellBody>
                <Input
                  onChangeText={price => this.setState({price})}
                  style={[styles.cell_input]}
                  placeholder="请输入市场单价(必填)"
                  underlineColorAndroid="transparent" //取消安卓下划线
                />
              </CellBody>
            </Cell>
            <Cell customStyle={{borderTopWidth: 0}}>
              <CellBody>
                <TextArea
                  value={this.state.remark}
                  onChange={(remark) => self.setState({remark: remark})}
                  showCounter={false}
                  placeholder="请输入备注(选填)"
                  underlineColorAndroid="transparent" //取消安卓下划线
                  style={{borderWidth: 1, borderColor: '#efefef', height: pxToDp(200)}}
                />
              </CellBody>
            </Cell>
          </View>
        </ScrollView>
      </ConfirmDialog>
    )
  }

  render() {
    return (
      <View>
        <TouchableOpacity onPress={() => this.setState({visible: true})}>
          <View>
            <Text style={styles.err_btn}>参考有误？</Text>
          </View>
        </TouchableOpacity>

        {this.renderDialog()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  err_btn: {
    color: colors.main_color,
    // borderColor: colors.main_color,
    // borderWidth: pxToDp(1),
    // borderRadius: pxToDp(20),
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  inputItem: {
    borderWidth: pxToDp(1),
    borderColor: colors.fontGray
  },
  cell_title: {
    marginBottom: pxToDp(10),
    fontSize: pxToDp(26),
    color: colors.color999
  },
  cell_input: {
    fontSize: pxToDp(30),
    height: pxToDp(90),
    borderWidth: 1,
    borderColor: '#efefef'
  }
})

export default connect(mapStateToProps)(ReportErrorDialog);
