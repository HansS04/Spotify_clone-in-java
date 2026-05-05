import React, { useState, useEffect } from 'react';
import { Trash2, Camera, Save } from 'lucide-react';

function AlbumEdit({ album, onBack, onUpdateSuccess }) {
    const [name, setName] = useState(album.name);
    const [year, setYear] = useState(album.yearReleased);
    const [cover, setCover] = useState(null);
    const [songs, setSongs] = useState([]);
    const [coverPreview, setCoverPreview] = useState(`http://localhost:8080/api/albums/${album.id}/cover`);

    useEffect(() => {
        fetch('http://localhost:8080/api/songs')
            .then(res => res.json())
            .then(data => {
                const albumSongs = data.filter(s => s.album && s.album.id === album.id);
                setSongs(albumSongs);
            });
    }, [album]);

    const handleCoverChange = (e) => {
        if (e.target.files[0]) {
            setCover(e.target.files[0]);
            setCoverPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('year', year);
        if (cover) formData.append('cover', cover);

        const res = await fetch(`http://localhost:8080/api/albums/${album.id}/update`, {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            alert("Album updated!");
            onUpdateSuccess();
        } else {
            alert("Error updating album");
        }
    };

    const handleDeleteSong = async (songId) => {
        if (!window.confirm("Are you sure you want to delete this song?")) return;

        const res = await fetch(`http://localhost:8080/api/albums/songs/${songId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            setSongs(songs.filter(s => s.id !== songId));
        } else {
            alert("Error deleting song");
        }
    };

    return (
        <div style={{ padding: '40px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>Edit Album</h1>
                <button onClick={onBack} style={{ background: 'transparent', border: '1px solid #777' }}>Cancel</button>
            </div>

            <div style={{ display: 'flex', gap: '40px' }}>
                {/* Left: Album Metadata */}
                <form onSubmit={handleSave} style={{ flex: 1, maxWidth: '400px' }}>
                    <div style={{ width: '200px', height: '200px', marginBottom: '20px', position: 'relative' }}>
                        <img
                            src={coverPreview}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', background: '#333' }}
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <label style={{
                            position: 'absolute', bottom: '10px', right: '10px',
                            background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '50%', cursor: 'pointer'
                        }}>
                            <Camera color="white" size={20} />
                            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleCoverChange} />
                        </label>
                    </div>

                    <label>Album Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required />

                    <label>Release Year</label>
                    <input type="number" value={year} onChange={e => setYear(e.target.value)} required />

                    <button type="submit" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Save size={18} /> Save Changes
                    </button>
                </form>

                <div style={{ flex: 2 }}>
                    <h3>Manage Songs</h3>
                    {songs.length === 0 && <p style={{color: '#777'}}>No songs in this album.</p>}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {songs.map((song, idx) => (
                            <div key={song.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: '#181818', padding: '10px 15px', borderRadius: '4px'
                            }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <span style={{color: '#777'}}>{idx + 1}.</span>
                                    <span>{song.title}</span>
                                    <span style={{color: '#777', fontSize: '12px', alignSelf: 'center', marginLeft: '10px'}}>{song.genre}</span>
                                </div>

                                <button
                                    onClick={() => handleDeleteSong(song.id)}
                                    style={{ background: 'transparent', padding: '5px', minWidth: 'auto', border: 'none', color: '#ff4444' }}
                                    title="Delete Song"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AlbumEdit;