import {useEffect, useState} from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
    const { user, login, register, logout } = useAuth();
    const [form, setForm] = useState({ username: "", password: "", password2: "" });
    const [mode, setMode] = useState("login");

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (mode === "login") {
                await login(form.username, form.password);
            } else {
                await register(form.username, form.password, form.password2);
                setMode("login");
            }
        } catch (err) {
            alert("Authentication error: " + err.response?.data?.detail || err.message);
        }
    };

    useEffect(() => {
        if (user) {
            setMode("login");
        }
    }, [user]);

    return (
        <div className="navbar">
            <h2>CFlow</h2>
            {user ? (
                <div>
                    <span>Welcome, {user}!</span>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <input name="username" placeholder="Username" onChange={handleChange} />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} />
                    {mode === "register" && (
                        <input name="password2" type="password" placeholder="Confirm Password" onChange={handleChange} />
                    )}
                    <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
                    <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                        Switch to {mode === "login" ? "Register" : "Login"}
                    </button>
                </form>
            )}
        </div>
    );
}
