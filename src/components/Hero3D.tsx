
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FloatingCube = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Box ref={meshRef} args={[1, 1, 1]} position={[2, 0, 0]}>
      <meshStandardMaterial color="#8B5CF6" />
    </Box>
  );
};

const FloatingSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.2) * 0.2;
      meshRef.current.position.y = Math.cos(state.clock.elapsedTime * 0.8) * 0.2;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.8]} position={[-2, 0, 0]}>
      <meshStandardMaterial color="#3B82F6" />
    </Sphere>
  );
};

const Scene3D = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <FloatingCube />
      <FloatingSphere />
      <Text
        position={[0, 1, 0]}
        fontSize={0.5}
        color="#1F2937"
        anchorX="center"
        anchorY="middle"
      >
        AI Powered
      </Text>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </>
  );
};

interface Hero3DProps {
  onGetStarted: () => void;
}

const Hero3D = ({ onGetStarted }: Hero3DProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <Scene3D />
        </Canvas>
      </div>
      
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            Your AI
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {" "}PDF Assistant
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your PDFs into interactive learning experiences with AI-powered summaries, quizzes, and intelligent chat
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all"
            >
              Start Learning Now
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero3D;
