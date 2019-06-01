import React from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import withNavigation from "react-navigation/src/views/withNavigation";
import pxToDp from "../../../util/pxToDp";
import color from "../../../widget/color";
import {connect} from "react-redux";
import Config from '../../../config'
import Mapping from "../../../Mapping";
import HttpUtils from "../../../util/http";

function mapStateToProps (state) {
  const {global} = state;
  return {global};
}

class NextSchedule extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      schedule: {
        weather: '',
        schedules: []
      }
    }
  }
  
  componentDidMount (): void {
    this.fetchSchedule()
  }
  
  fetchSchedule () {
    const self = this
    const uri = `/api/user_today_schedule?access_token=${self.props.global.accessToken}`
    HttpUtils.get.bind(this.props)(uri).then(res => {
      self.setState({schedule: res})
    })
  }
  
  renderWeather () {
    if (!this.state.schedule.weather) {
      return
    }
    
    let weather = this.state.schedule.weather
    if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.SUN, weather)) {
      return <Image source={require('../../../img/weather_sun.png')} style={styles.weatherImg}/>
    } else if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.CLOUD, weather)) {
      return <Image source={require('../../../img/weather_cloud.png')} style={styles.weatherImg}/>
    } else if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.RAIN, weather)) {
      return <Image source={require('../../../img/weather_rain.png')} style={styles.weatherImg}/>
    } else if (Mapping.Tools.ValueEqMapping(Mapping.Common.WEATHER.SNOW, weather)) {
      return <Image source={require('../../../img/weather_sun.png')} style={styles.weatherImg}/>
    } else {
      return
    }
  }
  
  render () {
    if (!this.state.schedule.schedules.length) {
      return null
    }
    
    return (
      <View style={styles.container}>
        <View style={styles.title}>
          <Text style={styles.mainTitle}>今天安排</Text>
          <TouchableOpacity onPress={() => this.props.navigation.navigate(Config.ROUTE_WORKER_SCHEDULE)}>
            <View>
              <Text style={styles.link}>查看全部>></Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.scheduleContainer}>
          <View>
            <For of={this.state.schedule.schedules} each='item' index='idx'>
              <Text key={idx}>{item}</Text>
            </For>
          </View>
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