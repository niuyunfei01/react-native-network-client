import React, {PureComponent} from 'react'
import {Image, InteractionManager, RefreshControl, ScrollView, View} from 'react-native';
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import {connect} from "react-redux";
import {Button} from "react-native-elements";
import config from "../../config";


function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}


class MeituanPaotui extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      url: this.props.route.params.url,
      img: 'https://cnsc-pics.cainiaoshicai.cn/meituanpaotui.jpg'
    }
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }

  render() {
    return (
      <View style={{flexGrow: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={() => this.onHeaderRefresh()}
              tintColor='gray'
            />
          } style={{flex: 1, backgroundColor: colors.main_back, margin: pxToDp(30)}}>
          <Image style={{height: pxToDp(2600)}} source={{uri: this.state.img}} resizeMode={'contain'}/>
        </ScrollView>
        {this.rendenBtn()}
      </View>
    );
  }

  rendenBtn() {
    return (
      <View style={{backgroundColor: colors.white, padding: pxToDp(31)}}>
        <Button title={'去授权'}
                onPress={() => {
                  this.onPress(config.ROUTE_WEB, {url: this.state.url})
                }}
                buttonStyle={{
                  borderRadius: pxToDp(10),
                  backgroundColor: colors.main_color,
                }}
                titleStyle={{
                  color: colors.white,
                  fontSize: 16
                }}
        />
      </View>
    )
  }
}

export default connect(mapStateToProps)(MeituanPaotui)
