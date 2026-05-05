import React, { useState } from 'react';

function PlaylistCreate({ user, onCreated }) {
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('username', user.username);
        if (file) formData.append('file', file);

        try {
            const res = await fetch('http://localhost:8080/api/playlists/create', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                alert("Playlist created!");
                onCreated();
            }
        } catch (err) { alert("Error"); }
    };

    return (
        <div style={{ padding: '20px', background: '#181818', borderRadius: '8px' }}>
            <h3>Create Playlist</h3>
            <form onSubmit={handleSubmit} style={{maxWidth: '400px'}}>
                <input placeholder="Playlist Name" value={name} onChange={e => setName(e.target.value)} required />
                <label>Cover Image</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                <button type="submit">Create</button>
            </form>
        </div>
    );
}

export default PlaylistCreate;