import React, {Component} from "react"
import {Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import cityDatas from "./cityIndex";
import {WebView} from "react-native-webview";

const {width, height} = Dimensions.get('window');
// 适配性函数
const UIWIDTH = 750;

let hotCitys = [];
let defaultHotCityArray = [
    {cityCode: "310000", cityName: "上海市"},
    {cityCode: "440300", cityName: "深圳市"},
    {cityCode: "110000", cityName: "北京市"},
    {cityCode: "440100", cityName: "广州市"},
];

const sectionWidth = 20;
const statusHeight = 88;
const sectionTopBottomHeight = 60;
const sectionItemHeight = (height - sectionTopBottomHeight * 2 - statusHeight) / cityDatas.length;
const ROW_HEIGHT = 48;

let totalHeight = [];
let letters = [];

export function rx(UIPX) {
    return Math.round(UIPX * width / UIWIDTH);
}

export default class cityList extends Component {
    state = {
        currentCity: "正在定位...",
        isLocation: false,
        sectionListDatas: cityDatas,
        letterWords: 'A',
        webview: "",
    };

    constructor(props) {
        super(props);
        totalHeight = this._gotTotalHeightArray();
        letters = this._gotLettersArray();
    }

    // 获取每个字母区域的高度
    _gotTotalHeightArray() {
        let totalArray = []
        for (let i = 0; i < cityDatas.length; i++) {
            let eachHeight = ROW_HEIGHT * (cityDatas[i].data.length + 1);
            totalArray.push(eachHeight);
        }
        return totalArray
    }

    // 获取字母列表头
    _gotLettersArray() {
        let LettersArray = []
        for (let i = 0; i < cityDatas.length; i++) {
            let element = cityDatas[i];
            LettersArray.push(element.title)
        }
        return LettersArray
    }

    componentWillMount() {
        this.gotCurrentLocation();
        // this.requestHotCityList();
    }

    async gotCurrentLocation() {
        this.setState({
            currentCity: "北京",
            isLocation: true
        })
    }

    requestHotCityList() {
        hotCitys = defaultHotCityArray
    }

    currentCityAction(name) {

    }

    // 点击右侧字母滑动到相应位置
    scrollToList(item, index) {
        let position = 0;
        for (let i = 0; i < index; i++) {
            position += totalHeight[i]
        }
        this.refs.ScrollView.scrollTo({y: position})
    }

    /*右侧索引*/
    _renderSideSectionView() {
        const sectionItem = cityDatas.map((item, index) => {
            return (
                <Text onPress={() => this.scrollToList(item, index)} key={index} style={styles.rightSideText}>
                    {item.sortLetters}
                </Text>
            )
        });

        return (
            <View style={styles.rightSlideArea} ref="sectionItemView">
                {sectionItem}
            </View>
        );
    }

    // 渲染城市列表
    _renderCityList() {
        let lists = [];
        for (let i = 0; i < cityDatas.length; i++) {
            let sections = cityDatas[i];
            let header =
                <View key={sections.title} style={styles.cityLetterBox}>
                    <Text style={styles.cityLetterText}>{sections.sortLetters}</Text>
                </View>;
            lists.push(header);

            for (let j = 0; j < sections.data.length; j++) {
                let element = sections.data[j];
                let cityCell =
                    <TouchableOpacity key={element.name + j} onPress={() => {
                        this.selectCity(element)
                    }}>
                        <View style={styles.cityTextBox}>
                            <Text style={styles.cityTextStyle}>{element.name}</Text>
                        </View>
                    </TouchableOpacity>;

                lists.push(cityCell);
            }
        }
        return lists;
    }

    selectCity(cityItem) {
        console.log(cityItem.name)
        const message: string = JSON.stringify(cityItem);
        this.webview.postMessage(message)
        // this.props.callback(cityItem)
    }

    renderHotCityArray(hotCityArray) {
        let eleArray = [];

        let subArray = hotCityArray.slice(0, 12);
        for (let index = 0; index < subArray.length; index++) {
            const element = subArray[index];
            const ele =
                <TouchableOpacity key={element.cityCode} onPress={() => {
                }}>
                    <View style={[styles.textView, {marginTop: 10}]}>
                        <Text style={{color: "#333333", fontSize: 14,}}>{element.cityName}</Text>
                    </View>
                </TouchableOpacity>;
            eleArray.push(ele);

        }
        return eleArray;
    }


    render() {
        return (


            <View style={{flex: 1}}>
                <WebView
                    ref={w => this.webview = w}
                    source={require('./womap.html')}
                    //source={{uri: 'https://fire4.waisongbang.com/map.html'}}
                    onMessage={(event) => {
                        let cityData = JSON.parse(event.nativeEvent.data)
                        if (cityData.status == 1) {
                            console.log(cityData.rectangle.split(';')[0])
                            let coordinate = cityData.rectangle.split(';')[0];
                            console.log(this)
                            if (coordinate) {
                                // this.setState({
                                //     coordinate
                                // })
                            }
                        }

                    }}
                    style={{display: 'none'}}
                />


                <View style={{backgroundColor: "#FFFFFF",}} ref='topViews'>
                    <Text style={styles.titleText}>当前定位城市</Text>
                    <View style={styles.currentView}>


                        <TouchableOpacity onPress={() => {
                            this.currentCityAction(this.state.currentCity)
                        }}
                                          style={{width: 100,}}>
                            <View style={[styles.textView, {marginLeft: 15, width: 100,}]}>
                                <Text style={{color: "#C49225", fontSize: 14,}}>{this.state.currentCity}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/*<Text style={styles.titleText}>热门城市</Text>*/}
                    {/*<View style={styles.hotView}>*/}
                    {/*    {this.renderHotCityArray(hotCitys)}*/}
                    {/*</View>*/}

                </View>

                <ScrollView style={{backgroundColor: '#FFFFFF',}} ref="ScrollView">
                    {this._renderCityList()}
                </ScrollView>

                {this._renderSideSectionView()}
            </View>


        )
    }
}
const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: "#ECEBED"
    },
    titleText: {
        marginLeft: 30,
        marginTop: 20,
        color: "#999999",
        fontSize: 13,
    },
    currentView: {
        marginTop: 10,
        paddingBottom: 20
    },
    textView: {
        minWidth: 40,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 5,
        paddingLeft: 10,
        paddingRight: 10,
        marginRight: 10,
    },
    hotView: {
        marginTop: 5,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginLeft: 30,
        marginRight: 25,
        paddingBottom: 20,
        marginBottom: 15,
    },

    rightSlideArea: {
        position: 'absolute',
        width: sectionWidth,
        height: height - sectionTopBottomHeight * 2, right: 5,
        top: 0,
        marginTop: sectionTopBottomHeight,
        marginBottom: sectionTopBottomHeight,
    },
    rightSideText: {
        textAlign: 'center',
        alignItems: 'center',
        height: sectionItemHeight,
        lineHeight: sectionItemHeight,
        color: '#C49225'
    },
    cityLetterBox: {
        height: ROW_HEIGHT,
        backgroundColor: '#F4F4F4',
        justifyContent: 'center',
    },
    cityLetterText: {
        color: "#999",
        fontSize: 17,
        marginLeft: 20,
    },
    cityTextBox: {
        height: ROW_HEIGHT,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        marginLeft: 20,
        borderBottomColor: '#EFEFEF',

    },
    cityTextStyle: {
        color: '#333333',
        fontSize: 14,
    },


});
