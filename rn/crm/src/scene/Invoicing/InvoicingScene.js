import React, {PureComponent} from 'react';
import colors from "../../styles/colors";
import InvoicingGatherScene from './InvoicingGatherScene'
import InvoicingShippingScene from './InvoicingShippingScene'
import InvoicingOrderGoodsScene from './InvoicingOrderGoodsScene'
import InvoicingReceiptScene from './InvoicingReceiptScene'
import {NavigationItem} from '../../widget'
import * as globalActions from '../../reducers/global/globalActions';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import native from "../../common/native";
import {Tabs} from '@ant-design/react-native';

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

class InvoicingScene extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            initPage: 0
        }
        const {navigation} = props;
        navigation.setOptions(
            {
                headerTitle: '进销存系统',
                headerStyle: {
                    backgroundColor: colors.fontBlue,
                },
                headerRight: (() => (
                        <NavigationItem
                            iconStyle={{tintColor: colors.white,}}
                            icon={require('../../img/Order/print_white.png')}
                            position={'right'}
                            onPress={() => {
                                native.printSupplierSummaryOrder()
                            }}
                        />)
                )
            }
        );
    }

    UNSAFE_componentWillMount() {
        const {navigation} = this.props;
        const {initPage} = (this.props.route.params || {});
        if (initPage) {
            this.setState({initPage: initPage})
        }
    }

    toDetail(router, params = {}) {
        this.props.navigation.navigate(router, params)
    }

    render() {
        const tabs_list = [{title: '采集中'}, {title: '调货单'}, {title: '订货单'}, {title: '已结算'}];
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