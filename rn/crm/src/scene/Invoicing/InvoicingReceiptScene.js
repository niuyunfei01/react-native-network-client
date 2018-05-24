import React, {PureComponent} from 'react';
import {
	View,
	Text,
	ScrollView,
	Image,
	RefreshControl
} from 'react-native'
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import OrderComponent from './OrderComponent'

import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import * as globalActions from '../../reducers/global/globalActions';
import {fetchSupplyBalancedOrder, loadAllSuppliers, loadAllStores} from "../../reducers/invoicing/invoicingActions";
import ModalSelector from 'react-native-modal-selector'
import _ from 'lodash'
import EmptyListView from "./EmptyListView";

function mapStateToProps(state) {
	const {invoicing, global} = state;
	return {invoicing: invoicing, global: global}
}

function mapDispatchToProps(dispatch) {
	return {
		dispatch, ...bindActionCreators({
			fetchSupplyBalancedOrder,
			...globalActions
		}, dispatch)
	}
}

class InvoicingReceiptScene extends PureComponent {

	constructor(props) {
		super(props);
		this.renderItems = this.renderItems.bind(this);
		this.reloadData = this.reloadData.bind(this);
		this.chooseStore = this.chooseStore.bind(this);
		this.chooseSupplier = this.chooseSupplier.bind(this);
		this.state = {
			isRefreshing: false,
			checkedStoreId: 0,
			checkedStoreName: '全部门店',
			checkedSupplierId: 0,
			checkedSupplierName: '全部供货商'
		};
	}

	componentWillMount() {
	}

	componentDidMount() {
		this.reloadData();
		this.loadAllSuppliers();
		this.loadAllStores();
	}

	loadAllSuppliers() {
		const {dispatch, global} = this.props;
		let token = global['accessToken'];
		dispatch(loadAllSuppliers(token));
	}

	loadAllStores() {
		const {dispatch, global} = this.props;
		let token = global['accessToken'];
		dispatch(loadAllStores(token));
	}

	reloadData() {
		this.setState({isRefreshing: true});
		const {dispatch, global} = this.props;
		let token = global['accessToken'];
		let currStoreId = global['currStoreId'];
		let self = this;
		dispatch(fetchSupplyBalancedOrder(currStoreId, token, function () {
			self.setState({isRefreshing: false})
		}))
	}

	renderItems(suppliersMap) {
		let {invoicing} = this.props;
		let {balancedSupplyOrder} = invoicing;
		let views = [];
		let counter = 0;
		let checkedSupplierId = this.state.checkedSupplierId;
		let checkedStoreId = this.state.checkedStoreId;
		balancedSupplyOrder.forEach(function (item) {
			let storeId = item['store_id'];
			if (checkedStoreId == 0 || checkedStoreId == storeId) {
				let orders = item['data'];
				orders.forEach(function (order) {
					let supplierId = order['supplier_id'];
					if (checkedSupplierId == 0 || supplierId == checkedSupplierId) {
						let supplier = suppliersMap[supplierId];
						views.push(<OrderComponent key={counter} data={order} idx={counter} supplier={supplier}/>);
						counter += 1;
					}
				})
			}
		});
		return views.length > 0 ? views : <EmptyListView/>;
	}

	chooseStore(option) {
		this.setState({
			checkedStoreId: option.key,
			checkedStoreName: option.label,
		})
	}

	chooseSupplier(option) {
		this.setState({
			checkedSupplierId: option.key,
			checkedSupplierName: option.label
		})
	}

	render() {
		let {invoicing} = this.props;
		let {suppliers, stores} = invoicing;
		let suppliersMap = _.keyBy(suppliers, function (item) {
			return item['id'];
		});
		let storeLabels = _.map(stores, function (item) {
			return {key: item.id, label: item.name}
		});
		let supplierLabels = _.map(suppliers, function (item) {
			return {key: item.id, label: item.name}
		});
		storeLabels.unshift({key: 0, label: '全部门店'});
		supplierLabels.unshift({key: 0, label: '全部供货商'});
		return (
			<ScrollView refreshControl={
				<RefreshControl
					refreshing={this.state.isRefreshing}
					onRefresh={() => this.reloadData()}
					tintColor='gray'
				/>
			}>
				<View style={styles.select_box}>
					<ModalSelector
						cancelText={'取消'}
						data={storeLabels}
						keyExtractor={item => item.key}
						labelExtractor={item => item.label}
						onChange={(option) => this.chooseStore(option)}>
						<View style={styles.select_item}>
							<Text style={styles.select_text}>{this.state.checkedStoreName}</Text>
							<Image
								style={{alignItems: 'center', transform: [{scale: 0.7}]}}
								source={require('../../img/Public/xiangxia_.png')}
							/>
						</View>
					</ModalSelector>
					<ModalSelector
						cancelText={'取消'}
						data={supplierLabels}
						keyExtractor={item => item.key}
						labelExtractor={item => item.label}
						onChange={(option) => this.chooseSupplier(option)}>
						<View style={styles.select_item}>
							<Text style={styles.select_text}>{this.state.checkedSupplierName}</Text>
							<Image
								style={{alignItems: 'center', transform: [{scale: 0.7}]}}
								source={require('../../img/Public/xiangxia_.png')}
							/>
						</View>
					</ModalSelector>
				</View>
				<View style={{marginTop: pxToDp(10)}}>
					{this.renderItems(suppliersMap)}
				</View>
			</ScrollView>
		)
	}
}

const styles = {
	select_box: {
		flexDirection: 'row',
		width: '100%',
		height: pxToDp(100),
		justifyContent: 'space-between',
		backgroundColor: '#fff',
		paddingHorizontal: pxToDp(30),
		alignItems: 'center',

	},
	select_item: {
		backgroundColor: colors.main_back,
		width: pxToDp(300),
		height: pxToDp(70),
		borderRadius: pxToDp(6),
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	select_text: {
		textAlign: 'center',
		textAlignVertical: 'center',
		height: pxToDp(70)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoicingReceiptScene)