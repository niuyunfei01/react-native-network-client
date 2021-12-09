//import liraries
import React, {PureComponent} from "react";
import {ScrollView, StyleSheet,} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import {List, Picker, Provider} from '@ant-design/react-native'
import {bindActionCreators} from "redux";

import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellHeader, Cells, CellsTitle} from "../../weui/Cell";
import {Input, Label} from "../../weui/Form";
import {Button, ButtonArea} from "../../weui/Button";
import * as globalActions from "../../reducers/global/globalActions";
import {showError, showSuccess} from "../../util/ToastUtils";

const mapStateToProps = state => {
  let {global} = state
  return {global: global}
}

const mapDispatchToProps = dispatch => {
  return {
    actions: bindActionCreators({...globalActions}, dispatch)
  }
}
const data = [
  {value: '1', label: '快餐'},
  {value: '2', label: '送药'},
  {value: '3', label: '百货'},
  {value: '4', label: '脏衣服收'},
  {value: '5', label: '干净衣服派'},
  {value: '6', label: '生鲜'},
  {value: '7', label: '保单'},
  {value: '8', label: '高端饮品'},
  {value: '9', label: '现场勘验'},
  {value: '10', label: '快递'},
  {value: '12', label: '文件'},
  {value: '13', label: '蛋糕'},
  {value: '14', label: '鲜花'},
  {value: '15', label: '电子数码'},
  {value: '16', label: '服装鞋帽'},
  {value: '17', label: '汽车配件'},
  {value: '18', label: '珠宝'},
  {value: '20', label: '披萨'},
  {value: '21', label: '中餐'},
  {value: '22', label: '水产'},
  {value: '27', label: '专人直送'},
  {value: '32', label: '中端饮品'},
  {value: '33', label: '便利店'},
  {value: '34', label: '面包糕点'},
  {value: '35', label: '火锅'},
  {value: '36', label: '证照'},
  {value: '99', label: '其他'}];

let storename;

class BindDelivery extends PureComponent {

  constructor(props) {
    super(props);
    const {
      canReadStores,
      currStoreId,
    } = this.props.global;
    this.state = {
      value: [],
      app_key: '',
      app_secret: '',
      shop_id: '',
    }

    this.onChange = value => {
      this.setState({value});
    };
    this.onBindDelivery = this.onBindDelivery.bind(this)
    storename = (canReadStores[currStoreId] || {}).vendor + (canReadStores[currStoreId] || {}).name

  }

  onBindDelivery() {

    this.props.actions.addDelivery({
      name: this.props.route.params.name,
      type: this.props.route.params.id,
      app_key: this.state.app_key,
      value: this.state.value,
      app_secret: this.state.app_secret,
      shop_id: this.state.shop_id,
      model_id: this.props.global.currStoreId,
    }, (success, response) => {
      if (success) {
        showSuccess('绑定成功')
      } else {
        showError('绑定失败')
      }
      this.props.navigation.goBack();
    })
  }

