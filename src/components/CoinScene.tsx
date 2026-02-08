
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense, type RefObject } from 'react';
import Coin, { type CoinHandle } from './Coin';
import type { CoinStyle } from '../lib/proceduralTextures';

interface CoinSceneProps {
    coinStyle: CoinStyle;
    coinRef: RefObject<CoinHandle | null>;
}

const CoinScene = ({ coinStyle, coinRef }: CoinSceneProps) => {
    return (
        <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
        >
            <Suspense fallback={null}>
                <Environment preset="city" />
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
                <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#b0c4de" />

                <Coin ref={coinRef} style={coinStyle} />
            </Suspense>
        </Canvas>
    );
};

export default CoinScene;
