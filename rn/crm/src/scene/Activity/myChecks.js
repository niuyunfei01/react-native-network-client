import React from 'react';import PropTypes from 'prop-types';
import {
  StyleSheet,
} from 'react-native'
import { Icon } from '../../weui/Icon'
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellText,
} from "../../weui/index";
import xor from 'lodash/xor'
import $V from '../../weui/variable'

const styles = StyleSheet.create({
  checkbox: {
    fontSize: 23,
    marginRight: $V.baseFontSize * 0.35,
  }
})

const CheckboxCells = (props) => {
  const {
    values,
    onChange,
    style,
    options,
    label,
    value,
    ...others,
  } = props

  const inArray = (v) =>
      values.filter((a) => a === v).length

  return (
      <Cells style={style} {...others}>
        {options.map((option, idx) =>
            <Cell key={idx} onPress={() => onChange(xor(values, [option[value]]))}>
              <CellHeader>
                <Icon name={inArray(option[value]) ? 'success' : 'circle'} style={styles.checkbox} />
              </CellHeader>
              <CellBody>
                <CellText>{option[label] || option[value]}</CellText>
              </CellBody>
            </Cell>
        )}
      </Cells>
  )
};

CheckboxCells.propTypes = {
  values: PropTypes.any,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
  style: Icon.propTypes.style,
  label:PropTypes.any,
  value:PropTypes.any
};

export default CheckboxCells