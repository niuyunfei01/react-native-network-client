import React, {PureComponent,Component} from "react";
import {Modal, Animated, View, Text} from "react-native";

const menus = [{
    id: 0, title: '使用顺丰账号绑定', text: '使用顺丰商家账号授权后即可发单，与顺丰APP价格优惠活动一致', onPress: null
}, {
    id: 1, title: '使用顺丰店铺ID绑定', text: '登录顺丰同城APP，在商户信息授权开发者搜索【外送帮】并选择，复制店铺ID', onPress: null
}, {
    id: 2, title: '没有顺丰账号', text: '填写商家基本资料，并上传营业执照，在外送帮即可注册商家账号并使用', onPress: null
}]
const actions = [{
    id: 1, title: '联系客服'
}, {
    id: 2, title: '开始绑定'
}]

export default class ComplexActionSheet extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        //visible: true
    }

    renderItem = ({item}) => {
        console.log('item', item)
        return (
            <View>

            </View>
        )
    }

    render() {
        const {visible} = this.props
        console.log('是否可见：',visible)
        return (
            <Modal visible={visible} transparent={false}>
                <Animated.FlatList data={menus} renderItem={this.renderItem}/>
            </Modal>
        );
    }
}