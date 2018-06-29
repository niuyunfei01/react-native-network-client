import React, {PureComponent} from 'react'
import IconButton from "react-native-vector-icons/Entypo";
import {View, Text} from "react-native";
import styles from './SupplementWageStyle'
import {connect} from "react-redux";
import pxToDp from "../../util/pxToDp";

var Accordion = require('react-native-accordion')

function mapStateToProps(state) {
	const {global, mine} = state;
	return {global: global, mine: mine}
}

class SupplementWage extends PureComponent {
	static navigationOptions = ({navigation}) => ({
		headerTitle: '提成预估',
		headerTitleStyle: {color: '#3d3d3d'}
	});
	
	constructor(props) {
		super(props)
		const {mine} = this.props;
		this.state = {
			supplementDetail: mine.wage_data
		}
	}
	
	renderOrderHeader() {
		const self = this
		const {expect_order_supplement} = self.state.supplementDetail
		return (
			<View style={styles.orderHeader}>
				<View>
					<Text>单量提成</Text>
				</View>
				<View style={styles.headerRight}>
					<Text>{expect_order_supplement}</Text>
					<IconButton
						name="chevron-thin-right"
						style={[styles.right_btn]}
					/>
				</View>
			</View>
		)
	}
	
	renderOrderContent() {
		const self = this
		const {detail} = self.state.supplementDetail
		let items = []
		for (let i in detail) {
			items.push(
				<View style={styles.orderContent} key={i}>
					<Text>{detail[i].store.name}</Text>
					<Text>{detail[i].daily_apiece_order}/人天</Text>
					<Text>{detail[i].order_standard}/单</Text>
					<Text>{detail[i].days}天</Text>
					<Text>约{detail[i].except_order_supplement}元</Text>
				</View>
			)
		}
		return <View>{items}</View>
	}
	
	renderPunctualHeader() {
		const self = this
		const {expect_punctual_supplement} = self.state.supplementDetail
		return (
			<View style={styles.orderHeader}>
				<View>
					<Text>准单率提成</Text>
				</View>
				<View style={styles.headerRight}>
					<Text>{expect_punctual_supplement}</Text>
					<IconButton
						name="chevron-thin-right"
						style={[styles.right_btn]}
					/>
				</View>
			</View>
		)
	}
	
	renderPunctualContent() {
		const self = this
		const {detail} = self.state.supplementDetail
		let items = []
		for (let i in detail) {
			items.push(
				<View style={styles.orderContent} key={i}>
					<Text>{detail[i].store.name}</Text>
					<Text>{detail[i].punctual_percent * 100}%</Text>
					<Text>{detail[i].punctual_standard}</Text>
					<Text>{detail[i].days}天</Text>
					<Text>约{detail[i].except_punctual_supplement}元</Text>
				</View>
			)
		}
		return <View>{items}</View>
	}
	
	renderScoreHeader() {
		const self = this
		const {expect_score_supplement} = self.state.supplementDetail
		return (
			<View style={styles.orderHeader}>
				<View>
					<Text>评分提成</Text>
				</View>
				<View style={styles.headerRight}>
					<Text>{expect_score_supplement}</Text>
					<IconButton
						name="chevron-thin-right"
						style={[styles.right_btn]}
					/>
				</View>
			</View>
		)
	}
	
	renderScoreContent() {
		const self = this
		const {detail} = self.state.supplementDetail
		let items = []
		for (let i in detail) {
			items.push(
				<View style={styles.orderContent} key={i}>
					<Text>{detail[i].store.name}</Text>
					<Text>{detail[i].punctual_percent * 100}%</Text>
					<Text>{detail[i].punctual_standard}</Text>
					<Text>{detail[i].days}天</Text>
					<Text>约{detail[i].except_punctual_supplement}元</Text>
				
				</View>
			)
		}
		return <View>{items}</View>
	}
	
	render() {
		const self = this
		const {expect_total_supplement} = self.state.supplementDetail
		return (
			<View>
				<Accordion
					header={this.renderOrderHeader()}
					content={this.renderOrderContent()}
					activeOpacity={0}
					easing="easeOutCubic"
					underlayColor='#eee'
					animationDuration={500}
					style={{marginTop: pxToDp(20)}}
				/>
				<Accordion
					header={this.renderPunctualHeader()}
					content={this.renderPunctualContent()}
					activeOpacity={0}
					easing="easeOutCubic"
					underlayColor='#eee'
					animationDuration={500}
					style={{marginTop: pxToDp(20)}}
				/>
				<Accordion
					header={this.renderScoreHeader()}
					content={this.renderScoreContent()}
					activeOpacity={0}
					easing="easeOutCubic"
					underlayColor='#eee'
					animationDuration={500}
					style={{marginTop: pxToDp(20)}}
				/>
				
				<View style={[styles.orderHeader, {marginTop: pxToDp(20)}]}>
					<View>
						<Text>合计</Text>
					</View>
					<View style={styles.headerRight}>
						<Text>{expect_total_supplement}</Text>
					</View>
				</View>
			</View>
		)
	}
}

export default connect(mapStateToProps)(SupplementWage)