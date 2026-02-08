
import { useState, useRef } from 'react';
import CoinScene from './components/CoinScene';
import type { CoinStyle } from './lib/proceduralTextures';
import type { CoinHandle } from './components/Coin';
import './style.css';

function App() {
    const [selectedStyle, setSelectedStyle] = useState<CoinStyle>('egyptian');
    const [generatedStyle, setGeneratedStyle] = useState<CoinStyle | null>(null);

    const coinRef = useRef<CoinHandle>(null);

    const handleGenerate = () => {
        setGeneratedStyle(selectedStyle);
    };

    const handleAlign = () => {
        coinRef.current?.align();
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <h1>Procedural Coin</h1>

                <div className="control-group">
                    <label>Style Selection</label>
                    <div className="radio-group">
                        <label className={`radio-option ${selectedStyle === 'egyptian' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="style"
                                value="egyptian"
                                checked={selectedStyle === 'egyptian'}
                                onChange={() => setSelectedStyle('egyptian')}
                            />
                            Egyptian Bronze
                        </label>
                        <label className={`radio-option ${selectedStyle === 'silver' ? 'active' : ''}`}>
                            <input
                                type="radio"
                                name="style"
                                value="silver"
                                checked={selectedStyle === 'silver'}
                                onChange={() => setSelectedStyle('silver')}
                            />
                            Silver Dollar
                        </label>
                    </div>
                </div>

                <div className="actions">
                    <button className="primary-btn" onClick={handleGenerate}>
                        Generate Coin
                    </button>

                    <button className="secondary-btn" onClick={handleAlign} disabled={!generatedStyle}>
                        Align Upright (Y)
                    </button>
                </div>

                <div className="info-panel">
                    <p><strong>Current:</strong> {generatedStyle ? (generatedStyle === 'egyptian' ? 'Egyptian Bronze' : 'Silver Dollar') : 'None'}</p>
                    <p className="hint">Drag to rotate. Inertia enabled.</p>
                </div>
            </div>

            <div className="main-canvas">
                {generatedStyle ? (
                    <CoinScene coinStyle={generatedStyle} coinRef={coinRef} />
                ) : (
                    <div className="placeholder">
                        <p>Select a style and click Generate</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
