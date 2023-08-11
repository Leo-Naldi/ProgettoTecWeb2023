import { React, createContext, useReducer, useContext, useEffect } from 'react';

import managedAccountsReducer from '../reducers/ManagedAccountsReducer';
import { useAccount } from './CurrentAccountContext';
import authorizedRequest from '../utils/authorizedRequest';

const ManagedAccountsContext = createContext(null);
const ManagedAccountsDispatchContext = createContext(null);


export function ManagedAccountsContextProvider({ children }) {

    const smm = useAccount()
    const [managedAccounts, managedAccountsDispatch] = useReducer(managedAccountsReducer, []);

    useEffect(() => {
        if ((smm.loggedIn) && (smm.token)){
            authorizedRequest({
                endpoint: `users/${smm.handle}/managed`,
                method: 'get',
                token: smm.token,
            })
            .then(res => {
                if (res.ok) return res.json()
                else throw Error(`Fetch Managed Users failed with code: ${res.status}`)
            })
            .then(res => res.map(u => {
                if (u.messages) delete u.messages 
                return u
            }))
            .then(res => managedAccountsDispatch({
                type: 'FETCHED_ACCOUNTS',
                payload: res,
            })).catch(err => {
                console.log('Fetch managed users errored');
            })
        }
           
    }, [smm.loggedIn, smm.token]);

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