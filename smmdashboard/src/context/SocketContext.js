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
        
            console.log("BBBBBBBBBBBBBBBBBBBBBBBbbbbbb")
            socket?.on('user:changed', (user) => {
                console.log(user.handle)
                console.log(managedAccounts.some(u => u.handle === user.handle))
                console.log(managedAccounts)

                if (managedAccounts.some(u => u.handle === user.handle)) {

                    if (smm.handle !== user.smm) {
                        // smm is no longer user's manager
                        managedAccountsDispatch({
                            type: 'USER_REMOVED',
                            handle: user.handle,
                        });
                    } else {
                        managedAccountsDispatch({
                            type: 'USER_CHANGED',
                            handle: user.handle,
                            changes: user
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