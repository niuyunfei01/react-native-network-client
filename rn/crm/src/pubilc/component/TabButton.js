import React from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import PropTypes from 'prop-types'
import color from "../../pubilc/styles/colors";
import pxToDp from "../../util/pxToDp";

export default class TabButton extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    labelKey: PropTypes.string,
    valueKey: PropTypes.string,
    defaultIndex: PropTypes.number,
    containerStyle: PropTypes.any,
    disableBackgroundTint: PropTypes.string
  }

  static defaultProps = {
    labelKey: 'label',
    valueKey: 'value',
    defaultIndex: 0,
    containerStyle: {}
  }

  constructor(props) {
    super(props)
    this.state = {
      tabIndex: this.props.defaultIndex
    }
  }

  onClickTab(item, idx) {
    this.setState({tabIndex: idx})
    this.props.onClick(item[this.props.valueKey], item, idx)
  }

  render() {
    let disableTabStyle = {
      backgroundColor: this.props.disableBackgroundTint ? this.props.disableBackgroundTint : '#fff'
    }

    return (
        <View style={[styles.container, this.props.containerStyle]}>
          <For each="item" index="idx" of={this.props.data}>
            <TouchableOpacity key={idx} onPress={() => this.onClickTab(item, idx)} style={{flex: 1}}>
              <View
                  key={idx}
                  style={[idx == this.state.tabIndex ? styles.activeTab : disableTabStyle, styles.tab]}
              >
                <Text
                    style={[idx == this.state.tabIndex ? styles.activeText : styles.defaultText, styles.text]}
                >
                  {item[this.props.labelKey]}
                </Text>
              </View>
            </TouchableOpacity>
          </For>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: pxToDp(70)
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: pxToDp(1),
    borderColor: color.fontGray,
    flex: 1,
    height: pxToDp(70)
  },
  activeTab: {
    backgroundColor: color.theme
  },
  text: {
    fontSize: pxToDp(25),
    fontWeight: 'bold'
  },
  activeText: {
    color: '#fff'
  },
  defaultText: {
    color: '#000'
  }
})
