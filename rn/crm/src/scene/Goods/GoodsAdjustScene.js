import React, {PureComponent} from 'react'
import colors from "../../styles/colors";
import {Text, View} from "react-native";
import styles from "./GoodsAdjustStyles";
import GoodsAdjustRemind from './GoodsAdjustSenceRemind'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {newProductSave, uploadImg} from "../../reducers/product/productActions";
import * as globalActions from "../../reducers/global/globalActions";

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

class GoodsAdjust extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tab: 'remind'
    }
  }

  UNSAFE_componentWillMount() {
    this.props.navigation.setParams({
      tab: 'remind',
      batch: 0,
      toggleBatchOperation: this.toggleBatchOperation
    })
  }

  renderTab() {
    let leftStyle = [styles.tabItem];
    let rightStyle = [styles.tabItem];
    if (this.state.tab === 'remind') {
      leftStyle.push(styles.tabActive)
    }
    if (this.state.tab === 'quotation') {
      rightStyle.push(styles.tabActive)
    }
    return (
      <View style={[styles.in_cell, {
        backgroundColor: colors.white,
      }]}>
        <View style={styles.tabs}>
          <Text style={leftStyle} onPress={() => this.changeTab('remind')}>运营提醒 </Text>
          <Text style={rightStyle} onPress={() => this.changeTab('quotation')}>商圈行情 </Text>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View>
        {this.renderTab()}
        {this.state.tab === 'remind' ? <GoodsAdjustRemind/> : null}
      </View>
    )
  }

  changeTab(val) {
    this.setState({tab: val});
    this.props.navigation.setParams({tab: val})
  }

  toggleBatchOperation = () => {
    const batch = this.props.route.params.batch;
    const {dispatch} = this.props;
    if (batch == 0) {
      this.props.navigation.setParams({batch: 1});
      dispatch({batch: 1})
    } else {
      this.props.navigation.setParams({batch: 0});
      dispatch({batch: 0})
    }
  }
}

export default connect(mapDispatchToProps)(GoodsAdjust)
