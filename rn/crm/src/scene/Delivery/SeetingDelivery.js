//import liraries
import React, {Component} from "react";
import {
    RefreshControl,
    SafeAreaView, StyleSheet,
    View,
    Text
} from "react-native";
import colors from "../../styles/colors";
import {connect} from "react-redux";
import { Grid, WingBlank } from 'antd-mobile-rn'
import {bindActionCreators} from "redux";
import {
    fetchDutyUsers,
    fetchStoreTurnover,
    fetchUserCount,
    fetchWorkers,
    userCanChangeStore
} from "../../reducers/mine/mineActions";
import AutoDragSortableView from "react-native-drag-sort/AutoDragSortableView";
import {fetchUserInfo} from "../../reducers/user/userActions";
import {default as globalActions, upCurrentProfile} from "../../reducers/global/globalActions";
import {get_supply_orders} from "../../reducers/settlement/settlementActions";
import NavigationItem from "../../widget/NavigationItem";
import tool from "../../common/tool";
import Config from "../../config";
import pxToDp from "../../util/pxToDp";
import {Cell, CellBody, CellHeader, Cells, CellsTitle} from "../../weui/Cell";
import {Input, Label, TextArea} from "../../weui/Form";
import {Button} from "../../weui/Button";
import Dimensions from "react-native/Libraries/Utilities/Dimensions";
 let data = [
    {icon: '../../data/img/animal1.png' ,txt: 1},
    {icon:  '../../data/img/animal2.png' ,txt: 2},
    {icon:  '../../data/img/animal3.png' ,txt: 3},
    {icon:  '../../data/img/animal4.png' ,txt: 4},
    {icon:  '../../data/img/animal5.png' ,txt: 5},
    {icon:  '../../data/img/animal6.png' ,txt: 6},
];
function mapStateToProps (state) {
    const {mine, user, global} = state;
    return {mine: mine, user: user, global: global};
}
var ScreenWidth = Dimensions.get("window").width;
function mapDispatchToProps (dispatch) {
    return {
        dispatch,
        ...bindActionCreators(
            {
                fetchUserCount,
                fetchWorkers,
                fetchDutyUsers,
                fetchStoreTurnover,
                fetchUserInfo,
                upCurrentProfile,
                userCanChangeStore,
                get_supply_orders,
                ...globalActions
            },
            dispatch
        )
    };
}
const {width} = Dimensions.get('window')

const parentWidth = width;
const childrenWidth = width - 20;
const childrenHeight = 48;
class SeetingDelivery extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: '绑定配送信息',
        }
    }
    constructor(props) {
        super(props);
        const {
            currentUser,
            currStoreId,
            currentUserProfile,
        } = this.props.global;
        this.state = {
            data: data,
        }
        this.onBind =this.onBind.bind(this)
    }
    onBind(){

    }
    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                <View style={styles.header}>
                    <Text style={styles.header_title}>Automatic Sliding: Single Line</Text>
                </View>
                <AutoDragSortableView
                    dataSource={this.state.data}

                    parentWidth={parentWidth}
                    childrenWidth= {childrenWidth}
                    marginChildrenBottom={10}
                    marginChildrenRight={10}
                    marginChildrenLeft = {10}
                    marginChildrenTop={10}
                    childrenHeight={childrenHeight}

                    onDataChange = {(data)=>{
                        console.log(data)
                        if (data.length != this.state.data.length) {
                            this.setState({
                                data: data
                            })
                        }
                    }}
                    keyExtractor={(item,index)=> item.txt} // FlatList作用一样，优化
                    renderItem={(item,index)=>{
                        return this.renderItem(item,index)
                    }}
                />
            </SafeAreaView>




        );
    }

    renderItem(item,index) {
        return (
            <View style={styles.item}>
                <View style={styles.item_icon_swipe}>
                    <Text style={styles.item_text}>{item.txt}</Text>
                </View>
                <Text style={styles.item_text}>{item.txt}</Text>
            </View>
        )
    }

}
const
    styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f0f0f0',
        },
        header: {
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomColor: '#2ecc71',
            borderBottomWidth: 2,
        },
        header_title: {
            color: '#333',
            fontSize: 24,
            fontWeight: 'bold',
        },
        item: {
            width: childrenWidth,
            height: childrenHeight,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#2ecc71',
            borderRadius: 4,
        },
        item_icon_swipe: {
            width: childrenHeight-10,
            height: childrenHeight-10,
            backgroundColor: '#fff',
            borderRadius: (childrenHeight - 10) / 2,
            marginLeft: 20,
            justifyContent: 'center',
            alignItems: 'center',
        },
        item_icon: {
            width: childrenHeight-20,
            height: childrenHeight-20,
            resizeMode: 'contain',
        },
        item_text: {
            color: '#fff',
            fontSize: 20,
            marginRight: 20,
            fontWeight: 'bold',
        },

    });
//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(SeetingDelivery);
