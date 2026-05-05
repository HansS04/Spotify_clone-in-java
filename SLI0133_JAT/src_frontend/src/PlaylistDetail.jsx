import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, Music } from 'lucide-react';

function PlaylistDetail({ playlist, currentSong, isPlaying, onTogglePlay, onBack, onPlaySong, onPlayContext }) {
    const [songs, setSongs] = useState(playlist.songs || []);
    const [playlistDetails, setPlaylistDetails] = useState(playlist);

    useEffect(() => {
        if (playlist && playlist.id) {
            fetch(`http://localhost:8080/api/playlists/${playlist.id}`)
                .then(res => res.json())
                .then(data => {
                    setPlaylistDetails(data);
                    setSongs(data.songs || []);
                })
                .catch(err => console.error("Chyba při aktualizaci playlistu:", err));
        }
    }, [playlist]);

    const bgGradient = `linear-gradient(to bottom, #444 0%, #121212 100%)`;

    return (
        <div style={{ background: '#121212', minHeight: '100%', paddingBottom: '20px' }}>
            <div style={{
                background: bgGradient,
                padding: '80px 30px 30px 30px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <button onClick={onBack} style={{
                    background: 'rgba(0,0,0,0.3)', width: 'fit-content', padding: '8px 16px', marginBottom: '20px',
                    fontSize: '14px', color: 'white', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer'
                }}>
                    ← BACK
                </button>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
                    <div style={{ width: '232px', height: '232px', minWidth: '232px', boxShadow: '0 4px 60px rgba(0,0,0,0.5)', background: '#282828', display:'flex', alignItems:'center', justifyContent:'center', position: 'relative' }}>
                        <img
                            src={`http://localhost:8080/api/playlists/${playlistDetails.id}/cover`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', zIndex: 2 }}
                            onError={(e) => e.target.style.display='none'}
                            alt={playlistDetails.name}
                        />
                        <Music size={64} color="#777" style={{position:'absolute', zIndex: 1}}/>
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Playlist</div>
                        <h1 style={{ fontSize: '4rem', margin: '0.1em 0 0.2em 0', fontWeight: '900', textShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
                            {playlistDetails.name}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                            <span>{playlistDetails.owner?.username}</span>
                            <span>• {songs.length} songs</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.2)' }}>

                <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={() => onPlayContext(songs)}
                        style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: '#1DB954', border: 'none', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            transition: 'transform 0.1s'
                        }}
                        className="play-btn-hover"
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Play size={28} color="black" fill="black" style={{ marginLeft: '4px' }} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', color: '#b3b3b3', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px', fontSize: '12px', textTransform: 'uppercase' }}>
                    <div style={{ width: '40px', textAlign: 'center' }}>#</div>
                    <div style={{ flex: 1 }}>Title</div>
                    <div style={{ marginRight: '20px' }}><Clock size={16} /></div>
                    <div style={{ width: '40px' }}></div>
                </div>

                {songs.map((song, index) => {
                    const isCurrent = currentSong && currentSong.id === song.id;
                    return (
                        <div
                            key={song.id}
                            className="song-row"
                            onDoubleClick={() => onPlaySong(song)}
                            style={{
                                display: 'flex', alignItems: 'center', padding: '10px 0',
                                color: isCurrent ? '#1DB954' : '#b3b3b3',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'default'
                            }}
                        >
                            <div style={{ width: '40px', textAlign: 'center', fontSize: '16px' }}>
                                {isCurrent && isPlaying ?
                                    <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" width="14" alt="playing"/>
                                    : index + 1
                                }
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ color: isCurrent ? '#1DB954' : 'white', fontSize: '16px', fontWeight: '500' }}>
                                    {song.title}
                                </div>
                                <div style={{ fontSize: '13px', color: '#b3b3b3' }}>{song.album?.artist?.name}</div>
                            </div>

                            <div style={{ fontSize: '14px', marginRight: '20px' }}>
                                {song.durationSeconds
                                    ? `${Math.floor(song.durationSeconds / 60)}:${(song.durationSeconds % 60).toString().padStart(2, '0')}`
                                    : "0:00"
                                }
                            </div>

                            <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                                <button
                                    onClick={() => {
                                        if (isCurrent) {
                                            onTogglePlay();
                                        } else {
                                            onPlaySong(song);
                                        }
                                    }}
                                    style={{
                                        background: 'transparent', border: '1px solid #555', borderRadius: '50%',
                                        width: '32px', height: '32px', padding: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: 'white'
                                    }}
                                >
                                    {isCurrent && isPlaying ?
                                        <Pause size={14} fill="white" /> :
                                        <Play size={14} fill="white" style={{ marginLeft: '2px' }} />
                                    }
                                </button>
                            </div>
                        </div>
                    );
                })}

                {songs.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>This playlist is empty. Add songs from Search or Home.</div>}
            </div>
        </div>
    );
}

export default PlaylistDetail;