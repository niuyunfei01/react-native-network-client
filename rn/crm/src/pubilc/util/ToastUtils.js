'use strict';
import React from 'react';
import {WModal, WToast} from 'react-native-smart-tip'
import {ActivityIndicator, StyleSheet} from 'react-native'
import {Icon} from "../../weui/Icon";
import tool from "./tool";

export function ToastShort(content) {
  WToast.show({data: content, duration: WToast.duration.SHORT})
}

export function ToastLong(content) {
  WToast.show({data: content, duration: WToast.duration.LONG})
}

export function showModal(content, icon = 'loading') {

  WModal.hide()
  const modalOpts = {
    data: content,
    textColor: '#fff',
    backgroundColor: '#444444',
    position: WModal.position.CENTER,
    icon: icon === 'loading' ? <ActivityIndicator color='#fff' size={'large'}/> :
        <Icon name={icon} style={[styles.toastIcon]}/>
  }

  WModal.show(modalOpts)
  tool.debounces(() => {
    WModal.hide()
  }, 6000);
}

export function hideModal() {
  WModal.hide()
}

export function showSuccess(content) {
  WModal.hide()
  const toastOpts = {
    data: content,
    textColor: '#ffffff',
    backgroundColor: '#444444',
    duration: WToast.duration.SHORT, //1.SHORT 2.LONG
    position: WToast.position.CENTER, // 1.TOP 2.CENTER 3.BOTTOM
    icon: <Icon name={'success'} style={[styles.toastIcon]}/>
  }
  WToast.show(toastOpts)
  tool.debounces(() => {
    WToast.hide()
  }, WToast.duration.LONG);
}

export function showError(content) {
  WModal.hide()
  const toastOpts = {
    data: content,
    textColor: '#ffffff',
    backgroundColor: '#444444',
    duration: WToast.duration.LONG, //1.SHORT 2.LONG
    position: WToast.position.CENTER, // 1.TOP 2.CENTER 3.BOTTOM
    icon: <Icon name={'warn'} style={[styles.toastIcon]}/>
  }
  WToast.show(toastOpts)
  tool.debounces(() => {
    WToast.hide()
  }, WToast.duration.LONG);
}

const styles = StyleSheet.create({
  toastIcon: {
    color: '#fff',
    fontSize: 55,
    textAlign: 'center',
  },
})
