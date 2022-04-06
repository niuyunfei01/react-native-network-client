import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native'


import config from "../../../pubilc/common/config";
import {Button, Cell, CellBody, CellHeader, Cells, Input, Label} from "../../../weui";
import pxToDp from "../../../util/pxToDp";
import colors from "../../../pubilc/styles/colors";


class StoreOrderMsg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bankcard_code: this.props.route.params.call_not_print,
      bankcard_address: this.props.route.params.bankcard_address,
      bankcard_username: this.props.route.params.bankcard_username,

    }
  }

  render() {
    let {
      bankcard_code,
      bankcard_address,
      bankcard_username
    } = this.state;

    return (
        <View style={{
          flexDirection: "column",
          flex: 1,

        }}>


          <Cells style={[styles.cell_box]}>
            <Cell customStyle={[styles.cell_rowTitle]}>
              <CellBody>
                <Text style={[styles.cell_rowTitleText]}>银行卡信息</Text>
              </CellBody>
            </Cell>

            <Cell customStyle={[styles.cell_row]}>
              <CellHeader>
                <Label style={[styles.cell_label]}>银行卡号</Label>
              </CellHeader>
              <CellBody>
                <Input
                    onChangeText={v => {
                      this.setState({bankcard_code: v});
                    }}
                    value={this.state.bankcard_code}
                    style={[styles.cell_input]}
                    placeholder="请输入银行卡号"
                    underlineColorAndroid="transparent" //取消安卓下划线
                />
              </CellBody>
            </Cell>
            <Cell customStyle={[styles.cell_row]}>
              <CellHeader>
                <Label style={[styles.cell_label]}>开户地址</Label>
              </CellHeader>
              <CellBody>
                <Input
                    onChangeText={v => {
                      this.setState({bankcard_address: v});
                    }}
                    value={this.state.bankcard_address}
                    style={[styles.cell_input]}
                    placeholder="请输入开户地址"
                    underlineColorAndroid="transparent"
                />
              </CellBody>
            </Cell>
            <Cell customStyle={[styles.cell_row]}>
              <CellHeader>
                <Label style={[styles.cell_label]}>开户人姓名</Label>
              </CellHeader>
              <CellBody>
                <Input
                    onChangeText={v => {
                      this.setState({bankcard_username: v});
                    }}
                    placeholder="请输入开户人姓名"
                    value={this.state.bankcard_username}
                    style={[styles.cell_input]}
                    underlineColorAndroid="transparent"
                />
              </CellBody>
            </Cell>
          </Cells>

          <Button
              onPress={() => {
                this.props.route.params.onBack(this.state);
                this.props.navigation.navigate(config.ROUTE_STORE_ADD, this.state);
              }}
              type="primary"
              style={styles.btn_submit}
          >
            保存信息
          </Button>


        </View>


    );
  }
}

const
    styles = StyleSheet.create({
      btn_select: {
        marginRight: pxToDp(20),
        height: pxToDp(60),
        width: pxToDp(60),
        fontSize: pxToDp(40),
        color: colors.color666,
        textAlign: "center",
        textAlignVertical: "center"
      },
      cell_rowTitle: {
        height: pxToDp(90),
        justifyContent: 'center',
        paddingRight: pxToDp(10),
        borderTopColor: colors.white,
        borderBottomColor: "#EBEBEB",
        borderBottomWidth: pxToDp(1)
      },
      cell_rowTitleText: {
        fontSize: pxToDp(30),
        color: colors.title_color
      },
      cell_title: {
        marginBottom: pxToDp(10),
        fontSize: pxToDp(26),
        color: colors.color999
      },
      cell_box: {
        // marginTop: 0,
        // borderTopWidth: pxToDp(1),
        // borderBottomWidth: pxToDp(1),
        // borderColor: colors.color999,

        margin: 10,
        borderRadius: pxToDp(20),
        backgroundColor: colors.white,
        borderTopColor: colors.white,
        borderBottomColor: colors.white
      },
      cell_row: {
        height: pxToDp(90),
        justifyContent: "center"
      },
      cell_input: {
        //需要覆盖完整这4个元素
        fontSize: pxToDp(30),
        height: pxToDp(90),
        textAlign: "right",
        overflow: "hidden"

      },
      cell_label: {

        fontSize: pxToDp(26),
        color: colors.color666,
        // width: pxToDp(234),
        // fontSize: pxToDp(30),
        // fontWeight: "bold",
        // color: colors.color333
      },
      btn_submit: {
        margin: pxToDp(30),
        marginBottom: pxToDp(50),
        backgroundColor: "#6db06f"
      },
      right_icon: {
        marginTop: 20,

        fontSize: pxToDp(40),
        color: colors.color666,
        height: pxToDp(60),
        width: pxToDp(40),
        textAlignVertical: "center",
      },
      body_text: {
        paddingLeft: pxToDp(8),
        fontSize: pxToDp(30),
        color: colors.color333,
        marginTop: 20,
        height: pxToDp(70),
        textAlignVertical: "center",
        textAlign: "right",

      },
      btn1: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: pxToDp(15),
        marginBottom: pxToDp(10)
      },

      btnText: {
        height: 40,
        backgroundColor: colors.main_color,
        color: 'white',
        fontSize: pxToDp(30),
        fontWeight: "bold",
        textAlign: "center",
        paddingTop: pxToDp(15),
        paddingHorizontal: pxToDp(30),
        borderRadius: pxToDp(10)
      },
      timerbox: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#f7f7f7"

      },
      timerItem: {

        paddingVertical: pxToDp(4)
      }

    });

export default StoreOrderMsg;
