import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, PlusCircle, Edit } from 'lucide-react';

function AlbumDetail({ album, user, currentSong, isPlaying, onTogglePlay, onBack, onPlaySong, onPlayAlbum, onAddToPlaylist, onArtistClick, onEditAlbum }) {
    const [songs, setSongs] = useState([]);

    useEffect(() => {
        if (album && album.id) {
            fetch('http://localhost:8080/api/songs')
                .then(res => res.json())
                .then(data => {
                    const albumSongs = data.filter(song => song.album && song.album.id === album.id);
                    setSongs(albumSongs);
                })
                .catch(err => console.error(err));
        }
    }, [album]);

    const isOwner = user && album.artist &&
        user.role === 'ARTIST' &&
        user.username.toLowerCase() === album.artist.name.toLowerCase().replace(/\s/g, '');

    const bgGradient = `linear-gradient(to bottom, ${album.backgroundColor || '#444'} 0%, #121212 100%)`;

    const isPlayingThisAlbum = isPlaying && currentSong && songs.length > 0 && songs.some(s => s.id === currentSong.id);

    return (
        <div style={{ background: '#121212', minHeight: '100%', paddingBottom: '20px' }}>
            {/* Header Section */}
            <div style={{ background: bgGradient, padding: '80px 30px 30px 30px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button
                        onClick={onBack}
                        style={{ background: 'rgba(0,0,0,0.3)', width: 'fit-content', padding: '8px 16px', marginBottom: '20px', fontSize: '14px', color: 'white', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        ← BACK
                    </button>

                    {isOwner && (
                        <button
                            onClick={() => onEditAlbum(album)}
                            style={{ background: 'rgba(0,0,0,0.3)', width: 'fit-content', padding: '8px 16px', marginBottom: '20px', fontSize: '14px', color: 'white', borderRadius: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            <Edit size={16} /> Edit Album
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
                    <div style={{ width: '232px', height: '232px', boxShadow: '0 4px 60px rgba(0,0,0,0.5)', background: '#282828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={`http://localhost:8080/api/albums/${album.id}/cover`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => e.target.style.display='none'}
                            alt={album.name}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Album</div>
                        <h1 style={{ fontSize: '4rem', margin: '0.1em 0 0.2em 0', fontWeight: '900', textShadow: '0 0 10px rgba(0,0,0,0.3)' }}>{album.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                            <span style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => onArtistClick(album.artist)}>
                                {album.artist?.name}
                            </span>
                            <span>• {album.yearReleased}</span>
                            <span>• {songs.length} songs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ padding: '20px 30px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center' }}>

                    <button
                        onClick={() => {
                            if (isPlayingThisAlbum) {
                                onTogglePlay();
                            } else {
                                onPlayAlbum(songs);
                            }
                        }}
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: '#1DB954',
                            color: 'black',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            transition: 'transform 0.1s, background-color 0.2s',
                            padding: 0
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#1ed760'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#1DB954'; }}
                    >
                        {isPlayingThisAlbum ? (
                            <Pause size={28} fill="currentColor" strokeWidth={0} />
                        ) : (
                            <Play size={28} fill="currentColor" strokeWidth={0} style={{ marginLeft: '4px' }} />
                        )}
                    </button>

                </div>

                <div style={{ display: 'flex', alignItems: 'center', color: '#b3b3b3', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px', fontSize: '12px', textTransform: 'uppercase' }}>
                    <div style={{ width: '40px', textAlign: 'center' }}>#</div>
                    <div style={{ flex: 1 }}>Title</div>
                    <div style={{ marginRight: '20px' }}><Clock size={16} /></div>
                    <div style={{ width: '80px' }}></div>
                </div>

                {songs.map((song, index) => {
                    const isCurrent = currentSong && currentSong.id === song.id;
                    return (
                        <div key={song.id} className="song-row" onDoubleClick={() => onPlaySong(song)} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', color: isCurrent ? '#1DB954' : '#b3b3b3', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'default' }}>
                            <div style={{ width: '40px', textAlign: 'center', fontSize: '16px' }}>
                                {isCurrent && isPlaying ? <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" width="14" alt="playing"/> : index + 1}
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ color: isCurrent ? '#1DB954' : 'white', fontSize: '16px', fontWeight: '500' }}>{song.title}</div>
                                <div style={{ fontSize: '13px', color: '#b3b3b3' }}>{song.album?.artist?.name}</div>
                            </div>
                            <div style={{ fontSize: '14px', marginRight: '20px' }}>
                                {song.durationSeconds ? `${Math.floor(song.durationSeconds / 60)}:${(song.durationSeconds % 60).toString().padStart(2, '0')}` : "0:00"}
                            </div>
                            <div style={{ width: '80px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => onAddToPlaylist(song)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}><PlusCircle size={20} color="#b3b3b3" /></button>
                                <button onClick={() => { if (isCurrent) { onTogglePlay(); } else { onPlaySong(song); }}} style={{ background: 'transparent', border: '1px solid #555', borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                    {isCurrent && isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" style={{ marginLeft: '2px' }} />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default AlbumDetail;