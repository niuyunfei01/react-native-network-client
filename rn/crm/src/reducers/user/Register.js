export default {
    namespace: 'RegisterModel',
    state: {
        login: false,
        loading: true,
        fetching: false,
    },
    reducers: {
        updateState(state, { payload }) {
            return { ...state, ...payload }
        },
    },
    effects: {
        *login({ payload }, { call, put }) {
            yield put(createAction('updateState')({ fetching: true }))
            const login = yield call(authService.login, payload)
            if (login) {
                yield put(NavigationActions.back())
            }
            yield put(createAction('updateState')({ login, fetching: false }))
            Storage.set('login', login)
        },
        *logout(action, { call, put }) {
            yield call(Storage.set, 'login', false)
            yield put(createAction('updateState')({ login: false }))
        },
    }
}
