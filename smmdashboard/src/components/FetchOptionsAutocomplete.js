import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';


export default function FetchOptionsAutocomplete({ optionsPromise, onChange, id, getOptionLabel, textLabel }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handle_open = () => {
        setOpen(true);
        setLoading(true);
        optionsPromise().then(res => {
            setOptions(res);
            setLoading(false);
        })
    }

    const handle_close = () => {
        setOpen(true);
        setLoading(false);
    }

    const handle_value_changed = (e, val) => {
        setLoading(true);
        optionsPromise(val).then(res => {
            setOptions(res);
            setLoading(false);
        });
    }

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

