import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';

function PlaylistLibrary({ user, onPlaylistClick }) {
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:8080/api/playlists/user?username=${user.username}`)
                .then(res => res.json())
                .then(data => setPlaylists(data))
                .catch(err => console.error(err));
        }
    }, [user]);

    return (
        <div style={{ padding: '20px 40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'white' }}>My Playlists</h2>

            {playlists.length === 0 && (
                <div style={{ color: '#b3b3b3' }}>You haven't created any playlists yet.</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                {playlists.map(playlist => (
                    <div
                        key={playlist.id}
                        onClick={() => onPlaylistClick(playlist)}
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
                        <div style={{ width: '100%', aspectRatio: '1/1', marginBottom: '16px', position: 'relative', background: '#333', borderRadius: '4px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <img
                                src={`http://localhost:8080/api/playlists/${playlist.id}/cover`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <Music size={48} color="#777" style={{ position: 'absolute', zIndex: 0 }}/>
                        </div>
                        <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {playlist.name}
                        </div>
                        <div style={{ color: '#b3b3b3', fontSize: '14px' }}>
                            By {playlist.owner?.username}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PlaylistLibrary;