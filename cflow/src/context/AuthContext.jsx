import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import csrfAxios from "../utils/csrfAxios.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if the user is already logged in
        const fetchUser = async () => {
            try {
                const res = await csrfAxios.get('/accounts/user/');
                setUser(res.data); // Get user info
            } catch (err) {
                console.error("Error fetching user", err.response?.data || err.message);
            }
        };

        fetchUser();
    }, []);

    const login = async (username, password) => {
        try {
            const res = await csrfAxios.post(
                '/api/login/',
                {username, password}
            );
            setUser(username);
        } catch (err) {
            console.error("Login failed", err.response?.data || err.message);
        }
    };

    const handleGitHubLogin = async () => {
        try {
            // Redirect to the GitHub OAuth login
            window.location.href = 'http://localhost:8000/accounts/github/login/';
        } catch (err) {
            console.error("GitHub login failed", err.response?.data || err.message);
        }
    };

    const handleGitHubCallback = async (code) => {
        try {
            // GitHub OAuth callback after successful login, exchange code for an access token
            const res = await csrfAxios.post('/api/auth/github/callback/', { code });
            setUser(res.data);  // Assuming the response contains user data
        } catch (err) {
            console.error("GitHub callback failed", err.response?.data || err.message);
        }
    };

    const logout = async () => {
        try {
            await csrfAxios.post('/api/auth/logout/');
            setUser(null);
        } catch (err) {
            console.error("Logout failed", err.response?.data || err.message);
        }
    };

    const gitHubLogout = async () => {
        try {
            await csrfAxios.post('/api/auth/logout/');
            setUser(null);
        } catch (err) {
            console.error("Logout failed", err.response?.data || err.message);
        }
    };


    return (
        <AuthContext.Provider value={{ user, handleGitHubLogin, logout , login, gitHubLogout}}>
            {children}
        </AuthContext.Provider>
    );
};





/*
import { createContext, useState, useContext } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import csrfAxios from "../utils/csrfAxios.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (username, password) => {
        try {
            const res = await csrfAxios.post(
                '/api/login/',
                {username, password}
            );
            setUser(username);
        } catch (err) {
            console.error("Login failed", err.response?.data || err.message);
        }
    };

    const register = async (username, password, password2) => {
        try {
            await csrfAxios.post('/api/register/', { username, password, password2 });
            setUser(username);
        } catch (err) {
            console.error("Registration failed", err.response?.data || err.message);
        }
    };


    const logout = async () => {
        try {
            const csrfToken = Cookies.get('csrftoken');
            console.log('CSRF Token', csrfToken); // DEBUG ***

            await csrfAxios.post(
                '/api/logout/',
                {},
                {
                    headers: {
                        'X-CSRFToken': csrfToken,
                    }
                }
            );
            console.log("Logged out");
            setUser(null);
        } catch (err) {
            console.error("Logout failed", err.response?.data || err.message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

 */