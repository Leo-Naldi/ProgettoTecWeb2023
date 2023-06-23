export default function accountReducer(state, action) {

    switch (action.type) {
        case ('USER_CHANGED'): {

            const newUser = {
                ...state,
                ...action.payload.user,
                loggedIn: true,
                token: action.payload.token,
                timestamp: (new Date()).getTime(),
            };

            localStorage.setItem('smmDashboardUser', JSON.stringify(newUser));

            return newUser;
        }
        case 'USER_LOGOUT': {

            localStorage.removeItem('smmDashboardUser');

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