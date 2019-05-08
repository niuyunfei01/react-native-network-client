export default {
  STORE_PRODUCT_STATUS: {
    ON_SALE: {
      value: '1',
      label: '售卖中'
    },
    SOLD_OUT: {
      value: '2',
      label: '售罄'
    },
    OFF_SALE: {
      value: '3',
      label: '下架'
    }
  },
  // 收货状态
  RECEIPT_STATUS: {
    TO_PACK: {
      value: '0',
      label: '待打包'
    },
    PACKING: {
      value: '1',
      label: '打包中'
    },
    ENTRY: {
      value: '2',
      label: '已入库'
    }
  }
}