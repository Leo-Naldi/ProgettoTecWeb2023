import * as React from 'react';
import { useState, } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Copyright from '../components/Copiright';
import { Alert, CircularProgress } from '@mui/material';
import { useDispatchAccount } from '../context/CurrentAccountContext';


export default function SignIn() {

    const userDispatch = useDispatchAccount();

    const [fetching, setFetching] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            handle: data.get('handle'),
            password: data.get('password'),
        });

        setFetching(true);

        fetch(`http://localhost:8000/auth/login/smm`, {
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
                    console.log(data);
                    userDispatch({
                        type: 'USER_CHANGED',
                        payload: {
                            user: data.user,
                            token: data.token,
                        }
                    })
                })
            else {
                setErrorMessage("Incorrect Handle or password");
                setShowError(true)
            }
        })
        .catch(err => console.log(err));
    };

    // TODO if user is already logged in redirect to homepage

    return (
        (fetching) ? 
        (<Container component='main' maxWidth='xs'>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 4,
                flexDirection: 'column'
            }}>
                <CircularProgress /> 
            </Box>
        </Container>) :
        (<Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    {showError ? <Alert severity='error'>{errorMessage}</Alert> : null}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="handle"
                        label="User Handle"
                        name="handle"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />
                    <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href="#" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>)
    );
}