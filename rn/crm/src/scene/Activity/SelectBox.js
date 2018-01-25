import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import pxToDp from "../../util/pxToDp";
import colors from "../../styles/colors";
import tool from "../../common/tool";

class SelectBox extends PureComponent {
  render() {
    return (
        <View style={select.box}>
          <View style={select.items_box}>
            <TouchableOpacity
                onPress={async () => {
                  console.log('000000')
                }}
            >
              <Text style={[select.select_item, select.select_item_active]}>菜鸟食材</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={async () => {
                  console.log('000000')
                }}
            >
              <Text style={[select.select_item, select.select_item_active]}>菜鸟食材</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={async () => {
                  console.log('000000')
                }}
            >
              <Text style={[select.select_item, select.select_item_active]}>菜鸟食材</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={async () => {
                  console.log('000000')
                }}
            >
              <Text style={[select.select_item, select.select_item_active]}>菜鸟食材</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={async () => {
                  console.log('000000')
                }}
            >
              <Text style={[select.select_item, select.select_item_active]}>菜鸟食材</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={async () => {
                  console.log('000000')
                }}
            >
              <Text style={[select.select_item, select.select_item_active]}>菜鸟食材</Text>
            </TouchableOpacity>
          </View>
          <TouchableWithoutFeedback
              onPress={() => {
                console.log('隐藏')
              }}
          >
            <View style={{flex: 1}}/>
          </TouchableWithoutFeedback>
        </View>
    )
  }
}

const select = StyleSheet.create({
  box: {
    flex: 1,
    position:'absolute',
    zIndex:100,
    width:'100%',
    backgroundColor: 'rgba(0,0,0,.4)',
    height:'100%',
  },
  items_box: {
    minHeight: pxToDp(60),
    backgroundColor: "#fff",
    paddingHorizontal: pxToDp(45),
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: pxToDp(50),
    justifyContent: 'space-between',
    borderTopWidth: pxToDp(1)
  },
  select_item: {
    width: pxToDp(172),
    marginTop: pxToDp(50),
    height: pxToDp(55),
    textAlign: 'center',
    borderRadius: pxToDp(25),
    textAlignVertical: 'center',
    fontSize: pxToDp(28),
  },
  select_item_active: {
    backgroundColor: colors.main_color,
    color: colors.white,
  }
});

export default SelectBox