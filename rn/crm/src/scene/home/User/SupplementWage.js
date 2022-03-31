import React, {PureComponent} from 'react'
import IconButton from "react-native-vector-icons/Entypo";
import {ScrollView, Text, View} from "react-native";
import styles from './SupplementWageStyle'
import {connect} from "react-redux";
import pxToDp from "../../../util/pxToDp";
import AppConfig from "../../../pubilc/common/config";
import FetchEx from "../../../util/fetchEx";
import {ToastShort} from "../../../pubilc/util/ToastUtils";

import Accordion from '@ercpereda/react-native-accordion';

function mapStateToProps(state) {
  const {global, mine} = state;
  return {global: global, mine: mine}
}

class SupplementWage extends PureComponent {

  constructor(props) {
    super(props)
    const {mine} = this.props;
    this.state = {
      supplementDetail: mine.wage_data
    }
    const {uid, date} = this.props.route.params
    if (uid && date) {
      this.getExceptSupplement(uid, date)
    }
  }

  getExceptSupplement(uid, month) {
    const self = this
    const {accessToken} = this.props.global;
    const url = `api/supplement_wage?access_token=${accessToken}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.postJSON(url, {
      uid, month
    })).then(resp => resp.json()).then(resp => {
      let {ok, obj, reason} = resp;
      if (ok) {
        self.setState({supplementDetail: obj})
      } else {
        ToastShort(reason)
      }
    })
  }

  renderOrderHeader = ({isOpen}) => {
    const self = this
    const {expect_order_supplement} = self.state.supplementDetail
    return (
      <View style={styles.orderHeader}>
        <View>
          <Text>单量提成 </Text>
        </View>
        <View style={styles.headerRight}>
          <Text>{expect_order_supplement} </Text>
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
    items.push(
      <View style={[styles.orderContent, styles.orderContentTh]} key={0}>
        <Text>店铺名 </Text>
        <Text>人效 </Text>
        <Text>标准 </Text>
        <Text>出勤天数 </Text>
        <Text>预计提成 </Text>
      </View>
    )
    for (let i in detail) {
      items.push(
        <View style={styles.orderContent} key={i + 1}>
          <Text>{detail[i].store.name} </Text>
          <Text>{detail[i].daily_apiece_order}/人天 </Text>
          <Text>{detail[i].order_standard}/单 </Text>
          <Text>{detail[i].days}天 </Text>
          <Text>约{detail[i].except_order_supplement}元 </Text>
        </View>
      )
    }
    return <View>{items}</View>
  }

  renderPunctualHeader = ({isOpen}) => {
    const self = this
    const {expect_punctual_supplement} = self.state.supplementDetail
    return (
      <View style={styles.orderHeader}>
        <View>
          <Text>准单率提成 </Text>
        </View>
        <View style={styles.headerRight}>
          <Text>{expect_punctual_supplement} </Text>
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
    items.push(
      <View style={[styles.orderContent, styles.orderContentTh]} key={0}>
        <Text>店铺名 </Text>
        <Text>准点率 </Text>
        <Text>标准 </Text>
        <Text>出勤天数 </Text>
        <Text>预计提成 </Text>
      </View>
    )
    for (let i in detail) {
      items.push(
        <View style={styles.orderContent} key={i + 1}>
          <Text>{detail[i].store.name} </Text>
          <Text>{detail[i].punctual_percent * 100}% </Text>
          <Text>{detail[i].punctual_standard} </Text>
          <Text>{detail[i].days}天 </Text>
          <Text>约{detail[i].except_punctual_supplement}元 </Text>
        </View>
      )
    }
    return <View>{items}</View>
  }

  renderScoreHeader = ({isOpen}) => {
    const self = this
    const {expect_score_supplement} = self.state.supplementDetail
    return (
      <View style={styles.orderHeader}>
        <View>
          <Text>评分提成 </Text>
        </View>
        <View style={styles.headerRight}>
          <Text>{expect_score_supplement} </Text>
          <IconButton
            name="chevron-thin-right"
            style={[styles.right_btn]}
          />
        </View>
      </View>
    )
  }

  renderScoreListHeader = (detail, isOpen) => {
    const self = this
    const {except_score_supplement, store} = detail
    return (
      <View style={styles.orderHeader}>
        <View>
          <Text>{store.name} </Text>
        </View>
        <View style={styles.headerRight}>
          <Text>{except_score_supplement} </Text>
          <IconButton
            name="chevron-thin-right"
            style={[styles.right_btn]}
          />
        </View>
      </View>
    )
  }

  renderScoreListContent(detail) {
    const self = this
    const {score, store} = detail
    let items = []
    items.push(
      <View style={[styles.orderContent, styles.orderContentTh]} key={0}>
        <Text>日期 </Text>
        <Text>店铺 </Text>
        <Text>评分 </Text>
        <Text>标准(1/26) </Text>
        <Text>预计提成 </Text>
      </View>
    )
    for (let i in score) {
      items.push(
        <View style={styles.orderContent} key={i + 1}>
          <Text>{score[i].date} </Text>
          <Text>{store.name} </Text>
          <Text>{score[i].bizScore} </Text>
          <Text>{score[i].standard} </Text>
          <Text>约{score[i].expect_supplement}元 </Text>
        </View>
      )
    }
    return <View>{items}</View>
  }

  renderScoreContent() {
    const self = this
    const {detail} = self.state.supplementDetail
    let items = []
    for (let i in detail) {
      items.push(
        <Accordion
          key={i + 1}
          header={({isOpen}) => self.renderScoreListHeader(detail[i], isOpen)}
          content={self.renderScoreListContent(detail[i])}
          activeOpacity={0}
          easing="easeOutCubic"
          underlayColor='#eee'
          animationDuration={500}
          style={{marginTop: pxToDp(20), marginLeft: pxToDp(20)}}
        />
      )
    }
    return <View>{items}</View>
  }

  render() {
    const self = this
    const {expect_total_supplement} = self.state.supplementDetail
    return (
      <ScrollView>
        <Accordion
          header={this.renderOrderHeader}
          content={this.renderOrderContent()}
          activeOpacity={0}
          easing="easeOutCubic"
          underlayColor='#eee'
          animationDuration={500}
          style={{marginTop: pxToDp(20)}}
        />
        <Accordion
          header={this.renderPunctualHeader}
          content={this.renderPunctualContent()}
          activeOpacity={0}
          easing="easeOutCubic"
          underlayColor='#eee'
          animationDuration={500}
          style={{marginTop: pxToDp(20)}}
        />
        <Accordion
          header={this.renderScoreHeader}
          content={this.renderScoreContent()}
          activeOpacity={0}
          easing="easeOutCubic"
          underlayColor='#eee'
          animationDuration={500}
          style={{marginTop: pxToDp(20)}}
        />

        <View style={[styles.orderHeader, {marginTop: pxToDp(20)}]}>
          <View>
            <Text>合计 </Text>
          </View>
          <View style={styles.headerRight}>
            <Text>{expect_total_supplement} </Text>
          </View>
        </View>
      </ScrollView>
    )
  }
}

export default connect(mapStateToProps)(SupplementWage)
