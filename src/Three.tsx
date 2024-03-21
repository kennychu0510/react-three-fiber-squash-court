import { Canvas, Euler, MeshProps, ThreeElements, useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { BackSide, BufferGeometry, DoubleSide, FrontSide, Shape, Vector3 } from 'three';
import { Text } from '@react-three/drei';
import styles from './Three.module.css';
import TWEEN from '@tweenjs/tween.js';
import { BALL_GEOMETRY, BALL_SIZE } from './constants';

const COURT_WIDTH = 6.4;
const COURT_LENGTH = 9.75;
const COURT_HEIGHT = 4.57;

function Box(props: ThreeElements['mesh']) {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  useFrame((state, delta) => (mesh.current.rotation.x += delta));
  return (
    <mesh {...props} ref={mesh} scale={active ? 1.5 : 1} onClick={(event) => setActive(!active)} onPointerOver={(event) => setHover(true)} onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}

interface FloorProps extends MeshProps {
  color: string;
}
function Floor({ position, scale, color, ...props }: FloorProps) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]} scale={scale} {...props}>
      {/*
        The thing that gives the mesh its shape
        In this case the shape is a flat plane
      */}
      <planeBufferGeometry attach={'geometry'} />
      {/*
        The material gives a mesh its texture or look.
        In this case, it is just a uniform green
      */}
      <meshBasicMaterial color={color} side={DoubleSide} attach='material' />
    </mesh>
  );
}

function FloorText({ position, text, showLabels, fontSize, rotation }: { position: number[]; text: string; showLabels: boolean; fontSize?: number; rotation?: Euler }) {
  if (!showLabels) return null;
  return (
    <Text textAlign='center' position={new Vector3(...position)} rotation={rotation ?? [-Math.PI / 2, 0, 0]} fontSize={fontSize ?? 0.5} color={'black'}>
      {text}
    </Text>
  );
}

function Wall({ position, scale, rotate }: { position: Vector3; scale: Vector3; rotate?: boolean }) {
  return (
    <mesh position={position} rotation={[0, rotate ? Math.PI * 1.5 : Math.PI / 2, 0]} scale={scale}>
      {/*
        The thing that gives the mesh its shape
        In this case the shape is a flat plane
      */}
      <planeBufferGeometry />
      {/*
        The material gives a mesh its texture or look.
        In this case, it is just a uniform green
      */}
      <meshBasicMaterial color='white' side={BackSide} />
    </mesh>
  );
}

function FrontWall({ position, scale, color }: { position: number[]; scale: number[]; color: string }) {
  return (
    <mesh position={new Vector3(...position)} rotation={[0, 0, 0]} scale={new Vector3(...scale)}>
      <planeBufferGeometry attach={'geometry'} />
      <meshBasicMaterial color={color} side={FrontSide} attach={'material'} />
    </mesh>
  );
}

function BackWall({ position, scale, color }: { position: number[]; scale: number[]; color: string }) {
  return (
    <mesh position={new Vector3(...position)} rotation={[0, Math.PI, 0]} scale={new Vector3(...scale)}>
      <planeBufferGeometry attach={'geometry'} />
      <meshBasicMaterial color={color} side={FrontSide} attach={'material'} />
    </mesh>
  );
}

function WallText({ position, text, showLabels, isSide, rotate, fontSize }: { position: number[]; text: string; showLabels: boolean; isSide?: boolean; rotate?: boolean; fontSize?: number }) {
  if (!showLabels) return null;
  const rotateY = isSide ? (rotate ? -Math.PI * 1.5 : -Math.PI / 2) : 0;
  return (
    <Text rotation={[0, rotateY, 0]} position={new Vector3(...position)} fontSize={fontSize ?? 0.5} color={'black'}>
      {text}
    </Text>
  );
}

