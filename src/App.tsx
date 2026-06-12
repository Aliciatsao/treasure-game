import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import keyImage from './assets/key.png';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

interface User {
  name: string;
  email: string;
}

const STORAGE_KEY = 'treasure_game_data';

function getStoredData(): Record<string, { name: string; cumulativeScore: number }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function App() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cumulativeScore, setCumulativeScore] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: '', email: '' });
  const [scoreRecorded, setScoreRecorded] = useState(false);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
    setScoreRecorded(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameEnded && user && !scoreRecorded) {
      const data = getStoredData();
      const prev = data[user.email]?.cumulativeScore ?? 0;
      const newTotal = prev + score;
      data[user.email] = { name: user.name, cumulativeScore: newTotal };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setCumulativeScore(newTotal);
      setScoreRecorded(true);
    }
  }, [gameEnded, user, score, scoreRecorded]);

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();
          const newScore = box.hasTreasure ? score + 150 : score - 50;
          setScore(newScore);
          return { ...box, isOpen: true };
        }
        return box;
      });

      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
      }

      return updatedBoxes;
    });
  };

  const handleLogin = () => {
    if (!loginForm.name.trim() || !loginForm.email.trim()) return;

    const data = getStoredData();
    const existing = data[loginForm.email];
    const newUser: User = { name: loginForm.name, email: loginForm.email };

    if (!existing) {
      data[loginForm.email] = { name: loginForm.name, cumulativeScore: 0 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setCumulativeScore(0);
    } else {
      setCumulativeScore(existing.cumulativeScore);
    }

    setUser(newUser);
    setShowLoginModal(false);
    setLoginForm({ name: '', email: '' });
    initializeGame();
  };

  const handleLogout = () => {
    setUser(null);
    setCumulativeScore(0);
    initializeGame();
  };

  const getStatusLabel = () => {
    if (score > 50) return 'Win';
    if (score < 50) return 'Lose';
    return 'Tie';
  };

  const getStatusColor = () => {
    if (score > 50) return 'text-green-600';
    if (score < 50) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">

      {/* Top-right login/logout */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        {user ? (
          <>
            <span className="text-amber-800 text-sm font-medium">Hi, {user.name}!</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-sm border-amber-400 text-amber-800 hover:bg-amber-100"
            >
              Logout
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setShowLoginModal(true)}
            className="text-sm bg-amber-600 hover:bg-amber-700 text-white"
          >
            Login
          </Button>
        )}
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-amber-50 rounded-xl p-8 w-full max-w-md shadow-2xl border-2 border-amber-400"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl text-amber-900 mb-2 text-center">Join the Hunt!</h2>
              <p className="text-amber-600 text-sm text-center mb-6">Enter your details to track your cumulative score</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-amber-800 text-sm mb-1 font-medium">Name</label>
                  <input
                    type="text"
                    value={loginForm.name}
                    onChange={e => setLoginForm(f => ({ ...f, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter your name"
                    className="w-full p-3 rounded-lg border-2 border-amber-300 bg-white text-amber-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-amber-800 text-sm mb-1 font-medium">Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter your email"
                    className="w-full p-3 rounded-lg border-2 border-amber-300 bg-white text-amber-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <Button
                  onClick={handleLogin}
                  disabled={!loginForm.name.trim() || !loginForm.email.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3"
                >
                  Login / Register
                </Button>
                <Button
                  onClick={() => setShowLoginModal(false)}
                  variant="outline"
                  className="w-full border-amber-400 text-amber-800 hover:bg-amber-100"
                >
                  Continue as Guest
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$150 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8 w-full max-w-sm">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400 flex items-center justify-center gap-3">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
          <AnimatePresence>
            {gameEnded && (
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`text-xl font-bold ${getStatusColor()}`}
              >
                — {getStatusLabel()}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {user && (
          <div className="text-center mt-2 p-2 bg-amber-100 rounded-lg border border-amber-300 text-sm text-amber-800">
            Cumulative Score: <span className="font-bold text-amber-900">${cumulativeScore}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={{ cursor: box.isOpen ? 'default' : `url(${keyImage}) 16 16, pointer` }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: box.isOpen ? 180 : 0,
                scale: box.isOpen ? 1.1 : 1
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <img
                src={box.isOpen
                  ? (box.hasTreasure ? treasureChest : skeletonChest)
                  : closedChest
                }
                alt={box.isOpen
                  ? (box.hasTreasure ? "Treasure!" : "Skeleton!")
                  : "Treasure Chest"
                }
                className="w-48 h-48 object-contain drop-shadow-lg"
              />

              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure ? (
                    <div className="text-2xl animate-bounce">✨💰✨</div>
                  ) : (
                    <div className="text-2xl animate-pulse">💀👻💀</div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$150' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">
                  Click to open!
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score:{' '}
              <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${score}
              </span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            {!user && (
              <p className="text-xs text-amber-500 mt-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="underline hover:text-amber-700"
                >
                  Login
                </button>{' '}
                to track your cumulative score across games!
              </p>
            )}
          </div>

          <Button
            onClick={initializeGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
