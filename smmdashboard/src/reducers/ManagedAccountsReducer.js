export default function managedAccountsReducer(state, action) {

    switch (action.type) {
        case ('FETCHED_ACCOUNTS'): {

            return action.payload;
        }
        case ('CHANGE_CHARLEFT'): {
            
            let res = [...state];
            const i = state.findIndex(u => u.handle === action.payload.handle)

            res[i].charLeft = action.payload.charLeft;

            return res;
        }
        case 'USER_REMOVED': {

            return state.filter(u => u.handle !== action.handle);
        } case 'USER_CHANGED': {

            let res = [...state];
            const i = state.findIndex(u => u.handle === action.handle)

            res[i] = { ...res[i], ...action.changes };

            return res;
        }
        default: {
            throw Error(`Managed Accounts Reducer: Unknown action type "${action.type}"`);
        }
    }
}