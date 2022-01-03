import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native'
import {Radio, SearchBar, List} from "@ant-design/react-native";
import Cts from "../../Cts";
import tool from "../../common/tool";


import {hideModal, showError, showModal} from "../../util/ToastUtils";
import LoadMore from "react-native-loadmore";
import {WebView} from "react-native-webview";


import JbbText from "../../scene/component/JbbText";
import Config from "../../config";
import pxToDp from "../../util/pxToDp";

const RadioItem = Radio.RadioItem;


class SearchShop extends Component {
    constructor(props) {
        super(props);
        const {limit_store, onBack, isType} = this.props.route.params;

        this.state = {
            fnPriceControlled: false,
            shops: [],
            page_size: 1,
            page_num: Cts.GOODS_SEARCH_PAGE_NUM,
            isLoading: false,
            isLastPage: false,
            selectTagId: 0,
            selIndex: 0, // 选中索引
            searchKeywords: this.props.route.params.keywords,
            showNone: false,
            isMap: false, //控制显示搜索还是展示地图
            isCan: true,
            onBack,
            coordinate: "116.40,39.90",//默认为北京市
            isType
        }
        console.log(this.props.route.params.keywords)
        if (this.props.route.params.keywords) {
            this.search()
        }
    }


    onCancel = () => { //点击取消

        this.setState({searchKeywords: '', shops: []});
    }
    search = (showLoading = false) => {   //submit 事件 (点击键盘的 enter)
        tool.debounces(() => {
            const searchKeywords = this.state.searchKeywords ? this.state.searchKeywords : '';
            if (searchKeywords) {
                let header = 'https://restapi.amap.com/v5/place/text?parameters?'
                const params = {
                    keywords: searchKeywords,
                    key: '85e66c49898d2118cc7805f484243909',
                    location: this.state.coordinate,
                    radius: "50000"
                    //key:'608d75903d29ad471362f8c58c550daf',
                    // page_size: this.state.page,
                    // page_num: this.state.page_num,
                }
                Object.keys(params).forEach(key => {
                        header += '&' + key + '=' + params[key]
                    }
                )
                //根据ip获取的当前城市的坐标后作为location参数以及radius 设置为最大
                // console.log(header)
                fetch(header)
                    .then(response => response.json())
                    .then(data => {
                        if (data.status == 1) {
                            this.setState({
                                shops: data.pois,
                                isLoading: false,
                                showLoading: false,
                            })

                        } else {
                            console.log(res.infocode)
                        }
                    });

            } else {
                showError("请输入内容")
            }
        }, 1000)
    }

    onChange = (searchKeywords: any) => {
        const toUpdate = {searchKeywords};
        if (this.state.searchKeywords !== searchKeywords) {
            toUpdate.page = 1
        }
        this.setState(toUpdate, () => {
            this.search(true)
        });
    }


    renderSearchBar = () => {
        return <SearchBar placeholder="请输入您的店铺地址" value={this.state.searchKeywords} onChange={this.onChange}
                          onCancel={this.onCancel} onSubmit={() => this.search(true)} returnKeyType={'search'}/>
    }


    onRefresh() {
        return

    }

    onLoadMore() {
        return

    }


    renderList() {
        const shops = this.state.shops
        let items = [];
        let obj = {};
        let that = this;
        for (const i in shops) {
            const shopItem = that.state.shops[i];
            items.push(
                <RadioItem key={i} style={{fontSize: 16, fontWeight: 'bold', height: pxToDp(100), paddingTop: 15,}}
                           checked={that.state.selIndex === i}
                           onChange={event => {
                               if (!that.state.isCan) {
                                  
                                   return
                               }
                               if (event.target.checked) {
                                   that.state.isCan = false
                                   setInterval(() => {
                                       that.state.isCan = true
                                   }, 800)
                                   // that.state.shops[i].pagekey = this.state.apply_key;
                                   that.state.shops[i].onBack = this.state.onBack;
                                   that.state.shops[i].isType = this.state.isType;

                                   this.props.navigation.navigate(Config.ROUTE_SHOP_MAP, that.state.shops[i]);
                               }
                           }}><JbbText>{shopItem.name}</JbbText></RadioItem>
            )
        }
        return <List style={{marginTop: 12}}>
            {items}
        </List>
    }

    render() {
        return (

            <View style={{
                flexDirection: "column",
                flex: 1,
                maxHeight: 6000
            }}>


                {this.renderSearchBar()}
                <View style={{
                    flexDirection: "column",
                    paddingBottom: 80
                }}>
                    {this.state.shops && this.state.shops.length ? (
                        <View>
                            <LoadMore
                                loadMoreType={'scroll'}
                                renderList={this.renderList()}
                                onRefresh={() => this.onRefresh()}
                                onLoadMore={() => this.onLoadMore()}
                                isLastPage={this.state.isLastPage}
                                isLoading={this.state.isLoading}
                                scrollViewStyle={{
                                    paddingBottom: 5,
                                    marginBottom: 0
                                }}
                                indicatorText={'加载中'}
                                bottomLoadDistance={10}
                            />
                            <View style={{
                                paddingVertical: 9,
                                alignItems: "center",
                                flexDirection: "row",
                                justifyContent: "center",
                                flex: 1
                            }}>
                                {this.state.isLastPage}
                            </View>
                        </View>
                    ) : (<View style={{
                        paddingVertical: 9,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        marginTop: '40%',
                        flex: 1
                    }}>
                        <If condition={this.state.keywords && this.state.shops.length == 0}>
                            <Text>没有找到" {this.state.searchKeywords} "这个店铺</Text>
                        </If>
                    </View>)}


                </View>
                {/*<ScrollView/>*/}
                <WebView
                    source={{uri: 'https://fire4.waisongbang.com/map.html'}}
                    onMessage={(event) => {
                        let cityData = JSON.parse(event.nativeEvent.data)
                        if (cityData.status == 1) {
                            console.log(cityData.rectangle.split(';')[0])
                            let coordinate = cityData.rectangle.split(';')[0];
                            console.log(this)
                            if (coordinate) {
                                this.setState({
                                    coordinate
                                })
                            }
                        }

                    }}
                    style={{display: 'none'}}
                />
            </View>

        );
    }
}

export default SearchShop;
