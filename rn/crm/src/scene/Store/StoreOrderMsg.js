import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native'
import config from "../../pubilc/common/config";
import {Button, Cell, CellBody, CellFooter, CellHeader, Cells, Icon, Input, Label} from "../../weui";
import pxToDp from "../../util/pxToDp";
import colors from "../../pubilc/styles/colors";
import Cts from "../../Cts";


class StoreOrderMsg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      call_not_print: this.props.route.params.call_not_print,
      ship_way: this.props.route.params.ship_way,
    }
  }

  render() {

    let {
      call_not_print,
      ship_way
    } = this.state;

    return (
      <View style={{
        flexDirection: "column",
        flex: 1,

      }}>

        <Cells style={[styles.cell_box]}>
          <Cell customStyle={[styles.cell_rowTitle]}>
            <CellBody>
              <Text style={[styles.cell_rowTitleText]}>电话催单间隔(0为不催单) </Text>
            </CellBody>
          </Cell>

          <Cell customStyle={[styles.cell_row]}>
            <CellHeader>
              <Label style={[styles.cell_label]}>首次催单间隔</Label>
            </CellHeader>
            <CellBody style={{flexDirection: "row", alignItems: "center"}}>
              <Input
                onChangeText={call_not_print =>
                  this.setState({call_not_print})
                }
                value={call_not_print}

                style={[styles.cell_input, {width: pxToDp(65)}]}
                keyboardType="numeric" //默认弹出的键盘
                underlineColorAndroid="transparent" //取消安卓下划线
              />
              <Text style={[styles.body_text]}>分钟</Text>
            </CellBody>
          </Cell>
        </Cells>

        <Cells style={[styles.cell_box]}>

          <Cell customStyle={[styles.cell_rowTitle]}>
            <CellBody>
              <Text style={[styles.cell_rowTitleText]}>排单方式</Text>
            </CellBody>
          </Cell>

          <Cell
            onPress={() => {
              this.setState({ship_way: Cts.SHIP_AUTO});
            }}
            customStyle={[styles.cell_row]}
          >
            <CellBody>
              <Text style={styles.cell_label}>不排单</Text>
            </CellBody>
            <CellFooter>
              {Cts.SHIP_AUTO === parseInt(ship_way) ? (
                <Icon name="success_no_circle" style={{fontSize: 16}}/>
              ) : null}
            </CellFooter>
          </Cell>
          <Cell
            onPress={() => {
              this.setState({ship_way: Cts.SHIP_AUTO_FN_DD});
            }}
            customStyle={[styles.cell_row]}
          >
            <CellBody>
              <Text style={styles.cell_label}>自动发单</Text>
            </CellBody>
            <CellFooter>
              {Cts.SHIP_AUTO_FN_DD === parseInt(ship_way) ? (
                <Icon name="success_no_circle" style={{fontSize: 16}}/>
              ) : null}
            </CellFooter>
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
      fontSize: pxToDp(30),
      height: pxToDp(90),
      textAlign: "right",
      overflow: "hidden"

    },
    cell_label: {

      fontSize: pxToDp(26),
      color: colors.color666,
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
