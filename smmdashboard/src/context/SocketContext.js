import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "./CurrentAccountContext";
import { io } from 'socket.io-client';
import { useManagedAccounts, useManagedAccountsDispatch } from "./ManagedAccountsContext";


const SocketContext = createContext(null);


export default function SocketContextProvider({ children }) {

    const smm = useAccount();
    const managedAccounts = useManagedAccounts();
    const managedAccountsDispatch = useManagedAccountsDispatch()
    const [socket, setSocket] = useState(null);
    

    useEffect(() => {
        if (smm.loggedIn) {

            setSocket(io(`http://localhost:8000/pro-io/${smm.handle}`, {
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
        
            socket?.on('user:changed', (changes) => {
                console.log(changes.handle)
                console.log(managedAccounts.some(u => u.handle === changes.handle))
                console.log(managedAccounts)

                if (managedAccounts.some(u => u.handle === changes.handle)) {

                    if (changes.smm === null) {
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
            })

            socket?.on('user:deleted', (delete_info) => {
                if (managedAccounts.some(u => u.handle === delete_info.handle)) {

                    managedAccountsDispatch({
                        type: 'USER_REMOVED',
                        handle: delete_info.handle,
                    });

                }
            })
        

        return () => {
            socket?.off('user:changed');
            socket?.off('user:deleted');
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