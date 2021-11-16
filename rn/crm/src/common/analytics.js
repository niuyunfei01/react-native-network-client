import {Mixpanel} from 'mixpanel-react-native';


export class MixpanelManager {
  static sharedInstance = MixpanelManager.sharedInstance || new MixpanelManager();
  constructor() {
    this.mixpanel = new Mixpanel('dec49f0bb85d25ec538dd9476575961d');
    this.mixpanel.init();
    this.mixpanel.setLoggingEnabled(true);
  }
}

export const MixpanelInstance = MixpanelManager.sharedInstance.mixpanel;
