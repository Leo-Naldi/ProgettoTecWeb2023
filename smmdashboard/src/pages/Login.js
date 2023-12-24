import * as React from 'react';
import { useState, } from 'react';

import { useAccount, useDispatchAccount } from '../context/CurrentAccountContext';
import { Navigate } from 'react-router-dom';

import LoginForm from '../components/Login';
import Spinner from '../components/Spinner';


export default function SignIn() {

    const userDispatch = useDispatchAccount();
    const smm = useAccount();

    const [fetching, setFetching] = useState(false);

    const handleSubmit = (event, setShowError) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        setFetching(true);

        fetch(`http://site222346.tw.cs.unibo.it/auth/login/smm`, {
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                handle: data.get('handle'),
                password: data.get('password'),
            })
        })
        .then(res => {
            setFetching(false);
            if (res.status === 200)
                return res.json().then(data => {
                    userDispatch({
                        type: 'USER_CHANGED',
                        payload: {
                            user: data.user,
                            token: data.token,
                        }
                    })
                })
            else {
                setShowError(true)
            }
        })
        .catch(err => console.log(err));
    };

    return (
        (fetching) ? 
            (<Spinner />) : ((smm.loggedIn) ? 
                (<Navigate to='/dashboard' />) : (<LoginForm onSubmit={handleSubmit} />))
    );
}