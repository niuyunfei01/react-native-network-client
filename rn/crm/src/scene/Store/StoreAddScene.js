import React, {Component} from "react";
import {
    Alert,
    Clipboard,
    InteractionManager,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import colors from "../../styles/colors";
import pxToDp from "../../util/pxToDp";
import * as tool from "../../common/tool";
import {simpleBarrier} from "../../common/tool";


import {Button, Cell, CellBody, CellHeader, Cells, CellsTitle, Input, Label, TextArea,} from "../../weui/index";

import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import * as globalActions from "../../reducers/global/globalActions";
import {hideModal, showModal, ToastLong, ToastShort} from "../../util/ToastUtils";
import Config from "../../config";
import AppConfig from "../../config";
import Entypo from "react-native-vector-icons/Entypo";
import Cts from "../../Cts";
import DateTimePicker from "@react-native-community/datetimepicker";
import {copyStoreGoods, saveOfflineStore} from "../../reducers/mine/mineActions";
import Dialog from "../../weui/Dialog/Dialog";
import ModalSelector from "../../widget/ModalSelector/index";
//组件
import {uploadImg} from "../../reducers/product/productActions";
import LoadingView from "../../widget/LoadingView";


import _ from "lodash";
//请求
import {getWithTpl} from "../../util/common";
import FetchEx from "../../util/fetchEx";
import WorkerPopup from "../component/WorkerPopup";
import HttpUtils from "../../util/http";
import JbbText from "../component/JbbText";
import {DatePickerView, List} from "@ant-design/react-native"
import color from "../../widget/color";

const CustomChildren = props => (
    <TouchableOpacity onPress={props.onPress}>
        <View
            style={{
                height: 36,
                paddingLeft: 15,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Text style={{flex: 1}}>{props.children}</Text>
            <Text style={{textAlign: 'right', color: '#888', marginRight: 15}}>
                {props.extra}
            </Text>
        </View>

    </TouchableOpacity>
);

function mapStateToProps(state) {
    const {mine, global} = state;
    return {mine: mine, global: global};
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch,
        ...bindActionCreators(
            {
                saveOfflineStore,
                copyStoreGoods,
                ...globalActions
            },
            dispatch
        )
    };
}

const createUserTag = -100;

// create a component
class StoreAddScene extends Component {
    constructor(props) {
        super(props);

        let navigation = this.props.navigation;
        navigation.setOptions(this.navigationOptions(this.props.route))

        let {currVendorId} = tool.vendor(this.props.global);
        console.log( this.props)
        const {mine} = this.props;
        console.log(mine,'mine')
        console.log(mine.user_list[currVendorId],'mine.user_list[currVendorId]')
        let user_list = mine.user_list[currVendorId] || [];
        let normal_list = mine.normal[currVendorId] || [];


        let userActionSheet = [];
        userActionSheet.push({key: -999, section: true, label: "职位任命"});
        userActionSheet.push({key: createUserTag, label: "创建新用户"});
        userActionSheet.push({key: 0, label: "不任命任何人"});
        for (let user_info of normal_list) {
            let item = {
                key: user_info.id,
                label: user_info.nickname
            };
            userActionSheet.push(item);
        }

        let fileId = [];

        const {btn_type} = this.props.route.params || {};
        this.state = {
            timerIdx: 0,
            timerType: "start",
            isRefreshing: false,
            btn_type: btn_type,
            onSubmitting: false,
            goToCopy: false,
            goToReset: false,
            user_list: user_list,
            userActionSheet: userActionSheet,
            isStartVisible: true,
            isEndVisible: false,
            isBd: false, //是否是bd
            isUploadingImage: false,
            storeImageInfo: undefined,
            bossImageInfo: undefined,
            fileId: fileId,
            templateList: [], //模板列表
            templateInfo: {key: undefined, label: undefined},
            qualification: {name: '', info: ''}, //上传资质
            bdList: [],
            bdInfo: {key: undefined, label: undefined},
            sale_categoryInfo: {key: undefined, label: '店铺类型'},
            isLoading: true,
            isGetbdList: true,
            isLoadingStoreList: true,
            isServiceMgr: false,  //是否是业务人员 BD+运营
            remark: '',
            receiveSecretKey: '',
            createUserName: '',
            workerPopupVisible: false,
            workerPopupMulti: false,
            err_num: 0,
            selectCity: {
                cityId: '',
                name: "点击选择城市"
            },
            shelfNos: [{label: '托管店', value: '1'}, {label: '联营店', value: '0'}],
            shoptypes: [{label: '托管店', value: '1'}, {label: '联营店', value: '0'}],
            pickerValue: "",
            timemodalType: false,
            sale_category_name: "",
            sale_category: "",
            datePickerValue: new Date()

        };

        this.onPress = this.onPress.bind(this);
        this.onStoreAdd = this.onStoreAdd.bind(this);
        this.onCheckData = this.onCheckData.bind(this);
        this.onStoreCopyGoods = this.onStoreCopyGoods.bind(this);
        this.fileId = [];
        this.fetchDeliveryErrorNum();
    }


    navigationOptions = (route) => {
        const params = route.params || {}

        let title = params.btn_type === "add" ? "新增门店" : "门店信息/修改";
        let ActionSheet = [
            {key: -999, section: true, label: "操作"},
            {key: 1, label: "初始化商品"}, //force -> true
            {key: 2, label: "复制商品"} //force -> false
        ];

        return {
            headerTitle: title,
            headerRight: () => {
                return params.btn_type === "add" ? null : (
                    <ModalSelector
                        onChange={option => {
                            if (option.label === "初始化商品") {
                                params.goToReset();
                            } else if (option.label === "复制商品") {
                                params.goToCopy();
                            }
                        }}
                        data={ActionSheet}
                        skin="customer"
                    >
                        <Entypo name="dots-three-horizontal" style={styles.btn_select}/>
                    </ModalSelector>
                )
            }
        };
    };

    onStoreCopyGoods(force) {
        const {accessToken} = this.props.global;
        const {dispatch} = this.props;
        let {store_id} = this.state;
        HttpUtils.get.bind(this.props)(`/v1/new_api/Stores/sale_categories?access_token=${accessToken}`, {}).then(res => {
            res.map((v, i) => {
                v.label = v.name
                v.value = v.id
            })

            this.setState({
                shelfNos: res
            })
        }).catch((success, errorMsg) => {
            this.showErrorToast(errorMsg)
        })
        if (!(store_id > 0)) {
            ToastLong("错误的门店信息");
            return false;
        }
        InteractionManager.runAfterInteractions(() => {
            dispatch(
                copyStoreGoods(store_id, force, accessToken, resp => {
                    if (resp.ok) {
                        ToastLong(resp.desc);
                    }
                    this.setState({
                        goToReset: false,
                        goToCopy: false
                    });
                })
            );
        });
    }

    navigationOptions = (route) => {
        const params = route.params || {}

        let title = params.btn_type === "add" ? "新增门店" : "门店信息/修改";
        let ActionSheet = [
            {key: -999, section: true, label: "操作"},
            {key: 1, label: "初始化商品"}, //force -> true
            {key: 2, label: "复制商品"} //force -> false
        ];

        return {
            headerTitle: title,
            headerRight: () => {
                return params.btn_type === "add" ? null : (
                    <ModalSelector
                        onChange={option => {
                            if (option.label === "初始化商品") {
                                params.goToReset();
                            } else if (option.label === "复制商品") {
                                params.goToCopy();
                            }
                        }}
                        data={ActionSheet}
                        skin="customer"
                    >
                        <Entypo name="dots-three-horizontal" style={styles.btn_select}/>
                    </ModalSelector>
                )
            }
        };
    };

    onStoreCopyGoods(force) {
        const {accessToken} = this.props.global;
        const {dispatch} = this.props;
        let {store_id} = this.state;
        if (!(store_id > 0)) {
            ToastLong("错误的门店信息");
            return false;
        }
        InteractionManager.runAfterInteractions(() => {
            dispatch(
                copyStoreGoods(store_id, force, accessToken, resp => {
                    if (resp.ok) {
                        ToastLong(resp.desc);
                    }
                    this.setState({
                        goToReset: false,
                        goToCopy: false
                    });
                })
            );
        });
    }

    fetchDeliveryErrorNum() {
        if (this.props.route.params.btn_type === "add") {
            return null;
        }
        const {accessToken, currStoreId} = this.props.global
        const api = `/v1/new_api/Delivery/shop_bind_list?access_token=${accessToken}`
        HttpUtils.post.bind(this.props)(api, {store_id: currStoreId}).then((res) => {
            if (res.diff_count > 0) {
                this.setState({
                    err_num: res.diff_count
                })
            }
        })
    }


    setStateByStoreInfo = (store_info, currVendorId, accessToken) => {
        let {
            id = 0, //store_id
            alias = "",
            name = "",
            type = currVendorId,
            district = "",
            owner_name = undefined,
            owner_nation_id = "",
            location_long = "",
            location_lat = "",
            deleted = 0,
            tel = "",
            mobile = "",
            files = [],
            dada_address = "",
            owner_id = "",
            open_end = "19:00:00",
            open_start = "09:00:00",
            vice_mgr = 0,
            call_not_print = "0",
            ship_way = Cts.SHIP_AUTO,
            city = undefined,
            city_code = undefined,
            fn_price_controlled = 1,
            reservation_order_print = -1,
            sale_category_name,
            sale_category,

            open_time_conf = [],

        } = store_info || {};


        //门店照片的地址呀
        let storeImageUrl = undefined;
        let bossImageUrl = undefined;
        let imageList = [];
        let existImgIds = [];

        if (files && files.length) {
            //初始化已有图片
            files.map(element => {
                existImgIds.push(element.id);

                if (element.modelclass === "StoreImage") {
                    storeImageUrl = {
                        url: Config.staticUrl(element.thumb),
                        id: element.id
                    };
                } else if (element.modelclass === "StoreBoss") {
                    bossImageUrl = {
                        url: Config.staticUrl(element.thumb),
                        id: element.id
                    };
                } else {
                    imageList.push({
                        imageUrl: {url: Config.staticUrl(element.thumb), id: element.id},
                        imageInfo: undefined
                    });
                }
            });
        }

        this.setState({
            open_time_conf,
            store_id: id > 0 ? id : 0,
            type: type, //currVendorId
            district: district, //所属区域
            owner_name: owner_name, //店主收款人姓名
            owner_nation_id: owner_nation_id, //身份证号
            location_long: location_long,
            location_lat: location_lat,
            deleted: deleted,
            tel: tel, //门店电话
            mobile: mobile, //店长电话
            dada_address: dada_address, //门店地址
            owner_id: owner_id, //店长ID
            open_end: open_end,
            open_start: open_start,
            vice_mgr: vice_mgr, //店副ID
            call_not_print: call_not_print, //未打印通知
            ship_way: ship_way, //配送方式
            fn_price_controlledname: fn_price_controlled === `1` ? '托管店' : '联营店', //是否是托管
            fn_price_controlled: fn_price_controlled,
            reservation_order_print,
            sale_category_name,
            sale_category,


            selectCity: {
                cityId: city ? city_code : undefined,
                name: city ? city : "点击选择城市"
            },
            qualification: {
                name: files && files.length ? "资质已上传" : "点击上传资质",
                info: undefined
            }, //上传资质
            alias: alias, //别名
            name: name, //店名
            imageList:
                files && files.length
                    ? imageList
                    : [
                        {id: 1, imageUrl: undefined, imageInfo: undefined},
                        {id: 2, imageUrl: undefined, imageInfo: undefined},
                        {id: 3, imageUrl: undefined, imageInfo: undefined}
                    ],
            storeImageUrl: storeImageUrl, //门店照片
            bossImageUrl: bossImageUrl,
            existImgIds: existImgIds,
        })

        let url = `api/get_tpl_stores/${currVendorId}?access_token=${accessToken}`;
        let bdUrl = `api/get_bds/${currVendorId}?access_token=${accessToken}`;

        //获取模板店列表
        getWithTpl(
            url,
            response => {
                if (response.ok) {
                    let arr = [];
                    for (let i in response.obj) {
                        arr.push(response.obj[i]); //属性
                    }
                    let selectTemp = [{key: -999, section: true, label: "选择模板店"}];
                    for (let item of arr) {
                        if (
                            store_info &&
                            store_info.tpl_store &&
                            item.id === store_info.tpl_store
                        ) {
                            this.setState({
                                templateInfo: {
                                    key: item.id,
                                    label: item.name
                                }
                            });
                        }
                        let value = {
                            key: item.id,
                            label: item.name
                        };
                        selectTemp.push(value);
                    }
                    this.setState({
                        templateList: selectTemp,
                        isLoadingStoreList: false
                    });
                }
            },
            error => {
                console.log("error:%o", error);
            }
        );
        //获取bd列表
        getWithTpl(
            bdUrl,
            response => {
                if (response.ok) {
                    let arr = [];
                    for (let i in response.obj) {
                        arr.push(response.obj[i]); //属性
                    }

                    let selectTemp = [{key: -999, section: true, label: "选择bd"}];
                    let data = _.toPairs(response.obj);
                    for (let item of data) {
                        if (
                            store_info &&
                            store_info.service_bd &&
                            item[0] === store_info.service_bd
                        ) {
                            this.setState({
                                bdInfo: {
                                    key: item[0],
                                    label: item[1]
                                }
                            });
                        }
                        let value = {
                            key: item[0],
                            label: item[1]
                        };
                        selectTemp.push(value);
                    }
                    this.setState({
                        bdList: selectTemp,
                        isGetbdList: false
                    });
                }
            },
            error => {
                console.log("error:%o", error);
            }
        );
    }

    getStoreEditData() {
        let {
            store_id, type, alias, name, district,
            owner_name, owner_nation_id, location_long,
            location_lat, deleted, tel, mobile, dada_address,
            owner_id, open_end, open_start, vice_mgr, call_not_print,
            ship_way, fn_price_controlledname, fn_price_controlled, bdInfo, templateInfo, sale_category
        } = this.state;
        return {
            store_id: store_id,
            type: type,
            alias: alias,
            name: name,
            district: district,
            owner_name: owner_name,
            owner_nation_id: owner_nation_id,
            location_long: location_long,
            location_lat: location_lat,
            deleted: deleted,
            tel: tel,
            mobile: mobile,
            dada_address: dada_address,
            owner_id: owner_id,
            open_end: open_end,
            open_start: open_start,
            vice_mgr: vice_mgr,
            call_not_print: call_not_print,
            ship_way: ship_way,
            fn_price_controlledname: fn_price_controlledname,
            fn_price_controlled: fn_price_controlled,
            bdInfo: bdInfo,
            templateInfo: templateInfo,
            sale_category: sale_category
        };
    }

    onAddUser(is_vice) {
        let storeId = this.state.store_id;
        let storeData = this.getStoreEditData();
        this.onPress(Config.ROUTE_USER_ADD, {
            type: 'add',
            pageFrom: 'storeAdd',
            storeData: storeData,
            store_id: storeId,
            onBack: (userId, userMobile, userName) => this.onCreateUser(userId, userMobile, userName, is_vice)
        });
        return false;
    }

    componentDidMount() {

        const accessToken = this.props.global.accessToken;
        HttpUtils.get.bind(this.props)(`/v1/new_api/Stores/sale_categories?access_token=${accessToken}`, {}).then(res => {

            res.map((v, i) => {
                v.label = v.name
                v.value = v.id
            })
            this.setState({
                shelfNos: res
            })
        }).catch((success, errorMsg) => {
            this.showErrorToast(errorMsg)
        })
        this.props.navigation.setParams({
            goToCopy: () => {
                this.setState({goToCopy: true});
            },
            goToReset: () => {
                this.setState({goToReset: true});
            }
        });
    }

    UNSAFE_componentWillMount() {
        let {currVendorId} = tool.vendor(this.props.global);
        const accessToken = this.props.global.accessToken;

        let isServiceMgrUrl = `api/is_service_mgr/${currVendorId}?access_token=${accessToken}`
        //判断是否是业务人员
        getWithTpl(isServiceMgrUrl, response => {
            if (response.ok) {
                this.setState({
                    isLoading: false,
                    isServiceMgr: response.obj.is_mgr
                });
            }
        }, error => {
            console.log("error:%o", error);
        })

        let {editStoreId} = this.props.route.params;
        if (editStoreId) {
            const api = `api/read_store/${editStoreId}?access_token=${accessToken}`
            HttpUtils.get.bind(this.props)(api).then(store_info => {


                this.setStateByStoreInfo(store_info, currVendorId, accessToken);
            })
        } else {
            this.setStateByStoreInfo({}, currVendorId, accessToken)
        }
        let isBdUrl = `api/is_bd/${currVendorId}?access_token=${accessToken}`;
        getWithTpl(
            isBdUrl,
            response => {
                if (response.ok) {
                    this.setState({
                        isLoading: false,
                        isBd: response.obj.is_bd
                    });
                }
            },
            error => {
                console.log("error:%o", error);
            }
        );

    }

    onPress(route, params = {}) {
        let _this = this;
        InteractionManager.runAfterInteractions(() => {
            _this.props.navigation.navigate(route, params);

        });
    }

    onCreateUser(userId, userMobile, userName, isViceMgr) {
        if (isViceMgr) {
            if (userId > 0) {
                const vice_mgr = this.state.vice_mgr;
                let viceMgrs = !!vice_mgr ? vice_mgr.split(",") : []
                if (viceMgrs.indexOf(userId) === -1) {
                    viceMgrs.push(userId)
                    this.setState({
                        vice_mgr: viceMgrs.join(",")
                    })
                }
            }
        } else {
            this.setState({
                owner_id: userId,
                mobile: userMobile,
                createUserName: userName
            });
        }
    }

    onSetOwner(worker) {
        console.log(worker)
        this.setState({
            workerPopupVisible: false,
            owner_id: worker.id,
            mobile: worker.mobilephone ? worker.mobilephone : ""
        });
    }

    _hideDateTimePicker = () =>
        this.setState({
            isStartVisible: false,
            isEndVisible: false
        });

    _handleDatePicked = (date) => {

        let Hours = date.getHours();
        let Minutes = date.getMinutes();
        Hours = Hours < 10 ? "0" + Hours : Hours;
        Minutes = Minutes < 10 ? "0" + Minutes : Minutes;
        let confirm_time = `${Hours}:${Minutes}`;
        if (this.state.timerType === "start") {
            let end_hour = this.state.open_time_conf[this.state.timerIdx].end_time.split(":")[0];
            if (Hours > end_hour) {

                ToastLong("开始营业时间不能大于结束营业时间");
            } else {
                this.state.open_time_conf[this.state.timerIdx].start_time = confirm_time;
                this.setState({open_time_conf: this.state.open_time_conf});
            }
        } else {
            let start_hour = this.state.open_time_conf[this.state.timerIdx].start_time.split(":")[0];
            if (start_hour > Hours) {

                ToastLong("结束营业时间不能小于开始营业时间");
            } else {
                this.state.open_time_conf[this.state.timerIdx].end_time = confirm_time;
                this.setState({open_time_conf: this.state.open_time_conf});
            }
        }
        this._hideDateTimePicker()

    };

    doUploadImg = qualification => {
        this.setState({
            isUploadingImage: true
        });
        let barrier = simpleBarrier();
        let self = this;
        this.upload(qualification.bossImageInfo, "StoreBoss", barrier);
        this.upload(qualification.storeImageInfo, "StoreImage", barrier);
        qualification.imageList.map(element => {
            this.upload(element.imageInfo, "StoreImageList", barrier);
        });
        let doneUpload = () => {
            let rmIds = qualification.rmIds;
            let existImgIds = self.state.existImgIds;
            let ids = _.difference(existImgIds, rmIds); //去掉rmids中的和existimgids中重复的去掉 返回去重后的existImgIds
            let fileIds = self.fileId;
            fileIds = fileIds.concat(ids);
            self.fileId = fileIds;
            self.setState({
                isUploadingImage: false,
                fileId: fileIds,
                qualification: qualification,
                imageList: qualification.imageList, // array
                storeImageUrl: qualification.storeImageUrl,
                storeImageInfo: qualification.storeImageInfo,
                bossImageUrl: qualification.bossImageUrl,
                bossImageInfo: qualification.bossImageInfo
            });
        };
        //存在图片上传
        if (barrier.getRequiredCallbacks() > 0) {
            barrier.endWith(doneUpload);
        } else {
            doneUpload();
        }
    };

    getReceiveSecretKey() {
        const {store_id} = this.state
        const self = this
        const {accessToken} = this.props.global;
        const url = `api/get_store_receive_secret_key/${store_id}?access_token=${accessToken}`;
        FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.get(url)).then(resp => resp.json()).then(resp => {
            let {ok, obj, reason} = resp;
            if (ok) {
                self.setState({receiveSecretKey: obj})
            } else {
                ToastShort(reason)
            }
        })
    }

    copyReceiveSecretKey(text) {
        Clipboard.setString(text)
        ToastLong('已复制到剪切板')
    }

    getViceMgrName() {
        const {vice_mgr, user_list} = this.state;
        let vice_mgr_name = "";
        if (!!vice_mgr && vice_mgr !== "0") {
            for (let vice_mgr_id of vice_mgr.split(",")) {
                if (vice_mgr_id > 0) {
                    let user_info = user_list[vice_mgr_id] || {};
                    let mgr_name = user_info["name"] || user_info["nickname"] || vice_mgr_id;
                    //let mgr_tel = user_info['mobilephone'];
                    if (!!mgr_name) {
                        if (vice_mgr_name !== "") {
                            vice_mgr_name += ",";
                        }
                        vice_mgr_name += mgr_name;
                    }
                }
            }
        }

        let viceMgrNames = vice_mgr_name || "点击选择店助";


        return viceMgrNames
    }

    getStoreMgrName() {
        const {owner_id, user_list} = this.state;
        console.log(user_list,'user_list')
        console.log(owner_id,'owner_id')

        let store_mgr_name;
        if (owner_id > 0) {
            const owner = user_list[owner_id];
            if (!owner) {
                store_mgr_name = this.state.createUserName || '-'
            } else {
                store_mgr_name = `${owner['nickname']}(${owner['mobilephone']})`
            }
        } else {
            store_mgr_name = "-";
        }

        return store_mgr_name;
    }

    showWorkerPopup(is_vice) {
        Alert.alert('提示', '请选择方式', [
            {'text': '取消'},
            {
                'text': '搜索员工',
                onPress: () => this.setState({workerPopupMulti: is_vice}, () => {
                    this.setState({workerPopupVisible: true})
                })
            },
            {
                'text': '添加员工',
                onPress: () => this.onAddUser(is_vice)
            }
        ])
    }

    renderRemark() {
        const {isServiceMgr} = this.state
        return isServiceMgr ? (
            <View>

                <CellsTitle style={styles.cell_title}>备注</CellsTitle>
                <Cells style={[styles.cell_box]}>
                    <Cell customStyle={{paddingVertical: pxToDp(10)}}>
                        <CellBody>
                            <TextArea
                                value={this.state.remark}
                                onChange={(remark) => {
                                    this.setState({remark})
                                }}
                                showCounter={false}
                                underlineColorAndroid="transparent" //取消安卓下划线
                                style={{borderWidth: 1, borderColor: '#efefef', height: pxToDp(200)}}
                            >
                            </TextArea>
                        </CellBody>
                    </Cell>
                </Cells>
            </View>
        ) : null
    }

    setAddress(res) {
        // 门店地址 dada_address   所属城市 selectCity  所属区域 district

        let lat = res.location.substr(res.location.lastIndexOf(",") + 1, res.location.length);
        let Lng = res.location.substr(0, res.location.lastIndexOf(","));

        this.setState({
            selectCity: {
                name: res.cityname,
                cityId: res.citycode
            },
            district: res.adname,
            location_long: Lng,
            location_lat: lat,
        }, () => {

        })

    }

    setOrder(res) {
        this.setState({
            ship_way: res.ship_way,
            call_not_print: res.call_not_print
        })

    }

    setBank(res) {
        this.setState({
            bankcard_code: res.bankcard_code,
            bankcard_address: res.bankcard_address,
            bankcard_username: res.bankcard_username,
        })

    }

    renderReceiveSecretKey() {
        let {isServiceMgr, receiveSecretKey} = this.state
        return isServiceMgr ? (
            <Cell>
                <CellHeader>
                    <Label style={[styles.cell_label]}>收款密钥</Label>
                </CellHeader>
                <CellBody>
                    {
                        receiveSecretKey ?
                            <View>
                                <Text>{receiveSecretKey}</Text>
                                <Button onPress={() => this.copyReceiveSecretKey(receiveSecretKey)}>
                                    <Text style={{fontSize: pxToDp(24)}}>复制</Text>
                                </Button>
                            </View> :
                            <Button onPress={() => this.getReceiveSecretKey()}>
                                <Text style={{fontSize: pxToDp(24)}}>获取收款密钥</Text>
                            </Button>
                    }
                </CellBody>
            </Cell>
        ) : null
    }

    render() {
        let {
            store_id,
            alias,
            name,
            district,
            owner_name,
            owner_nation_id,
            location_long,
            location_lat,
            deleted,
            tel,
            mobile,
            dada_address,
            owner_id,
            open_end,
            open_start,
            vice_mgr,
            call_not_print,
            ship_way,
            reservation_order_print,

            printer_cfg,
            auto_add_tips,
            user_list,
            createUserName,
            datePickerValue

        } = this.state;
        return this.state.isLoading ? (
            <LoadingView/>
        ) : (this.state.btn_type === 'edit' && !this.state.store_id ? <View><Text>您不能编辑本店详情</Text></View> :

                <View style={{flex: 1}}>


                    <ScrollView style={{backgroundColor: colors.main_back}}>
                        <If condition={this.state.err_num > 0}>
                            <View style={{
                                flexDirection: 'row',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                marginTop: pxToDp(10),
                                marginBottom: pxToDp(10)
                            }}>
                                <Text style={{
                                    fontSize: pxToDp(25),
                                    marginTop: pxToDp(15),
                                    marginLeft: pxToDp(5),
                                    color: '#E88A8A',
                                    textDecorationLine: 'underline',
                                }}>检测到{this.state.err_num}家配送平台所留信息不一致</Text>
                                <Button type={"primary"} size={'small'} onPress={() => {
                                    this.onPress(Config.ROUTE_DELIVERY_LIST);
                                }}
                                        style={{
                                            marginLeft: pxToDp(40),
                                            backgroundColor: "#EE2626",
                                            borderWidth: 0
                                        }}>去修改</Button>
                            </View>
                        </If>

                        <Cells style={[styles.cell_box]}>

                            <Cell customStyle={[styles.cell_rowTitle]}>
                                <CellBody>
                                    <Text style={[styles.cell_rowTitleText]}>门店信息</Text>
                                </CellBody>
                            </Cell>

                            <Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <Label style={[styles.cell_label]}>店铺名称</Label>
                                </CellHeader>
                                <CellBody>
                                    <Input
                                        onChangeText={name => this.setState({name})}
                                        value={name}
                                        style={[styles.cell_input]}
                                        placeholder="64个字符以内"
                                        underlineColorAndroid="transparent" //取消安卓下划线
                                        editable={this.state.isServiceMgr}
                                    />
                                </CellBody>
                            </Cell>
                            <Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <Label style={[styles.cell_label]}>门店电话</Label>
                                </CellHeader>
                                <CellBody>
                                    <Input
                                        onChangeText={tel => this.setState({tel})}
                                        value={tel}
                                        style={[styles.cell_input]}
                                        placeholder="请输入店铺电话"
                                        maxLength={18} // 可输入的最大长度
                                        keyboardType="numeric" //默认弹出的键盘
                                        underlineColorAndroid="transparent" //取消安卓下划线
                                    />
                                </CellBody>
                            </Cell>
                            <Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <Label style={[styles.cell_label]}>门店地址</Label>
                                </CellHeader>
                                <CellBody>
                                    <Input
                                        onChangeText={dada_address => this.setState({dada_address})}
                                        value={dada_address}
                                        style={[styles.cell_input]}
                                        placeholder="请输入门店地址"
                                        underlineColorAndroid="transparent" //取消安卓下划线
                                    />
                                </CellBody>
                            </Cell>
                            <Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <Label style={[styles.cell_label]}>定位信息</Label>
                                </CellHeader>
                                <CellBody>
                                    <TouchableOpacity

                                        onPress={() => {
                                            let center = "";
                                            if (location_long && location_lat) {
                                                center = `${location_long},${location_lat}`;
                                            }
                                            const params = {
                                                keywords: this.state.dada_address,
                                                onBack: (res) => {
                                                    this.setAddress.bind(this)(res)
                                                },
                                                action: Config.LOC_PICKER,
                                                center: center,
                                                isType: 'fixed',
                                            };
                                            this.onPress(Config.ROUTE_SEARC_HSHOP, params);
                                        }}
                                    >

                                        <Text style={[styles.body_text]}>
                                            {location_long !== "" && location_lat !== ""
                                                ? `${location_long},${location_lat}`
                                                : "点击选择地址"}
                                            <Entypo name="chevron-right" style={styles.right_icon}/>


                                        </Text>
                                    </TouchableOpacity>
                                </CellBody>
                            </Cell>

                            {this.state.isServiceMgr ? (
                                <Cell customStyle={[styles.cell_row]}>
                                    <CellHeader>
                                        <Label style={[styles.cell_label]}>门店类型</Label>
                                    </CellHeader>
                                    <CellBody>

                                        <ModalSelector
                                            onChange={option => {
                                                this.setState({
                                                    fn_price_controlled: option.key,
                                                    fn_price_controlledname: option.label
                                                });
                                            }}
                                            data={this.state.shoptypes}
                                            skin="customer"
                                            defaultKey={-999}
                                        >
                                            <Text style={styles.body_text}>
                                                {this.state.fn_price_controlledname || '点击选择门店类型'}
                                                <Entypo name="chevron-right" style={styles.right_icon}/>
                                            </Text>
                                        </ModalSelector>
                                    </CellBody>
                                </Cell>
                            ) : null}

                            <Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <View>
                                        <Text style={[styles.cell_label]}>店铺类型</Text>
                                    </View>
                                </CellHeader>
                                <CellBody>
                                    <ModalSelector
                                        onChange={option => {

                                            if (option.value === 6 || option.value === 7) {
                                                ToastLong('鲜花/蛋糕类商品配送价格可能高于其他类型商品，且您在选择店铺类型后将不能随意更改，注册后如需更改请联系客服。')
                                            }
                                            this.setState({
                                                sale_categoryInfo: {
                                                    key: option.value,
                                                    label: option.label
                                                },

                                                sale_category_name: option.label

                                            });

                                            this.state.sale_category = option.value

                                        }}
                                        data={this.state.shelfNos}
                                        skin="customer"
                                        defaultKey={-999}
                                    >
                                        <Text style={styles.body_text}>
                                            {this.state.sale_category_name || '点击选择店铺类型'}
                                            <Entypo name="chevron-right" style={styles.right_icon}/>
                                        </Text>

                                    </ModalSelector>

                                </CellBody>
                            </Cell>


                            {/*商家资质不是bd不显示*/
                                this.state.isBd ? (
                                    <Cell customStyle={[styles.cell_row]}>
                                        <CellHeader>
                                            <Label style={[styles.cell_label]}>商家资质</Label>
                                        </CellHeader>
                                        <CellBody>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    this.props.navigation.navigate(
                                                        Config.ROUTE_SELECT_QUALIFICATION,
                                                        {
                                                            imageList: this.state.imageList,
                                                            storeImageUrl: this.state.storeImageUrl,
                                                            storeImageInfo: this.state.storeImageInfo,
                                                            bossImageUrl: this.state.bossImageUrl,
                                                            bossImageInfo: this.state.bossImageInfo,
                                                            callback: qualification => {
                                                                this.doUploadImg(qualification);
                                                            }
                                                        }
                                                    )
                                                }
                                            >
                                                <Text style={styles.body_text}>
                                                    {this.state.qualification.name}
                                                </Text>

                                            </TouchableOpacity>
                                        </CellBody>
                                    </Cell>
                                ) : null}

                            <Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <Label style={[styles.cell_label]}>身份证号</Label>
                                </CellHeader>
                                <CellBody>
                                    <Input
                                        onChangeText={owner_nation_id =>
                                            this.setState({owner_nation_id})
                                        }
                                        value={owner_nation_id}
                                        maxLength={18} // 可输入的最大长度
                                        style={[styles.cell_input]}
                                        placeholder="请输入本人身份证号"
                                        keyboardType="numeric" //默认弹出的键盘
                                        underlineColorAndroid="transparent" //取消安卓下划线
                                    />
                                </CellBody>
                            </Cell>

                            {this.state.isServiceMgr ? (
                                <Cell customStyle={[styles.cell_row]}>
                                    <CellHeader>
                                        <Label style={[styles.cell_label]}>选择模板店</Label>
                                    </CellHeader>
                                    <CellBody>
                                        {this.state.isLoadingStoreList ? (
                                            <Text style={styles.body_text}>
                                                正在获取模板店列表,请稍候！
                                            </Text>
                                        ) : (
                                            <ModalSelector
                                                onChange={option => {
                                                    this.setState({
                                                        templateInfo: {
                                                            key: option.key,
                                                            label: option.label
                                                        }
                                                    });
                                                }}
                                                data={this.state.templateList}
                                                skin="customer"
                                                defaultKey={-999}
                                            >
                                                <Text style={styles.body_text}>
                                                    {this.state.templateInfo.label || "点击选择模板店"}
                                                    <Entypo name="chevron-right" style={styles.right_icon}/>
                                                </Text>
                                            </ModalSelector>
                                        )}
                                    </CellBody>
                                </Cell>
                            ) : null}
                            {this.state.isBd ? (
                                <Cell customStyle={[styles.cell_row]}>
                                    <CellHeader>
                                        <Label style={[styles.cell_label]}>选择bd</Label>
                                    </CellHeader>
                                    <CellBody>
                                        {this.state.isGetbdList ? (
                                            <Text style={styles.body_text}>
                                                正在获取bd列表,请稍候！
                                            </Text>
                                        ) : (
                                            <ModalSelector
                                                onChange={option => {
                                                    this.setState({
                                                        bdInfo: {
                                                            key: option.key,
                                                            label: option.label
                                                        }
                                                    });
                                                }}
                                                data={this.state.bdList}
                                                skin="customer"
                                                defaultKey={-999}
                                            >
                                                <Text style={styles.body_text}>
                                                    {this.state.bdInfo.label || "点击选择bd"}
                                                    <Entypo name="chevron-right" style={styles.right_icon}/>
                                                </Text>
                                            </ModalSelector>
                                        )}
                                    </CellBody>
                                </Cell>
                            ) : null}
                            <Cell>

                                <CellHeader>
                                    <Label style={[styles.cell_label]}>营业时间</Label>
                                </CellHeader>
                                <CellBody>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.setState({
                                                timemodalType: true
                                            })
                                        }}>
                                        <Text style={styles.body_text}>
                                            {open_start} —— {open_end}
                                            <Entypo name="chevron-right" style={styles.right_icon}/>
                                        </Text>
                                    </TouchableOpacity>
                                </CellBody>

                            </Cell>
                        </Cells>

                        {/*营业时间弹窗*/}
                        <Modal visible={this.state.timemodalType}
                               onRequestClose={() => this.setState({timemodalType: false})}
                               transparent={true} animationType="slide"
                        >
                            <TouchableOpacity
                                style={{backgroundColor: 'rgba(0,0,0,0.25)', flex: 3, minHeight: pxToDp(200)}}
                                onPress={() => this.setState({timemodalType: false})}>
                            </TouchableOpacity>

                            <ScrollView style={{backgroundColor: colors.default_container_bg}}
                                        overScrollMode="always"
                                        automaticallyAdjustContentInsets={false}
                                        showsHorizontalScrollIndicator={false}
                                        showsVerticalScrollIndicator={false}>

                                <View style={{backgroundColor: colors.default_container_bg}}>
                                    <View style={{
                                        marginHorizontal: 10,
                                        borderBottomLeftRadius: pxToDp(20),
                                        borderBottomRightRadius: pxToDp(20),
                                        backgroundColor: colors.white,
                                        flexDirection: "column",
                                        justifyContent: "space-evenly",
                                        marginBottom: pxToDp(10)
                                    }}>
                                        <View style={{padding: pxToDp(20)}}>
                                            <Text>营业时间</Text>
                                        </View>
                                        {this.state.open_time_conf && this.state.open_time_conf.map((timeItem, idx) => {

                                            return <View style={[styles.timerbox]}>
                                                <View style={[styles.timerItem]}>
                                                    <TouchableOpacity
                                                        onPress={() => {

                                                            if (this.state.isServiceMgr) {
                                                                this.state.timerIdx = idx
                                                                this.state.timerType = "start"
                                                                this.setState({isStartVisible: true});
                                                            }
                                                            console.log(this.state.isStartVisible)
                                                        }}
                                                    >
                                                        <Text style={styles.body_text}>{timeItem.start_time}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={[styles.timerItem]}>
                                                    <Text>——</Text>
                                                </View>
                                                <View style={[styles.timerItem]}>

                                                    <TouchableOpacity
                                                        onPress={() => {

                                                            if (this.state.isServiceMgr) {
                                                                this.state.timerIdx = idx
                                                                this.state.timerType = "end"
                                                                this.setState({isStartVisible: true});
                                                            }
                                                        }}
                                                    >
                                                        <Text style={styles.body_text}>{timeItem.end_time}</Text>
                                                    </TouchableOpacity>

                                                </View>
                                                <View style={[styles.timerItem]}>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            let arr = [];
                                                            this.state.open_time_conf.map((val, index) => {
                                                                if (index !== idx) {
                                                                    arr.push(val)
                                                                }
                                                            })


                                                            this.setState({open_time_conf: arr})
                                                        }}
                                                    >
                                                        <Text>❌</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        })}


                                        {this.state.isStartVisible && (
                                            this.showDatePicker()
                                        )}


                                        {tool.length(this.state.open_time_conf) < 3 ? <View style={styles.btn1}>
                                            <View style={{flex: 1}}><TouchableOpacity onPress={() => {
                                                let timeobj = {};
                                                timeobj['start_time'] = "00:00";
                                                timeobj['end_time'] = "24:00";
                                                this.state.open_time_conf.push(timeobj);
                                                this.setState({
                                                    open_time_conf: this.state.open_time_conf
                                                })

                                            }} style={{marginHorizontal: pxToDp(10)}}><JbbText
                                                style={styles.btnText}>添加营业时间</JbbText></TouchableOpacity></View>
                                        </View> : null}
                                    </View>
                                </View>
                            </ScrollView>
                        </Modal>


                        <Cells style={[styles.cell_box]}>

                            <Cell customStyle={[styles.cell_rowTitle]}>
                                <CellBody>
                                    <Text style={[styles.cell_rowTitleText]}>店长信息</Text>
                                </CellBody>
                            </Cell>

                            <Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <Label style={[styles.cell_label]}>店长</Label>
                                </CellHeader>
                                <CellBody>
                                    <TouchableOpacity onPress={() => this.showWorkerPopup(false)}>
                                        <View>
                                            <Text style={styles.body_text}>
                                                {owner_id > 0 ? this.getStoreMgrName() : "点击选择店长"}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </CellBody>
                            </Cell>
                            <Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <Label style={[styles.cell_label]}>店长手机号</Label>
                                </CellHeader>
                                <CellBody>
                                    <Input
                                        onChangeText={mobile => this.setState({mobile})}
                                        value={mobile}
                                        maxLength={11} // 可输入的最大长度
                                        style={[styles.cell_input]}
                                        placeholder="店长手机号"
                                        keyboardType="numeric" //默认弹出的键盘
                                        underlineColorAndroid="transparent" //取消安卓下划线
                                    />
                                </CellBody>
                            </Cell>
                            <Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <Label style={[styles.cell_label]}>店助</Label>
                                </CellHeader>
                                <CellBody>
                                    <TouchableOpacity onPress={() => this.showWorkerPopup(true)}>
                                        <Text style={styles.body_text}>
                                            {this.getViceMgrName()}
                                            <Entypo name="chevron-right" style={styles.right_icon}/>
                                        </Text>
                                    </TouchableOpacity>
                                </CellBody>
                            </Cell>
                        </Cells>


                        <Cells style={[styles.cell_box]}>
                            <Cell customStyle={[styles.cell_rowTitle]}>
                                <CellBody>
                                    <Text style={[styles.cell_label]}>订单信息(选填,可不填)</Text>
                                </CellBody>
                                <CellBody>
                                    <TouchableOpacity
                                        onPress={() => {
                                            // ROUTE_SHOP_ORDER
                                            this.props.navigation.navigate(Config.ROUTE_SHOP_ORDER, {
                                                ship_way: this.state.ship_way,
                                                call_not_print: this.state.call_not_print,
                                                onBack: (res) => {
                                                    this.setOrder.bind(this)(res)
                                                },
                                            })
                                        }}>
                                        <Text style={styles.body_text}>

                                            <Entypo name="chevron-right" style={styles.right_icon}/>
                                        </Text>
                                    </TouchableOpacity>
                                </CellBody>
                            </Cell>

                        </Cells>

                        <Cells style={[styles.cell_box]}>
                            <Cell customStyle={[styles.cell_rowTitle]}>
                                <CellBody>
                                    <Text style={[styles.cell_label]}>银行卡信息(选填,可不填)</Text>
                                </CellBody>
                                <CellBody>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.props.navigation.navigate(Config.ROUTE_SHOP_BANK, {
                                                bankcard_code: this.state.bankcard_code,
                                                bankcard_address: this.state.bankcard_address,
                                                bankcard_username: this.state.bankcard_username,
                                                onBack: (res) => {
                                                    this.setBank.bind(this)(res)
                                                },
                                            })


                                        }}>
                                        <Text style={styles.body_text}>

                                            <Entypo name="chevron-right" style={styles.right_icon}/>
                                        </Text>
                                    </TouchableOpacity>
                                </CellBody>
                            </Cell>

                        </Cells>

                        <CellsTitle style={styles.cell_title}>结算收款帐号</CellsTitle>
                        <Cells style={[styles.cell_box]}>

                            <Cell customStyle={[styles.cell_rowTitle]}>
                                <CellBody>
                                    <Text style={[styles.cell_rowTitleText]}>店长信息</Text>
                                </CellBody>
                            </Cell>

                            <Cell customStyle={[styles.cell_row]}>
                                <CellHeader>
                                    <Label style={[styles.cell_label]}>店长实名</Label>
                                </CellHeader>
                                <CellBody>
                                    <Input
                                        onChangeText={v => {
                                            this.setState({owner_name: v});
                                        }}
                                        value={this.state.owner_name}
                                        style={[styles.cell_input]}
                                        underlineColorAndroid="transparent" //取消安卓下划线
                                    />
                                </CellBody>
                            </Cell>
                            {this.renderReceiveSecretKey()}
                        </Cells>

                        {this.renderRemark()}


                        <Dialog
                            onRequestClose={() => {
                            }}
                            visible={this.state.goToReset}
                            buttons={[
                                {
                                    type: "warn",
                                    label: "确认",
                                    onPress: () => {
                                        this.onStoreCopyGoods(true);
                                    }
                                },
                                {
                                    type: "default",
                                    label: "取消",
                                    onPress: () => {
                                        this.setState({goToReset: false});
                                    }
                                }
                            ]}
                        >
                            <Text>
                                您选择了重置门店的所有商品、销售状态和价格，一旦修改，商户之前的工作全部归零，不可撤销！
                            </Text>
                        </Dialog>
                        <Dialog
                            onRequestClose={() => {
                            }}
                            visible={this.state.goToCopy}
                            buttons={[
                                {
                                    type: "warn",
                                    label: "确认",
                                    onPress: () => {
                                        this.onStoreCopyGoods(false);
                                    }
                                },
                                {
                                    type: "default",
                                    label: "取消",
                                    onPress: () => {
                                        this.setState({goToCopy: false});
                                    }
                                }
                            ]}
                        >
                            <Text>模板店里商品太多，不要轻易复制！</Text>
                        </Dialog>
                    </ScrollView>


                    <Button
                        onPress={() => {
                            this.onStoreAdd();
                        }}
                        type="primary"
                        style={styles.btn_submit}
                    >
                        {this.state.btn_type === "edit" ? "确认修改" : "创建门店"}
                    </Button>


                    {/*员工列表*/
                    }
                    <WorkerPopup
                        multiple={this.state.workerPopupMulti}
                        visible={this.state.workerPopupVisible}
                        selectWorkerIds={!!vice_mgr ? vice_mgr.split(",") : []}
                        onClickWorker={(worker) => {
                            this.onSetOwner(worker);
                            this.setState({workerPopupVisible: false});
                        }}
                        onComplete={(workers) => {
                            let vice_mgr = _.map(workers, 'id').join(",");
                            this.setState({vice_mgr, workerPopupVisible: false});
                        }}
                        onCancel={() => this.setState({workerPopupVisible: false})}
                    />
                </View>

        )
            ;

    }

    showDatePicker() {
        let {datePickerValue} = this.state
        return <List style={{marginTop: 12}}>
            <DatePickerView value={datePickerValue} minDate={new Date(1598051730000)}
                            minuteStep={10}
                            mode={"time"}
                            onChange={(value) => {
                                this.setState({datePickerValue: value})
                            }
                            }>
            </DatePickerView>
            <TouchableOpacity onPress={() => {
                this._handleDatePicked(this.state.datePickerValue)
            }} style={styles.modalCancel1}>
                <View>
                    <Text style={styles.modalCancelText1}>确认营业时间</Text>
                </View>
            </TouchableOpacity>
        </List>
    }

    upload = (imageInfo, name, barrier) => {
        let handleResp = resp => {
            if (resp.ok) {
                this.fileId.push(resp.obj.file_id);
            } else {
                ToastLong(resp.desc);
            }
            return resp;
        };
        if (imageInfo) {
            uploadImg(imageInfo, barrier.waitOn(handleResp), name, 1);
        }
    };

    onStoreAdd() {
        if (this.state.isUploadingImage) {
            ToastLong("商家资质正在上传！请稍后再提交！");
            return false;
        }
        if (this.state.onSubmitting) {
            ToastLong("正在提交...");
            return false;
        }
        const {dispatch} = this.props;
        const {accessToken} = this.props.global;
        let _this = this;
        if (this.onCheckData()) {
            let {
                currVendorId,
                btn_type,
                store_id,
                type,
                alias,
                name,
                district,
                owner_name,
                owner_nation_id,
                location_long,
                location_lat,
                deleted,
                tel,
                mobile,
                dada_address,
                owner_id,
                open_end,
                open_start,
                vice_mgr,
                call_not_print,
                ship_way,
                printer_cfg,
                auto_add_tips,
                fn_price_controlled,
                bankcard_code,
                bankcard_address,
                bankcard_username,
                reservation_order_print,
                remark,
                sale_category
            } = this.state;

            let send_data = {
                app_open_time_conf: JSON.stringify(this.state.open_time_conf),
                type: type, //品牌id
                name: name,
                city: this.state.selectCity.name,
                owner_name: owner_name,
                owner_nation_id: owner_nation_id,
                owner_id: owner_id,
                mobile: mobile,
                tel: tel,
                dada_address: dada_address,
                location_long: location_long,
                location_lat: location_lat,
                open_start: open_start,
                open_end: open_end,
                district: district,
                call_not_print: call_not_print,
                ship_way: ship_way,
                vice_mgr: vice_mgr,
                remark: remark,
                bankcard_code: bankcard_code,
                reservation_order_print: reservation_order_print,
                bankcard_address: bankcard_address,
                bankcard_username: bankcard_username,
                fn_price_controlled: fn_price_controlled,
                sale_category
            };
            if (this.state.isServiceMgr || this.state.isBd) {
                send_data["tpl_store"] = this.state.templateInfo.key ? this.state.templateInfo.key : 0;

                send_data["service_bd"] = this.state.bdInfo.key ? this.state.bdInfo.key : 0;
            }

            if (this.state.isBd) {
                let data = this.state.fileId.join(",");
                send_data["attachment"] = data;
            }
            if (store_id > 0) {
                send_data.id = store_id;
            }

            _this.setState({onSubmitting: true});
            showModal('提交中')


            InteractionManager.runAfterInteractions(() => {
                dispatch(
                    saveOfflineStore(send_data, accessToken, resp => {
                        hideModal()
                        _this.setState({onSubmitting: false});
                        if (resp.ok) {
                            let msg = btn_type === "add" ? "添加门店成功" : "操作成功";
                            ToastShort(msg);
                            const {goBack, state} = _this.props.navigation;
                            if (this.props.route.params.actionBeforeBack) {
                                this.props.route.params.actionBeforeBack({shouldRefresh: true});
                            }
                            goBack();
                        }
                    })
                );
            });
        }
    }

    onCheckData() {
        let {
            name,
            district,
            owner_name,
            owner_nation_id,
            location_long,
            location_lat,
            tel,
            mobile,
            dada_address,
            owner_id,
            open_end,
            open_start,
            vice_mgr,
            call_not_print,
            ship_way,
            printer_cfg,
            auto_add_tips,
            sale_category
        } = this.state;
        let error_msg = "";

        if (name.length < 1 || name.length > 64) {
            error_msg = "店名应在1-64个字符内";
        } else if (!sale_category) {
            error_msg = "请选择店铺类型";
        } else if (tel.length < 8 || tel.length > 11) {
            error_msg = "门店电话格式有误";
        } else if (dada_address.length < 1) {
            error_msg = "请输入门店地址";
        } else if (district.length < 1) {
            error_msg = "请输入门店所在区域";
        } else if (location_long === "" || location_lat === "") {
            error_msg = "请选择门店定位信息";
        } else if (!this.state.selectCity.cityId) {
            error_msg = "请选择门店所在城市";
        } else if (!owner_nation_id || (owner_nation_id.length !== 18 && owner_nation_id.length !== 11)) {
            // error_msg = "身份证格式有误";
        } else if (this.state.isBd && !this.state.templateInfo.key) {
            // error_msg = "请选择模板店";
        } else if (this.state.isBd && !this.state.bdInfo.key) {
            // error_msg = "请选择bd";
        } else if (!(owner_id > 0)) {
            error_msg = "请选择门店店长";
        } else if (mobile.length !== 11) {
            error_msg = "店长手机号格式有误";
        } else if (!owner_name) {
            error_msg = "请输入店长实名";
        }
        if (error_msg === "") {
            this.setState({onSubmitting: true});
            showModal('提交中')
            return true;
        } else {
            ToastLong(error_msg);
            return false;
        }
    }
}