function Diagonal({ position, scale, rotate, angle }: { position: Vector3; scale: Vector3; rotate?: boolean; angle: number }) {
  return (
    <mesh position={position} rotation={[0, rotate ? Math.PI * 1.5 : Math.PI / 2, angle]} scale={scale}>
      {/*
        The thing that gives the mesh its shape
        In this case the shape is a flat plane
      */}
      <planeBufferGeometry attach={'geometry'} />
      {/*
        The material gives a mesh its texture or look.
        In this case, it is just a uniform green
      */}
      <meshBasicMaterial color='red' side={BackSide} attach='material' />
    </mesh>
  );
}

type LineProps = {
  start: number[];
  end: number[];
  color: string;
};

function Line(props: LineProps) {
  const ref = useRef<any>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.geometry.setFromPoints([props.start, props.end].map((point) => new Vector3(...point)));
    }
  });
  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color={props.color} linewidth={2} linecap={'round'} linejoin={'round'} />
    </line>
  );
}

const Ball = React.forwardRef<THREE.Mesh, { position: Vector3 }>((props, ref) => {
  return (
    <mesh position={props.position} ref={ref}>
      <sphereBufferGeometry args={BALL_GEOMETRY} />
      <meshStandardMaterial color='orange' />
    </mesh>
  );
});

function Tween() {
  useFrame(() => {
    TWEEN.update();
  });
  return null;
}

