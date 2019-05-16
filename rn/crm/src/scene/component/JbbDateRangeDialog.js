import React from "react";
import ConfirmDialog from "./ConfirmDialog";
import {Calendar} from "react-native-calendars";
import {TouchableOpacity, View} from "react-native";
import moment from "moment";

export default class JbbDateRangeDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      start: '',
      end: '',
      visible: false,
      markedDates: {}
    }
  }
  
  componentWillReceiveProps (nextProps: Readonly<P>, nextContext: any): void {
    const self = this
    this.setState({
      start: nextProps.start,
      end: nextProps.end,
      visible: nextProps.visible ? nextProps.visible : false,
      markedDates: self.getMarkedDates(nextProps.start, nextProps.end)
    })
  }
  
  handlePressChild () {
    console.log('press child')
    if (this.props.beforeVisible) {
      if (!this.props.beforeVisible()) {
        return
      }
    }
    this.setState({visible: true})
  }
  
  getMarkedDates (start, end) {
    let markedDates = {}
    let mStart = moment(start, 'YYYY-MM-DD')
    let mEnd = moment(end, 'YYYY-MM-DD')
    let diffDays = mEnd.diff(mStart, 'days')
    let mDate = mStart
    
    markedDates[start] = {startingDay: true, color: 'green', selected: true}
    for (let i = 0; i < diffDays; i++) {
      let date = mDate.add(1, 'days').format('YYYY-MM-DD')
      mDate = moment(date, 'YYYY-MM-DD')
      markedDates[date] = {color: 'green', selected: true}
    }
    markedDates[end] = {endingDay: true, color: 'green', selected: true}
    
    return markedDates
  }
  
  onCancel () {
    this.setState({visible: false})
    this.props.onCancel && this.props.onCancel()
  }
  
  onConfirm () {
    let responseData = {
      start: this.state.start,
      end: this.state.end
    }
    this.props.onConfirm && this.props.onConfirm(responseData)
    this.setState({visible: false})
  }
  
  onDayPress (day) {
    let {start, markedDates} = this.state
    
    if (markedDates && Object.keys(markedDates).length >= 2) {
      markedDates = {}
    }
    
    if (markedDates && Object.keys(markedDates).length === 0) {
      markedDates[day.dateString] = {startingDay: true, color: 'green', selected: true}
      this.setState({start: day.dateString, markedDates})
    } else if (markedDates && Object.keys(markedDates).length === 1) {
      markedDates = this.getMarkedDates(start, day.dateString)
      this.setState({end: day.dateString, markedDates})
    }
  }
  
  renderDialog () {
    return (
      <ConfirmDialog
        visible={this.state.visible}
        onClickCancel={() => this.onCancel()}
        onClickConfirm={() => this.onConfirm()}
      >
        <Calendar
          monthFormat={'yyyy年MM月'}
          // Collection of dates that have to be colored in a special way. Default = {}
          markedDates={this.state.markedDates}
          // Date marking style [simple/period/multi-dot/custom]. Default = 'simple'
          markingType={'period'}
          // Handler which gets executed on day press. Default = undefined // res {year: 2019, month: 5, day: 23, timestamp: 1558569600000, dateString: "2019-05-23"}
          onDayPress={(day) => this.onDayPress(day)}
        />
      </ConfirmDialog>
    );
  }
  
  render () {
    const {children} = this.props
    
    return children ? (
      <View>
        {this.renderDialog()}
        
        <TouchableOpacity
          onPress={() => this.handlePressChild()}
          style={this.props.childrenTouchableStyle}
        >
          {this.props.children}
        </TouchableOpacity>
      </View>
    ) : this.renderDialog()
  }
}

