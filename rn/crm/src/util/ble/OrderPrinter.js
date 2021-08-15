import ECS from "./Ecs"

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

const OrderPrinter = {
   printOrder
}

module.exports = OrderPrinter
