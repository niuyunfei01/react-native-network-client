import React from "react";
import {ScrollView, StyleSheet, Text} from "react-native";
import colors from "../../../pubilc/styles/colors";
import {Styles} from "./GoodsIncrementServiceStyle";

const styles = StyleSheet.create({

  content: {padding: 4, fontSize: 12, color: colors.color333, lineHeight: 21},
  bold: {fontWeight: 'bold'}
})
export default class MemberAgreementScene extends React.PureComponent {


  render() {
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={Styles.zoneWrap}>
        <Text style={[styles.content]}>
          <Text style={styles.bold}>
            &emsp;&emsp;外送帮会员服务由北京家帮帮科技有限公司（以下亦称“家帮帮”）提供。《外送帮会员服务协议》由您和家帮帮进行缔结，对双方具有同等
            法律效力。我们建议您仔细阅读本协议的全部内容，尤其是以加粗形式展示的、与您的权益（可能）存在重大关系的条款（包括相关约定
            家帮帮责任、
            您享有的权益、争议解决方式及司法管辖等条款），请您重点阅读。若您认为本协议中的加粗条款可能会导致您的部分或全部权利或利益受损，请您务必再次
            仔细阅读，在确保您已经理解、接受了加粗条款的前提下，继续使用外送帮会员收费服务事项。{`\n`}
            &emsp;&emsp;如果您不同意本协议中的任一或全部条款内容，请不要以确认形式（包括但不限于支付行为、或完成了成为会员的全部程序而在此过程中未
            向家帮帮提出关于本协议的任何异议）进行下一步操作或使用外送帮会员服务。当您以确认形式进行下一步操作或使用外送帮会员服务时，即表示您与家帮帮
            已达成服务关系，您自愿接受本协议并遵守本协议项下的全部约定。{`\n`}
            &emsp;&emsp;家帮帮有权变更本协议内容，一旦本协议内容发生变更的，家帮帮将在相应页面或以其他合理方式进行通知，请您仔细阅读。如果您不同意
            变更的内容的，您可以选择停止使用外送帮会员服务。如您继续使用外送帮会员服务的，则视为您已经同意变更的全部内容。更新后的外送帮会员服务协议
            自更新之日起生效。您在使用外送帮会员服务时必须完全、严格遵守本协议条款。{`\n`}
            &emsp;&emsp;一、使用服务{`\n`}
            &emsp;&emsp;1.外送帮会员服务为收费服务，您可以通过支付相应的服务费用购买服务。{`\n`}
          </Text>
          &emsp;&emsp;2.您在获取外送帮会员服务时，应当遵守法律法规、本协议约定，不侵犯第三方或家帮帮的合法权益。您不得自行（或协助他人）通过以下方式获取会员服务：{`\n`}
          &emsp;&emsp;（1）以商业性或其他非个人使用等目的；{`\n`}
          &emsp;&emsp;（2）通过机器人软件、蜘蛛软件、爬虫软件等任何自动程序、脚本、软件等方式；{`\n`}
          &emsp;&emsp;（3）通过不正当手段或以违反诚实信用原则的方式（如利用规则漏洞、利用系统漏洞、滥用会员身份、黑色产业、投机等）。{`\n`}
          <Text style={styles.bold}>
            &emsp;&emsp;二、账号管理及安全{`\n`}
            &emsp;&emsp;1.您应自行负责并妥善、正确地保管、使用、维护您的会员账号和密码，并对您的账号和密码采取必要和有效的保密措施。非家帮帮
            法定过错导致的任何遗失、泄露、被篡改、被盗以及其他因保管、使用、维护不当而造成的损失，您应自行承担。{`\n`}
            &emsp;&emsp;2.请您特别注意，您的会员账号下的行为视为您本人的行为，您应对您的外送帮会员账号下发生的行为或通过该账号进行的行为负责。{`\n`}
            &emsp;&emsp;3.您的会员账号仅限您本人使用，您不得将会员账号及权益转让、赠与、售卖、租借、分享给第三方，否则因上述行为导致账号遗失、
            泄露、被篡改、被盗等损失的均应当由您自行承担。{`\n`}
          </Text>
          &emsp;&emsp;4.特别提醒您，使用外送帮会员权益需要满足一定软件版本、设备及/或操作系统要求，因此，家帮帮建议您及时升级应用程序或操作系统
          版本、或更换使用设备以顺利的享受会员权益。{`\n`}
          &emsp;&emsp;5.外送帮会员服务所有权及相关知识产权归家帮帮所有或经过授权使用，您仅拥有本协议项下拥有本协议项下外送帮会员服务的使用权。{`\n`}
          <Text style={styles.bold}>&emsp;&emsp;三、服务期限{`\n`} </Text>
          &emsp;&emsp;1.会员服务的服务期限以支付相应会员费用对应的服务期限为准，您可以通过登录外送帮会员中心查询。
          <Text style={styles.bold}>
            特别提醒您，该期限不因您未使用相应服务而延长。当会员服务期限到期后，外送帮会员服务软件将停止继续向您提供会员服务；但如您在服务期限到期
            前继续购买服务并且付费成功的，会员服务期限将在原服务期限的基础上顺延。{`\n`}
            &emsp;&emsp;2.外送帮会员服务期限自缴费开通成功之时起至当前服务周期届满之日起终止，请您理解，终止后您使用的收费相关会员服务的功能将自动关闭不能使用，
            如需要再次开通则需要重新开启相关功能或增值服务。{`\n`}
          </Text>
          &emsp;&emsp;3.请您理解，因互联网服务的特殊性，外送帮会员服务期限中包含家帮帮解决故障、服务器维修、调整、升级等或因第三方侵权处理所需用的合理时间，对
          上述情况所需使用的时间家帮帮不另行补偿；若因此给您造成损失的，除存在法定过错外，家帮帮不承担任何赔偿责任，但家帮帮会尽可能将影响降至最低。{`\n`}
          <Text style={styles.bold}>
            &emsp;&emsp;四、会员权益及额外付费的收费说明{`\n`}
          </Text>
          &emsp;&emsp;1.收费方式{`\n`}
          &emsp;&emsp;外送帮会员服务中明确需额外付费方可使用的项目为收费服务，可使用微信、支付宝等在线充值方式支付。{`\n`}
          <Text style={styles.bold}>
            &emsp;&emsp;2.费用退还{`\n`}
            &emsp;&emsp;付费会员服务属于虚拟网络商品，采用先收费后服务的方式，会员费用是您所购买的付费会员服务对应的网络商品价格，而非预付款或者
            存款、定金、储蓄卡等，付费会员服务一经开通后不可退款（如因付费会员服务存在重大瑕疵导致您完全无法使用等家帮帮违约情形、本协议另有约定、
            法律法规要求必须退款的或经家帮帮判断后认为可以退款等除外）。{`\n`}
            &emsp;&emsp;特别提醒，在购买外送帮会员服务付费项目之前应仔细核对账号信息、购买的服务内容、价格、服务期限等信息。{`\n`}
            &emsp;&emsp;3.收费标准、方式的变更{`\n`}
            &emsp;&emsp;外送帮付费会员服务的收费方式、收费标准会根据公司的运营成本、运营策略等综合考虑后独立决定（调整包括但不限于促销、涨价等），
            并在相关的产品服务宣传及支付页面向您展示；若您在购买和续费时，相关收费方式发生变化的，以实际支持的收费方式为准；相关服务的价格发生了调整
            的，应以外送帮平台上公示的现时有效的价格为准（但家帮帮与您另有约定的情形除外）。变更后您选择购买或续费会员服务的，即视为您知悉并同意变更
            后的收费方式、收费标准。{`\n`}
            &emsp;&emsp;五、违规处理{`\n`}
            &emsp;&emsp;您知悉并同意，如您存在任何违反国家法律法规或监管政策、违反本协议或有损家帮帮或及其关联公司的声誉、利益的行为的，家帮帮有
            权独立决定采取以下一项或多项处理措施：{`\n`}
            &emsp;&emsp;1.如本协议对此行为有单独条款约定处理方式的，按照该条款处理；{`\n`}
            &emsp;&emsp;2.无需通知您而采取一种或多种措施制止您的行为及行为产生的后果，如删除屏蔽相关链接或内容、限制取消您的账号账户使用权限等；{`\n`}
            &emsp;&emsp;3.无需通知您而中断或终止部分或全部会员服务，且您已交纳的付费会员服务费用将不予退还且不支付任何形式的补偿赔偿；{`\n`}
            &emsp;&emsp;4.如您的行为使家帮帮或及其关联公司遭受任何损失的，您应当承担全部损失赔偿责任并在家帮帮要求的时限内完成费用支付。{`\n`}
            &emsp;&emsp;六、通知{`\n`}
          </Text>
          &emsp;&emsp;1.为便于您获知与本协议和会员服务相关的信息，您同意家帮帮有权通过页面提示、弹窗、消息通知，该通知自外送帮服务软件发送之时视为已成功送达您。{`\n`}
          &emsp;&emsp;2.此类通知的内容或将对您产生重大有利或不利影响，请您务必确保联系方式为有效并请及时关注相应通知。{`\n`}
          <Text style={styles.bold}>
            &emsp;&emsp;七、联系我们{`\n`}
          </Text>
          &emsp;&emsp;如果您有任何需要投诉或申诉的内容，请在APP在线联系客服办理，我们会立即处理您的情况，如需核实，我们会在7个工作日内将处理结果或意见反馈到您。{`\n`}
          <Text style={styles.bold}>
            &emsp;&emsp;八、其他{`\n`}
          </Text>
          &emsp;&emsp;1.本协议的生效、履行、解释及争议的解决均适用中华人民共和国法律。{`\n`}
          &emsp;&emsp;2.如就本协议的签订、履行等发生任何争议的，双方应尽量友好协商解决；协商不成时，任何一方均可向家帮帮住所地的人民法院提起诉讼。{`\n`}
          &emsp;&emsp;3.如本协议因与中华人民共和国现行法律相抵触而导致部分无效的，不影响本协议其他条款的效力。{`\n`}
          &emsp;&emsp;4.本协议最终解释权归北京家帮帮科技有限公司所有。{`\n`}
        </Text>
      </ScrollView>
    )
  }
}
