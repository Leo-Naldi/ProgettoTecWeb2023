import { React, createContext, useReducer, useContext, useEffect, useState } from 'react';

import managedAccountsReducer from '../reducers/ManagedAccountsReducer';
import { useAccount } from './CurrentAccountContext';
import authorizedRequest from '../utils/authorizedRequest';
import { useSocket } from './SocketContext';

const ManagedAccountsContext = createContext(null);
const ManagedAccountsDispatchContext = createContext(null);
const ManagedAccountsFetchingContext = createContext(null);

export function ManagedAccountsContextProvider({ children }) {

    const smm = useAccount()
    const [managedAccounts, managedAccountsDispatch] = useReducer(managedAccountsReducer, []);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if ((smm.loggedIn) && (smm.token)){
            
            setFetching(true);

            authorizedRequest({
                endpoint: `users/${smm.handle}/managed`,
                method: 'get',
                token: smm.token,
            })
            .then(res => {
                if (res.ok) return res.json()
                else throw Error(`Fetch Managed Users failed with code: ${res.status}`)
            })
            .then(res => {

                setFetching(false);

                return managedAccountsDispatch({
                    type: 'FETCHED_ACCOUNTS',
                    payload: res,
                })}
            ).catch(err => {
                setFetching(false);
                console.log('Fetch managed users errored');
            })
        }
           
    }, [smm.loggedIn, smm.token]);

    return (
        <ManagedAccountsContext.Provider value={managedAccounts}>
            <ManagedAccountsDispatchContext.Provider value={managedAccountsDispatch}>
                <ManagedAccountsFetchingContext.Provider value={fetching}>
                    {children}
                </ManagedAccountsFetchingContext.Provider>
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

export function useManagedAccountsFetching() {
    return useContext(ManagedAccountsFetchingContext);
}

export default ManagedAccountsContextProvider;