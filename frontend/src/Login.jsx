import React, { useState } from 'react';

function Login({ onLogin, onSwitchToRegister}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const user = await response.json();
                onLogin(user);
            } else {
                alert("Wrong password (Try: admin / admin)");
            }
        } catch (err) {
            console.error(err);
            alert("SERVER ERROR");
        }
    };

    return (
        <div className="login-page">
            <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Spotify Clone</h1>
            <div className="login-box">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'left' }}>
                        <label>User name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label>Heslo</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </div>
                    <button type="submit" style={{ width: '50%', marginTop: '20px' }}>
                        Login
                    </button>
                    <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <p style={{ fontSize: '0.9em', color: '#B3B3B3', margin: 0 }}>Don't have an account?</p>
                    <button
                        type="button"
                        onClick={onSwitchToRegister}
                        style={{ background: 'transparent', border: '1px solid #777', color: 'white', marginTop: '10px', padding: '10px 20px' }}
                    >
                    Register
                    </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;