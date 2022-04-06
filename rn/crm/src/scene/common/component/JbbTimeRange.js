import React from 'react'
import ConfirmDialog from "./ConfirmDialog";
import PropTypes from 'prop-types'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import JbbButton from "./JbbButton";
import JbbDatePicker from "./JbbDatePicker";
import Swipeout from 'react-native-swipeout'
import dayjs from "dayjs";

/**
 * Demo <JbbPicker> ... </JbbPicker>
 */

export default class JbbTimeRange extends React.Component {
  static propTypes = {
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      ranges: []
    }
  }

  componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
    this.setState({ranges: nextProps.value})
  }

  onConfirm() {
    this.setState({visible: false})
    this.props.onConfirm && this.props.onConfirm(this.state.ranges)
  }

  onCancel() {
    this.props.onCancel && this.props.onCancel()
    this.setState({visible: false})
  }

  onPushNewItem() {
    let ranges = this.state.ranges
    ranges.push({start: '', end: ''})
    this.setState({ranges})
  }

  onRemoveItem(idx) {
    let ranges = this.state.ranges
    ranges.splice(idx, 1)
    this.setState({ranges})
  }

  onSelectTime(idx, pos, time) {
    let ranges = this.state.ranges
    ranges[idx][pos] = time ? dayjs(time).format('HH:mm') : '00:00'
    this.setState({ranges})
  }

  render(): React.ReactNode {
    return (
        <View>
          <ConfirmDialog
              visible={this.state.visible}
              onClickCancel={() => this.onCancel()}
              onClickConfirm={() => this.onConfirm()}
              onRequestClose={() => this.setState({visible: false})}
          >
            <For of={this.state.ranges} each="range" index="idx">
              <Swipeout right={[{text: '删除', onPress: () => this.onRemoveItem(idx)}]} key={idx}>
                <View style={styles.rangeItem}>
                  <JbbDatePicker onConfirm={(time) => this.onSelectTime(idx, 'start', time)}>
                    <View style={styles.itemTime}>
                      <Text>{range.start ? range.start : '请选择开始时间'} </Text>
                    </View>
                  </JbbDatePicker>
                  <View style={styles.delimiter}>
                    <Text>~</Text>
                  </View>
                  <JbbDatePicker onConfirm={(time) => this.onSelectTime(idx, 'end', time)}>
                    <View style={styles.itemTime}>
                      <Text>{range.end ? range.end : '请选择结束时间'} </Text>
                    </View>
                  </JbbDatePicker>
                </View>
              </Swipeout>
            </For>

            <JbbButton
                text={'添加'}
                onPress={() => this.onPushNewItem()}
            />
          </ConfirmDialog>

          <TouchableOpacity onPress={() => this.setState({visible: true})}>
            <View pointerEvents="none">
              {this.props.children}
            </View>
          </TouchableOpacity>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  rangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40
  },
  delimiter: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
