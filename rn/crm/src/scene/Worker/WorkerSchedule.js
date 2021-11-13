import React from "react";
import {Image, StyleSheet, Text, View} from "react-native";
import {connect} from "react-redux";
import {Agenda} from 'react-native-calendars';
import moment from "moment";
import HttpUtils from "../../util/http";
import tool from "../../common/tool";
import TimeUtil from "../../util/TimeUtil";
import pxToDp from "../../util/pxToDp";
import Mapping from "../../Mapping";
import color from "../../widget/color";
import _ from 'lodash'

moment.locale('zh');

function mapStateToProps (state) {
  const {global} = state;
  return {global};
}

class WorkerSchedule extends React.Component {

  constructor (props) {
    super(props);
    const store = tool.store(this.props.global)
    this.state = {
      storeId: store.id,
      today: moment().format('YYYY-MM-DD'),
      items: {}
    }
  }

  render () {
    return (
      <Agenda
        monthFormat={'yyyy年MM月'}
        items={this.state.items}
        onDayPress={this.loadMonthEvents.bind(this)}
        selected={this.state.today}
        renderItem={this.renderItem.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        renderDay={this.renderDay.bind(this)}
      />
    );
  }

  componentDidMount () {
    const today = moment(new Date()).format('YYYY-MM-DD')
    this.loadMonthEvents({dateString: today})
  }

  loadMonthEvents (day) {
    const self = this
    const accessToken = this.props.global.accessToken
    HttpUtils.get.bind(this.props)(`/api/worker_schedule_month_info?access_token=${accessToken}`, {
      storeId: this.state.storeId,
      day: day.dateString
    }).then(res => {
      self.setState({items: res})
    })
  }

  renderItem (item) {
    return (
      <View style={[styles.item]}>
        <View style={{flex: 1}}>
          <If condition={item.work_day && item.work_day.is_voc == 1}>
            <Text style={{color: color.red, fontSize: 13}}>高峰日</Text>
          </If>
          <If condition={item.schedules && item.schedules.length}>
            <For of={item.schedules} each="schedule" index="idx">
              <Text>{schedule.slot_label}: {_.map(schedule.users, function (user) {
                return user.username + (user.is_leader ? '(负责人)' : '') + '，'
              })}</Text>
            </For>
          </If>
        </View>
        <View style={{width: 60, justifyContent: 'space-between', alignItems: 'flex-end'}}>
          {this.renderWeather(item)}
          <If condition={item.work_day && item.work_day.expect_orders}>
            <Text style={{fontSize: 12}}>预计{item.work_day.expect_orders}单</Text>
          </If>
        </View>
      </View>
    );
  }

  renderWeather (item) {
    if (!item.work_day || !item.work_day.weather) {
      return
    }

    let weather = item.work_day.weather
    if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.SUN, weather)) {
      return <Image source={require('../../img/weather_sun.png')} style={styles.weatherImg}/>
    } else if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.CLOUD, weather)) {
      return <Image source={require('../../img/weather_cloud.png')} style={styles.weatherImg}/>
    } else if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.RAIN, weather)) {
      return <Image source={require('../../img/weather_rain.png')} style={styles.weatherImg}/>
    } else if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.SNOW, weather)) {
      return <Image source={require('../../img/weather_sun.png')} style={styles.weatherImg}/>
    } else {
      return <View/>
    }
  }

  renderEmptyDate () {
    return (
      <View style={styles.emptyDate}><Text>暂无工作安排</Text></View>
    );
  }

  rowHasChanged (r1, r2) {
    return r1.day !== r2.day;
  }

  renderDay (day, item) {
    let isVoc = item && item.work_day.is_voc == 1
    return (
      <View style={[styles.day, isVoc ? styles.dayIsVoc : null]}>
        <If condition={day}>
          <Text
            allowFontScaling={false}
            style={styles.dayNum}>
            {day ? moment(new Date(day.dateString)).format('MM') : '未知'}
          </Text>
          <Text
            allowFontScaling={false}
            style={styles.dayNum}>
            {day ? moment(new Date(day.dateString)).format('DD') : '未知'}
          </Text>
          <Text
            allowFontScaling={false}
            style={styles.dayText}>
            {day ? TimeUtil.getWeek(new Date(day.dateString)) : '未知'}
          </Text>
        </If>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
    borderTopWidth: pxToDp(1),
    borderTopColor: '#eee'
  },
  dayIsVoc: {
    backgroundColor: color.orange
  },
  day: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 18
  },
  dayNum: {
    fontSize: 28,
    fontWeight: '200',
    color: '#7a92a5'
  },
  dayText: {
    fontSize: 14,
    fontWeight: '300',
    color: '#7a92a5',
    marginTop: -5,
    backgroundColor: 'rgba(0,0,0,0)'
  },
  weatherImg: {
    width: 40,
    height: 40
  }
});

export default connect(mapStateToProps)(WorkerSchedule)
