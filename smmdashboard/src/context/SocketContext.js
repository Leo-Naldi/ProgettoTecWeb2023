import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "./CurrentAccountContext";
import { io } from 'socket.io-client';
import { useManagedAccounts, useManagedAccountsDispatch } from "./ManagedAccountsContext";

import _ from 'underscore';


const SocketContext = createContext(null);


export default function SocketContextProvider({ children }) {

    const smm = useAccount();
    const managedAccounts = useManagedAccounts();
    const managedAccountsDispatch = useManagedAccountsDispatch()
    const [socket, setSocket] = useState(null);
    

    useEffect(() => {
        if (smm.loggedIn) {

            setSocket(io(`http://site222346.tw.cs.unibo.it/pro-io/${smm.handle}`, {
                extraHeaders: {
                    Authorization: `Bearer ${smm.token}`
                }
            }));

        } else if (socket) {
            // unregister events
            socket.removeAllListeners()
            socket.disconnect();
            setSocket(null);
        }

        return () => {
            if (socket) {   
                socket.removeAllListeners()
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [smm.loggedIn]);

    useEffect(() => {

        const user_changed_context_cb = (changes) => {
            console.log(changes.handle)
            console.log(managedAccounts.some(u => u.handle === changes.handle))
            console.log(managedAccounts)
            if (managedAccounts.some(u => u.handle === changes.handle)) {
                if ((_.has(changes, 'smm')) && (_.isNull(changes.smm))) {
                    managedAccountsDispatch({
                        type: 'USER_REMOVED',
                        handle: changes.handle,
                    });
                } else {
                    managedAccountsDispatch({
                        type: 'USER_CHANGED',
                        handle: changes.handle,
                        changes: changes,
                    });
                }
            }
        }

        const user_deleted_context_cb = (delete_info) => {
            if (managedAccounts.some(u => u.handle === delete_info.handle)) {
                managedAccountsDispatch({
                    type: 'USER_REMOVED',
                    handle: delete_info.handle,
                });
            }
        }

        socket?.on('user:changed', user_changed_context_cb);
        socket?.on('user:deleted', user_deleted_context_cb)
        

        return () => {
            socket?.off('user:changed', user_changed_context_cb);
            socket?.off('user:deleted', user_deleted_context_cb);
        }
    }, [socket, managedAccounts]);
    

    return (
        <SocketContext.Provider value={socket}>
            { children }
        </SocketContext.Provider>
    )
}

export function useSocket() {
    return useContext(SocketContext);
}