import React, {PureComponent} from 'react'
import {Image, StyleSheet, Text, View} from "react-native";
import PropTypes from 'prop-types'
import pxToDp from "../../util/pxToDp";

export default class Rate extends PureComponent {
  static propTypes = {
    showRecord: PropTypes.bool,
    maxRecord: PropTypes.number,
    currRecord: PropTypes.number,
    starNum: PropTypes.number,
    style: PropTypes.any
  }
  static defaultProps = {
    starNum: 5,
    currRecord: 0,
    maxRecord: 5,
    showRecord: false
  }

  renderLightStar(num) {
    let items = []
    for (let i = 0; i < num; i++) {
      items.push(<Image source={require('../../img/Goods/xingxingliang_.png')} style={styles.star} key={`light_${i}`}/>)
    }
    return items
  }

  renderDarkStar(num) {
    let items = []
    for (let i = 0; i < num; i++) {
      items.push(<Image source={require('../../img/Goods/xingxinghui_.png')} style={styles.star} key={`dark_${i}`}/>)
    }
    return items
  }

  render() {
    let light_num = Math.floor(this.props.currRecord / this.props.maxRecord * this.props.starNum)
    let dark_num = this.props.starNum - light_num
    return (
      <View style={[styles.box, this.props.style]}>
        {this.renderLightStar(light_num)}
        {this.renderDarkStar(dark_num)}
        <If condition={this.props.showRecord}>
          <Text style={styles.record_text}>（{this.props.currRecord}分）</Text>
        </If>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  box: {
    flexDirection: 'row'
  },
  star: {
    width: pxToDp(32),
    height: pxToDp(32)
  },
  record_text: {
    color: '#fd5b1b',
    fontSize: pxToDp(30)
  }
})
