import React from 'react';import PropTypes from 'prop-types';
import {
    TextInput,
    StyleSheet,
} from 'react-native'
import $V from '../variable'

const styles = StyleSheet.create({
    input: {
        fontSize: $V.weuiCellFontSize,
        height: $V.weuiCellLineHeight,
        marginTop: ($V.weuiCellLineHeight - $V.weuiCellFontSize) / 2,
        marginBottom: ($V.weuiCellLineHeight - $V.weuiCellFontSize) / 2,
    }
})

const Input = (props) => {
    const {
        value,
        onChange,
        onChangeText,
        style,
        ...others
    } = props

    return (
        <TextInput
            style={[styles.input, style]}
            value={value}
            onChangeText={onChangeText || onChange}
            underlineColorAndroid='#999'
            {...others}
        />
    )
}

Input.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    onChangeText: PropTypes.func,
    style: TextInput.propTypes.style,
}

export default Input
