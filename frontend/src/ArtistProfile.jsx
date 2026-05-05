import React, { useState, useEffect } from 'react';
import { Play, Pause, BadgeCheck, Disc, PlusCircle, Camera, Upload } from 'lucide-react';

function ArtistProfile({ artist, user, currentSong, isPlaying, onTogglePlay, onPlaySong, onAlbumClick, onBack, onAddToPlaylist }) {
    const [fullArtist, setFullArtist] = useState(artist);
    const [topSongs, setTopSongs] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [imageRefresh, setImageRefresh] = useState(0);
    const [editSongId, setEditSongId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editGenre, setEditGenre] = useState('');
    const [editAlbumId, setEditAlbumId] = useState('');
    const [editCoverFile, setEditCoverFile] = useState(null);

    const primaryGenre = topSongs.length > 0 ? topSongs[0].genre : "Artist";


    const canEdit = user && (
        user.username === 'admin' ||
        user.username.toLowerCase() === artist.name.toLowerCase().replace(/\s/g, '')
    );

    const refreshData = async () => {
        try {
            if (artist && artist.id) {
                const res = await fetch(`http://localhost:8080/api/artists/${artist.id}`);
                const data = await res.json();
                setFullArtist(data);
                if (data.albums) setAlbums(data.albums);

                const songsRes = await fetch('http://localhost:8080/api/songs');
                const songsData = await songsRes.json();
                const artistSongs = songsData.filter(s => s.artistId && String(s.artistId) === String(artist.id));
                setTopSongs(artistSongs.slice(0, 5));
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { refreshData(); }, [artist]);

    const handleProfileUpload = async (e) => {
        if (!e.target.files[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        await fetch(`http://localhost:8080/api/artists/${artist.id}/image`, { method: 'POST', body: formData });
        setImageRefresh(prev => prev + 1);
    };

    const handleCoverUpload = async (e) => {
        if (!e.target.files[0]) return;
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        await fetch(`http://localhost:8080/api/artists/${artist.id}/cover`, { method: 'POST', body: formData });
        setImageRefresh(prev => prev + 1);
    };

    return (
        <div style={{ background: '#121212', minHeight: '100%', paddingBottom: '40px' }}>
            {/* HERO SECTION */}
            <div style={{ height: '400px', position: 'relative', background: '#333' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: `url(http://localhost:8080/api/artists/${fullArtist.id}/cover?r=${imageRefresh})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7
                }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent 0%, #121212 100%)' }} />

                {/* EDIT BUTTON FOR COVER (Pouze pokud canEdit) */}
                {canEdit && (
                    <label style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', cursor: 'pointer', zIndex: 20 }} title="Change Cover">
                        <Camera color="white" size={20} />
                        <input type="file" style={{display:'none'}} accept="image/*" onChange={handleCoverUpload} />
                    </label>
                )}

                <button onClick={onBack} style={{ position: 'absolute', top: '30px', left: '30px', background: 'rgba(0,0,0,0.4)', padding: '8px 16px', borderRadius: '20px', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', zIndex: 20 }}>← BACK</button>

                <div style={{ position: 'absolute', bottom: '30px', left: '30px', right: '30px', display: 'flex', alignItems: 'flex-end', gap: '30px', zIndex: 10 }}>
                    <div style={{ position: 'relative', width: '180px', height: '180px', minWidth: '180px' }} className="group">
                        <img
                            src={`http://localhost:8080/api/artists/${fullArtist.id}/image?r=${imageRefresh}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', background: '#333' }}
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', fontWeight: 'bold', zIndex: -1 }}>
                            {fullArtist.name?.charAt(0)}
                        </div>

                        {/* EDIT BUTTON FOR AVATAR (Pouze pokud canEdit) */}
                        {canEdit && (
                            <label style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                <Upload color="white" size={32} />
                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleProfileUpload} />
                            </label>
                        )}
                    </div>

                    <div style={{ paddingBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                            <BadgeCheck fill="#3D91F4" color="white" size={24} />
                            <span style={{ fontSize: '14px', color: 'white' }}>Verified Artist</span>
                        </div>
                        <h1 style={{ fontSize: '5rem', margin: 0, fontWeight: '900', lineHeight: '1', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>{fullArtist.name}</h1>
                        <div style={{ fontSize: '16px', color: 'white', marginTop: '10px', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                            {primaryGenre} • {albums.length} Releases
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '30px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'white' }}>Popular</h2>
                <div style={{ marginBottom: '40px' }}>
                    {topSongs.map((song, index) => {
                        const isCurrent = currentSong && currentSong.id === song.id;
                        const isOwner = user && song.ownerUsername && user.username === song.ownerUsername;
                        return (
                            <div key={song.id} className="song-row" onDoubleClick={() => onPlaySong(song)} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderRadius: '4px', cursor: 'default', background: isCurrent ? '#2a2a2a' : 'transparent', transition: 'background 0.2s' }}>
                                <div style={{ width: '30px', textAlign: 'center', color: '#b3b3b3', fontSize: '16px' }}>{index + 1}</div>
                                <img src={song.coverUrl ? `http://localhost:8080${song.coverUrl}` : (song.albumId ? `http://localhost:8080/api/albums/${song.albumId}/cover` : null)} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '16px', marginLeft: '10px', background: '#333', display: (song.coverUrl || song.albumId) ? 'block' : 'none' }} onError={(e) => e.target.style.display='none'} />
                                <div style={{ flex: 1, display:'flex', flexDirection:'column' }}>
                                    <span style={{ fontWeight: '500', color: isCurrent ? '#1DB954' : 'white' }}>{song.title}</span>
                                    <span style={{ fontSize: '12px', color: '#b3b3b3' }}>{song.genre} {song.ownerUsername ? ` • ${song.ownerUsername}` : ''}</span>
                                </div>
                                <div style={{ color: '#b3b3b3', fontSize: '14px', marginRight: '20px' }}>
                                    {song.durationSeconds ? `${Math.floor(song.durationSeconds / 60)}:${(song.durationSeconds % 60).toString().padStart(2, '0')}` : "0:00"}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button onClick={() => onAddToPlaylist(song)} style={{ background: 'transparent', border: 'none', padding: 0, minWidth: 'auto', cursor:'pointer' }}><PlusCircle size={20} color="#b3b3b3" /></button>
                                    <button onClick={() => isCurrent ? onTogglePlay() : onPlaySong(song)} style={{ background: 'transparent', border: '1px solid #777', borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }} className="play-btn-hover">
                                        {isCurrent && isPlaying ? <Pause size={14} fill="white"/> : <Play size={14} fill="white" style={{marginLeft:'2px'}}/>}
                                    </button>
                                    {isOwner && (
                                        <button onClick={() => { setEditSongId(song.id); setEditTitle(song.title); setEditGenre(song.genre||''); setEditAlbumId(song.albumId||''); }} style={{ background: 'transparent', border: '1px solid #777', color: 'white', padding: '6px 10px', borderRadius: '6px', cursor:'pointer' }}>Edit</button>
                                    )}
                                </div>
                                {editSongId === song.id && (
                                    <div style={{ marginTop: '10px', width: '100%', paddingTop: '10px' }}>
                                        <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" />
                                        <input type="text" value={editGenre} onChange={e => setEditGenre(e.target.value)} placeholder="Genre" />
                                        <select value={editAlbumId} onChange={e => setEditAlbumId(e.target.value)}>
                                            <option value="">No Album</option>
                                            {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button onClick={async () => {
                                                const fd = new FormData();
                                                if (editTitle) fd.append('title', editTitle);
                                                if (editGenre) fd.append('genre', editGenre);
                                                if (editAlbumId) fd.append('albumId', editAlbumId);
                                                const res = await fetch(`http://localhost:8080/api/songs/${song.id}/update`, { method: 'POST', body: fd });
                                                if (res.ok) { alert('Updated'); setEditSongId(null); setImageRefresh(prev=>prev+1); await refreshData(); }
                                                else alert('Update failed');
                                            }} style={{ padding: '6px 10px' }}>Save</button>

                                            <label style={{ padding: '6px 10px', border: '1px solid #777', borderRadius: '6px', cursor: 'pointer' }}>
                                                Upload Cover
                                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => { const f = e.target.files[0]; if (!f) return; const fd = new FormData(); fd.append('file', f); const r = await fetch(`http://localhost:8080/api/songs/${song.id}/cover`, { method: 'POST', body: fd }); if (r.ok) { alert('Cover uploaded'); setEditSongId(null); setImageRefresh(prev=>prev+1); await refreshData(); } else alert('Upload failed'); }} />
                                            </label>

                                            <button onClick={() => setEditSongId(null)} style={{ padding: '6px 10px' }}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: 'white' }}>Discography</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                    {albums.map(album => (
                        <div key={album.id} onClick={() => onAlbumClick(album)} style={{ background: '#181818', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = '#282828'} onMouseLeave={e => e.currentTarget.style.background = '#181818'}>
                            <div style={{ width: '100%', aspectRatio: '1/1', marginBottom: '16px', position: 'relative' }}>
                                <img src={`http://localhost:8080/api/albums/${album.id}/cover`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', background: '#333' }} onError={(e) => e.target.style.display = 'none'} />
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.name}</div>
                            <div style={{ color: '#b3b3b3', fontSize: '14px', display:'flex', alignItems:'center', gap:'5px' }}>{album.yearReleased} • <Disc size={12}/> Album</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ArtistProfile;