import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  Label,
} from "../../weui/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {getVendorStores} from "../../reducers/mine/mineActions";
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import Config from "../../config";
import {uploadImg, newProductSave} from "../../reducers/product/productActions";
import ImagePicker from "react-native-image-crop-picker";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import native from "../../common/native";
import {ToastLong} from "../../util/ToastUtils";
import {NavigationActions} from "react-navigation";
import {Toast, Dialog, Icon, Button} from "../../weui/index";
import OperateIncomeItem from './OperateIncomeItem';
function mapStateToProps(state) {
  const {mine, product, global} = state;
  return {mine: mine, product: product, global: global}
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch, ...bindActionCreators({
      uploadImg,
      newProductSave,
      ...globalActions
    }, dispatch)
  }
}

class OperateOtherExpendDetailScene extends PureComponent {
  static navigationOptions = ({navigation}) => {
    let {type} = navigation.state.params;
    console.log(type);
    return {
      headerTitle: tool.getOperateDetailsType(type),
    }
  };
  constructor(props) {
    super(props);
    let {currVendorId} = tool.vendor(this.props.global);
    let currStoreId = this.props.navigation.state.params.store_id

  }
  renderList(){
    return(
        <OperateIncomeItem/>
    )
  }
  render() {
    return (
        <View style={{flex: 1}}>
          <ScrollView style={{flex: 1}}>
            {
              this.renderList()
            }

          </ScrollView>
        </View>
    )
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(OperateOtherExpendDetailScene)
