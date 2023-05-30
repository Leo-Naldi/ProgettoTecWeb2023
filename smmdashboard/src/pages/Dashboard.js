import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAccount } from "../context/CurrentAccountContext";
import Dashboard from "../components/Dashboard";


export default function DashboardPage(){

    const smm = useAccount();

    return ((!smm.loggedIn) ? (<Navigate to='/'/>) : (
        <Dashboard />
    ))
}