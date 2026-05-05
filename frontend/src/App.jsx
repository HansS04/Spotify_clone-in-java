import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import SongUpload from './SongUpload';
import AlbumCreate from './AlbumCreate';
import PlaylistCreate from './PlaylistCreate';
import AlbumLibrary from './AlbumLibrary';
import AlbumDetail from './AlbumDetail';
import AlbumEdit from './AlbumEdit';
import PlaylistLibrary from './PlaylistLibrary';
import PlaylistDetail from './PlaylistDetail';
import ArtistProfile from './ArtistProfile';
import ProfileEdit from './ProfileEdit';
import BottomPlayer from './BottomPlayer';
import Search from './Search';
import AddToPlaylistModal from './AddToPlaylistModal';
import { Play, Pause, Search as SearchIcon, Home as HomeIcon, Library, PlusCircle, Mic2, Disc, Music } from 'lucide-react';
import './Spotify.css';

function App() {
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('login');
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState('home');

    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [selectedArtist, setSelectedArtist] = useState(null);

    const [editingAlbum, setEditingAlbum] = useState(null);

    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [songQueue, setSongQueue] = useState([]);

    const [newestSongs, setNewestSongs] = useState([]);
    const [myPlaylists, setMyPlaylists] = useState([]);

    const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
    const [songToAdd, setSongToAdd] = useState(null);

    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => { setImageError(false); }, [refreshKey]);

    useEffect(() => {
        if (activeTab === 'home') {
            fetch('http://localhost:8080/api/songs/newest')
                .then(res => res.json())
                .then(data => setNewestSongs(data))
                .catch(err => console.error(err));
        }
    }, [activeTab, refreshKey]);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:8080/api/playlists/user?username=${user.username}`)
                .then(res => res.json())
                .then(data => setMyPlaylists(data))
                .catch(err => console.error(err));
        }
    }, [user, refreshKey]);

    const handlePlayContext = (songs) => {
        if (songs && songs.length > 0) {
            setSongQueue(songs);
            setCurrentSong(songs[0]);
            setIsPlaying(true);
        }
    };

    const handleNextSong = () => {
        if (!currentSong || songQueue.length === 0) return;
        const currentIndex = songQueue.findIndex(s => s.id === currentSong.id);
        if (currentIndex >= 0 && currentIndex < songQueue.length - 1) {
            setCurrentSong(songQueue[currentIndex + 1]);
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    };

    const resetSelection = () => {
        setSelectedAlbum(null);
        setSelectedPlaylist(null);
        setSelectedArtist(null);
        setEditingAlbum(null); // Reset edit
    };

    const openAddToPlaylist = (song) => {
        setSongToAdd(song);
        setIsAddToPlaylistOpen(true);
    };

    const handleAddToPlaylist = async (playlistId) => {
        if (!songToAdd) return;
        try {
            const res = await fetch(`http://localhost:8080/api/playlists/${playlistId}/songs/${songToAdd.id}`, { method: 'POST' });
            if (res.ok) {
                alert("Song added to playlist");
                setIsAddToPlaylistOpen(false);
                setSongToAdd(null);
                setRefreshKey(prev => prev + 1);
            } else {
                alert("Song is already in this playlist");
            }
        } catch (err) { console.error(err); }
    };

    const handleArtistClick = (artist) => {
        setSelectedArtist(artist);
        setSelectedAlbum(null);
        setSelectedPlaylist(null);
        setEditingAlbum(null);
        setActiveTab('artist');
    };

    if (!user) {
        if (currentView === 'register') {
            return <Register onRegisterSuccess={() => setCurrentView('login')} onSwitchToLogin={() => setCurrentView('login')} />;
        }
        return <Login onLogin={(u) => setUser(u)} onSwitchToRegister={() => setCurrentView('register')} />;
    }

    const isDetailView = (activeTab === 'albums' && selectedAlbum) || (activeTab === 'playlists' && selectedPlaylist) || (activeTab === 'artist' && selectedArtist) || (activeTab === 'profile-edit') || (activeTab === 'album-edit');

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="logo" onClick={() => {setActiveTab('home'); resetSelection();}}>SpotifyClone</div>
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Discover</div>
                    <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => {setActiveTab('home'); resetSelection();}}>
                        <HomeIcon size={20} style={{marginRight: '10px'}}/> Home
                    </div>
                    <div className={`nav-item ${activeTab === 'search' ? 'active' : ''}`} onClick={() => {setActiveTab('search'); resetSelection();}}>
                        <SearchIcon size={20} style={{marginRight: '10px'}}/> Search
                    </div>
                </div>
                <div className="sidebar-section">
                    <div className="sidebar-section-title">Your Library</div>
                    <div className={`nav-item ${activeTab === 'albums' ? 'active' : ''}`} onClick={() => {setActiveTab('albums'); setSelectedAlbum(null);}}>
                        <Disc size={20} style={{marginRight: '10px'}}/> Albums
                    </div>
                    <div className={`nav-item ${activeTab === 'playlists' ? 'active' : ''}`} onClick={() => {setActiveTab('playlists'); setSelectedPlaylist(null);}}>
                        <Library size={20} style={{marginRight: '10px'}}/> My Playlists
                    </div>
                    <div className={`nav-item ${activeTab === 'createPlaylist' ? 'active' : ''}`} onClick={() => {setActiveTab('createPlaylist'); resetSelection();}}>
                        <PlusCircle size={20} style={{marginRight: '10px'}}/> Create Playlist
                    </div>
                    <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {myPlaylists.map(pl => (
                            <div key={pl.id} className="sidebar-playlist-card" onClick={() => { setActiveTab('playlists'); setSelectedPlaylist(pl); }}>
                                <div style={{ width: '48px', height: '48px', minWidth: '48px', borderRadius: '4px', overflow: 'hidden', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <img src={`http://localhost:8080/api/playlists/${pl.id}/cover`} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} onError={(e) => e.target.style.display = 'none'} alt={pl.name}/>
                                    <Music size={24} color="#777" style={{ position: 'absolute', zIndex: 0 }}/>
                                </div>
                                <div style={{ marginLeft: '12px', overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px' }}>{pl.name}</div>
                                    <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Playlist</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {user.role === 'ARTIST' && (
                    <div className="sidebar-section">
                        <div className="sidebar-section-title" style={{ color: '#1DB954' }}>Artist Dashboard</div>
                        <div className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
                            <Music size={20} style={{marginRight: '10px'}}/> Add Song
                        </div>
                        <div className={`nav-item ${activeTab === 'createAlbum' ? 'active' : ''}`} onClick={() => setActiveTab('createAlbum')}>
                            <Disc size={20} style={{marginRight: '10px'}}/> Create Album
                        </div>
                    </div>
                )}
            </div>

            <div className="main-content" style={{ paddingBottom: '100px', paddingTop: isDetailView ? '0' : '20px', paddingLeft: isDetailView ? '0' : '20px', paddingRight: isDetailView ? '0' : '20px' }}>
                {!isDetailView && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '0 20px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>

                        </div>
                        <div className="profile-section" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                            {!imageError ? (
                                <img src={`http://localhost:8080/api/auth/${user.username}/avatar?r=${refreshKey}`} style={{width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', marginRight: '10px'}} onError={() => setImageError(true)} alt="avatar" />
                            ) : (
                                <div style={{width: '28px', height: '28px', borderRadius: '50%', background: '#535353', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>{user.username.charAt(0).toUpperCase()}</div>
                            )}
                            <span>{user.username}</span>
                            <span style={{ fontSize: '0.8em', marginLeft: '5px' }}>▼</span>
                            {isProfileMenuOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); setActiveTab('profile-edit'); setIsProfileMenuOpen(false); }}>Update Profile</div>
                                    <div style={{ borderTop: '1px solid #3e3e3e', margin: '5px 0' }}></div>
                                    <div className="dropdown-item" onClick={() => setUser(null)}>Log out</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'profile-edit' && (
                    <ProfileEdit
                        user={user}
                        onCancel={() => setActiveTab('home')}
                        onUpdateSuccess={(updatedUser) => {
                            setUser(updatedUser);
                            setRefreshKey(k => k + 1);
                            setActiveTab('home');
                        }}
                    />
                )}

                {activeTab === 'createAlbum' && <AlbumCreate user={user} onAlbumCreated={() => setActiveTab('albums')} />}
                {activeTab === 'createPlaylist' && <PlaylistCreate user={user} onCreated={() => { setRefreshKey(k=>k+1); setActiveTab('playlists'); }} />}
                {activeTab === 'upload' && <SongUpload user={user} onUploadSuccess={() => { setRefreshKey(k => k + 1); setActiveTab('home'); }} />}

                {activeTab === 'search' && (
                    <Search
                        currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
                        onPlaySong={(song) => { setSongQueue([song]); setCurrentSong(song); setIsPlaying(true); }}
                        onAddToPlaylist={openAddToPlaylist} onArtistClick={handleArtistClick}
                    />
                )}

                {activeTab === 'albums' && !selectedAlbum && !editingAlbum && <AlbumLibrary user={user} onAlbumClick={(album) => setSelectedAlbum(album)} />}

                {/* ALBUM DETAIL */}
                {activeTab === 'albums' && selectedAlbum && (
                    <AlbumDetail
                        album={selectedAlbum}
                        user={user}
                        currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
                        onBack={() => setSelectedAlbum(null)}
                        onPlaySong={(song) => { setSongQueue([song]); setCurrentSong(song); setIsPlaying(true); }}
                        onPlayAlbum={handlePlayContext}
                        onAddToPlaylist={openAddToPlaylist}
                        onArtistClick={handleArtistClick}
                        onEditAlbum={(album) => {
                            setEditingAlbum(album);
                            setSelectedAlbum(null); // Switch off detail view
                            setActiveTab('album-edit');
                        }}
                    />
                )}

                {activeTab === 'album-edit' && editingAlbum && (
                    <AlbumEdit
                        album={editingAlbum}
                        onBack={() => {
                            setActiveTab('albums');
                            setSelectedAlbum(editingAlbum); // Go back to detail
                            setEditingAlbum(null);
                        }}
                        onUpdateSuccess={() => {
                            setRefreshKey(k => k + 1);
                            setActiveTab('albums');
                            setSelectedAlbum(editingAlbum);
                            setEditingAlbum(null);
                        }}
                    />
                )}

                {activeTab === 'playlists' && !selectedPlaylist && <PlaylistLibrary user={user} onPlaylistClick={(pl) => setSelectedPlaylist(pl)} />}
                {activeTab === 'playlists' && selectedPlaylist && (
                    <PlaylistDetail
                        playlist={selectedPlaylist} currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
                        onBack={() => setSelectedPlaylist(null)}
                        onPlaySong={(song) => { setSongQueue(selectedPlaylist.songs || [song]); setCurrentSong(song); setIsPlaying(true); }}
                        onPlayContext={handlePlayContext}
                    />
                )}

                {activeTab === 'artist' && selectedArtist && (
                    <ArtistProfile
                        artist={selectedArtist} user={user} currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
                        onBack={() => { setActiveTab('home'); setSelectedArtist(null); }}
                        onPlaySong={(song) => { setSongQueue([song]); setCurrentSong(song); setIsPlaying(true); }}
                        onAlbumClick={(album) => { setActiveTab('albums'); setSelectedAlbum(album); }}
                        onAddToPlaylist={openAddToPlaylist}
                    />
                )}

                {activeTab === 'home' && (
                    <div style={{ padding: '0 20px' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Newest Releases</h2>
                        <div style={{ background: '#181818', borderRadius: '8px', padding: '10px' }}>
                            {newestSongs.map(song => {
                                const isCurrent = currentSong && currentSong.id === song.id;
                                return (
                                    <div key={song.id} className="song-row" style={{display:'flex', alignItems:'center', padding:'10px', borderRadius:'4px'}}>
                                        <img src={song.coverUrl ? `http://localhost:8080${song.coverUrl}` : (song.albumId ? `http://localhost:8080/api/albums/${song.albumId}/cover` : null)} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', marginRight: '16px', background: '#333' }} onError={(e) => e.target.style.display='none'}/>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: isCurrent ? '#1DB954' : 'white', fontWeight: '500', fontSize:'16px' }}>{song.title}</div>
                                            <div style={{ color: '#B3B3B3', fontSize: '14px', cursor:'pointer' }} className="hover:underline hover:text-white" onClick={() => handleArtistClick({ id: song.artistId, name: song.artistName })}>
                                                {song.artistName}
                                            </div>
                                        </div>
                                        <button onClick={() => openAddToPlaylist(song)} style={{ background: 'transparent', border: 'none', marginRight: '10px', padding: 0, minWidth: 'auto', cursor:'pointer' }} title="Add to Playlist"><PlusCircle size={20} color="#b3b3b3" /></button>
                                        <button onClick={() => { if (isCurrent) setIsPlaying(!isPlaying); else { setSongQueue(newestSongs); setCurrentSong(song); setIsPlaying(true); }}} style={{ background: 'transparent', border: '1px solid #777', borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }} className="play-btn-hover">
                                            {isCurrent && isPlaying ? <Pause size={16} fill="white"/> : <Play size={16} fill="white" style={{marginLeft:'2px'}}/>}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <BottomPlayer currentSong={currentSong} isPlaying={isPlaying} setIsPlaying={setIsPlaying} onSongEnd={handleNextSong} />
            {isAddToPlaylistOpen && <AddToPlaylistModal playlists={myPlaylists} onClose={() => setIsAddToPlaylistOpen(false)} onSelectPlaylist={handleAddToPlaylist} />}
        </div>
    );
}

export default App;