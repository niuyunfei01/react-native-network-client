import React from 'react'
import PropTypes from 'prop-types'
import {View, TouchableOpacity, Text, StyleSheet, ScrollView} from 'react-native'
import colors from "../../../styles/colors";
import {connect} from "react-redux";
import ConfirmDialog from "../../component/ConfirmDialog";
import GoodsBaseItem from '../../../Components/Goods/BaseItem'
import {List, InputItem, WhiteSpace, TextareaItem, Toast} from 'antd-mobile-rn'
import pxToDp from "../../../util/pxToDp";
import HttpUtils from "../../../util/http";

function mapStateToProps (state) {
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
  
  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      access_token: this.props.global.accessToken,
      price: '',
      remark: ''
    }
  }
  
  onClickConfirm () {
    const self = this
    const {storeId, productId} = this.props
    const {price, remark, access_token} = this.state
    HttpUtils.post(`/api/report_track_product_err/${storeId}/${productId}?access_token=${access_token}`, {
      price, remark
    }).then(res => {
      Toast.success('提交成功')
      self.setState({visible: false})
    })
  }
  
  onClickCancel () {
    this.setState({visible: false})
  }
  
  renderDialog () {
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
          
          <List renderHeader={'请输入市场单价'}>
            <InputItem
              styles={styles.inputItem}
              placeholder={'点击输入市场单价'}
              onChange={(text) => self.setState({price: text})}
            />
          </List>
          <WhiteSpace/>
          <List renderHeader={'理由(选填)'}>
            <TextareaItem
              styles={styles.inputItem}
              rows={5}
              placeholder={'点击请输入理由'}
              onChange={(text) => self.setState({remark: text})}
            />
          </List>
        </ScrollView>
      </ConfirmDialog>
    )
  }
  
  render () {
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
  }
})

export default connect(mapStateToProps)(ReportErrorDialog);