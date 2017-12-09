import React, {PureComponent} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    TextInput,

} from 'react-native';

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from '../../reducers/global/globalActions';
import {productSave, fetchVendorProduct ,batchPriceSave} from "../../reducers/product/productActions";
import pxToDp from "../../util/pxToDp";
import ModalSelector from "../../widget/ModalSelector/index";
import Config from "../../config";
import tool from '../../common/tool';
import Cts from '../../Cts';
import {NavigationItem} from '../../widget';
import Icon from '../../weui/Icon/Icon'
import {Toast} from "../../weui/index";
import ScrollableTabView, {DefaultTabBar,ScrollableTabBar} from 'react-native-scrollable-tab-view';

function mapStateToProps(state) {
    const {product, global} = state;
    return {product: product, global: global}
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        ...bindActionCreators({
            fetchVendorProduct,
            batchPriceSave,
            ...globalActions
        }, dispatch)
    }
}

class GoodsApplyRecordScene extends PureComponent{
    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;
        let {type} = params;
        return {
          headerTitle: '申请记录',
          headerLeft: (<NavigationItem
            icon={require('../../img/Register/back_.png')}
            iconStyle={{width: pxToDp(48), height: pxToDp(48), marginLeft: pxToDp(31), marginTop: pxToDp(20)}}
            onPress={() => {
                navigation.goBack();
            }}
          />),
        }
      };
    constructor(props){
        super(props);
    }
    render(){
        return(
            <View style={{flex:1}}>


                <ScrollableTabView
                    renderTabBar={() => <DefaultTabBar />}>
                    <Text tabLabel='申请中'>申请中</Text>
                    <Text tabLabel='已完成'>已完成</Text>
                    <Text tabLabel='不通过'>不通过</Text>

                </ScrollableTabView>


            </View>
        )
    }

}
export default connect(mapStateToProps, mapDispatchToProps)(GoodsApplyRecordScene);