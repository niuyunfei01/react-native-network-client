import ProductModule from './modules/product'
import OrderModule from './modules/order'
import CommonModule from './modules/common'

/**
 * 存放常量的对应关系
 */
export default class Mapping {
  static Tools = {
    // 根据值获取label
    MatchLabel: function (mapping, val, key = 'label') {
      for (const item in mapping) {
        if (String(mapping[item].value) === String(val)) {
          return mapping[item][key]
        }
      }
    },
    ValueEqMapping: function (mapping, val) {
      if (typeof (mapping) === 'object') {
        return String(mapping.value) === String(val)
      }
      return String(mapping) === String(val)
    },
    TransferOptions: (object, opt = {}) => {
      let options = []
      for (const o in object) {
        if (object[o].optionHidden) continue
        if (opt && opt.enableType && object[o].meta && object[o].meta.hidden && object[o].meta.hidden[opt.enableType]) continue
        options.push(object[o])
      }
      return options
    }
  }
  
  static Product = ProductModule
  static Order = OrderModule
  static Common = CommonModule
}