export default {
  INVOICING: {
    STATUS_TRASHED: -1,
    STATUS_CREATED: 0,
    STATUS_LOCKED: 1,
    STATUS_SHIPPED: 2,
    STATUS_ARRIVED: 3,
    STATUS_CONFIRMED: 4,
    STATUS_COMPLETE: 5,
    SkuUnitMap: {
      '0': '斤',
      '1': '份'
    },
    SkuUnitSelect: [
      {label: '斤', value: '0'},
      {label: '份', value: '1'},
    ]
  },
  ERROR_CODE: {
    INVALID_TOKEN: '21327',
    EXPIRE_TOKEN: '21332',
    ACCESS_DENIED: '10001'
  },
  GOOD_ADJUST: {
    OPERATION_REJECT: -1,
    OPERATION_AGREE: 1,
    OPERATION_MODIFY: 2
  }
};
