import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAccount } from "../context/CurrentAccountContext";



export default function Dashboard(){

    const smm = useAccount();

    return ((!smm.loggedIn) ? (<Navigate to='/'/>) : (
        <h1>Hello World</h1>
    ))
}