import React, {PureComponent} from 'react'
import IconButton from "react-native-vector-icons/Entypo";
import {ScrollView, Text, View} from "react-native";
import styles from './SupplementWageStyle'
import {connect} from "react-redux";
import pxToDp from "../../../pubilc/util/pxToDp";
import AppConfig from "../../../pubilc/common/config";
import FetchEx from "../../../pubilc/util/fetchEx";
import {ToastShort} from "../../../pubilc/util/ToastUtils";

import Accordion from '@ercpereda/react-native-accordion';
import colors from "../../../pubilc/styles/colors";

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
            <Text style={{color: colors.color333}}>单量提成 </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{color: colors.color333}}>{expect_order_supplement} </Text>
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
          <Text style={{color: colors.color333}}>店铺名 </Text>
          <Text style={{color: colors.color333}}>人效 </Text>
          <Text style={{color: colors.color333}}>标准 </Text>
          <Text style={{color: colors.color333}}>出勤天数 </Text>
          <Text style={{color: colors.color333}}>预计提成 </Text>
        </View>
    )
    for (let i in detail) {
      items.push(
          <View style={styles.orderContent} key={i + 1}>
            <Text style={{color: colors.color333}}>{detail[i].store.name} </Text>
            <Text style={{color: colors.color333}}>{detail[i].daily_apiece_order}/人天 </Text>
            <Text style={{color: colors.color333}}>{detail[i].order_standard}/单 </Text>
            <Text style={{color: colors.color333}}>{detail[i].days}天 </Text>
            <Text style={{color: colors.color333}}>约{detail[i].except_order_supplement}元 </Text>
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
            <Text style={{color: colors.color333}}>准单率提成 </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{color: colors.color333}}>{expect_punctual_supplement} </Text>
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
          <Text style={{color: colors.color333}}>店铺名 </Text>
          <Text style={{color: colors.color333}}>准点率 </Text>
          <Text style={{color: colors.color333}}>标准 </Text>
          <Text style={{color: colors.color333}}>出勤天数 </Text>
          <Text style={{color: colors.color333}}>预计提成 </Text>
        </View>
    )
    for (let i in detail) {
      items.push(
          <View style={styles.orderContent} key={i + 1}>
            <Text style={{color:colors.color333}}>{detail[i].store.name} </Text>
            <Text style={{color:colors.color333}}>{detail[i].punctual_percent * 100}% </Text>
            <Text style={{color:colors.color333}}>{detail[i].punctual_standard} </Text>
            <Text style={{color:colors.color333}}>{detail[i].days}天 </Text>
            <Text style={{color:colors.color333}}>约{detail[i].except_punctual_supplement}元 </Text>
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
            <Text style={{color:colors.color333}}>评分提成 </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{color:colors.color333}}>{expect_score_supplement} </Text>
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
            <Text style={{color:colors.color333}}>{store.name} </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{color:colors.color333}}>{except_score_supplement} </Text>
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
          <Text style={{color:colors.color333}}>日期 </Text>
          <Text style={{color:colors.color333}}>店铺 </Text>
          <Text style={{color:colors.color333}}>评分 </Text>
          <Text style={{color:colors.color333}}>标准(1/26) </Text>
          <Text style={{color:colors.color333}}>预计提成 </Text>
        </View>
    )
    for (let i in score) {
      items.push(
          <View style={styles.orderContent} key={i + 1}>
            <Text style={{color:colors.color333}}>{score[i].date} </Text>
            <Text style={{color:colors.color333}}>{store.name} </Text>
            <Text style={{color:colors.color333}}>{score[i].bizScore} </Text>
            <Text style={{color:colors.color333}}>{score[i].standard} </Text>
            <Text style={{color:colors.color333}}>约{score[i].expect_supplement}元 </Text>
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
              <Text style={{color:colors.color333}}>合计 </Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={{color:colors.color333}}>{expect_total_supplement} </Text>
            </View>
          </View>
        </ScrollView>
    )
  }
}

export default connect(mapStateToProps)(SupplementWage)
