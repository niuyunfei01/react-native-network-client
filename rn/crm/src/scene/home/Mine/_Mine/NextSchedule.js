import React from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {withNavigation} from '@react-navigation/compat';
import pxToDp from "../../../../util/pxToDp";
import color from "../../../../widget/color";
import {connect} from "react-redux";
import Config from '../../../../pubilc/common/config'
import Mapping from "../../../../pubilc/Mapping";
import HttpUtils from "../../../../pubilc/util/http";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

function mapStateToProps(state) {
  const {global} = state;
  return {global};
}

class NextSchedule extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      schedule: {
        weather: '',
        schedules: []
      }
    }
  }

  componentDidMount(): void {
    this.fetchSchedule()
  }

  fetchSchedule() {
    const self = this
    const uri = `/api/user_today_schedule?access_token=${self.props.global.accessToken}`
    HttpUtils.get.bind(this.props)(uri).then(res => {
      self.setState({schedule: res})
    })
  }

  renderWeather() {
    if (!this.state.schedule.weather) {
      return
    }

    let weather = this.state.schedule.weather
    if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.SUN, weather)) {
      return <FontAwesome5 name={'sun'} style={{fontSize:40}} />
    } else if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.CLOUD, weather)) {
      return <FontAwesome5 name={'cloud'} style={{fontSize:40}} />
    } else if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.RAIN, weather)) {
      return <FontAwesome5 name={'cloud-rain'} style={{fontSize:40}} />
    } else if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.SNOW, weather)) {
      return <FontAwesome5 name={'sun'} style={{fontSize:40}} />
    } else {

    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.title}>
          <Text style={styles.mainTitle}>今天安排 </Text>
          <TouchableOpacity onPress={() => this.props.navigation.navigate(Config.ROUTE_WORKER_SCHEDULE)}>
            <View>
              <Text style={styles.link}>查看全部> </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.scheduleContainer}>
          {this.state.schedule.schedules.length ? (
            <View>
              <For of={this.state.schedule.schedules} each='item' index='idx'>
                <Text key={idx}>{item} </Text>
              </For>
            </View>
          ) : (
            <View>
              <Text>未知今日安排 </Text>
            </View>
          )}

          {this.renderWeather()}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: pxToDp(20),
    backgroundColor: '#fff',
    paddingVertical: pxToDp(10)
  },
  scheduleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: pxToDp(20)
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: pxToDp(20),
    alignItems: 'center'
  },
  mainTitle: {
    fontSize: pxToDp(30),
    fontWeight: 'bold'
  },
  link: {
    fontSize: pxToDp(20),
    color: color.theme
  },
  weatherImg: {
    width: 40,
    height: 40
  }
})

export default withNavigation(connect(mapStateToProps)(NextSchedule))
