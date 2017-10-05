/**
 * Copyright (c) 2017-present, Liu Jinyong
 * All rights reserved.
 *
 * https://github.com/huanxsd/MeiTuan
 * @flow
 */

//import liraries
import React, {PureComponent} from 'react'
import {View, Text} from 'react-native'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";


/**
 * ## Redux boilerplate
 */
function mapStateToProps({weui}) {
    return {}
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({}, dispatch)
    }
}

// create a component
class GoodsScene extends PureComponent {

    static navigationOptions = { title: 'Goods', header: null };


    constructor(props: Object) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
    }

    componentWillUnmount() {

    }

    render() {
        return (<View/>);
    }

}
export default connect(mapStateToProps, mapDispatchToProps)(GoodsScene)
