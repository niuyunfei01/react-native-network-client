'use strict';
import React from 'react';
import Toast from "react-native-root-toast";
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native'
import {Icon} from "../../weui/Icon";
import tool from "./tool";

let show_toast = null;

export function ToastShort(content, position = -100) {
  Toast.hide(show_toast)
  if (tool.length(content) > 0) {
    show_toast = Toast.show(content, {
      duration: Toast.durations.SHORT,
      position: position,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }
}

export function ToastLong(content, position = -100) {
  Toast.hide(show_toast)
  if (tool.length(content) > 0) {
    show_toast = Toast.show(content, {
      duration: Toast.durations.LONG,
      position: position,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  }
}

export function showModal(content, icon = 'loading', timeOut = 6000, position = 0) {

  Toast.hide(show_toast)
  show_toast = Toast.show(
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 150,
      paddingVertical: 10,
      paddingHorizontal: 20
    }}>
      {icon === 'loading' ? <ActivityIndicator color='#fff' size={'large'}/> :
        <Icon name={icon} style={[styles.toastIcon]}/>}
      <Text style={{color: '#ffffff', fontSize: 16, marginTop: 12}}> {content} </Text>
    </View>, {
      duration: timeOut,
      position: position,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
}

export function hideModal() {
  Toast.hide(show_toast)
}

export function showSuccess(content, position = 0) {
  Toast.hide(show_toast)
  show_toast = Toast.show(
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 150,
      paddingVertical: 10,
      paddingHorizontal: 20
    }}>
      <Icon name={'success'} style={[styles.toastIcon]}/>
      <Text style={{color: '#ffffff', fontSize: 16, marginTop: 12}}> {content} </Text>
    </View>, {
      duration: Toast.durations.SHORT,
      position: position,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
}

export function showError(content, position = 0) {
  Toast.hide(show_toast)
  show_toast = Toast.show(
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 150,
      paddingVertical: 10,
      paddingHorizontal: 20
    }}>
      <Icon name={'warn'} style={[styles.toastIcon]}/>
      <Text style={{color: '#ffffff', fontSize: 16, marginTop: 12}}> {content} </Text>
    </View>, {
      duration: Toast.durations.SHORT,
      position: position,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
}

const styles = StyleSheet.create({
  toastIcon: {
    color: '#fff',
    fontSize: 30,
    textAlign: 'center',
  },
})
