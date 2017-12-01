import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  RefreshControl,
  InteractionManager,
  TextInput,
  Modal,
} from 'react-native';

import CheckboxCells from "../../weui/Form/CheckboxCells";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {NavigationActions} from 'react-navigation';
function mapStateToProps(state) {
  const {product, global} = state;
  return {product: product, global: global}
}
function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}
class  GoodsClassifyScene extends  PureComponent{
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    let {type} = params;
    return {
      headerTitle: '门店分类',
    }
  };
  constructor(props) {
    super(props)
    let {Classify} = this.props.navigation.state.params
    this.state = {
      arrData:Classify,
      checked:['123'],
    }
  }
  setGoodsCats(checked){
    this.setState({checked});
    let {state,dispatch } = this.props.navigation;
    console.log(state)
    const setParamsAction = NavigationActions.setParams({
      params: {store_categories: checked},
      key: state.params.nav_key,
    });
    dispatch(setParamsAction);
    console.log(checked)
  }
  render(){
    return(
      <View >
        <CheckboxCells
          options={this.state.arrData}
          onChange={(checked) => this.setGoodsCats(checked)}
          style={{marginLeft:0,paddingLeft: 0,}}
          value={this.state.checked}
        />
      </View>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GoodsClassifyScene)