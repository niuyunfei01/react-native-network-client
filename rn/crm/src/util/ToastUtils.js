'use strict';
import React from 'react';
import {WModal, WToast} from 'react-native-smart-tip'
import {ActivityIndicator, StyleSheet} from 'react-native'
import {Icon} from "../weui";

export function ToastShort(content) {
  WToast.show({data: content, duration: WToast.duration.SHORT})
}

export function ToastLong(content) {
  WToast.show({data: content, duration: WToast.duration.LONG})
}

export function showModal(content, icon = 'loading') {
  const modalOpts = {
    data: content,
    textColor: '#fff',
    backgroundColor: '#444444',
    position: WModal.position.CENTER,
    icon: icon === 'loading' ? <ActivityIndicator color='#fff' size={'large'}/> :
      <Icon name={icon} style={[styles.toastIcon]}/>
  }

  WModal.show(modalOpts)
}

export function hideModal() {
  WModal.hide()
}


const styles = StyleSheet.create({
  toastIcon: {
    marginTop: 22,
    color: '#fff',
    fontSize: 55,
    textAlign: 'center',
  },
})
