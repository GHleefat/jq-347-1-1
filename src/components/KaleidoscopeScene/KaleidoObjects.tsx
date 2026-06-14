import { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useKaleidoscopeStore } from '@/hooks/useKaleidoscopeStore';
import type { KaleidoObject, ObjectType } from '@/types';
import { clamp } from '@/utils/geometry';

const CYLINDER_RADIUS = 2;
const CYLINDER_HEIGHT_HALF = 2;

const getGeometry = (type: ObjectType) => {
  switch (type) {
    case 'sphere':
      return <sphereGeometry args={[1, 32, 32]} />;
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />;
    case 'octahedron':
      return <octahedronGeometry args={[1, 0]} />;
    case 'torus':
      return <torusGeometry args={[0.7, 0.28, 16, 64]} />;
    case 'cone':
      return <coneGeometry args={[1, 1.6, 32]} />;
    case 'tetrahedron':
      return <tetrahedronGeometry args={[1, 0]} />;
    case 'icosahedron':
      return <icosahedronGeometry args={[1, 0]} />;
    case 'dodecahedron':
      return <dodecahedronGeometry args={[1, 0]} />;
    default:
      return <sphereGeometry args={[1, 32, 32]} />;
  }
};

interface SingleObjectProps {
  obj: KaleidoObject;
  isSelected: boolean;
}

function SingleKaleidoObject({ obj, isSelected }: SingleObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const transformRef = useRef<any>(null);
  const floatOffset = useRef(Math.random() * Math.PI * 2);
  const rotSpeed = useMemo(
    () => ({
      x: (Math.random() - 0.5) * 0.4,
      y: (Math.random() - 0.5) * 0.4,
      z: (Math.random() - 0.5) * 0.4,
    }),
    []
  );

  const selectObject = useKaleidoscopeStore((s) => s.selectObject);
  const updateObject = useKaleidoscopeStore((s) => s.updateObject);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectObject(obj.id);
  };

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    if (isSelected) return;

    meshRef.current.rotation.x += rotSpeed.x * delta;
    meshRef.current.rotation.y += rotSpeed.y * delta;
    meshRef.current.rotation.z += rotSpeed.z * delta;

    const floatY = Math.sin(state.clock.elapsedTime * 0.6 + floatOffset.current) * 0.08;
    const pos = meshRef.current.position;
    pos.y = obj.position[1] + floatY;

    const dist = Math.sqrt(pos.x ** 2 + pos.z ** 2);
    if (dist > CYLINDER_RADIUS - obj.scale) {
      const ratio = (CYLINDER_RADIUS - obj.scale) / dist;
      pos.x *= ratio;
      pos.z *= ratio;
    }
    pos.y = clamp(pos.y, -CYLINDER_HEIGHT_HALF + obj.scale, CYLINDER_HEIGHT_HALF - obj.scale);
  });

  const emissiveIntensity = isSelected ? Math.min(obj.emissiveIntensity * 2.5, 2.5) : obj.emissiveIntensity;

  return (
    <>
      <mesh
        ref={meshRef}
        position={obj.position}
        rotation={obj.rotation}
        scale={obj.scale}
        onClick={handleClick}
      >
        {getGeometry(obj.type)}
        <meshStandardMaterial
          color={obj.color}
          emissive={obj.emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={obj.roughness}
          metalness={obj.metalness}
        />
      </mesh>
      {isSelected && (
        <mesh position={obj.position} rotation={obj.rotation} scale={obj.scale * 1.15}>
          {getGeometry(obj.type)}
          <meshBasicMaterial
            color={obj.emissive}
            transparent
            opacity={0.25}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}
      {isSelected && (
        <TransformControls
          ref={transformRef}
          object={meshRef.current!}
          mode="translate"
          onObjectChange={() => {
            if (!meshRef.current) return;
            const p = meshRef.current.position;
            const r = meshRef.current.rotation;
            updateObject(obj.id, {
              position: [p.x, p.y, p.z],
              rotation: [r.x, r.y, r.z],
            });
          }}
        />
      )}
    </>
  );
}

export default function KaleidoObjects() {
  const objects = useKaleidoscopeStore((s) => s.objects);
  const selectedObjectId = useKaleidoscopeStore((s) => s.selectedObjectId);

  return (
    <group>
      {objects.map((obj) => (
        <SingleKaleidoObject
          key={obj.id}
          obj={obj}
          isSelected={selectedObjectId === obj.id}
        />
      ))}
    </group>
  );
}
