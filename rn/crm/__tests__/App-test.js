/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
const cityInfo = {
  1: '北京',
  2: '上海'
}
export default function Fetch(url, params) {
  return new Promise((resolve, reject) => {
    if (params.cityId && cityInfo[params.cityId]) {
      resolve(cityInfo[params.cityId]);
    } else {
      reject('city not found');
    }
  });
}
it('test cityInfo', async () => {
  expect.assertions(1); //检测用例中有多少个断言被调用
  const data = await Fetch('/cityInfo', {cityId: 1});
  expect(data).toEqual('北京');
});
