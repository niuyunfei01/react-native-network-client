//import liraries
import React, {PureComponent} from 'react'
import {View, Text} from 'react-native'
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
    this.state = {};
  }

  componentWillMount() {
  }

  render() {
    return (<View/>);
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(GoodsScene)
