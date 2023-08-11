import { React, createContext, useReducer, useContext, useEffect } from 'react';
import authorizedRequest from '../utils/authorizedRequest';

import accountReducer from '../reducers/AccountReducer';
import dayjs from 'dayjs';

const AccountContext = createContext(null);
const AccountDispatchContext = createContext(null);


export function AccountContextProvider({ children }) {

    let mem = localStorage.getItem('smmDashboardUser');
    //console.log(mem);

    const getTimeDiff = (timestamp) => {
        const memoryTimeStamp = new dayjs(timestamp);
        return (new dayjs()).diff(memoryTimeStamp, 'hour');
    }

    if (mem) {
     
        mem = JSON.parse(mem);
    
        const diff = getTimeDiff(mem.timestamp);
        
        if (diff >= 7*24) {

            // Expired
            localStorage.removeItem('smmDashboardUser');
            mem = null;

        }
    }

    const [user, accountDispatch] = useReducer(accountReducer, mem ?? {
        loggedIn: false, 
        token: null,
    });

    useEffect(() => {

        let ignore = false;  // react stuff

        const refreshToken = () => {
            return authorizedRequest({
                endpoint: '/auth/refresh',
                token: user.token,
                method: 'post',
            }).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    console.log(`Refresh Token Failed with code: ${res.status}`)
                    throw Error(`Refresh Token Failed with code: ${res.status}`)
                }
            }).then(res => {
                if (!ignore) {
                    accountDispatch({
                        type: 'REFRESH_TOKEN',
                        payload: {
                            token: res.token,
                        }
                    })
                }  
            }).catch(err => {
                accountDispatch({
                    type: 'USER_LOGOUT',  // TODO add some error message
                })
            })
        }

        if (user.loggedIn) {

            // refresh the token when the user first logs in ...
            refreshToken();

            // ... and every 60 minutes
            const iid = setInterval(refreshToken, 1000*60*60);

            return () => {
                clearInterval(iid);
                ignore = true;
            }
        }
    }, [user.loggedIn])


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