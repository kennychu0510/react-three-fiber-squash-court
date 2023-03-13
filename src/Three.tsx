import { Canvas, ThreeElements, useFrame } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { BackSide, BufferGeometry, DoubleSide, FrontSide, Shape, Vector3 } from 'three';

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

function Floor() {
  return (
    <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[COURT_WIDTH, COURT_LENGTH, 1]}>
      {/*
        The thing that gives the mesh its shape
        In this case the shape is a flat plane
      */}
      <planeBufferGeometry />
      {/*
        The material gives a mesh its texture or look.
        In this case, it is just a uniform green
      */}
      <meshBasicMaterial color='white' side={DoubleSide} />
    </mesh>
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

function FrontWall() {
  return (
    <mesh position={[0, COURT_HEIGHT / 2, -COURT_LENGTH / 2]} rotation={[0, 0, 0]} scale={[COURT_WIDTH, COURT_HEIGHT, 0]}>
      {/*
        The thing that gives the mesh its shape
        In this case the shape is a flat plane
      */}
      <planeBufferGeometry />
      {/*
        The material gives a mesh its texture or look.
        In this case, it is just a uniform green
      */}
      <meshBasicMaterial color='white' side={DoubleSide} attach={'material'} />
    </mesh>
  );
}

function Truss1() {
  var length = 14,
    width = 2,
    deg = 10,
    thickness = 0.3;
  var rad = (deg * Math.PI) / 180;
  var offset = Math.min(Math.tan(rad) * width, length / 2);
  var shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(offset, width);
  shape.lineTo(length - offset, width);
  shape.lineTo(length, 0);
  shape.lineTo(0, 0);
  const extrudeSettings = {
    curveSegments: 1,
    steps: 1,
    depth: thickness,
    bevelEnabled: false,
  };

  return (
    <mesh>
      <extrudeBufferGeometry attach='geometry' args={[shape, extrudeSettings]} />
      <meshStandardMaterial color='red' side={DoubleSide} />
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

export default function Three() {
  return (
    <Canvas style={{ height: '100vh' }}>
      <ambientLight />
      <PerspectiveCamera position={[0, 15, 15]} makeDefault />
      <pointLight position={[20, 0, 20]} intensity={1.5} />
      <Floor />
      <Wall position={new Vector3(-COURT_WIDTH / 2, COURT_HEIGHT / 2, 0)} scale={new Vector3(COURT_LENGTH, COURT_HEIGHT, 0)} rotate />
      <Wall position={new Vector3(COURT_WIDTH / 2, COURT_HEIGHT / 2, 0)} scale={new Vector3(COURT_LENGTH, COURT_HEIGHT, 0)} />
      <Line start={[-COURT_WIDTH / 2, 0, 0]} end={[COURT_WIDTH / 2, 0, 0]} color={'red'} />
      <Line start={[0, 0, 0]} end={[0, 0, COURT_LENGTH / 2]} color={'red'} />

      {/* TIN */}
      <Line start={[-COURT_WIDTH / 2, 0.48, -COURT_LENGTH / 2]} end={[COURT_WIDTH / 2, 0.48, -COURT_LENGTH / 2]} color={'red'} />

      {/* LEFT EDGE */}
      <Line start={[-COURT_WIDTH / 2, 0.002, -COURT_LENGTH / 2]} end={[-COURT_WIDTH / 2, 0.002, COURT_LENGTH / 2]} color={'black'} />

      {/* FRONT EDGE */}
      <Line start={[-COURT_WIDTH / 2, 0.002, -COURT_LENGTH / 2]} end={[COURT_WIDTH / 2, 0.002, -COURT_LENGTH / 2]} color={'black'} />

      {/* RIGHT EDGE */}
      <Line start={[COURT_WIDTH / 2, 0.002, COURT_LENGTH / 2]} end={[COURT_WIDTH / 2, 0.002, -COURT_LENGTH / 2]} color={'black'} />

      {/* FRONT LEFT CORNER EDGE */}
      <Line start={[-COURT_WIDTH / 2 + 0.002, 0.002, -COURT_LENGTH / 2 + 0.002]} end={[-COURT_WIDTH / 2 + 0.002, COURT_HEIGHT, -COURT_LENGTH / 2 + 0.002]} color={'black'} />
      
      {/* FRONT RIGHT CORNER EDGE */}
      <Line start={[COURT_WIDTH / 2 - 0.002, 0.002, -COURT_LENGTH / 2 + 0.002]} end={[COURT_WIDTH / 2 - 0.002, COURT_HEIGHT, -COURT_LENGTH / 2 + 0.002]} color={'black'} />

      <FrontWall />
      <OrbitControls />
    </Canvas>
  );
}
