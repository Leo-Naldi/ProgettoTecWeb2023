export default function managedAccountsReducer(state, action) {

    switch (action.type) {
        case ('FETCHED_ACCOUNTS'): {

            return action.payload;
        }
        case ('CHANGE_CHARLEFT'): {
            
            let res = [...state];
            const i = state.findIndex(u => u.handle === action.payload.handle)

            if (i >= 0)
                res[i].charLeft = action.payload.charLeft;
            else 
                throw Error(`No user with handle ${action.payload.handle}`)

            return res;
        }
        case 'USER_REMOVED': {

            return state.filter(u => u.handle !== action.handle);
        } case 'USER_CHANGED': {

            let res = [...state];
            const i = state.findIndex(u => u.handle === action.handle)

            if (i >= 0)
                res[i] = { ...res[i], ...action.changes };
            else
                throw Error(`No user with handle ${action.payload.handle}`)

            return res;
        }
        default: {
            throw Error(`Managed Accounts Reducer: Unknown action type "${action.type}"`);
        }
    }
}