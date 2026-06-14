import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import KaleidoObjects from './KaleidoObjects';
import CylinderBody from './CylinderBody';
import { useKaleidoscopeStore } from '@/hooks/useKaleidoscopeStore';

function SceneContent() {
  const groupRef = useRef<THREE.Group>(null);
  const { rotationConfig, mirrorConfig } = useKaleidoscopeStore();

  useFrame((_, delta) => {
    if (groupRef.current && rotationConfig.autoRotate) {
      groupRef.current.rotation.z += delta * rotationConfig.speed * rotationConfig.direction;
    }
  });

  const mirrorAngleRad = (mirrorConfig.angle * Math.PI) / 180;

  return (
    <group ref={groupRef} rotation={[0, 0, mirrorAngleRad]}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 3]} intensity={2} color="#b967ff" distance={10} />
      <pointLight position={[3, 0, -2]} intensity={1.5} color="#00f0ff" distance={10} />
      <pointLight position={[-3, 2, 1]} intensity={1.5} color="#ff2d95" distance={10} />
      <pointLight position={[0, -3, 0]} intensity={1} color="#ffd700" distance={8} />

      <KaleidoObjects />
      <CylinderBody />
    </group>
  );
}

interface KaleidoscopeSceneProps {
  className?: string;
}

export function KaleidoscopeScene({ className }: KaleidoscopeSceneProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#050810');
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <color attach="background" args={['#050810']} />
        <fog attach="fog" args={['#050810', 5, 15]} />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        <SceneContent />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={12}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />

        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default KaleidoscopeScene;
