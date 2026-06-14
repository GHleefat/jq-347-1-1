import { useRef, useEffect, forwardRef, useImperativeHandle, ReactNode, useMemo } from 'react';
import { useThree, useFrame, createPortal } from '@react-three/fiber';
import * as THREE from 'three';

export interface SceneToTextureHandle {
  getTexture: () => THREE.Texture | null;
  getRenderTarget: () => THREE.WebGLRenderTarget | null;
  render: () => void;
}

export interface SceneToTextureProps {
  children: ReactNode;
  width?: number;
  height?: number;
  orthoSize?: number;
  onTextureReady?: (texture: THREE.Texture) => void;
}

export const SceneToTexture = forwardRef<SceneToTextureHandle, SceneToTextureProps>(
  ({ children, width = 1024, height = 1024, orthoSize = 2, onTextureReady }, ref) => {
    const { gl } = useThree();
    const renderTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

    const { virtualScene, orthoCamera } = useMemo(() => {
      const aspect = width / height;
      const camera = new THREE.OrthographicCamera(
        -orthoSize * aspect,
        orthoSize * aspect,
        orthoSize,
        -orthoSize,
        0.1,
        100
      );
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);

      const vScene = new THREE.Scene();
      vScene.background = new THREE.Color(0x000000);

      return { virtualScene: vScene, orthoCamera: camera };
    }, [width, height, orthoSize]);

    useEffect(() => {
      const renderTarget = new THREE.WebGLRenderTarget(width, height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        generateMipmaps: true,
      });
      renderTargetRef.current = renderTarget;

      if (onTextureReady) {
        onTextureReady(renderTarget.texture);
      }

      return () => {
        renderTarget.dispose();
      };
    }, [width, height, onTextureReady]);

    useFrame(() => {
      if (renderTargetRef.current) {
        gl.setRenderTarget(renderTargetRef.current);
        gl.render(virtualScene, orthoCamera);
        gl.setRenderTarget(null);
      }
    });

    useImperativeHandle(ref, () => ({
      getTexture: () => renderTargetRef.current?.texture ?? null,
      getRenderTarget: () => renderTargetRef.current,
      render: () => {
        if (renderTargetRef.current) {
          gl.setRenderTarget(renderTargetRef.current);
          gl.render(virtualScene, orthoCamera);
          gl.setRenderTarget(null);
        }
      },
    }));

    return createPortal(<>{children}</>, virtualScene);
  }
);

SceneToTexture.displayName = 'SceneToTexture';
