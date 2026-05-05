import React, { useState, useEffect } from 'react';
import { Disc } from 'lucide-react';

function AlbumLibrary({ user, onAlbumClick }) {
    const [albums, setAlbums] = useState([]);

    useEffect(() => {
        if (user) {
            let url = 'http://localhost:8080/api/albums';

            if (user.role === 'ARTIST') {
                url = `http://localhost:8080/api/albums/my-albums?username=${user.username}`;
            }

            fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch");
                    return res.json();
                })
                .then(data => {
                    if (Array.isArray(data)) {
                        setAlbums(data);
                    } else {
                        setAlbums([]);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setAlbums([]);
                });
        }
    }, [user]);

    return (
        <div style={{ padding: '20px 40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}>
                {user.role === 'ARTIST' ? 'My Discography' : 'All Albums'}
            </h2>

            {albums.length === 0 && (
                <div style={{ color: '#b3b3b3' }}>No albums found.</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                {albums.map(album => (
                    <div
                        key={album.id}
                        onClick={() => onAlbumClick(album)}
                        style={{
                            background: '#181818',
                            padding: '16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#282828'}
                        onMouseLeave={e => e.currentTarget.style.background = '#181818'}
                    >
                        <div style={{ width: '100%', aspectRatio: '1/1', marginBottom: '16px', position: 'relative', background: '#333', borderRadius: '4px' }}>
                            <img
                                src={`http://localhost:8080/api/albums/${album.id}/cover`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            {/* Fallback icon */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 0 }}>
                                <Disc size={48} color="#555" />
                            </div>
                        </div>
                        <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {album.name}
                        </div>
                        <div style={{ color: '#b3b3b3', fontSize: '14px' }}>
                            {album.yearReleased} • Album
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AlbumLibrary;