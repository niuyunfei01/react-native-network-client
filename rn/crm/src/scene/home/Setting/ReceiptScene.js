import React, {PureComponent} from 'react'
import {Image, InteractionManager, RefreshControl, ScrollView, StyleSheet} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../util/pxToDp";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../../reducers/global/globalActions';
import {fetchUserCount, fetchWorkers} from "../../../reducers/mine/mineActions";


function mapStateToProps(state) {
  const {mine, global} = state;
  return {mine: mine, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      fetchUserCount,
      fetchWorkers,
      ...globalActions
    }, dispatch)
  }
}

class ReceiptScene extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isRefreshing: false,
      img: 'https://cnsc-pics.cainiaoshicai.cn/diyprinter.jpg'
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  onHeaderRefresh() {
  }

  onPress(route, params = {}, callback = {}) {
    let _this = this;
    InteractionManager.runAfterInteractions(() => {
      _this.props.navigation.navigate(route, params, callback);
    });
  }


  render() {
    return (
        <ScrollView
            refreshControl={
              <RefreshControl
                  refreshing={this.state.isRefreshing}
                  onRefresh={() => this.onHeaderRefresh()}
                  tintColor='gray'
              />
            } style={{backgroundColor: colors.main_back, margin: pxToDp(30)}}>
          <Image source={{uri: this.state.img}} resizeMode={'contain'} style={styles.image}/>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    height: pxToDp(2974),
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ReceiptScene)
