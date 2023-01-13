import React, {PureComponent} from 'react';
import colors from "../../../pubilc/styles/colors";
import InvoicingGatherScene from './InvoicingGatherScene'
import InvoicingShippingScene from './InvoicingShippingScene'
import InvoicingOrderGoodsScene from './InvoicingOrderGoodsScene'
import InvoicingReceiptScene from './InvoicingReceiptScene'
import * as globalActions from '../../../reducers/global/globalActions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import native from "../../../pubilc/util/native";
import {Tabs} from '@ant-design/react-native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import pxToDp from "../../../pubilc/util/pxToDp";
import {TouchableOpacity} from "react-native";

function mapStateToProps(state) {
  const {global} = state;
  return {global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      ...globalActions
    }, dispatch)
  }
}

const tabs_list = [{title: '采集中'}, {title: '调货单'}, {title: '订货单'}, {title: '已结算'}];

class InvoicingScene extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      initPage: 0
    }

  }

  componentDidMount() {
    const {navigation} = this.props;
    const {initPage} = (this.props.route.params || {});
    navigation.setOptions(
      {
        headerRight: (() => (
            <TouchableOpacity
              style={{
                width: pxToDp(48),
                height: pxToDp(48),
                marginLeft: pxToDp(31),
                marginTop: pxToDp(20)
              }}
              onPress={() => native.printSupplierSummaryOrder()}
            >
              <FontAwesome5 name={'file-image'} style={{fontSize: pxToDp(45), color: colors.white}}/>
            </TouchableOpacity>)
        )
      }
    );
    if (initPage) {
      this.setState({initPage: initPage})
    }
  }

  render() {

    return (
      <Tabs tabs={tabs_list}>
        <InvoicingGatherScene tabLabel='采集中' navigation={this.props.navigation}/>
        <InvoicingShippingScene tabLabel='调货单' navigation={this.props.navigation}/>
        <InvoicingOrderGoodsScene tabLabel='订货单'/>
        <InvoicingReceiptScene tabLabel='已结算'/>
      </Tabs>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicingScene)
