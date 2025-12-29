import React, { useState, useEffect } from 'react';

function SongUpload({ onUploadSuccess }) {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [file, setFile] = useState(null);
    const [albums, setAlbums] = useState([]);
    const [selectedAlbumId, setSelectedAlbumId] = useState('');

    useEffect(() => {
        fetch('http://localhost:8080/api/albums')
            .then(res => res.json())
            .then(data => {
                setAlbums(data);
                if (data.length > 0) setSelectedAlbumId(data[0].id);
            })
            .catch(err => console.error("Chyba načítání alb (běží Spring?):", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !selectedAlbumId) {
            alert("Vyber soubor a album!");
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('duration', duration);
        formData.append('albumId', selectedAlbumId);
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/api/songs/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert("✅ Písnička nahrána!");
                setTitle('');
                setFile(null);
                onUploadSuccess();
            } else {
                alert("❌ Chyba při nahrávání.");
            }
        } catch (error) {
            console.error("Chyba:", error);
            alert("❌ Nepodařilo se spojit se serverem.");
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>📤 Nahrát novou skladbu</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                <input placeholder="Název skladby" value={title} onChange={e => setTitle(e.target.value)} required />

                <label>Vyber album:</label>
                <select value={selectedAlbumId} onChange={e => setSelectedAlbumId(e.target.value)}>
                    {albums.length === 0 && <option>Žádná alba (spusť Spring DataLoader)</option>}
                    {albums.map(album => (
                        <option key={album.id} value={album.id}>{album.name}</option>
                    ))}
                </select>

                <input type="file" accept="audio/*" onChange={e => setFile(e.target.files[0])} required />

                <button type="submit" style={{ padding: '10px', background: '#1DB954', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Nahrát
                </button>
            </form>
        </div>
    );
}

export default SongUpload;