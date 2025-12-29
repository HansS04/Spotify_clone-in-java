import React, { useState, useEffect } from 'react';

function SongList({ refreshKey }) {
    const [songs, setSongs] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/songs')
            .then(res => res.json())
            .then(data => setSongs(data))
            .catch(err => console.error("Chyba načítání písniček:", err));
    }, [refreshKey]);

    return (
        <div>
            {songs.map(song => (
                <div key={song.id} className="song-row">
                    <div style={{ width: '40px', textAlign: 'center', color: '#B3B3B3' }}>♫</div>
                    <div style={{ flex: 1, paddingLeft: '10px' }}>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>{song.title}</div>
                        <div style={{ color: '#B3B3B3', fontSize: '0.8em' }}>{song.durationSeconds} s</div>
                    </div>
                    <audio controls src={`http://localhost:8080/api/songs/${song.id}/play`} />
                </div>
            ))}
        </div>
    );
}

export default SongList;