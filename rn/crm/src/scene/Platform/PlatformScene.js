import {ScrollView, Image, Text,View} from 'react-native'
import React, {PureComponent} from 'react'
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import {SwipeAction, List,Button } from 'antd-mobile-rn';
import * as globalActions from "../../reducers/global/globalActions"
import HttpUtils from "../../util/http";
mapStateToProps = state => {
    let {global} = state
    return {global: global}
}

mapDispatchToProps = dispatch => {
    return {
        actions: bindActionCreators({...globalActions}, dispatch)
    }
}
class PlatformScene extends PureComponent {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: '绑定平台信息',
        }
    }

    constructor(props) {
        super(props)
        const params = this.props.navigation.state.params
        this.state = {
            platformsList:[],
            dialogVisible: false,
            developerId: '',
            businessId: '',
            sign: '',
            timestamp: ''
        }
    }
    componentDidMount () {
        this.props.actions.platformList(this.props.global.currentUser, (success,response) => {
           this.setState({platformsList:[]})
        })
    }
    render() {
        const right = [
            {
                text: 'Delete',
                onPress: () => console.log('delete'),
                style: { backgroundColor: 'red', color: 'white' },
            },
        ];
        const records = this.state.platformsList;
        return (
            <ScrollView
                style={{ flex: 1, backgroundColor: '#f5f5f9' }}
                automaticallyAdjustContentInsets={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            >
                <List>
                    {records&&records.map((item,id) => {
                        return <SwipeAction
                            autoClose
                            style={{ backgroundColor: 'transparent' }}
                            right={right}
                        >
                            <List.Item thumb="https://os.alipayobjects.com/rmsportal/mOoPurdIfmcuqtr.png">
                                {item.name}
                                <List.Item.Brief>{item.wid}</List.Item.Brief>
                            </List.Item>
                        </SwipeAction>
                    })}
                </List>
                {!records.length? <View><Text style={{
                    flex: 1,
                    marginTop:30,
                    backgroundColor: '#f5f5f9',
                    textAlignVertical: "center",
                    textAlign: "center",
                    fontWeight: 'bold',
                    fontSize: 25}}>您还没有绑定任何平台，
                </Text><Text style={{
                    flex: 1,
                    marginTop:5,
                    backgroundColor: '#f5f5f9',
                    textAlignVertical: "center",
                    textAlign: "center",
                    fontWeight: 'bold',
                    fontSize: 25}}>绑定平台以后方可使用。</Text></View> : null}
                <Button
                    onClick={() =>{

                     this.props.navigation.navigate('PlatformBind', {ePoiId:this.props.global.currStoreId,ePoiName:"四季生鲜"})
                    }}
                    style={{backgroundColor: '#f5f5f9',
                    textAlignVertical: "center",
                    textAlign: "center",  marginTop:30}}>添加平台信息</Button>
            </ScrollView>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformScene)
