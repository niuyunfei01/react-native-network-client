import React from 'react';import PropTypes from 'prop-types';

const FlexItem = ({ component, children, style, ...others }) =>
  <component style={[{ flex: 1 }, style]} {...others}>{children}</component>

FlexItem.propTypes = {
  component: PropTypes.node.isRequired,
  style: PropTypes.any,
  children: PropTypes.node,
}

export default FlexItem
