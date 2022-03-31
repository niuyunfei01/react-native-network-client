'use strict';
import AppConfig from '../../pubilc/common/config.js';
import FetchEx from "../../util/fetchEx";

export function get_help_types(token, callback) {
  return dispatch => {
    const url = `api/help_type_list.json?access_token=${token}`;
    FetchEx.timeout(AppConfig.FetchTimeout, FetchEx.post(url))
      .then(resp => resp.json())
      .then(resp => {
        callback(resp);
      }).catch((error) => {
        callback({ok: false, desc: error.message});
      }
    );
  }
}
