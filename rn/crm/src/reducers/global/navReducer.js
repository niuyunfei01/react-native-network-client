import {AppNavigator} from '../../common/AppNavigator'
import { NavigationActions } from "react-navigation";

const homeAction = AppNavigator.router.getActionForPathAndParams('Home');
console.log('first action', homeAction);

const tempNavState = AppNavigator.router.getStateForAction(homeAction);
console.log('tempNavState', tempNavState);

const secondAction = AppNavigator.router.getActionForPathAndParams('Order', 'order/:order_id');
console.log('secondAction', secondAction);

const initialNavState = AppNavigator.router.getStateForAction(
    secondAction,
    tempNavState
);
console.log('initialNavState', initialNavState)


export default function nav(state = initialNavState, action) {
    console.log("action=", action, "state=", state)
    let nextState;
    switch (action.type) {
        case 'Login':
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.back(),
                state
            );
            break;
        case 'Logout':
            nextState = AppNavigator.router.getStateForAction(
                NavigationActions.navigate({ routeName: 'Login' }),
                state
            );
            break;
        default:
            nextState = AppNavigator.router.getStateForAction(action, state);
            break;
    }

    // Simply return the original `state` if `nextState` is null or undefined.
    return nextState || state;
}