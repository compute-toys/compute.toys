import React, {Fragment, useContext, useState} from 'react'
import { supabase } from '../lib/supabaseclient'
import {CssTextField, Item, theme} from "../theme/theme";
import {Button, Typography} from "@mui/material";
import {useAuth} from "../lib/authcontext";

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')

    const handleLogin = async (email) => {
        try {
            setLoading(true)
            const { error } = await supabase.auth.signIn({ email })
            if (error) throw error
            alert('Check your email for the login link!')
        } catch (error) {
            alert(error.error_description || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Fragment>
            <Typography variant="h6" component="h2" sx={{color: theme.palette.dracula.foreground}}>
                Log In
            </Typography>
            <Typography id="modal-modal-description" sx={{color: theme.palette.dracula.foreground}}>
                Log in with a magic link sent to your email
            </Typography>
            <Item>
                <CssTextField
                    id="outlined-name"
                    aria-label={"Email input"}
                    size="small"
                    label={"Email"}
                    value={email}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {setEmail(event.target.value)}}
                    sx ={{
                        input: {color: theme.palette.dracula.cyan},
                        label: {color: theme.palette.dracula.cyan}
                    }}
                />
                <Button
                    onClick={(e) => {
                        e.preventDefault()
                        handleLogin(email)
                    }}
                    sx={loading ? {color: theme.status.disabled} : {color: theme.palette.dracula.orange}}
                    disabled={loading}
                >
                    <span>{loading ? 'Loading' : 'Send magic link!'}</span>
                </Button>
            </Item>
        </Fragment>
    )
}