import React, { useState } from 'react';
import Login from './Login';
import Register from './Register'; // Nezapomeň importovat
import SongUpload from './SongUpload';
import SongList from './SongList';
import './Spotify.css';

function App() {
    const [user, setUser] = useState(null);
    const [currentView, setCurrentView] = useState('login'); // 'login' nebo 'register'
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState('home');

    if (!user) {
        if (currentView === 'register') {
            return (
                <Register
                    onRegisterSuccess={() => setCurrentView('login')}
                    onSwitchToLogin={() => setCurrentView('login')}
                />
            );
        }
        return (
            <Login
                onLogin={(loggedInUser) => setUser(loggedInUser)}
                onSwitchToRegister={() => setCurrentView('register')}
            />
        );
    }

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="logo">SpotifyClone</div>
                <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>🏠 Domů</div>
                <div className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>➕ Přidat skladbu</div>
                <div style={{ flex: 1 }}></div>
                <div className="nav-item" onClick={() => setUser(null)}>🚪 Odhlásit ({user.username})</div>
            </div>

            <div className="main-content">
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 'bold' }}>👤 {user.username}</div>
                </div>

                {activeTab === 'upload' && (
                    <div className="card">
                        <h2>Nahrát novou hudbu</h2>
                        <SongUpload onUploadSuccess={() => { setRefreshKey(k => k + 1); setActiveTab('home'); }} />
                    </div>
                )}

                {activeTab === 'home' && (
                    <>
                        <h2>Vítej zpět!</h2>
                        <div className="card">
                            <SongList refreshKey={refreshKey} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;