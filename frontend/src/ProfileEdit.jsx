import React, { useState } from 'react';
import { Camera } from 'lucide-react';

function ProfileEdit({ user, onUpdateSuccess, onCancel }) {
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(`http://localhost:8080/api/auth/${user.username}/avatar`);

    const handleAvatarChange = (e) => {
        if (e.target.files[0]) {
            setAvatar(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('currentUsername', user.username);
        formData.append('newUsername', username);
        formData.append('newPassword', password);
        if (avatar) formData.append('avatar', avatar);

        try {
            const res = await fetch('http://localhost:8080/api/auth/update', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const updatedUser = await res.json();
                alert("Profile updated successfully!");
                onUpdateSuccess(updatedUser);
            } else {
                const msg = await res.text();
                alert("Update failed: " + msg);
            }
        } catch (err) {
            alert("Error connecting to server");
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', color: 'white' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '30px' }}>Edit Profile</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                        <img
                            src={preview}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: '#333' }}
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <label style={{
                            position: 'absolute', bottom: 0, right: 0,
                            background: '#1DB954', padding: '8px', borderRadius: '50%',
                            cursor: 'pointer', display: 'flex'
                        }}>
                            <Camera size={20} color="black" />
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarChange} />
                        </label>
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>{user.username}</h3>
                        <p style={{ color: '#b3b3b3', fontSize: '14px' }}>{user.role}</p>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <label>Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>

                <div>
                    <label>New Password (leave empty to keep current)</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="submit" style={{ flex: 1 }}>Save Changes</button>
                    <button type="button" onClick={onCancel} style={{ flex: 1, background: 'transparent', border: '1px solid #777', color: 'white' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default ProfileEdit;