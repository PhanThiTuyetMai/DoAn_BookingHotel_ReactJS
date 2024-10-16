import React from 'react';
import { Outlet } from 'react-router-dom';
import Home from './components/Home/Home';

const Layout = () => {
    return (
        <div>
            <Home /> 
            <Outlet /> 
        </div>
    );
};

export default Layout;
