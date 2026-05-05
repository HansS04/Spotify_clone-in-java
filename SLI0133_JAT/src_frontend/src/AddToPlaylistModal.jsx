import React from 'react';
import { X, Music } from 'lucide-react';

function AddToPlaylistModal({ playlists, onClose, onSelectPlaylist }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '350px', maxHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', margin: 0 }}>Add to Playlist</h2>
                    <button onClick={onClose} style={{ background: 'transparent', padding: 0, minWidth: 'auto' }}>
                        <X color="white" />
                    </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {playlists.length === 0 && <p style={{color: '#999'}}>No playlists found.</p>}

                    {playlists.map(pl => (
                        <div
                            key={pl.id}
                            onClick={() => onSelectPlaylist(pl.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '15px',
                                padding: '10px', borderRadius: '4px', cursor: 'pointer',
                                background: '#282828'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#3e3e3e'}
                            onMouseLeave={e => e.currentTarget.style.background = '#282828'}
                        >
                            <div style={{ width: '40px', height: '40px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden' }}>
                                <img
                                    src={`http://localhost:8080/api/playlists/${pl.id}/cover`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                                <Music size={20} color="#777" style={{ position: 'absolute' }} />
                            </div>
                            <div style={{ fontWeight: 'bold' }}>{pl.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AddToPlaylistModal;