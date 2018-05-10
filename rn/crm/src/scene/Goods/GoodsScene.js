//import liraries
import React, {PureComponent} from 'react'
import {View, Text, ScrollView, RefreshControl} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {native} from '../../common';
import * as globalActions from '../../reducers/global/globalActions';


function mapStateToProps(state) {
  const {mine, user, global} = state;
  return {mine: mine, user: user, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

class GoodsScene extends PureComponent {
  static navigationOptions = {title: 'Goods', header: null};
  constructor(props: Object) {
    super(props);
    this.state = {
      isFetching: false
    };
  }

  componentWillMount() {
  }

  render() {
    let refreshControl = <RefreshControl
      refreshing={this.state.isFetching}
      tintColor='gray'
    />;
    
    return (<ScrollView
      contentContainerStyle={{alignItems: 'center', justifyContent: 'space-around', flex: 1, backgroundColor: '#fff'}}
      refreshControl={refreshControl}>
      <View>
        <Text style={{textAlign: 'center'}}>暂不支持商品管理</Text>
        <Text style={{textAlign: 'center'}}>请联系客服查询门店商品信息配置是否符合要求</Text>
      </View>
    </ScrollView>);
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(GoodsScene)
