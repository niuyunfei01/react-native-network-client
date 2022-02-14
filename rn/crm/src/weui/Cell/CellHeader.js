import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, View, ViewPropTypes} from 'react-native'
import $V from '../variable'

const styles = StyleSheet.create({
  cellHeader: {
    marginRight: 5,
  },
  image: {
    width: 24,
    height: 24,
    marginRight: 5
  },
  error: {
    color: $V.globalWarnColor
  }
})

const CellHeader = (props) => {
  const {error, children, style, ...others} = props
  const childrenWithProps = React.Children.map(children, child => {
    if (!child) {
      return child;
    }
    if (child.type.displayName === 'Image') {
      return React.cloneElement(child, {style: [styles.image, child.props.style]})
    }
    if (error && child.type.name === 'Label') {
      return React.cloneElement(child, {style: [child.props.style, styles.error]})
    }
    return child
  });
  return <View style={[styles.cellHeader, style]} {...others}>{childrenWithProps}</View>
}
CellHeader.propTypes = {
  error: PropTypes.bool,
  children: PropTypes.node,
  style: ViewPropTypes.style,
  others: PropTypes.object
}

export default CellHeader
