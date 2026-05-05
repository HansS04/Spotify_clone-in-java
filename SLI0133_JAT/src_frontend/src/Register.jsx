import React, { useState } from 'react';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');

    const [profileImage, setProfileImage] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('role', role);

        // Upload images
        if (profileImage) formData.append('profileImage', profileImage);

        if (role === 'ARTIST') {
            if (coverImage) formData.append('coverImage', coverImage);
        }

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert("Registration successful! Please login.");
                onRegisterSuccess();
            } else {
                const msg = await response.text();
                alert("Registration failed: " + msg);
            }
        } catch (error) {
            console.error(error);
            alert("Error connecting to server");
        }
    };

    return (
        <div className="login-page">
            <div className="login-box" style={{ width: '450px' }}>
                <h1 style={{ marginBottom: '30px' }}>Sign up</h1>
                <form onSubmit={handleRegister}>
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    <label style={{textAlign:'left', color:'#b3b3b3'}}>Account Type</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="USER">Listener</option>
                        <option value="ARTIST">Artist</option>
                    </select>

                    <label style={{textAlign:'left', color:'#b3b3b3'}}>Profile Picture (Avatar)</label>
                    <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} />

                    {role === 'ARTIST' && (
                        <>
                            <label style={{textAlign:'left', color:'#b3b3b3'}}>Cover Image (Banner)</label>
                            <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
                            <p style={{fontSize:'12px', color:'#777'}}>Note: You will assign genres to individual songs when uploading.</p>
                        </>
                    )}

                    <button type="submit" style={{ width: '100%', marginTop: '20px' }}>Sign Up</button>
                </form>
                <p style={{ marginTop: '20px', color: '#b3b3b3' }}>
                    Already have an account? <span style={{ color: 'white', cursor: 'pointer', fontWeight: 'bold' }} onClick={onSwitchToLogin}>Log in here</span>.
                </p>
            </div>
        </div>
    );
}

export default Register;