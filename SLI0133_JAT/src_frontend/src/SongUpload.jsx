import React, { useState, useEffect } from 'react';

function SongUpload({ user, onUploadSuccess }) {
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:8080/api/albums/my-albums?username=${user.username}`)
                .then(res => res.json())
                .then(data => setAlbums(data))
                .catch(err => console.error(err));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAlbum) { alert("Please select an album"); return; }
        if (!file) { alert("Please select a file"); return; }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('genre', genre);
        formData.append('albumId', selectedAlbum);
        formData.append('file', file);

        const res = await fetch('http://localhost:8080/api/songs/upload', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            alert("Song uploaded!");
            setTitle('');
            setGenre('');
            setFile(null);
            onUploadSuccess();
        } else {
            alert("Upload failed");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text" placeholder="Song Title"
                value={title} onChange={(e) => setTitle(e.target.value)} required
            />

            <input
                type="text" placeholder="Genre (e.g. Rock, Pop)"
                value={genre} onChange={(e) => setGenre(e.target.value)} required
            />

            <select value={selectedAlbum} onChange={(e) => setSelectedAlbum(e.target.value)} required>
                <option value="">Select Album</option>
                {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>

            <input type="file" accept="audio/mp3" onChange={(e) => setFile(e.target.files[0])} required />

            <button type="submit">Upload</button>
        </form>
    );
}

export default SongUpload;