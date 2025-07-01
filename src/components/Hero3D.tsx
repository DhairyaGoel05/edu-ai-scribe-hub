
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Box } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const FloatingElements = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
        <Box position={[2, 0, 0]} args={[0.5, 0.5, 0.5]}>
          <meshStandardMaterial color="#3B82F6" />
        </Box>
      </Float>
      
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.2}>
        <Sphere position={[-2, 0, 0]} args={[0.4]}>
          <meshStandardMaterial color="#8B5CF6" />
        </Sphere>
      </Float>
      
      <Float speed={0.8} rotationIntensity={0.6} floatIntensity={1.5}>
        <Box position={[0, 1.5, 0]} args={[0.4, 0.8, 0.4]}>
          <meshStandardMaterial color="#10B981" />
        </Box>
      </Float>
    </group>
  );
};

const Scene3D = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      <FloatingElements />
      
      <OrbitControls 
        enableZoom={false} 
        autoRotate 
        autoRotateSpeed={0.3}
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
            camera={{ position: [0, 0, 6], fov: 50 }}
            dpr={1}
            onCreated={({ gl }) => {
              gl.setPixelRatio(1);
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
