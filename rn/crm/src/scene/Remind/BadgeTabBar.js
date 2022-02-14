import pxToDp from "../../util/pxToDp";
import React from 'react'
import ReactNative from 'react-native'
import IconBadge from '../../widget/IconBadge';
import PropTypes from 'prop-types';

const {Component} = React;

const {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ViewPropTypes,
  Animated
} = ReactNative;

const Button = (props) => {
  return <TouchableOpacity {...props}>
    {props.children}
  </TouchableOpacity>;
};

//TODO 此组件以作废
export default class BadgeTabBar extends Component {

  static propTypes = {
    goToPage: PropTypes.func,
    activeTab: PropTypes.number,
    tabs: PropTypes.array,
    backgroundColor: PropTypes.string,
    activeTextColor: PropTypes.string,
    inactiveTextColor: PropTypes.string,
    textStyle: Text.propTypes.style,
    tabStyle: ViewPropTypes.style,
    renderTab: PropTypes.func,
    underlineStyle: ViewPropTypes.style,
    count: PropTypes.object,
    countIndex: PropTypes.array
  }
  static defaultProps = {
    activeTextColor: 'navy',
    inactiveTextColor: 'black',
    backgroundColor: null,
  }

  constructor(props) {
    super(props)
  }

  renderTab(name, page, isTabActive, onPressHandler, props) {
    const {activeTextColor, inactiveTextColor, textStyle, count, countIndex, tabStyle} = props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';
    let indexKey = countIndex[page];
    let countData = count ? count[indexKey] : 0;

    let total = !countData ? 0 : countData['total'];
    let quick = !countData ? 0 : countData['quick'];
    let label = total == 0 ? name : name + "(" + total + ")";

    return <Button
      style={styles.flexOne}
      key={indexKey}
      accessible={true}
      accessibilityLabel={name}
      accessibilityTraits='button'
      onPress={() => onPressHandler(page)}>
      <IconBadge
        MainElement={
          <View style={[styles.tab, tabStyle,]}>
            <Text style={[{color: textColor, fontWeight,}, textStyle,]}>
              {label}
            </Text>
          </View>
        }
        BadgeElement={
          <Text style={{color: '#FFFFFF', fontSize: pxToDp(18)}}>{quick > 99 ? '99+' : quick}</Text>
        }
        MainViewStyle={
          [styles.flexOne]
        }
        Hidden={quick == 0}
        IconBadgeStyle={
          {width: 20, height: 15, top: 2, right: 1}
        }
      />
    </Button>
  }

  render() {
    let _this = this;
    const containerWidth = _this.props.containerWidth;
    const numberOfTabs = _this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };

    // const left = _this.props.scrollValue.interpolate({
    //   inputRange: [0, 1,], outputRange: [0, containerWidth / numberOfTabs,],
    // });
    return (
      <View style={[styles.tabs, {backgroundColor: _this.props.backgroundColor,}, _this.props.style,]}>
        {_this.renderTabs()}
        <Animated.View style={[tabUnderlineStyle, {}, _this.props.underlineStyle,]}/>
      </View>
    );
  }

  renderTabs() {
    let _this = this
    let tabs = [];
    let propTabs = this.props.tabs;
    propTabs.map((name, page) => {
      const isTabActive = _this.props.activeTab === page;
      const renderTab = _this.props.renderTab || _this.renderTab;
      tabs.push(renderTab(name, page, isTabActive, _this.props.goToPage, _this.props));
    })
    return tabs;
  }
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  flexOne: {
    flex: 1,
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
});

