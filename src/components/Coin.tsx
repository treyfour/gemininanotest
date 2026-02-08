
import { useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { type CoinStyle, generateCoinTextures } from '../lib/proceduralTextures';
import { useDragInertiaRotation } from '../hooks/useDragInertiaRotation';

interface CoinProps {
    style: CoinStyle;
}

export interface CoinHandle {
    align: () => void;
}

const Coin = forwardRef<CoinHandle, CoinProps>(({ style }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const { handlePointerDown, handlePointerMove, handlePointerUp, alignToUpright } =
        useDragInertiaRotation(groupRef);

    useImperativeHandle(ref, () => ({
        align: alignToUpright
    }));

    // Memoize textures per style
    const textures = useMemo(() => generateCoinTextures(style), [style]);

    // Geometry constants
    const RADIUS = 1.2;
    const THICKNESS = 0.2;
    const SEGMENTS = 64;

    return (
        <group
            ref={groupRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            {/* Body Cylinder */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[RADIUS, RADIUS, THICKNESS, SEGMENTS]} />
                <meshStandardMaterial
                    color={textures.bodyColor}
                    metalness={textures.metalness}
                    roughness={textures.roughness}
                />
            </mesh>

            {/* Front Face */}
            <mesh position={[0, 0, THICKNESS / 2 + 0.001]} rotation={[0, 0, 0]}>
                <circleGeometry args={[RADIUS, SEGMENTS]} />
                <meshStandardMaterial
                    map={textures.front.map}
                    normalMap={textures.front.normalMap}
                    normalScale={new THREE.Vector2(1.5, 1.5)}
                    color={textures.bodyColor}
                    metalness={textures.metalness}
                    roughness={textures.roughness}
                />
            </mesh>

            {/* Back Face */}
            <mesh position={[0, 0, -(THICKNESS / 2 + 0.001)]} rotation={[0, Math.PI, 0]}>
                <circleGeometry args={[RADIUS, SEGMENTS]} />
                <meshStandardMaterial
                    map={textures.back.map}
                    normalMap={textures.back.normalMap}
                    normalScale={new THREE.Vector2(1.5, 1.5)}
                    color={textures.bodyColor}
                    metalness={textures.metalness}
                    roughness={textures.roughness}
                />
            </mesh>
        </group>
    );
});

export default Coin;
