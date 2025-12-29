import React, {useState} from "react";
import Login from "./Login.jsx";

function Register({ onRegisterSuccess, onSwitchToLogin}){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch("http://localhost:8080/api/auth/register",{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, password})
            });

            if(response.ok){
                alert("Account was created successfully");
                onRegisterSuccess();
            }else {
                const msg = await response.text();
                alert("ERROR: " + msg);
            }
        }catch(err){
            console.error(err);
            alert("SERVER ERROR");
        }

    };

    return (
        <div className="login-page">
            <h1 style={{ fontSize: '3rem', marginBottom: '20px', }}>Spotify Clone</h1>

            <div className="login-box">
                <h2 style={{ marginBottom: '20px' }}>Create account</h2>

                {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'left' }}>
                        <label>Enter new username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="username"
                            required
                        />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <label>Enter new password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="password"
                            required
                        />
                    </div>

                    <button type="submit" style={{ width: '100%', marginTop: '20px' }}>
                        Register
                    </button>

                    <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                        <p style={{ fontSize: '0.9em', color: '#B3B3B3', margin: 0 }}>
                            Do you have an account?
                        </p>
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            style={{ background: 'transparent', border: '1px solid #777', color: 'white', marginTop: '10px', padding: '10px 20px' }}
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default Register;