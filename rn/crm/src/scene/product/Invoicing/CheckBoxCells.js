import React from 'react';
import PropTypes from 'prop-types';
import {StyleSheet,} from 'react-native'
import {Cell, CellBody, CellFooter, CellHeader, Cells, CellText, Icon,} from "../../../weui";
import $V from '../../../weui/variable'
import pxToDp from "../../../pubilc/util/pxToDp";

const styles = StyleSheet.create({
  checkbox: {
    fontSize: 18,
    marginRight: $V.baseFontSize * 0.35,
  }
});

const CheckboxCells = (props) => {
  const {
    value,
    onChange,
    style,
    options,
    ...others
  } = props

  return (
      <Cells style={style} {...others} >
        {options.map((option, idx) =>
            <Cell customStyle={{marginLeft: 0, paddingLeft: pxToDp(30)}} key={idx}
                  onPress={() => onChange(option.sId != value, option.id)}>
              <CellHeader>
                <CellText style={{fontSize: 13}}>{option.label || option.value}</CellText>
              </CellHeader>
              <CellBody/>
              <CellFooter>
                <Icon name={option.sId == value ? 'success' : 'circle'} style={styles.checkbox}/>
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
