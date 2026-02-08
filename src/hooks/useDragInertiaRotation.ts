
import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const useDragInertiaRotation = (
    groupRef: React.RefObject<THREE.Group | null>,
    sensitivity: number = 0.005,
    inertiaDecay: number = 0.95
) => {
    const isDragging = useRef(false);
    const lastPointer = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const coinQuaternion = useRef(new THREE.Quaternion());

    // For alignment animation
    const isAligning = useRef(false);
    const alignStartQuat = useRef(new THREE.Quaternion());
    const alignStartTime = useRef(0);
    const ALIGN_DURATION = 0.5; // seconds

    const handlePointerDown = useCallback((e: any) => {
        e.stopPropagation();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        isDragging.current = true;
        isAligning.current = false; // Cancel alignment
        lastPointer.current = { x: e.clientX, y: e.clientY };
        velocity.current = { x: 0, y: 0 };
    }, []);

    const handlePointerMove = useCallback((e: any) => {
        if (!isDragging.current || !groupRef.current) return;
        e.stopPropagation();

        const dx = e.clientX - lastPointer.current.x;
        const dy = e.clientY - lastPointer.current.y;

        lastPointer.current = { x: e.clientX, y: e.clientY };

        // Update velocity
        velocity.current = { x: dx, y: dy };

        // Apply rotation immediately
        // Axis-angle rotation. 
        // Drag X -> Rotate around local Y axis? Or World Y? 
        // Let's rotate around World Y and World X for consistent "tumbling".

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * sensitivity);

        const qy = new THREE.Quaternion();
        qy.setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * sensitivity);

        // Apply Y first, then X (or vice versa, order matters for feel)
        coinQuaternion.current.premultiply(qx);
        coinQuaternion.current.premultiply(qy);

        groupRef.current.quaternion.copy(coinQuaternion.current);
    }, [sensitivity, groupRef]);

    const handlePointerUp = useCallback((e: any) => {
        e.stopPropagation();
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        isDragging.current = false;
    }, []);

    const alignToUpright = useCallback(() => {
        if (!groupRef.current) return;
        isAligning.current = true;
        alignStartQuat.current.copy(groupRef.current.quaternion);
        alignStartTime.current = 0; // Will set on first frame
    }, [groupRef]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // 1. Alignment Animation
        if (isAligning.current) {
            if (alignStartTime.current === 0) alignStartTime.current = state.clock.elapsedTime;

            const elapsed = state.clock.elapsedTime - alignStartTime.current;
            const t = Math.min(1, elapsed / ALIGN_DURATION);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - t, 3);

            const targetQuat = new THREE.Quaternion(); // Identity (0,0,0,1)

            groupRef.current.quaternion.slerpQuaternions(alignStartQuat.current, targetQuat, ease);
            coinQuaternion.current.copy(groupRef.current.quaternion);

            if (t >= 1) {
                isAligning.current = false;
                velocity.current = { x: 0, y: 0 }; // Kill inertia
            }
            return;
        }

        // 2. Inertia
        if (!isDragging.current) {
            if (Math.abs(velocity.current.x) > 0.01 || Math.abs(velocity.current.y) > 0.01) {
                const dx = velocity.current.x;
                const dy = velocity.current.y;

                const qx = new THREE.Quaternion();
                qx.setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * sensitivity);

                const qy = new THREE.Quaternion();
                qy.setFromAxisAngle(new THREE.Vector3(0, 1, 0), dx * sensitivity);

                coinQuaternion.current.premultiply(qx);
                coinQuaternion.current.premultiply(qy);
                groupRef.current.quaternion.copy(coinQuaternion.current);

                // Decay
                // Frame independent decay: velocity * (decay ^ (dt * 60))
                const factor = Math.pow(inertiaDecay, delta * 60);
                velocity.current.x *= factor;
                velocity.current.y *= factor;
            }
        }
    });

    return {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        alignToUpright
    };
};