  render() {

    return (
      <Provider>
        <ScrollView style={styles.container}
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
        >

          <CellsTitle style={styles.cell_title}>{storename}</CellsTitle>
          <CellsTitle style={styles.cell_title}>登录顺丰同城急送APP，在商户信息页面授权开发者选择【外送帮】，并复制【店铺ID】填写到下方</CellsTitle>
          {/*<Cells style={[styles.cell_box]}>*/}
          {/*    <Cell customStyle={[styles.cell_row]}>*/}
          {/*        <CellHeader>*/}
          {/*            <Label style={[styles.cell_label]}>开发者appId</Label>*/}
          {/*        </CellHeader>*/}
          {/*        <CellBody>*/}
          {/*            <Input*/}
          {/*                onChangeText={(app_key) => {*/}
          {/*                    app_key = app_key.replace(/[^\w]+/, '');*/}
          {/*                    this.setState({app_key})*/}
          {/*                }}*/}
          {/*                value={this.state.app_key}*/}
          {/*                style={[styles.cell_input]}*/}
          {/*                placeholder="64个字符以内"*/}
          {/*                underlineColorAndroid="transparent" //取消安卓下划线*/}

          {/*            />*/}
          {/*        </CellBody>*/}
          {/*    </Cell>*/}
          {/*</Cells>*/}
          {/*<Cells style={[styles.cell_box]}>*/}
          {/*    <Cell customStyle={[styles.cell_row]}>*/}
          {/*        <CellHeader>*/}
          {/*            <Label style={[styles.cell_label]}>开发者appsecret</Label>*/}
          {/*        </CellHeader>*/}
          {/*        <CellBody>*/}
          {/*            <Input*/}
          {/*                onChangeText={(app_secret) => {*/}
          {/*                    app_secret = app_secret.replace(/[^\w]+/, '');*/}
          {/*                    this.setState({app_secret})*/}
          {/*                }}*/}
          {/*                value={this.state.app_secret}*/}
          {/*                style={[styles.cell_input]}*/}
          {/*                placeholder="64个字符以内"*/}
          {/*                underlineColorAndroid="transparent" //取消安卓下划线*/}
          {/*            />*/}
          {/*        </CellBody>*/}
          {/*    </Cell>*/}
          {/*</Cells>*/}
          <Cells style={[styles.cell_box]}>
            <Cell customStyle={[styles.cell_row]}>
              <CellHeader>
                <Label style={[styles.cell_label]}>配送平台门店id</Label>
              </CellHeader>
              <CellBody>
                <Input
                  onChangeText={(shop_id) => {
                    shop_id = shop_id.replace(/[^\d]+/, '');
                    this.setState({shop_id})
                  }}
                  value={this.state.shop_id}
                  style={[styles.cell_input]}
                  keyboardType="numeric"
                  placeholder="64个字符以内"
                  underlineColorAndroid="transparent" //取消安卓下划线

                />
              </CellBody>
            </Cell>
          </Cells>
          <Cells style={[styles.cell_box]}>
            <Cell customStyle={[styles.cell_row]}>

              <CellBody>

                <Picker
                  data={data}
                  cols={1}
                  value={this.state.value}
                  onChange={this.onChange}
                >
                  <List.Item arrow="horizontal" onPress={this.onPress}>
                    店铺类型选择
                  </List.Item>
                </Picker>

              </CellBody>
            </Cell>
          </Cells>
          <ButtonArea style={{marginBottom: pxToDp(20), marginTop: pxToDp(50)}}>
            <Button type="primary" onPress={() => this.onBindDelivery()}>确认绑定</Button>
          </ButtonArea>

        </ScrollView>
      </Provider>
    );
  }
}

const
  styles = StyleSheet.create({
    container: {
      marginBottom: pxToDp(22),
      backgroundColor: colors.white
    },
    btn_select: {
      marginRight: pxToDp(20),
      height: pxToDp(60),
      width: pxToDp(60),
      fontSize: pxToDp(40),
      color: colors.color666,
      textAlign: "center",
      textAlignVertical: "center"
    },
    cell_title: {
      marginBottom: pxToDp(10),
      fontSize: pxToDp(26),
      color: colors.color999
    },
    cell_box: {
      marginTop: 0,
      borderTopWidth: pxToDp(1),
      borderBottomWidth: pxToDp(1),
      borderColor: colors.color999
    },
    cell_row: {
      height: pxToDp(90),
      justifyContent: "center"
    },
    cell_input: {
      //需要覆盖完整这4个元素
      fontSize: pxToDp(30),
      height: pxToDp(90)
    },
    cell_label: {
      width: pxToDp(234),
      fontSize: pxToDp(30),
      fontWeight: "bold",
      color: colors.color333
    },
    btn_submit: {
      margin: pxToDp(30),
      marginBottom: pxToDp(50),
      backgroundColor: "#6db06f"
    },
    map_icon: {
      fontSize: pxToDp(40),
      color: colors.color666,
      height: pxToDp(60),
      width: pxToDp(40),
      textAlignVertical: "center"
    },
    body_text: {
      paddingLeft: pxToDp(8),
      fontSize: pxToDp(30),
      color: colors.color333,
      height: pxToDp(60),
      textAlignVertical: "center"

      // borderColor: 'green',
      // borderWidth: 1,
    }
  });
//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(BindDelivery);
