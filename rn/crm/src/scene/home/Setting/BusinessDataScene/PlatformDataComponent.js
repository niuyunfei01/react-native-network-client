import React, {PureComponent} from "react";
import {View, StyleSheet, TouchableOpacity, Text, Dimensions} from "react-native";
import colors from "../../../../pubilc/styles/colors"
import FastImage from "react-native-fast-image";
import AntDesign from "react-native-vector-icons/AntDesign";
import HttpUtils from "../../../../pubilc/util/http";
import tool from "../../../../pubilc/util/tool";
import AlertModal from "../../../../pubilc/component/AlertModal";
import CustomDateComponent from "../../../../pubilc/component/CustomDateComponent";

const {height, width} = Dimensions.get('window')
const styles = StyleSheet.create({
  rowCenter: {flexDirection: 'row', alignItems: 'center'},
  selectBtnWrap: {
    width: 0.2186 * width,
    height: 0.0443 * height,
    borderRadius: 18,
    backgroundColor: colors.main_color,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  notSelectBtnWrap: {
    width: 0.2186 * width,
    height: 0.0443 * height,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  selectBtnText: {fontSize: 14, fontWeight: '500', color: colors.white, lineHeight: 20},
  notSelectBtnText: {fontSize: 14, fontWeight: '400', color: colors.color666, lineHeight: 20},
  zoneWrap: {paddingHorizontal: 12, backgroundColor: colors.white, borderRadius: 6, marginBottom: 10},
  platformIcon: {width: 30, height: 30, marginVertical: 15, marginRight: 6},
  platformName: {fontSize: 16, fontWeight: 'bold', color: colors.color333, lineHeight: 22},
  detailDataWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.e5
  },
  detailDataHeaderTitle: {fontSize: 14, color: colors.color666},
  detailDataText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.color333,
    lineHeight: 25,
    paddingTop: 4,
    paddingBottom: 15
  },
  detailWrap: {borderTopColor: colors.main_color, borderTopWidth: 2, flexDirection: 'row'},
  detailLeftWrap: {alignItems: 'center', justifyContent: 'center', width: 0.2827 * width, backgroundColor: colors.f5},
  detailLeftLabel: {fontSize: 12, color: colors.color666, lineHeight: 17},
  detailRightWrap: {
    backgroundColor: colors.f5,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginLeft: 2,
    width: 0.584 * width
  },
  detailItemWrap: {width: 0.584 * width / 3},
  detailItemLabel: {paddingTop: 10, paddingLeft: 12, fontSize: 12, color: colors.color666, lineHeight: 17},
  detailItemValue: {
    paddingTop: 4,
    paddingLeft: 12,
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.color333,
    lineHeight: 20,
    paddingBottom: 10
  },
  notHasMoreInfo: {marginBottom: 10, textAlign: 'center', fontSize: 14, color: colors.color999}
})

const DATE_CATEGORY = [

  {
    index: 0,
    name: '昨日'
  },
  {
    index: 1,
    name: '近7天'
  },
  {
    index: 2,
    name: '自定义'
  },
]
export default class PlatformDataComponent extends PureComponent {

  time = new Date()
  state = {
    selectDate: 0,
    platform_data: [],
    start_date: tool.fullDay(this.time - 24 * 3600 * 1000),
    end_date: tool.fullDay(this.time - 24 * 3600 * 1000),
    current_datetime: tool.fullDay(this.time),
    yesterday_datetime: tool.fullDay(this.time - 24 * 3600 * 1000),
    week_datetime: tool.fullDay(this.time - 24 * 3600 * 1000 * 7),
    visible: false,
    title: '',
    desc: '',
    custom_date_visible: false
  }

  componentWillUnmount() {
    this.focus()
  }

  getInitData = () => {
    const {start_date, end_date} = this.state
    this.getData(start_date, end_date)
  }

  componentDidMount() {
    const {navigation} = this.props
    this.getInitData()
    this.focus = navigation.addListener('focus', () => {
      this.getInitData()
    })
  }

  getData = (start_date, end_date) => {
    if (!start_date || !end_date)
      return
    const {store_id, accessToken} = this.props
    const url = `/v1/new_api/analysis/platform_stat?access_token=${accessToken}`
    const params = {store_id: store_id, start_date: start_date, end_date: end_date}
    HttpUtils.get(url, params).then((res = []) => {
      this.setState({platform_data: res, custom_date_visible: false})
    })
  }

  setTime = (start_date, end_date) => {
    this.setState({start_date: start_date, end_date: end_date})
  }
  setHeaderBtn = (index) => {
    const {selectDate, current_datetime, yesterday_datetime, week_datetime} = this.state
    if (selectDate === index)
      return
    switch (index) {
      case 0:
        this.setTime(yesterday_datetime, yesterday_datetime)
        this.getData(yesterday_datetime, yesterday_datetime)
        break
      case 1:
        this.setTime(week_datetime, current_datetime)
        this.getData(week_datetime, current_datetime)
        break
      case 2:
        this.setState({custom_date_visible: true})
        break
    }
    this.setState({selectDate: index})
  }
  renderBtn = () => {
    const {selectDate} = this.state
    return (
      <View style={[styles.rowCenter, {marginBottom: 10}]}>
        {
          DATE_CATEGORY.map((item, index) => {
            return (
              <TouchableOpacity style={selectDate === index ? styles.selectBtnWrap : styles.notSelectBtnWrap}
                                onPress={() => this.setHeaderBtn(index)}
                                key={index}>
                <Text style={selectDate === index ? styles.selectBtnText : styles.notSelectBtnText}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )
          })
        }
      </View>
    )
  }

