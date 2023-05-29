export default function accountReducer(state, action) {

    switch (action.type) {
        case ('USER_CHANGED'): {
            return {
                ...state,
                ...action.user,
            };
        }
        case 'USER_LOGOUT': {
            return {
                loggedIn: false,
                token: null,
            }
        }
        default: {
            throw Error(`User Reducer: Unknown action type "${action.type}"`);
        }
    }
}