import { Canvas, MeshProps, ThreeElements, useFrame } from '@react-three/fiber';
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

interface FloorProps extends MeshProps {
  color: string
}
function Floor({ position, scale, color, ...props }: FloorProps) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]} scale={scale} {...props}>
      {/*
        The thing that gives the mesh its shape
        In this case the shape is a flat plane
      */}
      <planeBufferGeometry />
      {/*
        The material gives a mesh its texture or look.
        In this case, it is just a uniform green
      */}
      <meshBasicMaterial color={color} side={DoubleSide} />
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

function FrontWall({ position, scale, color }: { position: number[]; scale: number[]; color: string }) {
  return (
    <mesh position={new Vector3(...position)} rotation={[0, 0, 0]} scale={new Vector3(...scale)}>
      {/*
        The thing that gives the mesh its shape
        In this case the shape is a flat plane
      */}
      <planeBufferGeometry />
      {/*
        The material gives a mesh its texture or look.
        In this case, it is just a uniform green
      */}
      <meshBasicMaterial color={color} side={FrontSide} attach={'material'} />
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

function Diagonal({ position, scale, rotate, angle }: { position: Vector3; scale: Vector3; rotate?: boolean; angle: number }) {
  return (
    <mesh position={position} rotation={[0, rotate ? Math.PI * 1.5 : Math.PI / 2, angle]} scale={scale}>
      {/*
        The thing that gives the mesh its shape
        In this case the shape is a flat plane
      */}
      <planeBufferGeometry />
      {/*
        The material gives a mesh its texture or look.
        In this case, it is just a uniform green
      */}
      <meshBasicMaterial color='red' side={BackSide} />
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

export default function Three({ text, setText }: { text: string; setText: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <Canvas style={{ height: '100vh' }}>
      <ambientLight />
      <PerspectiveCamera position={[0, 15, 15]} makeDefault />
      <pointLight position={[20, 0, 20]} intensity={1.5} />
      <Floor position={[0, 0, 0]} scale={[COURT_WIDTH, COURT_LENGTH, 1]} color='white' />

      {/* LEFT WALL */}
      <Wall position={new Vector3(-COURT_WIDTH / 2, COURT_HEIGHT / 2, 0)} scale={new Vector3(COURT_LENGTH, COURT_HEIGHT, 0)} rotate />
      <Wall position={new Vector3(-COURT_WIDTH / 2, 4.57, 0)} scale={new Vector3(COURT_LENGTH, 2, 0)} rotate />

      {/* RIGHT WALL */}
      <Wall position={new Vector3(COURT_WIDTH / 2, COURT_HEIGHT / 2, 0)} scale={new Vector3(COURT_LENGTH, COURT_HEIGHT, 0)} />
      <Wall position={new Vector3(COURT_WIDTH / 2, 4.57, 0)} scale={new Vector3(COURT_LENGTH, 2, 0)} />

      <FrontWall position={[0, COURT_HEIGHT / 2, -COURT_LENGTH / 2]} scale={[COURT_WIDTH, COURT_HEIGHT, 0]} color={'white'} />
      <FrontWall position={[0, 4.57, -COURT_LENGTH / 2]} scale={[COURT_WIDTH, 2, 0]} color={'white'} />

      <Diagonal position={new Vector3(COURT_WIDTH / 2 - 0.005, COURT_HEIGHT - 2.44 / 2, 0)} scale={new Vector3(10.05, 0.05, 0)} angle={Math.atan(2.44 / 9.75)} />
      <Diagonal position={new Vector3(-COURT_WIDTH / 2 + 0.005, COURT_HEIGHT - 2.44 / 2, 0)} scale={new Vector3(10.05, 0.05, 0)} angle={-Math.atan(2.44 / 9.75)} rotate />

      {/* Short line */}
      <Floor position={[0, 0.002, COURT_LENGTH / 2 - 4.26]} scale={[COURT_WIDTH, 0.05, 0]} color={'red'} onClick={() => setText('Short Line')}/>

      {/* Half line */}
      <Floor position={new Vector3(0, 0.002, (COURT_LENGTH - 4.26) / 2)} scale={[0.05, 4.26, 0]} color={'red'} />

      {/* Left Box */}
      <Floor position={[-(COURT_WIDTH - 1.6) / 2, 0.002, COURT_LENGTH / 2 - (4.26 - 1.6)]} scale={[1.6, 0.05, 0]} color={'red'} />
      <Floor position={[-(COURT_WIDTH - 3.2) / 2, 0.002, COURT_LENGTH / 2 - (4.26 - 0.8)]} scale={[0.05, 1.65, 0]} color={'red'} />

      {/* Right Box */}
      <Floor position={[(COURT_WIDTH - 1.6) / 2, 0.002, COURT_LENGTH / 2 - (4.26 - 1.6)]} scale={[1.6, 0.05, 0]} color={'red'} />
      <Floor position={[(COURT_WIDTH - 3.2) / 2, 0.002, COURT_LENGTH / 2 - (4.26 - 0.8)]} scale={[0.05, 1.65, 0]} color={'red'} />

      {/* TIN */}
      <FrontWall position={[0, 0.48, -COURT_LENGTH / 2 + 0.005]} scale={[COURT_WIDTH, 0.05, 0]} color={'red'} />

      {/* Serving Line */}
      <FrontWall position={[0, 1.83, -COURT_LENGTH / 2 + 0.005]} scale={[COURT_WIDTH, 0.05, 0]} color={'red'} />

      {/* Out Line */}
      <FrontWall position={[0, 4.57, -COURT_LENGTH / 2 + 0.005]} scale={[COURT_WIDTH, 0.05, 0]} color={'red'} />

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

      <OrbitControls position={[0, 10, 0]} />
    </Canvas>
  );
}
