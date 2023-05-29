import { React, createContext, useReducer, useContext } from 'react';

import accountReducer from '../reducers/AccountReducer';

const AccountContext = createContext(null);
const AccountDispatchContext = createContext(null);


export function AccountContextProvider({ children }) {

    const [user, accountDispatch] = useReducer(accountReducer, {
        loggedIn: false, 
        token: null,
    });

    return (
        <AccountContext.Provider value={user}>
            <AccountDispatchContext.Provider value={accountDispatch}>
                {children}
            </AccountDispatchContext.Provider>
        </AccountContext.Provider>
    );

}

export function useAccount() {
    return useContext(AccountContext);
}

export function useDispatchAccount() {
    return useContext(AccountDispatchContext);
}

export default AccountContextProvider;