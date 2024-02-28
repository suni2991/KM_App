import { useLocation, Navigate, Outlet } from "react-router-dom";
import React from 'react';
import useAuth from "../hooks/useAuth";

let RequireAuth = () => {

    let { auth } = useAuth();
    let location = useLocation();

    console.log('Auth: ', auth)
    return (
        auth.role
            ? <Outlet />
            : <Navigate to="/" state={{ from: location }} replace />
    )
}

export default RequireAuth;
