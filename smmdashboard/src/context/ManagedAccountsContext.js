import { React, createContext, useReducer, useContext, useEffect } from 'react';

import managedAccountsReducer from '../reducers/ManagedAccountsReducer';
import { useAccount } from './CurrentAccountContext';

const ManagedAccountsContext = createContext(null);
const ManagedAccountsDispatchContext = createContext(null);


export function ManagedAccountsContextProvider({ children }) {

    const smm = useAccount()
    const [managedAccounts, managedAccountsDispatch] = useReducer(managedAccountsReducer, []);

    useEffect(() => {
        if (smm.loggedIn){
            fetch(`http://localhost:8000/users/${smm.handle}/managed`, {
                method: "get",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${smm.token}`
                }
            })
            .then(res => res.json())
            .then(res => managedAccountsDispatch({
                type: 'FETCHED_ACCOUNTS',
                payload: res,
            }))
        }
           
    }, [smm.loggedIn]);

    return (
        <ManagedAccountsContext.Provider value={managedAccounts}>
            <ManagedAccountsDispatchContext.Provider value={managedAccountsDispatch}>
                {children}
            </ManagedAccountsDispatchContext.Provider>
        </ManagedAccountsContext.Provider>
    );

}

export function useManagedAccounts() {
    return useContext(ManagedAccountsContext);
}

export function useManagedAccountsDispatch() {
    return useContext(ManagedAccountsDispatchContext);
}

export default ManagedAccountsContextProvider;