  setModal = (visible, title, desc) => {
    this.setState({visible: visible, title: title, desc: desc})
  }
  renderDetailData = (platform_info, index) => {
    const {name, icon, summary, ext_stores} = platform_info
    return (
      <View style={styles.zoneWrap} key={index}>
        <View style={styles.rowCenter}>
          <FastImage style={styles.platformIcon}
                     resizeMode={FastImage.resizeMode.contain}
                     source={{uri: icon}}/>
          <Text style={styles.platformName}>
            {name}
          </Text>
        </View>
        <View style={styles.detailDataWrap}>
          {
            summary && summary.map((item, index) => {
              const {label = '', value = 0} = item
              return (
                <View key={index} style={{width: '50%'}}>
                  <View style={styles.rowCenter}>
                    <Text style={styles.detailDataHeaderTitle}>
                      {label}
                    </Text>
                    <AntDesign name={'questioncircle'}
                               color={colors.color999}
                               style={{paddingLeft: 4}}
                               onPress={() => this.setModal(true, item.label, item.tip)}/>
                  </View>
                  <Text style={styles.detailDataText}>
                    {value}
                  </Text>
                </View>
              )
            })
          }
        </View>
        {
          ext_stores && ext_stores.map((item, key) => {
            const {
              name, gmv, gmv_name, total_order_num_name, total_order_num, valid_order_num_name,
              valid_order_num, avg_gmv_name, avg_gmv, valid_user_num_name,
              valid_user_num, new_user_num_name, new_user_num, old_user_num_name,
              old_user_num
            } = item
            return (
              <View key={key}>
                <Text style={[styles.platformName, {paddingTop: 15, paddingBottom: 10}]}>
                  {name}
                </Text>
                <View style={styles.detailWrap}>
                  <View style={styles.detailLeftWrap}>
                    <Text style={styles.detailLeftLabel}>{gmv_name}</Text>
                    <Text style={[styles.platformName, {marginTop: 4}]}>{gmv}</Text>
                  </View>
                  <View style={styles.detailRightWrap}>
                    <View style={styles.detailItemWrap}>
                      <Text style={styles.detailItemLabel}>{total_order_num_name}</Text>
                      <Text style={styles.detailItemValue}>{total_order_num}</Text>
                    </View>
                    <View style={styles.detailItemWrap}>
                      <Text style={styles.detailItemLabel}>{valid_order_num_name}</Text>
                      <Text style={styles.detailItemValue}>{valid_order_num}</Text>
                    </View>
                    <View style={styles.detailItemWrap}>
                      <Text style={styles.detailItemLabel}>{avg_gmv_name}</Text>
                      <Text style={styles.detailItemValue}>{avg_gmv}</Text>
                    </View>
                    <View style={styles.detailItemWrap}>
                      <Text style={styles.detailItemLabel}>{valid_user_num_name}</Text>
                      <Text style={styles.detailItemValue}>{valid_user_num}</Text>
                    </View>
                    <View style={styles.detailItemWrap}>
                      <Text style={styles.detailItemLabel}>{new_user_num_name}</Text>
                      <Text style={styles.detailItemValue}>{new_user_num}</Text>
                    </View>
                    <View style={styles.detailItemWrap}>
                      <Text style={styles.detailItemLabel}>{old_user_num_name}</Text>
                      <Text style={styles.detailItemValue}>{old_user_num}</Text>
                    </View>
                  </View>
                </View>
                <If condition={key === ext_stores.length - 1}>
                  <View style={{paddingBottom: 15}}/>
                </If>
              </View>
            )
          })
        }
      </View>
    )
  }
  renderNotMoreInfo = () => {
    return (
      <Text style={styles.notHasMoreInfo}>
        没有更多了~
      </Text>
    )
  }
  renderTip = () => {
    const {visible, title, desc} = this.state
    return (
      <AlertModal visible={visible}
                  title={title}
                  desc={desc}
                  actionText={'知道了'}
                  onPress={() => this.setModal(false, '', '')}/>
    )
  }
  renderCustomerDate = () => {
    const {custom_date_visible} = this.state
    return (
      <CustomDateComponent visible={custom_date_visible}
                           getData={(startTime, endTime) => {
                             this.setTime(startTime, endTime)
                             this.getData(startTime, endTime)
                           }}
                           onClose={() => this.setState({custom_date_visible: false})}/>
    )
  }

  render() {
    const {platform_data} = this.state
    return (
      <View style={{marginHorizontal: 12}}>
        {this.renderBtn()}
        {
          platform_data && platform_data.map((item, index) => {
            return this.renderDetailData(item, index)
          })
        }
        {this.renderNotMoreInfo()}
        {this.renderTip()}
        {this.renderCustomerDate()}
      </View>
    );
  }
}
