import React, { useState, useEffect } from 'react';

function SongList({ refreshKey, onPlay }) {
    const [songs, setSongs] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/songs')
            .then(res => res.json())
            .then(data => setSongs(data))
            .catch(err => console.error(err));
    }, [refreshKey]);

    return (
        <div>
            <h3>All Songs</h3>
            {songs.map(song => (
                <div key={song.id} className="song-row" onDoubleClick={() => onPlay(song)}>
                    <img
                        src={song.album?.id ? `http://localhost:8080/api/albums/${song.album.id}/cover` : null}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px', backgroundColor: '#333', display: song.album?.id ? 'block' : 'none' }}
                        onError={(e) => e.target.style.display='none'}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>{song.title}</div>
                        <div style={{ color: '#B3B3B3', fontSize: '0.8em' }}>{song.album?.artist?.name}</div>
                    </div>

                    <button
                        onClick={() => onPlay(song)}
                        style={{ padding: '8px 12px', fontSize: '12px', background: 'transparent', border: '1px solid #777', color: 'white', borderRadius: '20px' }}
                    >
                        ▶ Play
                    </button>
                </div>
            ))}
        </div>
    );
}

export default SongList;