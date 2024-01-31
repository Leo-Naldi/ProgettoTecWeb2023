import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * Used to avoid races when fetching the options.
 */
class Api {
    promise;

    constructor(api_call) {
        this.api_call = api_call;
    }

    async request(text) {
        this.promise = this.api_call(text);
        const localPromise = this.promise;
        const result = await this.promise;

        if (this.promise === localPromise) {
            return result;
        }
    }
}


export default function FetchOptionsAutocomplete({ optionsPromise, onChange, id, getOptionLabel, textLabel }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiClient, setApiClient] = useState(null);

    const handle_open = () => {
        setOpen(true);
        setLoading(true);
        apiClient?.request().then(res => {
            if (res) {
                setOptions(res);
                setLoading(false);
            }
        })
    }

    const handle_close = () => {
        setOpen(false);
        setLoading(false);
    }

    const handle_value_changed = (e, val) => {
        setLoading(true);
        apiClient?.request(val).then(res => {
            if (res) {
                setOptions(res);
                setLoading(false);
            }
        });
    }

    useEffect(() => {
        const client = new Api(optionsPromise);
        setApiClient(client);
    }, [])

    return (
        <Autocomplete
            id={id}
            getOptionLabel={getOptionLabel}
            multiple
            open={open}
            sx={{
                mt: 1
            }}
            onChange={onChange}
            onOpen={handle_open}
            onClose={handle_close}
            onInputChange={handle_value_changed}
            options={options}
            loading={loading}
            filterOptions={x => x}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={textLabel}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}

