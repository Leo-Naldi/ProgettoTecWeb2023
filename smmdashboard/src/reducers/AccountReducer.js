export default function accountReducer(state, action) {

    switch (action.type) {
        case ('USER_CHANGED'): {

            const newUser = {
                _id: action.payload.user._id,
                managed: action.payload.user.managed,
                handle: action.payload.user.handle,
                email: action.payload.user.email,
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