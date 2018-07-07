import React, {PureComponent} from 'react'
import colors from "../../styles/colors";
import {Image, Text, TouchableWithoutFeedback, View} from "react-native";
import styles from "./GoodsAdjustStyles";
import pxToDp from "../../util/pxToDp";
import GoodsAdjustRemind from './GoodsAdjustSenceRemind'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {newProductSave, uploadImg} from "../../reducers/product/productActions";
import * as globalActions from "../../reducers/global/globalActions";

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
		...bindActionCreators(
			{
				uploadImg,
				newProductSave,
				...globalActions
			},
			dispatch
		)
	};
}

class GoodsAdjust extends PureComponent {
	static navigationOptions = ({navigation}) => ({
		headerTitle: '商品变动',
		headerTitleStyle: {color: '#3d3d3d'},
		// headerRight: navigation.state.params.tab === 'remind' ? (<View style={styles.headerRight}>
		// 	<TouchableWithoutFeedback onPress={() => navigation.state.params.toggleBatchOperation()}>
		// 		<View>
		// 			<Text style={[styles.listItemOperationBtn, styles.operationBtnLight, {height: pxToDp(38)}]}>
		// 				{navigation.state.params.batch == 0 ? '批量操作' : '取消'}
		// 			</Text>
		// 		</View>
		// 	</TouchableWithoutFeedback>
		// 	<Image style={styles.headerImage} source={require('../../img/Goods/shaixuan_.png')}/>
		// </View>) : null
	});
	
	constructor(props) {
		super(props);
		
		this.state = {
			tab: 'remind'
		}
	}
	
	componentWillMount() {
		this.props.navigation.setParams({
			tab: 'remind',
			batch: 0,
			toggleBatchOperation: this.toggleBatchOperation
		})
	}
	
	renderTab() {
		let leftStyle = [styles.tabItem];
		let rightStyle = [styles.tabItem];
		if (this.state.tab === 'remind') {
			leftStyle.push(styles.tabActive)
		}
		if (this.state.tab === 'quotation') {
			rightStyle.push(styles.tabActive)
		}
		return (
			<View style={[styles.in_cell, {
				backgroundColor: colors.white,
			}]}>
				<View style={styles.tabs}>
					<Text style={leftStyle} onPress={() => this.changeTab('remind')}>运营提醒</Text>
					<Text style={rightStyle} onPress={() => this.changeTab('quotation')}>商圈行情</Text>
				</View>
			</View>
		)
	}
	
	render() {
		return (
			<View>
				{this.renderTab()}
				{this.state.tab === 'remind' ? <GoodsAdjustRemind/> : null}
			</View>
		)
	}
	
	changeTab(val) {
		this.setState({tab: val});
		this.props.navigation.setParams({tab: val})
	}
	
	toggleBatchOperation = () => {
		const batch = this.props.navigation.state.params.batch;
		const {dispatch} = this.props;
		if (batch == 0) {
			this.props.navigation.setParams({batch: 1});
			dispatch({batch: 1})
		} else {
			this.props.navigation.setParams({batch: 0});
			dispatch({batch: 0})
		}
	}
}

export default connect(mapDispatchToProps)(GoodsAdjust)