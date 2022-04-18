import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet,} from 'react-native'
import {Icon} from '../Icon'
import {Cell, CellBody, Cells, CellText} from '../Cell'

const styles = StyleSheet.create({
  radio: {
    fontSize: 16,
  }
})

const RadioCells = (props) => {
  const {
    value,
    options,
    onChange,
    style,
    cellStyle,
    cellTextStyle,
    ...others
  } = props

  return (
    <Cells style={style} {...others}>
      {options.map((option, idx) =>
        <Cell style={cellStyle} key={idx} onPress={() => onChange(option.value)}>
          <CellBody>
            <CellText style={cellTextStyle}>{option.label || option.value}</CellText>
          </CellBody>
          {value === option.value ? (
            <Icon name="success_no_circle" style={styles.radio}/>
          ) : null}
        </Cell>
      )}
    </Cells>
  )
}

RadioCells.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
  style: Icon.propTypes.style,
  cellTextStyle: Icon.propTypes.style,
  cellStyle: Icon.propTypes.style,
}

export default RadioCells
