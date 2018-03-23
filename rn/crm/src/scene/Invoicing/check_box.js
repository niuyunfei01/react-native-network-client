import React, {PropTypes} from 'react'
import {
  StyleSheet,
} from 'react-native'
import {
  Cells,
  Cell,
  CellHeader,
  CellBody,
  CellFooter,
  CellText,
  Icon,
} from "../../weui/index";


import xor from 'lodash/xor'
import $V from '../../weui/variable'
import pxToDp from "../../util/pxToDp";

const styles = StyleSheet.create({
  checkbox: {
    fontSize: 23,
    marginRight: $V.baseFontSize * 0.35,
  }
})

const CheckboxCells = (props) => {
  const {
    value,
    onChange,
    style,
    options,
    ...others
  } = props

  const inArray = (v) =>
      value.filter((a) => a === v).length

  return (
      <Cells style={style} {...others} >
        {options.map((option, idx) =>
            <Cell customStyle={{marginLeft:0,paddingLeft:pxToDp(30)}} key={idx} onPress={() => onChange(xor(value, [option.value]))}>
              <CellHeader>
                <CellText>{option.label || option.value}</CellText>
              </CellHeader>
              <CellBody/>
              <CellFooter>
                <Icon name={inArray(option.value) ? 'success' : 'circle'} style={styles.checkbox}/>
              </CellFooter>
            </Cell>
        )}
      </Cells>
  )
};

CheckboxCells.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
  style: Icon.propTypes.style,
};

export default CheckboxCells
