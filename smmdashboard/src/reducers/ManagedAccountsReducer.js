export default function managedAccountsReducer(state, action) {

    switch (action.type) {
        case ('FETCHED_ACCOUNTS'): {

            return action.payload;
        }
        default: {
            throw Error(`Managed Accounts Reducer: Unknown action type "${action.type}"`);
        }
    }
}