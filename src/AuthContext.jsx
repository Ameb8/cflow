import { createContext, useState, useContext } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import csrfAxios from "./csrfAxios";

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
