
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Float, Sphere, Torus, Box } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FloatingElements = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1} rotationIntensity={1} floatIntensity={2}>
        <Box position={[2, 1, 0]} args={[0.8, 0.8, 0.8]}>
          <meshStandardMaterial color="#3B82F6" />
        </Box>
      </Float>
      
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <Sphere position={[-2, 0.5, 0]} args={[0.6]}>
          <meshStandardMaterial color="#8B5CF6" />
        </Sphere>
      </Float>
      
      <Float speed={0.8} rotationIntensity={1.5} floatIntensity={2.5}>
        <Torus position={[0, -1, 1]} args={[0.8, 0.3, 16, 32]}>
          <meshStandardMaterial color="#EC4899" />
        </Torus>
      </Float>
      
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.8}>
        <Box position={[-1, -0.5, -1]} args={[0.6, 1.2, 0.6]}>
          <meshStandardMaterial color="#10B981" />
        </Box>
      </Float>
      
      <Float speed={2} rotationIntensity={2.5} floatIntensity={1}>
        <Sphere position={[1.5, -1.5, 0.5]} args={[0.4]}>
          <meshStandardMaterial color="#F59E0B" />
        </Sphere>
      </Float>
    </group>
  );
};

const AnimatedText = () => {
  const textRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Text
      ref={textRef}
      position={[0, 2, 0]}
      fontSize={0.8}
      color="#1F2937"
      anchorX="center"
      anchorY="middle"
    >
      AI Powered Learning
    </Text>
  );
};

const ParticleField = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const particleCount = 50;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={particleCount}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#64748B" size={0.02} transparent opacity={0.6} />
    </points>
  );
};

const Scene3D = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8B5CF6" />
      
      <ParticleField />
      <FloatingElements />
      <AnimatedText />
      
      <OrbitControls 
        enableZoom={false} 
        autoRotate 
        autoRotateSpeed={0.5}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
};

const Simple3DFallback = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse opacity-30"></div>
  </div>
);

interface Hero3DProps {
  onGetStarted: () => void;
}

const Hero3D = ({ onGetStarted }: Hero3DProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px] opacity-30"></div>
      </div>
      
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<Simple3DFallback />}>
          <Canvas 
            camera={{ position: [0, 0, 8], fov: 60 }}
            gl={{ 
              antialias: true,
              alpha: true,
              powerPreference: "high-performance"
            }}
            dpr={[1, 2]}
            onCreated={({ gl }) => {
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
              gl.setClearColor('#000000', 0);
            }}
            fallback={<Simple3DFallback />}
          >
            <Scene3D />
          </Canvas>
        </Suspense>
      </div>
      
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transform Your
            <motion.span 
              className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 bg-clip-text text-transparent block"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              PDF Learning
            </motion.span>
            Experience
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Upload any educational PDF and let our AI assistant generate summaries, create quizzes, provide YouTube resources, and answer your questions in real-time
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Start Learning Now
            </Button>
            
            <motion.div 
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm">✨ 500+ students using our platform</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Floating Action Elements */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2 animate-pulse"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero3D;
