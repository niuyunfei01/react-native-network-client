import {ScrollView,Image } from 'react-native'
import React, {PureComponent} from 'react'
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
import {SwipeAction, List } from 'antd-mobile-rn';
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
            platformsList: [
                {
                    platform: '美团',
                    avatar_url: 'http://s0.meituan.net/bs/fe-web-meituan/fa5f0f0/img/logo.png',
                    name: '建议sku数量少于200的商户选用',
                    enable: true,
                },
                {
                    platform: '饿了么',
                    avatar_url: '',
                    name: '建议sku数量少于200的商户选用',
                    enable: false,
                },
            ],
            dialogVisible: false,
            developerId: '',
            businessId: '',
            sign: '',
            timestamp: ''
        }
    }
    componentDidMount () {

    }
    render() {
        const right = [
            {
                text: 'Delete',
                onPress: () => console.log('delete'),
                style: { backgroundColor: 'red', color: 'white' },
            },
        ];

        return (
            <ScrollView
                style={{ flex: 1, backgroundColor: '#f5f5f9' }}
                automaticallyAdjustContentInsets={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            >
                <List>
                    <SwipeAction
                        autoClose
                        style={{ backgroundColor: 'transparent' }}
                        right={right}
                    >
                    <List.Item thumb="https://os.alipayobjects.com/rmsportal/mOoPurdIfmcuqtr.png">
                        thumb
                    </List.Item>
                    </SwipeAction>
                    <List.Item
                        thumb="https://os.alipayobjects.com/rmsportal/mOoPurdIfmcuqtr.png"
                        arrow="horizontal"
                    >
                        thumb
                    </List.Item>
                </List>
            </ScrollView>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformScene)
