import React, {PureComponent} from 'react'
import colors from "../../styles/colors";
import {Text, View} from "react-native";
import styles from "./GoodsAdjustStyles";
import pxToDp from "../../util/pxToDp";
import GoodsAdjustRemind from './GoodsAdjustSenceRemind'

class GoodsAdjust extends PureComponent {
	static navigationOptions = ({navigation}) => ({
		headerTitle: '商品变动',
		headerStyle: {
			backgroundColor: colors.fontGray,
		},
	});
	
	constructor(props) {
		super(props)
		this.state = {
			tab: 'remind'
		}
	}
	
	renderTab() {
		let leftStyle = [styles.tabItem]
		let rightStyle = [styles.tabItem]
		if (this.state.tab === 'remind') {
			leftStyle.push(styles.tabActive)
		}
		if (this.state.tab === 'quotation') {
			rightStyle.push(styles.tabActive)
		}
		return (
			<View style={[styles.in_cell, {
				backgroundColor: colors.white,
				marginBottom: pxToDp(10),
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
		this.setState({tab: val})
	}
}

export default GoodsAdjust