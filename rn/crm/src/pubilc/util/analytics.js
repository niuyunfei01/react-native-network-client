import {Mixpanel} from 'mixpanel-react-native';

const token = "dec49f0bb85d25ec538dd9476575961d"
const username = 'jbb.10cc05.mp-service-account';
const secret = 'EV3qFHKqA0mnoBiZqXsIXBaSlSSV1l6s';

export class MixpanelManager {
  static sharedInstance = MixpanelManager.sharedInstance || new MixpanelManager();

  constructor() {
    this.mixpanel = new Mixpanel(token);
    this.mixpanel.init();
    this.mixpanel.setLoggingEnabled(true);
  }
}

export const MixpanelInstance = MixpanelManager.sharedInstance.mixpanel;

export function mergeMixpanelId(mixpane_id, user_id) {

  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      'Content-Type': "application/json",
      // authorization: "Basic " + base64_encode(username + ":" + secret)
      authorization: "Basic amJiLjEwY2MwNS5tcC1zZXJ2aWNlLWFjY291bnQ6RVYzcUZIS3FBMG1ub0JpWnFYc0lYQmFTbFNTVjFsNnM="
    },
    body: JSON.stringify([{
      event: "$merge",
      properties:
        {
          distinct_id: mixpane_id,
          $distinct_ids: [user_id, mixpane_id],
        }
    }])
  }
  let api = 'https://api.mixpanel.com/import?strict=1&project_id=2568401';
  fetch(api, options)
    .then(response => response.json())
    .then(response => console.log(response, 'res'))
    .catch(err => console.error(err, 'err'));
}
