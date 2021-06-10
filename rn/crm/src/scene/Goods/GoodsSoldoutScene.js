import React, {Component} from "react";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import GoodItemEditBottom from "../component/GoodItemEditBottom";
import {Provider} from "@ant-design/react-native";
import pxToDp from "../../util/pxToDp";
import {Colors, Metrics, Styles} from "../../themes";
import {Button1, Yuan} from "../component/All";
import color from '../../widget/color'
import Cts from "../../Cts";
import NavigationItem from "../../widget/NavigationItem";
import {ToastLong} from "../../util/ToastUtils";
function mapStateToProps (state) {
  const {global} = state;
  return {global: global};
}
class GoodsSoldoutScene extends Component {
  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerTitle: '缺货商品',
      headerLeft: ()=>(
          <NavigationItem
              icon={require("../../img/Register/back_.png")}
              iconStyle={{
                width: pxToDp(48),
                height: pxToDp(48),
                marginLeft: pxToDp(31),
                marginTop: pxToDp(18)
              }}
              onPress={() => {
                this.props.navigation.goBack()
                this.props.route.params.onSuccess()
              }}
    />)
    })

  };
  constructor (props) {
    super(props)
    this.navigationOptions(this.props)
    this.state = {
      goodsList: this.props.route.params.goodsList,
      selectedProduct: {},
      storeId:0,
      modalType:'',
    }
    console.log(this.props.route.params.goodsList)
  }
  doneProdUpdate = (pid, prodFields, spFields) => {

    let {goodsList} = this.state;
    for (let index in goodsList){
      if (goodsList[index].product_id == pid){
        goodsList[index].active =false;
        this.setState({goodsList:goodsList})
        ToastLong(goodsList[index].name+" 下架成功！");
        break;
      }
    }
    this.setState({goods: this.state.goods})
  }
  componentDidMount () {
  }
  onOpenModal(modalType, product) {
    console.log(product)
    this.setState({
      modalType: modalType,
      selectedProduct: product ? product : {},
    }, () => {
    })
  }
  render () {
    const sp = this.state.selectedProduct;
    const accessToken = this.props.global.accessToken;
    const storeId = this.state.storeId;
    return (
  <Provider>
        <View style={{   paddingVertical: 9,
          backgroundColor: "#FFF",
          flex: 1}}>
          <ScrollView>
            <View style={{paddingHorizontal: pxToDp(31)}}>
          {this.state.goodsList.map((element, index) => {
            console.log("element", element);
            return (
                <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 15,

                      marginBottom:
                          index === this.state.goodsList.length - 1 ? 15 : 0
                    }}
                >
                  <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "75%"
                      }}
                  >
                    <View
                        style={{
                          width: 42,
                          height: 42,
                          borderWidth: 1,
                          marginRight: 20,
                          borderColor: "#ccc"
                        }}
                    >
                      <Image
                          source={{uri: element.product_img}}
                          style={{width: 40, height: 40}}
                      />
                    </View>
                    <View
                        style={{
                          height: 42,
                          justifyContent: "space-between",
                          flex: 1
                        }}
                    >
                      <Text style={Styles.h203e} numberOfLines={1}>
                        {element.name}
                      </Text>
                    </View>
                  </View>
                  <View
                      style={{flexDirection: "row", alignItems: "center"}}
                  >
                    {element.active?(<TouchableOpacity
                        onPress={() => this.onOpenModal('off_sale', element)}>
                      <Text style={{color: color.theme, fontSize: 13}}>
                        下架>>
                      </Text>
                    </TouchableOpacity>):(<Text style={{color: color.theme, fontSize: 13}}>
                     已下架
                      </Text>)

                    }

                  </View>
                </View>
                // </TouchableOpacity>
            );
          })}
            </View>

        </ScrollView>
          <View style={{paddingHorizontal: pxToDp(31)}}>
            <Button1 t="暂不操作" w="100%" onPress={() =>{
              this.props.navigation.goBack()
              this.props.route.params.onSuccess()
            }}/>
          </View>
        </View>


    {sp && <GoodItemEditBottom key={sp.sp_id} pid={Number(sp.product_id)} modalType={this.state.modalType}
                               productName={sp.name}
                               strictProviding={false} accessToken={accessToken}
                               storeId={Number(storeId)}
                               doneProdUpdate={this.doneProdUpdate}
                               onClose={() => this.setState({modalType: ''})}
                               spId={Number(sp.sp_id)}
                             />}
  </Provider>

    )
  }
}
export default connect(mapStateToProps)(GoodsSoldoutScene)