// define your styles
const
    styles = StyleSheet.create({
        btn_select: {
            marginRight: pxToDp(20),
            height: pxToDp(60),
            width: pxToDp(60),
            fontSize: pxToDp(40),
            color: colors.color666,
            textAlign: "center",
            textAlignVertical: "center"
        },
        cell_rowTitle: {
            height: pxToDp(90),
            justifyContent: 'center',
            paddingRight: pxToDp(10),
            borderTopColor: colors.white,
            borderBottomColor: "#EBEBEB",
            borderBottomWidth: pxToDp(1)
        },
        cell_rowTitleText: {
            fontSize: pxToDp(30),
            color: colors.title_color
        },
        cell_title: {
            marginBottom: pxToDp(10),
            fontSize: pxToDp(26),
            color: colors.color999
        },
        cell_box: {
            // marginTop: 0,
            // borderTopWidth: pxToDp(1),
            // borderBottomWidth: pxToDp(1),
            // borderColor: colors.color999,

            margin: 10,
            borderRadius: pxToDp(20),
            backgroundColor: colors.white,
            borderTopColor: colors.white,
            borderBottomColor: colors.white
        },
        cell_row: {
            height: pxToDp(90),
            justifyContent: "center"
        },
        cell_input: {
            //需要覆盖完整这4个元素
            fontSize: pxToDp(30),
            height: pxToDp(90),
            textAlign: "right",
            overflow: "hidden"

        },
        cell_label: {

            fontSize: pxToDp(26),
            color: colors.color666,
            // width: pxToDp(234),
            // fontSize: pxToDp(30),
            // fontWeight: "bold",
            // color: colors.color333
        },
        btn_submit: {
            margin: pxToDp(30),
            marginBottom: pxToDp(50),
            backgroundColor: "#6db06f"
        },
        right_icon: {
            fontSize: pxToDp(40),
            color: colors.color666,
            height: pxToDp(60),
            width: pxToDp(40),
            marginTop: 16,
            justifyContent: "center",
            alignItems: "center"
        },
        body_text: {
            paddingLeft: pxToDp(8),
            fontSize: pxToDp(30),
            color: colors.color333,
            lineHeight: pxToDp(70),
            height: pxToDp(70),
            textAlignVertical: "center",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "right",

        },
        modalCancel: {
            width: '100%',
            height: pxToDp(80),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: pxToDp(10),
            marginTop: pxToDp(20)
        },
        modalCancel1: {
            width: '100%',
            height: pxToDp(80),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F5F5F5',
            borderRadius: pxToDp(10),
            marginTop: pxToDp(20)
        },
        modalCancelText: {
            color: 'black',
            fontSize: pxToDp(40)
        },
        modalCancelText1: {
            color: color.theme,
            fontSize: pxToDp(40)
        },
        btn1: {
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginVertical: pxToDp(15),
            marginBottom: pxToDp(10)
        },

        btnText: {
            height: 40,
            backgroundColor: colors.main_color,
            color: 'white',
            fontSize: pxToDp(30),
            fontWeight: "bold",
            textAlign: "center",
            paddingTop: pxToDp(15),
            paddingHorizontal: pxToDp(30),
            borderRadius: pxToDp(10)
        },
        timerbox: {
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: "#f7f7f7"

        },
        timerItem: {

            paddingVertical: pxToDp(4)
        }

    });

//make this component available to the app
export default connect(mapStateToProps, mapDispatchToProps)(StoreAddScene);
