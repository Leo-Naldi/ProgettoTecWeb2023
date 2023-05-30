import { React, createContext, useReducer, useContext } from 'react';

import accountReducer from '../reducers/AccountReducer';

const AccountContext = createContext(null);
const AccountDispatchContext = createContext(null);


export function AccountContextProvider({ children }) {

    let mem = localStorage.getItem('smmDashboardUser');

    if (mem) mem = JSON.parse(mem);

    const [user, accountDispatch] = useReducer(accountReducer, mem ?? {
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