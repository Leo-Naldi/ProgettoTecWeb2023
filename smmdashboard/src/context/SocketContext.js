import React, { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "./CurrentAccountContext";
import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object


const SocketContext = createContext(null);


export default function SocketContextProvider({ children }) {

    const smm = useAccount();
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
            }
        }
    }, [smm.loggedIn]);

    

    return (
        <SocketContext.Provider value={socket}>
            { children }
        </SocketContext.Provider>
    )
}

export function useSocket() {
    return useContext(SocketContext);
}