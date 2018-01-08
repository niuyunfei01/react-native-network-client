import React, {PureComponent} from 'react'
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {Toast, Dialog, Icon, Button} from "../../weui/index";
import native from "../../common/native";


class OperateIncomeItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dlgShipVisible:false
    }
  }

  render() {
    return (
        <View>
          <View style={item.wrapper}>
            <View style={item.title_wrapper}>
              <Text style={item.title_text}>配送费收入</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={item.title_money}>135.66</Text>
                <TouchableOpacity
                    onPress = {()=>{
                      this.setState({dlgShipVisible:true})
                    }}
                >
                  <Text style={item.title_btn}>置为无效</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={item.details}>备注:今年财神不送礼，发条短信传给你。健康快乐长伴你，幸福美满粘着你，还有我要告诉你，财神已经盯上你！</Text>
          </View>

          <View style={item.wrapper}>
            <View style={item.title_wrapper}>
              <Text style={[item.title_text, {color: colors.fontGray}]}>配送费收入</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[item.title_money, {color: colors.fontGray}]}>135.66</Text>
                <Text style={[item.title_btn, {backgroundColor: colors.fontGray}]}>无效</Text>
              </View>
              <Text style={item.line_though}/>
            </View>
            <Text style={item.details}>备注:今年财神不送礼，发条短信传给你。健康快乐长伴你，幸福美满粘着你，还有我要告诉你，财神已经盯上你！</Text>
          </View>
          <Dialog onRequestClose={() => {
            this.setState({dlgShipVisible:false});
          }}
                  visible={this.state.dlgShipVisible}
                  title={'置为无效'}
                  titleStyle={{textAlign:'center'}}
                  buttons={[{
                    type: 'default',
                    label: '取消',
                    onPress: () => {
                      this.setState({dlgShipVisible:false});
                    }
                  },{
                    type: 'primary',
                    label: '确定',
                    onPress: () => {
                      this.setState({dlgShipVisible:false});

                    }
                  }]}

          ><Text>置为无效后,将保留此项列表,金额将不会计入总数</Text>
          </Dialog>
        </View>
    )
  }
}

const item = StyleSheet.create({
  wrapper: {
    paddingHorizontal: pxToDp(30),
    backgroundColor: colors.white,
    paddingBottom: pxToDp(30),
    borderTopWidth: pxToDp(1),
    borderColor: colors.fontGray
  },
  title_wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    height: pxToDp(90),
    alignItems: 'center',
    position: 'relative'
  },
  title_text: {
    fontSize: pxToDp(30),
    color: "#3f3f3f",
  },
  title_money: {
    fontSize: pxToDp(36),
    color: "#3f3f3f",
  },
  money: {
    flexDirection: 'row',
  },
  title_btn: {
    backgroundColor: colors.main_color,
    textAlign: 'center',
    marginLeft: pxToDp(20),
    color: colors.white,
    borderRadius: pxToDp(10),
    width: pxToDp(130),
    fontSize: pxToDp(24),
    height: pxToDp(50),
    marginRight: pxToDp(5)
  },
  details: {
    fontSize: pxToDp(24),
    color: colors.fontGray,
    lineHeight: pxToDp(40),
  },
  line_though: {
    position: 'absolute',
    width: '100%',
    borderTopWidth: pxToDp(2),
    borderColor: "#b4b4b4",
    height: pxToDp(2)
  }
});

export default OperateIncomeItem;