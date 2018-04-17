import React, {PureComponent} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput
} from "react-native";
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {getVendorStores} from "../../reducers/mine/mineActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";

import {
  uploadImg,
  newProductSave
} from "../../reducers/product/productActions";
import ImagePicker from "react-native-image-crop-picker";
import tool from "../../common/tool";
import Cts from "../../Cts";
import {NavigationItem} from "../../widget";
import native from "../../common/native";
import {ToastLong} from "../../util/ToastUtils";
import {NavigationActions} from "react-navigation";
import {Toast, Dialog, Icon, Button} from "../../weui/index";

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators(
      {
        uploadImg,
        newProductSave,
        ...globalActions
      },
      dispatch
    )
  };
}

class GoodsApplyWorkNewProductScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: "我要上新",
      headerLeft: (
        <NavigationItem
          icon={require("../../img/Register/back_.png")}
          iconStyle={{
            width: pxToDp(48),
            height: pxToDp(48),
            marginLeft: pxToDp(31),
            marginTop: pxToDp(20)
          }}
          onPress={() => {
            native.toGoods();
          }}
        />
      )
    };
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ScrollView
        style={{
          flex: 1,
          paddingVertical: 36,
          paddingHorizontal: 18
        }}
      >
        {/*创建和搜索*/}
        <Search
          bgc="#559ae7"
          title="扫码创建"
          image={require(`../../img/new/scan.png`)}
          onPress={() => {
            native.gotoNativeActivity(
              "cn.cainiaoshicai.crm.ui.scanner.FullScannerActivity",
              false
            );
          }}
        />
        <Search
          bgc="#ff648d"
          mgt={27}
          title="搜索上传"
          image={require(`../../img/new/search.png`)}
          onPress={() => {
            this.props.navigation.navigate("SearchGoods");
          }}
        />
      </ScrollView>
    );
  }
}

class Search extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {bgc, title, mgt, image, onPress} = this.props;
    return (
      <TouchableOpacity onPress={onPress}>
        <View
          style={{
            paddingVertical: 25,
            width: "100%",
            justifyContent: "center",
            backgroundColor: "white",
            alignItems: "center",
            borderRadius: 10,
            marginTop: mgt
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 40,
              backgroundColor: bgc
            }}
          >
            <Image source={image} style={{width: 40, height: 40}}/>
          </View>

          <View>
            <Text style={{color: "#3e3e3e", fontSize: 17, marginTop: 10}}>
              {title}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  GoodsApplyWorkNewProductScene
);

