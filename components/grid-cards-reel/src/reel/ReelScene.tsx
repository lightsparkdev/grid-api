/* The playground's card in a scene of the reel's own: the same mesh and
   studio as the stage (CardEnv, the stage's fill light, neutral tone
   mapping), with the camera and the card's pose driven from here instead
   of the stage's rig. The canvas is only a preview; the plate renders to
   its own targets (ReelRenderer). */

import { Canvas, useThree, type RootState } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CardEnv } from '@/components/CardStage/card3d/CardEnv';
import { CardMesh, type CardMeshState, type CardMeshUserData } from '@/components/CardStage/card3d/CardMesh';
import type { CardDesign } from '@/data/design';
import { credentialsOf, PLACEHOLDER } from '@reel/brands/reelBrands';

/** The stage camera's distance; scene units are card px. */
export const CAMERA_Z = 2000;

export interface SceneHandle {
  get: () => RootState;
  /** Takes position (the bounce); the card inside it takes the rotation. */
  carrier: THREE.Group;
  card: THREE.Group;
  setDesign: (design: CardDesign) => void;
  /** Bumped whenever the mesh reports something on screen changed. */
  changes: () => number;
  flags: () => CardMeshUserData;
}

const noSwapAnimation = () => ({ animate: false, backShowing: false });

function Rig({ onHandle }: { onHandle: (h: SceneHandle) => void }) {
  const get = useThree((s) => s.get);
  const carrier = useRef<THREE.Group>(null);
  const card = useRef<THREE.Group>(null);
  const changeCount = useRef(0);
  const [design, setDesign] = useState<CardDesign>(PLACEHOLDER.design);
  const state = useMemo<CardMeshState>(
    () => ({ design, issued: true, credentials: credentialsOf(design), frozen: false, closed: false }),
    [design],
  );
  const onChange = useCallback(() => {
    changeCount.current += 1;
  }, []);
  useEffect(() => {
    if (!carrier.current || !card.current) return;
    const c = card.current;
    onHandle({
      get,
      carrier: carrier.current,
      card: c,
      setDesign,
      changes: () => changeCount.current,
      flags: () => c.userData as CardMeshUserData,
    });
  }, [get, onHandle]);
  return (
    <group ref={carrier}>
      <CardMesh ref={card} state={state} swapContext={noSwapAnimation} onChange={onChange} />
    </group>
  );
}

export function ReelScene({ size, onHandle }: { size: number; onHandle: (h: SceneHandle) => void }) {
  return (
    <Canvas
      style={{ width: size, height: size }}
      dpr={1}
      frameloop="never"
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
      camera={{ position: [0, 0, CAMERA_Z], near: 200, far: 6000 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <CardEnv />
      <directionalLight position={[2, 5, 6]} intensity={0.3} color="#eef2f8" />
      <Rig onHandle={onHandle} />
    </Canvas>
  );
}
