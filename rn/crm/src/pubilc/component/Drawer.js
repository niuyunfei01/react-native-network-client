/**
 * @Author: small_axe
 * @描述: 抽屉动画
 * @Date: 2021/05/26
 */

import React, {useCallback, useEffect, useState} from 'react';
import {Animated, Dimensions, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';

const WINDOW = Dimensions.get('window');

const Drawer = props => {
  const {visible, duration, onShow, dismiss, menuPosition, distance} = props;

  const [animateValue, setAnimateValue] = useState(new Animated.Value(0));


  useEffect(() => {
    if (visible) {
      _onShow();
    } else {
      _dismiss();
    }
  }, [_onShow, visible, _dismiss]);

  const _onShow = () => {
    if (onShow) {
      onShow();
    }
    animate(1);
  };

  const _dismiss = () => {
    if (dismiss) {
      dismiss();
    }
    animate(0);
  };

  // 添加动画效果
  const animate = toValue => {
    Animated.timing(animateValue, {
      toValue: toValue,
      duration: duration,
      useNativeDriver: true,
      friction: 9,
    }).start();
  };

  // 判断position从不同位置唤出抽屉
  const getPosition = useCallback(() => {
    switch (menuPosition) {
      case 'left':
        return {
          translateX: animateValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-WINDOW.width, 0],
          }),
        };
      case 'right':
        return {
          translateX: animateValue.interpolate({
            inputRange: [0, 1],
            outputRange: [WINDOW.width, 0],
          }),
        };
      case 'top':
        return {
          translateY: animateValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-WINDOW.height, 0],
          }),
        };
      case 'bottom':
        return {
          translateY: animateValue.interpolate({
            inputRange: [0, 1],
            outputRange: [WINDOW.height, 0],
          }),
        };
      default:
        return {
          translateX: animateValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-WINDOW.width, 0],
          }),
        };
    }
  }, [animateValue, menuPosition]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: distance,
          transform: [getPosition()],
        },
      ]}>
      {props.children}
    </Animated.View>
  );
};

Drawer.propTypes = {
  visible: PropTypes.bool, // 控制抽屉显影状态
  duration: PropTypes.number, // 动画持续时间
  onShow: PropTypes.func, // 显示
  dismiss: PropTypes.func, // 影藏
  menuPosition: PropTypes.oneOf(['left', 'right', 'top', 'bottom']), // 抽屉出现的位置
};

Drawer.defaultProps = {
  visible: false,
  duration: 500,
  onShow: () => {
  },
  dismiss: () => {
  },
  menuPosition: 'left',
  distance: 100,
};

module.exports = Drawer;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
  },
});

