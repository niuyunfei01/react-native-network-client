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
  }
};