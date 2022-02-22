import React, {PureComponent} from 'react'
import {connect} from "react-redux";
import HttpUtils from "../../../util/http";
import {bindActionCreators} from "redux";
import * as globalActions from "../../../reducers/global/globalActions";
import {
    Clipboard,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import pxToDp from "../../../util/pxToDp";
import colors from "../../../styles/colors";
import CallImg from "../CallImg";
import native from "../../../common/native";
import tool from "../../../common/tool";
import {showError, ToastShort} from "../../../util/ToastUtils";
import {Cell, CellBody, CellFooter, Cells} from "../../../weui";
import JbbText from "../../component/JbbText";
import {List} from "@ant-design/react-native";

function mapStateToProps(state) {
    const {global} = state;
    return {global: global};
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch, ...bindActionCreators({
            ...globalActions
        }, dispatch)
    }
}
class ImageBtn extends PureComponent {
    constructor(props) {
        super(props)
    }

    render() {
        const {source, onPress, imageStyle, ...others} = this.props;
        return <TouchableOpacity onPress={onPress} others>
            <Image source={source} style={[styles.btn4text, {alignSelf: 'center', marginLeft: pxToDp(20)}, imageStyle]}/>
        </TouchableOpacity>
    }
}
class ComplainDetails extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            changeHide:false,
            complain: []
        }
    }


    render() {
        return (
            <View>
                <View style={{marginTop: 4}}>
                    <Cells style={[styles.cell_box]}>
                        <Cell customStyle={[styles.cell_row]} onPress={() => {
                            this.changeHideFn()
                        }}>
                            <CellBody>
                                <Text style={[styles.cell_body_text]}>如何正确申请投诉或索赔？</Text>
                            </CellBody>
                            <CellFooter>
                                <ImageBtn source={
                                    this.state.changeHide ? require('../../../img/Order/pull_up.png') : require('../../../img/Order/pull_down.png')
                                }
                                          imageStyle={styles.pullImg}
                                />
                            </CellFooter>
                        </Cell>

                        <If condition={this.state.changeHide}>
                            {this.renderRrinter()}
                        </If>
                    </Cells>
                </View>
            </View>
        )
    }
    changeHideFn() {
        this.setState({
            changeHide:!this.state.changeHide
        })
    }
    renderRrinter = () => {

        return <View>
            <Text>1111</Text>
        </View>
    }
}

const styles = StyleSheet.create({

    cell_box: {
        marginTop: 0,
        borderTopWidth: pxToDp(1),
        borderBottomWidth: pxToDp(1),
        borderColor: colors.color999,
    },
    cell_row: {
        height: pxToDp(70),
        justifyContent: 'center',
        paddingRight: pxToDp(10),
    },
    cell_input: {
        //需要覆盖完整这4个元素
        fontSize: 15,
        height: 45,
        marginTop: 2,
        marginBottom: 2,
    },
    cell_body_text: {
        fontSize: pxToDp(30),
        fontWeight: 'bold',
        color: colors.color333,
    },
    right_btn: {
        fontSize: pxToDp(25),
        paddingTop: pxToDp(8),
        marginLeft: pxToDp(10),
    },

    image: {
        width: '100%',
        height: pxToDp(420),
    },
    btn_submit: {},
    pullImg: {
        width: pxToDp(90),
        height: pxToDp(72)
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(ComplainDetails)
