import { Canvas } from '@react-three/fiber'
import { Environment, Center } from '@react-three/drei';
import { OrbitControls } from '@react-three/drei';
import React, { useState } from 'react';
import { useCart } from '../context/cartContext'
import Shirt from './Shirt';
import Backdrop from './Backdrop';
import CameraRig from './CameraRig';

const CanvasModel = () => { 
   
  return (
      
    <Canvas
      shadows
      camera={{ position: [0, 0, 0], fov: 25 }}
      gl={{ preserveDrawingBuffer: true }}
      className="w-full max-w-full h-full transition-all ease-in"
    >
      <ambientLight intensity={0.5} />
      <Environment preset="city" />
 <OrbitControls 
  enableZoom={true} 
  enablePan={false}
  maxPolarAngle={Math.PI / 2}
  minPolarAngle={Math.PI / 4}
  enableRotate={true}
/>
      <CameraRig>
        <Backdrop />
        <Center>
          <Shirt/>
        </Center>
      </CameraRig>
    </Canvas>
  )}

export default CanvasModel