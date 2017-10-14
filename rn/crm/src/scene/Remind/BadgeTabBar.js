const React = require('react');
const ReactNative = require('react-native');

import IconBadge from '../../widget/IconBadge';

const {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableNativeFeedback,
  TouchableOpacity
} = ReactNative;

const ButtonIOS = (props) => {
  return <TouchableOpacity {...props}>
    {props.children}
  </TouchableOpacity>;
};

const ButtonAndroid = (props) => {
  return <TouchableNativeFeedback
    delayPressIn={0}
    background={TouchableNativeFeedback.SelectableBackground()}
    {...props}>
    {props.children}
  </TouchableNativeFeedback>;
};


const BadgeTabBar = React.createClass({
  propTypes: {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
    backgroundColor: React.PropTypes.string,
    activeTextColor: React.PropTypes.string,
    inactiveTextColor: React.PropTypes.string,
    textStyle: Text.propTypes.style,
    tabStyle: View.propTypes.style,
    renderTab: React.PropTypes.func,
    underlineStyle: View.propTypes.style,
  },

  getDefaultProps() {
    return {
      activeTextColor: 'navy',
      inactiveTextColor: 'black',
      backgroundColor: null,
    };
  },

  renderTabOption(name, page) {
  },

  renderTab(name, page, isTabActive, onPressHandler) {
    const {activeTextColor, inactiveTextColor, textStyle,} = this.props;
    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return <IconBadge
      MainElement={
        <ButtonAndroid
          style={styles.flexOne}
          key={page}
          accessible={true}
          accessibilityLabel={name}
          accessibilityTraits='button'
          onPress={() => onPressHandler(page)}>
          <View style={[styles.tab, this.props.tabStyle,]}>
            <Text style={[{color: textColor, fontWeight,}, textStyle,]}>
              {name}
            </Text>
          </View>
        </ButtonAndroid>
      }
      BadgeElement={
        <Text style={{color: '#FFFFFF'}}>1</Text>
      }
      MainViewStyle={
        [styles.flexOne]
      }
      IconBadgeStyle={
        {width: 20, height: 15, top: 2, right: 1}
      }
    />;
  },

  render() {
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };

    const left = this.props.scrollValue.interpolate({
      inputRange: [0, 1,], outputRange: [0, containerWidth / numberOfTabs,],
    });
    return (
      <View style={[styles.tabs, {backgroundColor: this.props.backgroundColor,}, this.props.style,]}>
        {this.props.tabs.map((name, page) => {
          const isTabActive = this.props.activeTab === page;
          const renderTab = this.props.renderTab || this.renderTab;
          return renderTab(name, page, isTabActive, this.props.goToPage);
        })}
        <Animated.View style={[tabUnderlineStyle, {left,}, this.props.underlineStyle,]}/>
      </View>
    );
  },
});

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

module.exports = BadgeTabBar;
