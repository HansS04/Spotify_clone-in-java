import React, { useState, useEffect } from 'react';
import { Play, Pause, Search as SearchIcon, PlusCircle } from 'lucide-react';

function Search({ isPlaying, currentSong, onPlaySong, onTogglePlay, onAddToPlaylist, onArtistClick }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (query.length < 1) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetch(`http://localhost:8080/api/songs/search?query=${query}`)
                .then(res => res.json())
                .then(data => setResults(data))
                .catch(err => console.error(err));
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div style={{ padding: '0 20px' }}>
            <div style={{
                position: 'sticky', top: 0, zIndex: 10, padding: '24px 0 20px 0'
            }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <SearchIcon size={24} style={{ position: 'absolute', left: '16px', top: '14px', color: '#b3b3b3' }} />
                    <input
                        type="text" placeholder="What do you want to play?" value={query} onChange={(e) => setQuery(e.target.value)}
                        style={{ width: '100%', padding: '14px 14px 14px 54px', borderRadius: '500px', border: '1px solid transparent', fontSize: '16px', color: 'white', outline: 'none', transition: 'border-color 0.2s, background-color 0.2s' }}
                        onMouseEnter={(e) => { ; e.target.style.borderColor = '#555'; }}
                        onMouseLeave={(e) => { if (document.activeElement !== e.target) { e.target.style.borderColor = 'transparent'; }}}
                        onFocus={(e) => { e.target.style.border = '1px solid white' }}
                        onBlur={(e) => { e.target.style.border = '1px solid transparent'; }}
                    />
                </div>
            </div>

            <div style={{ paddingTop: '10px' }}>
                {results.length === 0 && query.length > 0 && (
                    <div style={{ color: '#b3b3b3', marginTop: '40px', textAlign: 'center' }}><h3>No results found</h3></div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {results.map((song) => {
                        const isCurrent = currentSong && currentSong.id === song.id;
                        return (
                            <div
                                key={song.id}
                                className="song-row"
                                onDoubleClick={() => onPlaySong(song)}
                                style={{
                                    display: 'flex', alignItems: 'center', padding: '10px 16px', borderRadius: '4px', cursor: 'default',
                                    background: isCurrent ? '#2a2a2a' : 'transparent', transition: 'background 0.2s'
                                }}
                            >
                                <img src={song.album?.id ? `http://localhost:8080/api/albums/${song.album.id}/cover` : null} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', marginRight: '16px', background: '#333' }} onError={(e) => e.target.style.display='none'} />

                                <div style={{ flex: 1 }}>
                                    <div style={{ color: isCurrent ? '#1DB954' : 'white', fontSize: '16px', fontWeight: '500' }}>{song.title}</div>
                                    <div style={{ color: '#B3B3B3', fontSize: '14px', marginTop: '4px' }}>
                                        <span
                                            style={{color: 'white', cursor: 'pointer', textDecoration: 'underline'}}
                                            onClick={(e) => { e.stopPropagation(); onArtistClick(song.album?.artist); }}
                                        >
                                            {song.album?.artist?.name}
                                        </span>
                                        {song.album?.name && ` • ${song.album.name}`}
                                    </div>
                                </div>

                                <button onClick={() => onAddToPlaylist(song)} style={{ background: 'transparent', border: 'none', marginRight: '10px', padding: 0, minWidth: 'auto', cursor:'pointer' }}>
                                    <PlusCircle size={20} color="#b3b3b3" />
                                </button>

                                <button onClick={() => isCurrent ? onTogglePlay() : onPlaySong(song)} style={{ background: 'transparent', border: '1px solid #777', borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }} className="play-btn-hover">
                                    {isCurrent && isPlaying ? <Pause size={16} fill="white"/> : <Play size={16} fill="white" style={{marginLeft:'2px'}}/>}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Search;