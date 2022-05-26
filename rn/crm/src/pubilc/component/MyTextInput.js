import React from "react";
import {TextInput} from "react-native";

export const MyTextInput = (props) => {
    return (
        <TextInput allowFontScaling={false} {...props}>
            {props.children}
        </TextInput>
    )
}