export default function Three() {
  const PerspectiveCameraRef = useRef<THREE.PerspectiveCamera>(null);
  const BallRef = useRef<THREE.Mesh>(null);
  const driveTypeRef = useRef<HTMLSelectElement>(null);
  const [ballPosition, setBallPosition] = useState(new Vector3(0, 0, 0));

  const [showLabels, setShowLabels] = useState(false);

  function onResetCamera() {
    if (PerspectiveCameraRef.current) {
      new TWEEN.Tween(PerspectiveCameraRef.current.position)
        .to({ x: 0, y: 15, z: 15 }, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut) // Add easing for smoother animation
        .start();
    }
    setBallPosition(new Vector3(0, 10000, 0));
  }

  function forehandDrive() {
    if (!BallRef.current) return;
    const initBall = new TWEEN.Tween(BallRef.current.position).to({ x: (COURT_WIDTH - 1.6) / 2, y: 1.2, z: COURT_LENGTH / 2 - 3 }, 0);
    const travelForward = new TWEEN.Tween(BallRef.current.position)
      .to({ y: 1.5, z: -COURT_LENGTH / 2 + BALL_SIZE }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .delay(500); // Add easing for smoother animation
    const travelBackward = new TWEEN.Tween(BallRef.current.position).to({ x: COURT_WIDTH / 2 - BALL_SIZE, y: BALL_SIZE, z: COURT_LENGTH / 2 - BALL_SIZE }, 1000).easing(TWEEN.Easing.Quadratic.InOut); // Add easing for smoother animation

    initBall.chain(travelForward);
    travelForward.chain(travelBackward);
    initBall.start();
  }

  function backhandDrive() {
    if (!BallRef.current) return;
    const initBall = new TWEEN.Tween(BallRef.current.position).to({ x: -(COURT_WIDTH - 1.6) / 2, y: 1.2, z: COURT_LENGTH / 2 - 3 }, 0);
    const travelForward = new TWEEN.Tween(BallRef.current.position)
      .to({ y: 1.5, z: -COURT_LENGTH / 2 + BALL_SIZE }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .delay(500); // Add easing for smoother animation
    const travelBackward = new TWEEN.Tween(BallRef.current.position).to({ x: -COURT_WIDTH / 2 + BALL_SIZE, y: BALL_SIZE, z: COURT_LENGTH / 2 - BALL_SIZE }, 1000).easing(TWEEN.Easing.Quadratic.InOut); // Add easing for smoother animation

    initBall.chain(travelForward);
    travelForward.chain(travelBackward);
    initBall.start();
  }

  function forehandBoast() {
    if (!BallRef.current) return;
    const initBall = new TWEEN.Tween(BallRef.current.position).to({ x: (COURT_WIDTH - 1.6) / 2, y: 0.5, z: COURT_LENGTH / 2 - 1 }, 0);
    const hitSideWall = new TWEEN.Tween(BallRef.current.position)
      .to({ x: COURT_WIDTH / 2 - BALL_SIZE, y: 1, z: COURT_LENGTH / 2 - 4 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .delay(500); // Add easing for smoother animation
    const hideFrontWall = new TWEEN.Tween(BallRef.current.position).to({ x: -(COURT_WIDTH - 1.6) / 2, y: 0.8, z: -COURT_LENGTH / 2 + BALL_SIZE }, 1000).easing(TWEEN.Easing.Quadratic.InOut);
    const hideAnotherSideWall = new TWEEN.Tween(BallRef.current.position).to({ x: -COURT_WIDTH / 2 + BALL_SIZE, y: BALL_SIZE, z: -COURT_LENGTH / 2 + 1 }, 500).easing(TWEEN.Easing.Quadratic.InOut);

    initBall.chain(hitSideWall);
    hitSideWall.chain(hideFrontWall);
    hideFrontWall.chain(hideAnotherSideWall);
    initBall.start();
  }

  function backhandBoast() {
    if (!BallRef.current) return;
    const initBall = new TWEEN.Tween(BallRef.current.position).to({ x: -(COURT_WIDTH - 1.6) / 2, y: 0.5, z: COURT_LENGTH / 2 - 1 }, 0);
    const hitSideWall = new TWEEN.Tween(BallRef.current.position)
      .to({ x: -COURT_WIDTH / 2 + BALL_SIZE, y: 1, z: COURT_LENGTH / 2 - 4 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .delay(500); // Add easing for smoother animation
    const hideFrontWall = new TWEEN.Tween(BallRef.current.position).to({ x: (COURT_WIDTH - 1.6) / 2, y: 0.8, z: -COURT_LENGTH / 2 + BALL_SIZE }, 1000).easing(TWEEN.Easing.Quadratic.InOut);
    const hideAnotherSideWall = new TWEEN.Tween(BallRef.current.position).to({ x: COURT_WIDTH / 2 - BALL_SIZE, y: BALL_SIZE, z: -COURT_LENGTH / 2 + 1 }, 500).easing(TWEEN.Easing.Quadratic.InOut);

    initBall.chain(hitSideWall);
    hitSideWall.chain(hideFrontWall);
    hideFrontWall.chain(hideAnotherSideWall);
    initBall.start();
  }

  function onPressStraight() {
    const type = driveTypeRef.current?.value;
    if (!type) return;
    type === 'Forehand' ? forehandDrive() : backhandDrive();
  }

  function onPressBoast() {
    const type = driveTypeRef.current?.value;
    if (!type) return;
    type === 'Forehand' ? forehandBoast() : backhandBoast();
  }

  function onShowLabels() {
    setShowLabels(!showLabels);
  }
  return (
    <>
      <Canvas style={{ height: '100dvh' }}>
        <Ball ref={BallRef} position={ballPosition} />
        <ambientLight />
        <PerspectiveCamera ref={PerspectiveCameraRef} position={[0, 15, 15]} makeDefault />
        <pointLight position={[20, 0, 20]} intensity={1.5} />
        <Floor position={[0, 0, 0]} scale={[COURT_WIDTH, COURT_LENGTH, 1]} color='white' />

        {/* LEFT WALL */}
        <Wall position={new Vector3(-COURT_WIDTH / 2, COURT_HEIGHT / 2, 0)} scale={new Vector3(COURT_LENGTH, COURT_HEIGHT, 0)} rotate />
        <WallText position={[-COURT_WIDTH / 2 + 0.002, COURT_HEIGHT / 2, 0]} text={'SIDE WALL (LEFT)'} showLabels={showLabels} isSide={true} rotate />
        <Wall position={new Vector3(-COURT_WIDTH / 2, 4.57, 0)} scale={new Vector3(COURT_LENGTH, 2, 0)} rotate />

        {/* RIGHT WALL */}
        <Wall position={new Vector3(COURT_WIDTH / 2, COURT_HEIGHT / 2, 0)} scale={new Vector3(COURT_LENGTH, COURT_HEIGHT, 0)} />
        <WallText position={[COURT_WIDTH / 2 - 0.002, COURT_HEIGHT / 2, 0]} text={'SIDE WALL (RIGHT)'} showLabels={showLabels} isSide={true} />
        <Wall position={new Vector3(COURT_WIDTH / 2, 4.57, 0)} scale={new Vector3(COURT_LENGTH, 2, 0)} />

        <FrontWall position={[0, COURT_HEIGHT / 2, -COURT_LENGTH / 2]} scale={[COURT_WIDTH, COURT_HEIGHT, 0]} color={'white'} />
        <WallText position={[0, COURT_HEIGHT / 2 + 1, -COURT_LENGTH / 2 + 0.002]} text={'FRONT WALL'} showLabels={showLabels} />
        <FrontWall position={[0, 4.57, -COURT_LENGTH / 2]} scale={[COURT_WIDTH, 2, 0]} color={'white'} />

        {/* BACK WALL */}
        <BackWall position={[0, (COURT_HEIGHT - 2.44) / 2, COURT_LENGTH / 2]} scale={[COURT_WIDTH, COURT_HEIGHT - 2.44, 0]} color={'white'} />
        <WallText position={[0, (COURT_HEIGHT - 2.44) / 2, COURT_LENGTH / 2]} text={'BACK WALL'} showLabels={showLabels} />

        <Diagonal position={new Vector3(COURT_WIDTH / 2 - 0.005, COURT_HEIGHT - 2.44 / 2, 0)} scale={new Vector3(10.05, 0.05, 0)} angle={Math.atan(2.44 / 9.75)} />
        <Diagonal position={new Vector3(-COURT_WIDTH / 2 + 0.005, COURT_HEIGHT - 2.44 / 2, 0)} scale={new Vector3(10.05, 0.05, 0)} angle={-Math.atan(2.44 / 9.75)} rotate />

        {/* Short line */}
        <Floor position={[0, 0.002, COURT_LENGTH / 2 - 4.26]} scale={[COURT_WIDTH, 0.05, 0]} color={'red'} />
        <FloorText position={[0, 0.002, COURT_LENGTH / 2 - 4.5]} fontSize={0.3} text={'SHORT LINE'} showLabels={showLabels} />

        {/* Half line */}
        <Floor position={new Vector3(0, 0.002, (COURT_LENGTH - 4.26) / 2)} scale={[0.05, 4.26, 0]} color={'red'} />
        <FloorText position={[-0.15, 0.002, (COURT_LENGTH - 4.26) / 2]} fontSize={0.3} text={'HALF COURT LINE'} showLabels={showLabels} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />

        {/* Left Box */}
        <Floor position={[-(COURT_WIDTH - 1.6) / 2, 0.002, COURT_LENGTH / 2 - (4.26 - 1.6)]} scale={[1.6, 0.05, 0]} color={'red'} />
        <Floor position={[-(COURT_WIDTH - 3.2) / 2, 0.002, COURT_LENGTH / 2 - (4.26 - 0.8)]} scale={[0.05, 1.65, 0]} color={'red'} />
        <FloorText position={[-(COURT_WIDTH - 1.6) / 2, 0.003, COURT_LENGTH / 2 - (4.26 - 0.8)]} fontSize={0.3} text={'SERVICE\nBOX'} showLabels={showLabels} />

        {/* Right Box */}
        <Floor position={[(COURT_WIDTH - 1.6) / 2, 0.002, COURT_LENGTH / 2 - (4.26 - 1.6)]} scale={[1.6, 0.05, 0]} color={'red'} />
        <Floor position={[(COURT_WIDTH - 3.2) / 2, 0.002, COURT_LENGTH / 2 - (4.26 - 0.8)]} scale={[0.05, 1.65, 0]} color={'red'} />
        <FloorText position={[(COURT_WIDTH - 1.6) / 2, 0.003, COURT_LENGTH / 2 - (4.26 - 0.8)]} fontSize={0.3} text={'SERVICE\nBOX'} showLabels={showLabels} />

        {/* TIN */}
        <FrontWall position={[0, 0.48, -COURT_LENGTH / 2 + 0.005]} scale={[COURT_WIDTH, 0.05, 0]} color={'red'} />
        <WallText position={[0, 0.6, -COURT_LENGTH / 2 + 0.005]} text={'TIN'} showLabels={showLabels} fontSize={0.3} />

        {/* Serving Line */}
        <FrontWall position={[0, 1.83, -COURT_LENGTH / 2 + 0.005]} scale={[COURT_WIDTH, 0.05, 0]} color={'red'} />
        <WallText position={[0, 2, -COURT_LENGTH / 2 + 0.005]} text={'SERVICE LINE'} showLabels={showLabels} fontSize={0.3} />

        {/* Out Line */}
        <FrontWall position={[0, 4.57, -COURT_LENGTH / 2 + 0.005]} scale={[COURT_WIDTH, 0.05, 0]} color={'red'} />

        {/* LEFT EDGE */}
        <Line start={[-COURT_WIDTH / 2, 0.002, -COURT_LENGTH / 2]} end={[-COURT_WIDTH / 2, 0.002, COURT_LENGTH / 2]} color={'black'} />

        {/* FRONT EDGE */}
        <Line start={[-COURT_WIDTH / 2, 0.002, -COURT_LENGTH / 2]} end={[COURT_WIDTH / 2, 0.002, -COURT_LENGTH / 2]} color={'black'} />

        {/* RIGHT EDGE */}
        <Line start={[COURT_WIDTH / 2, 0.002, COURT_LENGTH / 2]} end={[COURT_WIDTH / 2, 0.002, -COURT_LENGTH / 2]} color={'black'} />

        {/* BACK EDGE */}
        <Line start={[-COURT_WIDTH / 2, 0.002, COURT_LENGTH / 2]} end={[COURT_WIDTH / 2, 0.002, COURT_LENGTH / 2]} color={'black'} />

        {/* FRONT LEFT CORNER EDGE */}
        <Line start={[-COURT_WIDTH / 2 + 0.002, 0.002, -COURT_LENGTH / 2 + 0.002]} end={[-COURT_WIDTH / 2 + 0.002, COURT_HEIGHT, -COURT_LENGTH / 2 + 0.002]} color={'black'} />

        {/* FRONT RIGHT CORNER EDGE */}
        <Line start={[COURT_WIDTH / 2 - 0.002, 0.002, -COURT_LENGTH / 2 + 0.002]} end={[COURT_WIDTH / 2 - 0.002, COURT_HEIGHT, -COURT_LENGTH / 2 + 0.002]} color={'black'} />

        <OrbitControls position={[0, 10, 0]} />
        <Tween />
      </Canvas>
      <div className={styles.ButtonContainer}>
        <select ref={driveTypeRef}>
          <option>{'Forehand'}</option>
          <option>{'Backhand'}</option>
        </select>
        <div className={styles.row}>
          <button onClick={onPressStraight}>{'Straight'}</button>
          <button onClick={onPressBoast}>{'Boast'}</button>
        </div>
        <div className={styles.row}>
          <button onClick={onShowLabels}>{showLabels ? 'Hide Labels' : 'Show Labels'}</button>
          <button onClick={onResetCamera}>Reset</button>
        </div>
      </div>
    </>
  );
}
