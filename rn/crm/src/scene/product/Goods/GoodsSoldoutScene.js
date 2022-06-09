import React, {Component} from "react";
import {Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import GoodItemEditBottom from "../../../pubilc/component/goods/GoodItemEditBottom";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Button1} from "../../common/component/All";
import {ToastLong} from "../../../pubilc/util/ToastUtils";
import colors from "../../../pubilc/styles/colors";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global};
}

class GoodsSoldoutScene extends Component {
  constructor(props) {
    super(props)
    this.navigationOptions(this.props)
    this.state = {
      goodsList: this.props.route.params.goodsList,
      selectedProduct: {},
      storeId: 0,
      modalType: '',
    }
  }

  navigationOptions = ({navigation}) => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: pxToDp(31),
            marginTop: pxToDp(18)
          }}
          onPress={() => {
            this.props.navigation.goBack()
            this.props.route.params.onSuccess()
          }}
        >
          <FontAwesome5 name={'arrow-left'} style={{fontSize: 25}}/>
        </TouchableOpacity>)
    })

  };

  doneProdUpdate = (pid, prodFields, spFields) => {

    let {goodsList} = this.state;
    for (let index in goodsList) {
      if (goodsList[index].product_id == pid) {
        goodsList[index].active = false;
        this.setState({goodsList: goodsList})
        ToastLong(goodsList[index].name + " 下架成功！");
        break;
      }
    }
    this.setState({goods: this.state.goods})
  }

  componentDidMount() {
  }

  onOpenModal(modalType, product) {
    this.setState({
      modalType: modalType,
      selectedProduct: product ? product : {},
    }, () => {
    })
  }

  render() {
    const sp = this.state.selectedProduct;
    const accessToken = this.props.global.accessToken;
    const storeId = this.state.storeId;
    return (
      <View>
        <View style={{
          paddingVertical: 9,
          backgroundColor: "#FFF",
          flex: 1
        }}>
          <ScrollView>
            <View style={{paddingHorizontal: pxToDp(31)}}>
              {this.state.goodsList.map((element, index) => {
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
                        <Text style={{
                          color: colors.fontBlack,
                          fontSize: 13
                        }} numberOfLines={1}>
                          {element.name}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{flexDirection: "row", alignItems: "center"}}
                    >
                      {element.active ? (<TouchableOpacity
                        onPress={() => this.onOpenModal('off_sale', element)}>
                        <Text style={{color: colors.theme, fontSize: 13}}>
                          下架>>
                        </Text>
                      </TouchableOpacity>) : (<Text style={{color: colors.theme, fontSize: 13}}>
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
            <Button1 t="暂不操作" w="100%" onPress={() => {
              this.props.navigation.goBack()
              this.props.route.params.onSuccess()
            }}/>
          </View>
        </View>


        {sp && <GoodItemEditBottom key={sp.sp_id} pid={Number(sp.product_id)} modalType={this.state.modalType}
                                   productName={sp.name}
                                   strictProviding={false} accessToken={accessToken}
                                   storeId={Number(storeId)}
                                   currStatus={Number(sp.status)}
                                   doneProdUpdate={this.doneProdUpdate}
                                   onClose={() => this.setState({modalType: ''})}
                                   spId={Number(sp.sp_id)}
                                   storePro={sp}
        />}
      </View>

    )
  }
}

export default connect(mapStateToProps)(GoodsSoldoutScene)
