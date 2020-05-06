import {ListItem} from "react-native-elements"
import {View } from 'react-native'
import React, {PureComponent} from 'react'
import {connect} from "react-redux"
import {bindActionCreators} from "redux"
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
    keyExtractor = (item, index) => index.toString()

    renderItem = ({item}) => (
        <ListItem
            title={item.name}
            subtitle={item.subtitle}
            leftAvatar={{
                source: item.avatar_url,
                title: item.name
            }}
            bottomDivider
            chevron
            onPress={() => {
                if (item.enable) {
                    this.props.navigation.navigate('Web', {url: 'https://open-erp.meituan.com/error'})
                } else {
                    this.setState({dialogVisible: true});
                }
            }}
            disable={!item.enable}
        />
    )

    render() {
        return (
            <View>
                <FlatList
                    keyExtractor={this.keyExtractor}
                    data={this.state.platformsList}
                    renderItem={this.renderItem}
                />
            </View>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlatformScene)
