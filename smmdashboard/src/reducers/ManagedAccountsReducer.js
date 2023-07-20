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
        default: {
            throw Error(`Managed Accounts Reducer: Unknown action type "${action.type}"`);
        }
    }
}