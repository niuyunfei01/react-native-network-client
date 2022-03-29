import React, {PureComponent} from "react";
import {Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import Config from "../../pubilc/common/config";
import {setCreateProductStoreId} from '../../reducers/global/globalActions'
import {newProductSave, uploadImg} from "../../reducers/product/productActions";
import tool from "../../pubilc/common/tool";
import native from "../../common/native";

function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global};
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    ...bindActionCreators({
        uploadImg,
        newProductSave,
        setCreateProductStoreId
      },
      dispatch
    )
  };
}

class GoodsApplyWorkNewProductScene extends PureComponent {
  constructor(props) {
    super(props);
    let {currVendorId} = tool.vendor(this.props.global);
    let {currNewProductStoreId} = this.props.global;
    let navParams = this.props.route.params;
    let currStoreId = 0;
    if (navParams) {
      currStoreId = this.props.route.params.store_id;
    }
    if (!currStoreId) {
      if (!currNewProductStoreId) {
        currStoreId = this.props.global.currStoreId;
      } else {
        currStoreId = currNewProductStoreId;
      }
    }
    this.state = {
      vendor_id: currVendorId,
      store_id: currStoreId,
    };
    const {dispatch} = this.props;
    dispatch(setCreateProductStoreId(currStoreId))
  }

  render() {
    let jsonData = JSON.stringify(this.state);
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
              false, jsonData
            );
          }}
        />
        <Search
          bgc="#ff648d"
          mgt={27}
          title="搜索上传"
          image={require(`../../img/new/search.png`)}
          onPress={() => {
            this.props.navigation.navigate(Config.ROUTE_SEARCH_GOODS);
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

