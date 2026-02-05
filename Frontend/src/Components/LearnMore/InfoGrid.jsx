import { motion } from 'framer-motion';
import { Book, Users, Brain, Sparkles } from 'lucide-react';
import styles from './InfoGrid.module.css';

const features = [
  {
    icon: <Book size={32} />,
    title: 'Smart Learning',
    text: 'We break content down into digestible flashcards.',
  },
  {
    icon: <Users size={32} />,
    title: 'Community Focused',
    text: 'Join thousands of learners across the globe.',
  },
  {
    icon: <Brain size={32} />,
    title: 'AI-Enhanced',
    text: 'Flashcards are generated using smart sentence analysis.',
  },
  {
    icon: <Sparkles size={32} />,
    title: 'Memorable UX',
    text: 'Visually engaging interface that boosts retention.',
  },
];

export default function InfoGrid() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 mb-12">
      <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-800">Why FlashMind?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            className={styles.card}
          >
            <div className={styles.icon}>{feature.icon}</div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


// import { motion } from 'framer-motion';
// import { Book, Users, Brain, Sparkles } from 'lucide-react';

// const info = [
//     { title: "Fast Learning", desc: "Our flashcards help you absorb info in seconds.", size: "h-48" },
//     { title: "Smart AI", desc: "Automatically generate cards from content.", size: "h-64" },
//     { title: "Customizable", desc: "Create your own flashcard decks.", size: "h-40" },
//     { title: "Progress Tracking", desc: "See how much you've improved.", size: "h-56" },
//   ];

// export default function InfoGrid() {
  

//   return (
//     <div className="bg-gray-100 py-12 px-4">
//       <h2 className="text-3xl font-bold text-center mb-8">Why Choose FlashMind?</h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
//         {info.map((item, index) => (
//           <div
//             key={index}
//             className={`bg-white shadow-lg rounded-xl p-6 ${item.size} flex flex-col justify-between transition-transform transform hover:scale-105`}
//           >
//             <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
//             <p className="text-gray-600">{item.desc}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
