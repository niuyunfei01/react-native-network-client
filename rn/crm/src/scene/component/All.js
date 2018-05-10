import React, {PureComponent, Component} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  PixelRatio,
  TouchableWithoutFeedback,
  Dimensions
} from "react-native";

import pxToDp from "../../util/pxToDp";
import {Colors, Styles, Metrics} from "../../themes";
import Icon from "react-native-vector-icons/Ionicons";

const one = 1 / PixelRatio.get();
const  {height,width}=Dimensions.get('window')
class Left extends PureComponent {
  static defaultProps = {
    isOne: true
  };

  render() {
    const {
      title,
      info,
      right,
      onPress,
      onChangeText,
      category,
      placeholder,
      value,
      type,
      isOne,
      maxLength,
      editable,
    } = this.props;
    let editFlag = editable;
    if(editFlag!==false){
      editFlag = true;
    }
    return (
      <TouchableOpacity onPress={onPress}>
        <View
          style={{
            paddingVertical: 15,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            paddingHorizontal: pxToDp(31)
          }}
        >
          <Text style={{fontSize: 16, color: "#333", width: 85}}>
            {title}
          </Text>
          {info ? (
            <Text
              numberOfLines={1}
              style={{fontSize: 14, color: "#7A7A7A", flex: 1}}
            >
              {info}
            </Text>
          ) : (
            <View style={{flex: 1}}>
              <TextInput
                placeholder={placeholder}
                underlineColorAndroid="transparent"
                style={{padding: 0, fontSize: 14}}
                maxLength={maxLength}
                placeholderTextColor={"#7A7A7A"}
                keyboardType={type}
                value={value}
                editable = {editFlag}
                onChangeText={onChangeText}
              />
            </View>
          )}

          {right}
        </View>
        <View style={{height: 1, backgroundColor: "#f2f2f2"}}/>
      </TouchableOpacity>
    );
  }
}

class Adv extends PureComponent {
  render() {
    const {
      title,
      right,
      onChangeText,
      placeholder,
      value,
      maxLength
    } = this.props;
    return (
      <TouchableOpacity>
        <View
          style={{
            paddingVertical: 15,
            backgroundColor: "#fff",
            paddingHorizontal: pxToDp(31)
          }}
        >
          <Text style={{fontSize: 16, color: "#333", width: 85}}>
            {title}
          </Text>
          <TextInput
            placeholder={placeholder}
            underlineColorAndroid="transparent"
            maxLength={maxLength}
            style={{marginTop: 6, marginBottom: 3, padding: 0, fontSize: 14}}
            placeholderTextColor={"#7A7A7A"}
            value={value}
            onChangeText={onChangeText}
          />
          <Text style={{fontSize: 14, color: "#ccc", textAlign: "right"}}>
            {right}
          </Text>
        </View>
        <View style={{height: 1, backgroundColor: "#f2f2f2"}}/>
      </TouchableOpacity>
    );
  }
}

class Yuan extends Component {
  static defaultProps = {
    w: Metrics.CW / 10,
    bgc: Colors.white,
    size: 20
  };

  render() {
    let {
      w,
      bgc,
      ic,
      size,
      bc,
      bw,
      t,
      fontStyle,
      icon,
      image,
      images,
      mgt,
      mgb,
      mgl,
      mgr,
      onPress
    } = this.props;
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View
          style={[
            {
              width: w,
              height: w,
              borderRadius: w / 2,
              borderColor: bc,
              borderWidth: bw,
              backgroundColor: bgc,
              marginTop: mgt,
              marginBottom: mgb,
              marginLeft: mgl,
              marginRight: mgr
            },
            Styles.center
          ]}
        >
          {icon ? <Icon name={icon} color={ic} size={size}/> : null}

          {t ? (
            <Text style={fontStyle} allowFontScaling={false}>
              {t}
            </Text>
          ) : null}
          {image || images ? (
            <Image
              source={image ? image : {uri: images}}
              style={{
                width: w,
                height: w,
                borderRadius: w / 2,
                borderColor: bc,
                borderWidth: bw
              }}
            />
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

class Button extends Component {
  static defaultProps = {
    w: 70,
    h: 30,
    r: 15,
    bw: one,
    bc: Colors.theme,
    t: "已完成",
    fontStyle: Styles.n2
  };

  render() {
    const {
      w,
      h,
      bw,
      bc,
      r,
      bgc,
      fontStyle,
      t,
      onPress,
      mgt,
      mgb,
      mgl,
      mgr,
      content
    } = this.props;
    return (
      <TouchableOpacity
        style={[
          {
            height: h,
            width: w,
            borderRadius: r,
            borderWidth: bw,
            borderColor: bc,
            backgroundColor: bgc,
            marginTop: mgt,
            marginBottom: mgb,
            marginLeft: mgl,
            marginRight: mgr
          },
          Styles.center
        ]}
        onPress={onPress}
      >
        {t ? (
          <Text style={fontStyle} allowFontScaling={false}>
            {t}
          </Text>
        ) : (
          <View>{content}</View>
        )}
      </TouchableOpacity>
    );
  }
}

class Line extends Component {
  static defaultProps = {
    h: 1 / PixelRatio.get() * 2,
    c: Colors.line
  };

  render() {
    const {w, h, mgt, mgb, c, fontStyle, t} = this.props;
    return (
      <View
        style={{
          width: w,
          height: h,
          marginTop: mgt,
          marginBottom: mgb,
          backgroundColor: c
        }}
      >
        {this.props.t ? (
          <Text style={fontStyle} allowFontScaling={false}>
            {t}
          </Text>
        ) : null}
      </View>
    );
  }
}

class Button1 extends Component {
  static defaultProps = {
    w: Metrics.CW * 0.7,
    h: 40,
    r: 20,
    bw: one,
    bc: Colors.theme,
    bgc: Colors.theme,
    mgt: 15,
    t: "Button",
    fontStyle: Styles.t1white
  };

  render() {
    const {
      w,
      h,
      bw,
      bc,
      r,
      bgc,
      fontStyle,
      t,
      onPress,
      mgt,
      mgb,
      mgl,
      mgr,
      content
    } = this.props;
    return (
      <TouchableOpacity
        style={[
          {
            height: h,
            width: w,
            borderRadius: r,
            borderWidth: bw,
            borderColor: bc,
            backgroundColor: bgc,
            marginTop: mgt,
            marginBottom: mgb,
            marginLeft: mgl,
            marginRight: mgr
          },
          Styles.center
        ]}
        onPress={onPress}
      >
        {t ? (
          <Text style={fontStyle} allowFontScaling={false}>
            {t}
          </Text>
        ) : (
          <View>{content}</View>
        )}
      </TouchableOpacity>
    );
  }
}

class NavigationItem1 extends PureComponent {
  render() {

    const {icon, iconStyle, title, titleStyle, containerStyle, onPress,children, ...others,} = this.props;
    let _icon = this.props.icon &&
      <Image style={[styles.icon, iconStyle]} source={icon}/>

    let _title = this.props.title &&
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    return (
     <View style={{flexDirection:'row',width:width,alignItems:'center'}}>
        <TouchableOpacity style={[{flexDirection:'row',alignItems:'center'},containerStyle]} onPress={onPress} {...others}>
        {_icon}
        {_title}
      </TouchableOpacity>
      {
        children?
        <View style={{flex:1,marginLeft:20,}}>{children}</View>
        :
        null
      }
     </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 27,
    height: 27,
    margin: 8,
  },
  title: {
    fontSize: 15,
    color: '#333333',
    margin: 8,
  }
});


export {Left, Adv, Button, Line, Yuan, Button1,NavigationItem1 };
