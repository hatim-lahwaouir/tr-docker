import { motion } from 'framer-motion';

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-black">
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-4 h-4 bg-white rounded-full"
            animate={{
              y: ['0%', '-100%', '0%'],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;