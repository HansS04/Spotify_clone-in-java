import React, { useState } from 'react';

function AlbumCreate({ user, onAlbumCreated }) {
    const [name, setName] = useState('');
    const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
    const [bgColor, setBgColor] = useState('#121212');
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("User not authenticated");
            return;
        }

        const formData = new FormData();
        formData.append('title', name);
        formData.append('releaseYear', releaseYear);
        formData.append('bgColor', bgColor);
        formData.append('username', user.username);

        if (file) {
            formData.append('file', file);
        }

        try {
            const res = await fetch('http://localhost:8080/api/albums/create', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                alert("Album created successfully!");
                onAlbumCreated();
            } else {
                alert("Error creating album");
            }
        } catch (err) {
            console.error(err);
            alert("Server connection error");
        }
    };

    return (
        <div style={{ padding: '20px', background: '#181818', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Create New Album</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Album Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Awesome Album"
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Release Year</label>
                    <input
                        type="number"
                        value={releaseYear}
                        onChange={(e) => setReleaseYear(e.target.value)}
                        required
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Background Color</label>
                    <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        style={{ height: '50px', padding: '5px', cursor: 'pointer' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Cover Art</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files[0])}
                    />
                </div>

                <button type="submit" style={{ marginTop: '10px' }}>
                    Create Album
                </button>
            </form>
        </div>
    );
}

export default AlbumCreate;