import React, {PureComponent} from 'react'
import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import colors from "../../../pubilc/styles/colors";
import pxToDp from "../../../pubilc/util/pxToDp";
import {Button} from "react-native-elements";
import config from "../../../pubilc/common/config";
import Entypo from "react-native-vector-icons/Entypo";
import BigImage from "../../common/component/BigImage";


class BindSetMeituan extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showBindDesc: false,
      showUnBindDesc: false,
      showImg: '',
      full_screen: false,
    }
  }

  onToggleFullScreen(showImg = '') {
    let {full_screen} = this.state;
    this.setState({
      full_screen: !full_screen,
      showImg: showImg,
    });
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <BigImage
          visible={this.state.full_screen}
          urls={[{url: this.state.showImg}]}
          onClickModal={() => this.onToggleFullScreen()}
        />
        <ScrollView style={{backgroundColor: colors.main_back, flexGrow: 1}}>
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 6,
            margin: 10,
          }}>
            <View style={{
              borderBottomWidth: pxToDp(1),
              paddingBottom: 2,
              borderColor: colors.fontColor
            }}>
              <Text style={{
                color: colors.color333,
                padding: 10,
                fontSize: 15,
                fontWeight: 'bold',
              }}>绑定美团时应考虑的情况 </Text>
            </View>
            <View style={{margin: 6}}>
              <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>
                1、是否使用云打印机自动接单；
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '400',
                  color: colors.color000
                }}> (1）如果使用了云打印机自动接单，考虑到双方冲突，则应该先将打印机绑定到外送帮，并在绑定完成后开启自动接单。
              </Text>
              <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}> (2）如果未使用云打印机接单，则应该保留原有方式。
              </Text>
              <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>2、是否有总部的系统，或者收银系统：
                此时应该采用兼容模式并不会给客户做自动接单。</Text>
            </View>
          </View>


          <View style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 6,
            margin: 10,
            marginTop: 0,
          }}>
            <View style={{
              borderBottomWidth: pxToDp(1),
              paddingBottom: 2,
              borderColor: colors.fontColor
            }}>
              <Text style={{
                color: colors.color333,
                padding: 10,
                fontSize: 15,
                fontWeight: 'bold',
              }}>更换绑定原则</Text>
            </View>
            <View style={{margin: 6}}>
              <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>
                1、美团外卖非接单（收银系统）更换为外卖接单（默认方式；有云打印机）：可在下方点击更换绑定直接更换。
              </Text>
              <Text style={{
                fontSize: 14,
                fontWeight: '400',
                color: colors.color000,
                marginTop: 12
              }}>2、美团外卖接单（默认方式；有云打印机）更换为外卖非接单（收银系统）：需先解除美团外卖接单的绑定信息，在重新绑定外卖非接单。</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => {
            this.setState({showBindDesc: !this.state.showBindDesc})
          }} style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 6,
            margin: 10,
            marginTop: 0,
          }}>
            <View style={{
              borderBottomWidth: this.state.showBindDesc ? pxToDp(1) : 0,
              paddingBottom: this.state.showBindDesc ? 2 : 0,
              borderColor: colors.fontColor
            }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{
                  color: colors.color333,
                  padding: 10,
                  fontSize: 15,
                  fontWeight: 'bold',
                }}>如何在外送帮绑定美团店铺 </Text>
                <View style={{flexGrow: 1}}></View>
                <Entypo name={this.state.showBindDesc ? "chevron-thin-up" : "chevron-thin-right"}
                        style={{fontSize: pxToDp(40), color: colors.fontColor, marginRight: 6}}></Entypo>
              </View>
            </View>
            <If condition={this.state.showBindDesc}>
              <View style={{margin: 6}}>
                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>
                  1、绑定美团店铺
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '400',
                    color: colors.color000
                  }}> （1）在APP端-我的-店铺信息-绑定外卖店铺-选择美团去授权-选择绑定方式-绑定店铺-按美团提示绑定
                </Text>

                <TouchableOpacity
                  style={{margin: 15}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/1.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/1.png'}} style={{
                    width: 320,
                    height: 142,
                  }}/>
                </TouchableOpacity>

                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}> （2）在PC端-店铺-店铺管理-商家管理了—主页
                </Text>

                <TouchableOpacity
                  style={{margin: 15}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/2.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/2.png'}} style={{
                    width: 320,
                    height: 142,
                  }}/>
                </TouchableOpacity>
                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>2、登录美团账号</Text>

                <TouchableOpacity
                  style={{margin: 15}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/3.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/3.png'}} style={{
                    width: 320,
                    height: 142,
                  }}/>
                </TouchableOpacity>

                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>3、选择要绑定的店铺</Text>

                <TouchableOpacity
                  style={{margin: 15}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/4.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/4.png'}} style={{
                    width: 320,
                    height: 142,
                  }}/>
                </TouchableOpacity>
                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>4、选择要绑定的店铺</Text>

                <TouchableOpacity
                  style={{margin: 15}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/5.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/5.png'}} style={{
                    width: 320,
                    height: 142,
                  }}/>
                </TouchableOpacity>
                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>5、点击确定，绑定成功</Text>

                <TouchableOpacity
                  style={{margin: 15}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/6.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/6.png'}} style={{
                    width: 320,
                    height: 142,
                  }}/>
                </TouchableOpacity>
              </View>
            </If>
          </TouchableOpacity>


          <TouchableOpacity onPress={() => {
            this.setState({showUnBindDesc: !this.state.showUnBindDesc})
          }} style={{
            backgroundColor: colors.white,
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 6,
            margin: 10,
            marginTop: 0,
          }}>

            <View style={{
              borderBottomWidth: this.state.showUnBindDesc ? pxToDp(1) : 0,
              paddingBottom: this.state.showUnBindDesc ? 2 : 0,
              borderColor: colors.fontColor
            }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{
                  color: colors.color333,
                  padding: 10,
                  fontSize: 15,
                  fontWeight: 'bold',
                }}>如何在外送帮解除美团店铺绑定 </Text>
                <View style={{flexGrow: 1}}></View>
                <Entypo name={this.state.showUnBindDesc ? "chevron-thin-up" : "chevron-thin-right"}
                        style={{fontSize: pxToDp(40), color: colors.fontColor, marginRight: 6}}></Entypo>
              </View>
            </View>

            <If condition={this.state.showUnBindDesc}>
              <View style={{margin: 6}}>
                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>
                  1、在PC端-店铺-店铺管理-外卖店铺-选择您要解绑的店铺-更多操作-解绑
                </Text>
                <TouchableOpacity
                  style={{margin: 15}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/7.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/7.png'}} style={{
                    width: 320,
                    height: 142,
                  }}/>
                </TouchableOpacity>

                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>2、登录美团账号</Text>

                <TouchableOpacity
                  style={{margin: 15}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/8.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/8.png'}} style={{
                    width: 320,
                    height: 142,
                  }}/>
                </TouchableOpacity>

                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>3、确认是否是您要解除绑定的外卖店，点击下一步</Text>

                <TouchableOpacity
                  style={{margin: 15}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/9.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/9.png'}} style={{
                    width: 320,
                    height: 142,
                  }}/>
                </TouchableOpacity>
                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>4、确定不继续使用服务商系统操作外卖业务？</Text>

                <TouchableOpacity
                  style={{margin: 15}}
                  onPress={() => this.onToggleFullScreen('https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/10.png')}>
                  <Image source={{uri: 'https://cnsc-pics.cainiaoshicai.cn/BindSetMeituan/10.png'}} style={{
                    width: 320,
                    height: 142,
                  }}/>
                </TouchableOpacity>
                <Text style={{fontSize: 14, fontWeight: '400', color: colors.color000}}>5、点击确认解绑成功</Text>

              </View>
            </If>
          </TouchableOpacity>

        </ScrollView>
        {this.rendenBtn()}
      </View>
    );
  }

  rendenBtn() {
    return (
      <View style={{backgroundColor: colors.white, padding: pxToDp(31)}}>
        <Button title={'更换绑定'}
                onPress={() => {
                  this.props.navigation.navigate(config.ROUTE_BIND_MEITUAN)
                }}
                buttonStyle={{
                  borderRadius: pxToDp(10),
                  backgroundColor: colors.main_color,
                }}
                titleStyle={{
                  color: colors.white,
                  fontSize: 16
                }}
        />
      </View>
    )
  }
}


export default BindSetMeituan
