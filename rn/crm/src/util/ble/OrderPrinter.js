import ECS from "./Ecs"
import {getDeviceUUID} from "../../reducers/global/globalActions";
import HttpUtils from "../http";
import BleManager from "react-native-ble-manager";
import {fetchPrintHexStr} from "../../reducers/order/orderActions";

const _ = require('lodash');
const MAX_TITLE_PART = 16;

function printOrder(order) {

    ECS.resetByte();
    ECS.fontNormalHeightWidth();
    ECS.alignLeft();

    ECS.startLine(32);
    ECS.fontHeightTimes();
    ECS.text(" " + order.fullStoreName);
    ECS.printAndNewLine();
    ECS.printAndNewLine();
    ECS.text(order.platformWithId);
    ECS.text("    #"+order.dayId);
    ECS.printAndNewLine();

    const mobile = order.mobile.replace("_", "转").replace(",", "转");

    ECS.printAndNewLine();

    ECS.startLine(32);
    ECS.fontHeightTimes();
    ECS.text(`支付状态：${order.paid_done >= 1 ? "在线支付" : "待付款(以平台为准)"}`);
    ECS.printAndNewLine();

    ECS.startLine(32);
    ECS.fontHeightTimes();
    ECS.text(`${order.userName} ${mobile}`);
    ECS.printAndNewLine();
    ECS.text(order.address);

    ECS.printAndNewLine();

    ECS.startLine(32);
    ECS.fontNormalHeightWidth();
    ECS.text(`期望送达:${order.expectTimeStr}`);
    ECS.printAndNewLine();

    if (order.remark) {
        ECS.fontHeightTimes();
        ECS.text(`用户备注：${order.remark}`);
        ECS.printAndNewLine();
    }

    ECS.startLine(32);
    ECS.fontNormal();
    ECS.text("订单编号：" + "-" + order.platform_oid);
    ECS.printAndNewLine();
    ECS.fontNormal();
    ECS.text("下单时间：" + order.orderTime)
    ECS.printAndNewLine();

    ECS.startLine(32);
    ECS.fontHeightTimes();
    ECS.text("食材名称                   数量");
    ECS.printAndNewLine();
    ECS.text("--------------------------------")
    ECS.printAndNewLine();

    let total = 0;
    _.each(order.items, (item) => {
        let name = item.product_name
        const tagCode = item.tag_code
        if (tagCode && `${tagCode}` !== '0') {
            name = `${name}#${tagCode}`
        }

        if (item.price >= 0) {
           for(let idx = 0; idx < name.length; ) {
               let text = name.substring(idx, _.min(name.length, idx + MAX_TITLE_PART))
               const isEnd = idx + MAX_TITLE_PART >= name.length;
               if (isEnd) {
                   text = text + " x" + item.num
               }
               ECS.fontHeightTimes();
               ECS.text(text);
               ECS.printAndNewLine();
               if (isEnd) {
                   ECS.text("                                ");
                   ECS.printAndNewLine();
               }

               idx = idx + MAX_TITLE_PART;
           }
           total += item.num
        }
    })

    ECS.fontHeightTimes();
    ECS.text("合计");
    ECS.alignRight();
    ECS.text("x" + total);
    ECS.printAndNewLine();

    if (order.line_additional) {
        ECS.startLine(32)
        ECS.fontNormal();
        ECS.text(order.line_additional);
    }

    ECS.startLine(32);
    ECS.fontHeightTimes();
    ECS.text(order.line_money_total)
    ECS.printAndNewLine()

    ECS.startLine(32);
    ECS.fontNormal();
    ECS.text(order.print_footer1);
    ECS.printAndNewLine();
    ECS.text(order.print_footer2);

    if (order.print_footer3) {
        ECS.printAndNewLine();
        ECS.text(order.print_footer3)
    }

    ECS.printAndNewLine();
    ECS.hex("0D 0D 0D");
    ECS.walkPaper(4);

    return ECS.getByte();
}

function hexToBytes(hexStr) {
    ECS.resetByte();
    ECS.hex(hexStr);
    return ECS.getByte();
}

const sendToBt = (peripheral, service, bakeCharacteristic, btData, wmId, deviceId, props, okFn, errorFn, auto = 0) => {
    setTimeout(() => {
        BleManager.write(peripheral.id, service, bakeCharacteristic, btData).then(() => {
            const {accessToken} = props.global
            HttpUtils.post.bind(props)(`/api/order_log_print/${wmId}?access_token=${accessToken}`, {deviceId})
                .then(res => {
                }, (res) => {
                });
            if (typeof okFn == 'function') {
                okFn("ok")
            }
        }).catch((error) => {

            const {accessToken} = props.global
            HttpUtils.post.bind(props)(`/api/bluetooth_print_error_log/${wmId}/${auto}?error=${error}&access_token=${accessToken}`, {deviceId})
              .then(res => {
              }, (res) => {
              });
            if (typeof errorFn == 'function') {
                errorFn("打印错误", error)
            }
        });
    }, 300);
}


function printOrderToBt(props, peripheral, clb, wmId, order, auto = 0) {
    const service = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
    const bakeCharacteristic = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';
    const deviceId = getDeviceUUID();
    setTimeout(() => {
        BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
            fetchPrintHexStr.bind(props)(wmId, (ok, hex) => {
                if (ok) {
                    sendToBt(peripheral, service, bakeCharacteristic, hexToBytes(hex), wmId, deviceId, props, clb, clb, auto)
                } else {
                    if (order) {
                        const btData = printOrder(order);
                        sendToBt(peripheral, service, bakeCharacteristic, btData, wmId, deviceId, props, clb, clb, auto)
                    }
                }
            })
        }).catch((error) => {
            clb("通知打印机错误", error)
        });
    }, 200);
}

const OrderPrinter = {
    printOrder,
    sendToBt,
    print_order_to_bt: printOrderToBt
}

module.exports = OrderPrinter
