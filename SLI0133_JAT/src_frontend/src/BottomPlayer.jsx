import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Maximize2 } from 'lucide-react';

function BottomPlayer({ currentSong, isPlaying, setIsPlaying, onSongEnd }) {
    const audioRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [duration, setDuration] = useState(0);

    // EFEKT: Synchronizace <audio> elementu se stavem isPlaying z App.jsx
    useEffect(() => {
        if (currentSong && audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => {
                    console.warn("Playback prevented:", e);
                    setIsPlaying(false); // Pokud prohlížeč blokuje autoplay, resetujeme stav
                });
            } else {
                audioRef.current.pause();
            }
        }
    }, [currentSong, isPlaying, setIsPlaying]);

    const togglePlay = () => {
        // Měníme stav v App.jsx -> efekt výše se pak postará o audio.play()/pause()
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            if (!duration) setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const newTime = Number(e.target.value);
        audioRef.current.currentTime = newTime;
        setProgress(newTime);
    };

    const handleVolume = (e) => {
        const val = Number(e.target.value);
        setVolume(val);
        if (audioRef.current) {
            audioRef.current.volume = val;
        }
    };

    const formatTime = (s) => {
        if (!s) return "0:00";
        const min = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const getBackgroundSize = (current, max) => {
        if (!max || max === 0) return { backgroundSize: '0% 100%' };
        return { backgroundSize: `${(current / max) * 100}% 100%` };
    };

    if (!currentSong) return null;

    return (
        <div className="bottom-player">
            <audio
                ref={audioRef}
                src={`http://localhost:8080/api/songs/${currentSong.id}/play`}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => {
                    if (onSongEnd) onSongEnd();
                    else setIsPlaying(false);
                }}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
            />

            <div className="player-left">
                <img
                    src={currentSong.album?.id ? `http://localhost:8080/api/albums/${currentSong.album.id}/cover` : ""}
                    className="player-cover"
                    onError={(e) => e.target.style.display = 'none'}
                    alt="Album Art"
                />
                <div className="player-info">
                    <div className="player-title">{currentSong.title}</div>
                    <div className="player-artist">{currentSong.album?.artist?.name || "Unknown"}</div>
                </div>
            </div>

            <div className="player-center">
                <div className="player-controls">
                    <button className="icon-btn"><Shuffle size={16} /></button>
                    <button className="icon-btn"><SkipBack size={20} fill="currentColor" /></button>

                    <button className="play-pause-btn" onClick={togglePlay}>
                        {isPlaying ? <Pause size={20} fill="black" stroke="black" /> : <Play size={20} fill="black" stroke="black" className="ml-1" />}
                    </button>

                    <button className="icon-btn" onClick={onSongEnd}>
                        <SkipForward size={20} fill="currentColor" />
                    </button>

                    <button className="icon-btn"><Repeat size={16} /></button>
                </div>
                <div className="player-progress-bar">
                    <span style={{ minWidth: '35px', textAlign: 'center' }}>{formatTime(progress)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={progress}
                        onChange={handleSeek}
                        className="progress-slider"
                        style={getBackgroundSize(progress, duration)}
                    />
                    <span style={{ minWidth: '35px', textAlign: 'center' }}>{formatTime(duration)}</span>
                </div>
            </div>

            <div className="player-right">
                <div className="volume-container">
                    <Volume2 size={18} className="text-gray-400" />
                    <input
                        type="range"
                        min="0" max="1" step="0.01"
                        value={volume}
                        onChange={handleVolume}
                        className="volume-slider"
                        style={getBackgroundSize(volume, 1)}
                    />
                </div>
                <button className="icon-btn" style={{marginLeft: '8px'}}><Maximize2 size={16} /></button>
            </div>
        </div>
    );
}

export default BottomPlayer;