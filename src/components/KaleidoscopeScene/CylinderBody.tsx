import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CYLINDER_RADIUS = 2;
const CYLINDER_HEIGHT = 4;

export default function CylinderBody() {
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const edgeRef = useRef<THREE.LineSegments>(null);

  const edgeGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(
      CYLINDER_RADIUS,
      CYLINDER_RADIUS,
      CYLINDER_HEIGHT,
      64,
      1,
      true,
    );
    const edges = new THREE.EdgesGeometry(geo, 15);
    geo.dispose();
    return edges;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTopColor: { value: new THREE.Color("#8338ec") },
      uBottomColor: { value: new THREE.Color("#3a86ff") },
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (edgeRef.current) {
      const mat = edgeRef.current.material as THREE.LineBasicMaterial;
      const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 1.2) * 0.3;
      mat.opacity = pulse;
    }
  });

  return (
    <group>
      <mesh>
        <cylinderGeometry
          args={[
            CYLINDER_RADIUS,
            CYLINDER_RADIUS,
            CYLINDER_HEIGHT,
            64,
            1,
            true,
          ]}
        />
        <meshPhysicalMaterial
          ref={materialRef}
          color="#8338ec"
          transparent
          opacity={0.15}
          roughness={0.1}
          metalness={0.1}
          transmission={0.9}
          thickness={0.5}
          ior={1.5}
          side={THREE.DoubleSide}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            shader.uniforms.uTopColor = uniforms.uTopColor;
            shader.uniforms.uBottomColor = uniforms.uBottomColor;
            shader.uniforms.uTime = uniforms.uTime;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <common>",
              `
              #include <common>
              varying float vNormalizedY;
              `,
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <begin_vertex>",
              `
              #include <begin_vertex>
              vNormalizedY = (position.y + ${CYLINDER_HEIGHT / 2}.0) / ${CYLINDER_HEIGHT}.0;
              `,
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <common>",
              `
              #include <common>
              uniform vec3 uTopColor;
              uniform vec3 uBottomColor;
              uniform float uTime;
              varying float vNormalizedY;
              `,
            );
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <color_fragment>",
              `
              #include <color_fragment>
              vec3 gradientColor = mix(uBottomColor, uTopColor, vNormalizedY);
              float shimmer = 0.08 * sin(uTime * 0.8 + vNormalizedY * 8.0);
              diffuseColor.rgb *= gradientColor + shimmer;
              `,
            );
          }}
        />
      </mesh>

      <lineSegments ref={edgeRef} geometry={edgeGeometry}>
        <lineBasicMaterial
          color="#b967ff"
          transparent
          opacity={0.7}
          linewidth={2}
        />
      </lineSegments>

      <mesh
        position={[0, CYLINDER_HEIGHT / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[CYLINDER_RADIUS - 0.02, CYLINDER_RADIUS, 64]} />
        <meshBasicMaterial
          color="#b967ff"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[0, -CYLINDER_HEIGHT / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[CYLINDER_RADIUS - 0.02, CYLINDER_RADIUS, 64]} />
        <meshBasicMaterial
          color="#3a86ff"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
