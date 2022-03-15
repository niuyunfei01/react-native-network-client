import React from "react";
import ConfirmDialog from "./ConfirmDialog";
import {Calendar} from "react-native-calendars";
import {TouchableOpacity, View} from "react-native";
import color from '../../widget/color'
import dayjs from "dayjs";

export default class JbbDateRangeDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      start: '',
      end: '',
      visible: false,
      markedDates: {}
    }
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    const self = this
    this.setState({
      start: nextProps.start,
      end: nextProps.end,
      visible: nextProps.visible ? nextProps.visible : false,
      markedDates: self.getMarkedDates(nextProps.start, nextProps.end)
    })
  }

  handlePressChild() {
    if (this.props.beforeVisible) {
      if (!this.props.beforeVisible()) {
        return
      }
    }
    this.setState({visible: true})
  }

  getMarkedDates(start, end) {
    let markedDates = {}
    if (start === end) {
      markedDates[start] = {endingDay: true, startingDay: true, selected: true, color: color.theme}
      return markedDates
    }

    let mStart = dayjs(start, 'YYYY-MM-DD')
    let mEnd = dayjs(end, 'YYYY-MM-DD')
    let diffDays = mEnd.diff(mStart, 'days')
    let mStartDate = mStart
    let mEndDate = mEnd

    if (diffDays < 0) {
      mStartDate = mEnd
      mEndDate = mStart
    }

    markedDates[mStartDate.format('YYYY-MM-DD')] = {startingDay: true, selected: true, color: color.theme}
    for (let i = 0; i < Math.abs(diffDays); i++) {
      let date = mStartDate.add(1, 'days').format('YYYY-MM-DD')
      mStartDate = dayjs(date, 'YYYY-MM-DD')
      markedDates[date] = {selected: true, color: color.theme}
    }
    markedDates[mEndDate.format('YYYY-MM-DD')] = {endingDay: true, selected: true, color: color.theme}

    return markedDates
  }

  onCancel() {
    this.setState({visible: false})
    this.props.onCancel && this.props.onCancel()
  }

  onConfirm() {
    let {start, end} = this.state
    let mStart = dayjs(start, 'YYYY-MM-DD')
    let mEnd = dayjs(end, 'YYYY-MM-DD')
    let diffDays = mEnd.diff(mStart, 'days')
    let responseData = {}
    if (diffDays > 0) {
      responseData = {start, end}
    } else {
      responseData = {start: end, end: start}
    }

    this.props.onConfirm && this.props.onConfirm(responseData)
    this.setState({visible: false})
  }

  onDayPress(day) {
    let {start, markedDates} = this.state

    if (markedDates && Object.keys(markedDates).length >= 2) {
      markedDates = {}
    }

    if (markedDates && Object.keys(markedDates).length === 0) {
      markedDates[day.dateString] = {startingDay: true, endingDay: true, selected: true, color: color.theme}
      this.setState({start: day.dateString, end: day.dateString, markedDates})
    } else if (markedDates && Object.keys(markedDates).length === 1) {
      markedDates = this.getMarkedDates(start, day.dateString)
      this.setState({end: day.dateString, markedDates})
    }

  }

  renderDialog() {
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

  render() {
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

