import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function ScoreApp() {
  const [view, setView] = useState("game");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingGameName, setEditingGameName] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [gameName, setGameName] = useState("Dardos");
  const defaultNames = [
    "Alejandro","Mónica","Fran","Sil","Daniela","Susan","Puki","Geisel","Wen","Karen",
    "Andrey","Azo","Yeilyn","Fernanda","Maikol","Geiner","Keivid","Nicole","Vivian","Tavo",
    "Teo","Johan","Jose","Alex","Pipo","Yendry","Tata","Cindy","Anita","BatDog",
    "JuanK","Byron","Jenin","Oscar Blanco","Randy","Grettel","Tania","Oscar Primo","Kennett","Merce"
  ];
  const [players, setPlayers] = useState(
    defaultNames.map(name => ({ id: name, name, score: 0, color: `hsl(${Math.random()*360},80%,65%)` }))
  );
  const [newPlayer, setNewPlayer] = useState("");
  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [completedGames, setCompletedGames] = useState([]);
  const [expandedGames, setExpandedGames] = useState({});

  const addPlayer = () => {
    const name = newPlayer.trim();
    if (!name) return;
    const id = Date.now().toString();
    setPlayers(prev => [...prev, { id, name, score: 0, color: `hsl(${Math.random()*360},80%,65%)` }]);
    setNewPlayer("");
  };

  const updateScore = (id, delta) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, score: p.score + delta } : p));
  };

  const finalizeRound = () => {
    const roundData = players.map(p => ({ id: p.id, name: p.name, points: p.score }));
    setHistory(prev => {
      const updated = [...prev];
      roundData.forEach(({ id, name, points }) => {
        const entry = updated.find(e => e.id === id);
        if (entry) entry[`ronda${round}`] = points;
        else updated.push({ id, name, [`ronda${round}`]: points });
      });
      return updated;
    });
    setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
    setRound(r => r + 1);
    setShowConfetti(true);
  };

  const finalizeGame = () => {
    const roundTotals = history.map(h => ({
      id: h.id,
      name: h.name,
      total: Object.entries(h)
        .filter(([k]) => k.startsWith("ronda"))
        .reduce((sum, [, pts]) => sum + pts, 0),
    }));

    const sorted = roundTotals.sort((a, b) => b.total - a.total);
    const totals = sorted.reduce((acc, player) => {
      acc[player.name] = player.total;
      return acc;
    }, {});

    if (Object.values(totals).some(score => score > 0)) {
      setCompletedGames(prev => [...prev, { date: new Date(), name: gameName, totals }]);
    }

    setShowPodium(true);
  };

  const resetGame = () => {
    setPlayers(defaultNames.map(name => ({ id: name, name, score: 0, color: `hsl(${Math.random()*360},80%,65%)` })));
    setHistory([]);
    setRound(1);
    setShowPodium(false);
    // setCompletedGames([]);
    setExpandedGames({});
  };

  useEffect(() => {
    if (showConfetti) {
      const end = Date.now() + 2000;
      (function frame() {
        confetti({ particleCount: 5, spread: 60, origin: { x: Math.random(), y: 0.4 } });
        if (Date.now() < end) requestAnimationFrame(frame);
        else setShowConfetti(false);
      })();
    }
  }, [showConfetti]);

  return (
    <>
      

      <AnimatePresence>
        {showPodium && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-transparent p-8 rounded-lg">
              <div className="flex items-end justify-center space-x-8">
                {[3, 1, 0, 2, 4].map((idx, pos) => {
                  const sorted = history.map(h => ({
                    id: h.id,
                    total: Object.entries(h).filter(([k]) => k.startsWith('ronda')).reduce((s, [, pts]) => s + pts, 0)
                  })).sort((a, b) => b.total - a.total);
                  const player = players.find(p => p.id === sorted[idx]?.id) || {};
                  const name = player.name || "";
                  const score = sorted[idx]?.total || 0;
                  const colors = ['bg-blue-300','bg-gray-300','bg-yellow-300','bg-orange-300','bg-green-300'];
                  const heights = [180,220,260,200,160];
                  const medals = ['4️⃣','🥈','🥇','🥉','5️⃣'];
                  return (
                    <motion.div
                      key={pos}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }}>
                      <span className="mb-2 font-bold text-xl text-white">{medals[pos]}</span>
                      <div className={`${colors[pos]} w-12`} style={{ height: `${heights[pos]}px` }}></div>
                      <span className="mt-2 text-lg font-bold text-white">{name}</span>
                      <span className="text-xl font-bold text-white">{score}</span>
                    </motion.div>
                  );
                })}
              </div>
              <button
                className="mt-6 bg-white text-black py-2 px-4 rounded"
                onClick={() => setShowPodium(false)}>
                Cerrar Podio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            className="fixed inset-y-0 left-0 w-64 bg-indigo-800 text-white p-6 z-50"
            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}>
            <nav className="flex flex-col space-y-4">
              <button
                className="px-4 py-2 bg-indigo-700 rounded-lg hover:bg-indigo-600"
                onClick={() => { setView('game'); setDrawerOpen(false); }}>
                🎮 Juego
              </button>
              <button
                className="px-4 py-2 bg-indigo-700 rounded-lg hover:bg-indigo-600"
                onClick={() => { setView('history'); setDrawerOpen(false); }}>
                📚 Historial
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
      <button className="sticky top-4 left-4 z-50 p-2 bg-white rounded shadow" onClick={() => setDrawerOpen(prev => !prev)}>
        <div className="w-6 h-0.5 bg-black mb-1" />
        <div className="w-6 h-0.5 bg-black mb-1" />
        <div className="w-6 h-0.5 bg-black" />
      </button>
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        {view === 'history' ? (
          <section className="bg-gradient-to-b from-indigo-700 to-indigo-900 text-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-extrabold text-center mb-8">📚 Historial de Partidas</h2>
            <div className="space-y-6">
              {completedGames.map((g, i) => {
                const isExpanded = expandedGames[i] || false;
                return (
                  <Card key={i} className="relative bg-indigo-800 hover:bg-indigo-700 rounded-lg shadow-lg">
                    <CardContent className="p-6">
                      <button
                        onClick={() => setExpandedGames(prev => ({ ...prev, [i]: !prev[i] }))}
                        className="absolute top-4 right-4 bg-white text-indigo-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition">
                        {isExpanded ? '−' : '+'}
                      </button>
                      <h3 className="text-2xl font-bold text-center mb-2">{g.name}</h3>
                      <p className="text-sm text-gray-200 text-center mb-4">{new Date(g.date).toLocaleDateString()}</p>
                      {isExpanded && (
                        <table className="w-full text-white">
                          <thead className="border-b border-indigo-600">
                            <tr>
                              <th className="py-2 px-4 text-left">Jugador</th>
                              <th className="py-2 px-4 text-left">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(g.totals).map(([n, t]) => (
                              <tr key={n} className="border-b border-indigo-600">
                                <td className="py-2 px-4">{n}</td>
                                <td className="py-2 px-4 font-bold">{t}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ) : (
          <>
            <div className="fixed top-0 left-0 w-full bg-gradient-to-b from-purple-700 to-indigo-600 p-4 z-40 shadow-md">
              {editingGameName ? (
                <Input autoFocus value={gameName} onChange={e => setGameName(e.target.value)} onBlur={() => setEditingGameName(false)} className="text-black text-4xl font-bold text-center w-full mb-4" />
              ) : (
                <h1 onClick={() => setEditingGameName(true)} className="text-white text-4xl font-bold text-center mb-4 cursor-text animate-bounce">🎮 {gameName}</h1>
              )}
              <div className="flex flex-wrap justify-center gap-4">
                <Input className="w-64 text-black" placeholder="Nombre del jugador" value={newPlayer} onChange={e => setNewPlayer(e.target.value)} />
                <Button onClick={addPlayer} className="bg-green-400">Agregar</Button>
                <Button onClick={finalizeRound} className="bg-blue-400">Finalizar Ronda</Button>
                <Button onClick={finalizeGame} className="bg-yellow-300">Finalizar Partida</Button>
                <Button onClick={resetGame} className="bg-red-400">Reiniciar</Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-8 space-y-10 mt-36">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {players.map(p => (
                  <Card key={p.id} className="relative overflow-hidden" style={{ backgroundColor: p.color }}>
                    <CardContent className="text-black text-center">
                      <button onClick={() => setPlayers(prev => prev.filter(pl => pl.id !== p.id))} className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-400">×</button>
                      <div className="flex flex-col items-center gap-4 pt-4 mb-6">
                        {editingPlayerId === p.id ? (
                          <Input autoFocus value={p.name} onChange={e => setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, name: e.target.value } : pl))} onBlur={() => setEditingPlayerId(null)} className="bg-indigo-500 text-white text-xl font-bold rounded-full px-3 py-1 text-center w-full" />
                        ) : (
                          <div onClick={() => setEditingPlayerId(p.id)} className="bg-indigo-500 text-white text-lg font-bold rounded-full px-2 py-0.5 cursor-text w-auto">{p.name}</div>
                        )}
                        {editingScoreId === p.id ? (
                          <Input autoFocus value={p.score} onChange={e => setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, score: parseInt(e.target.value) || 0 } : pl))} onBlur={() => setEditingScoreId(null)} className="bg-white text-black text-2xl font-extrabold rounded-full px-3 py-1 text-center w-20" />
                        ) : (
                          <div onClick={() => setEditingScoreId(p.id)} className="bg-white text-black text-2xl font-extrabold rounded-full px-3 py-1 cursor-text w-20">{p.score}</div>
                        )}
                      </div>
                      <div className="flex justify-center gap-4">
                        <Button onClick={() => updateScore(p.id, -10)} className="bg-white text-black font-bold rounded-full px-4 py-2 shadow-lg hover:bg-gray-100 transition">-10</Button>
                        <Button onClick={() => updateScore(p.id, -1)} className="bg-white text-black font-bold rounded-full px-4 py-2 shadow-lg hover:bg-gray-100 transition">-1</Button>
                        <Button onClick={() => updateScore(p.id, 1)} className="bg-black text-white font-bold rounded-full px-4 py-2 shadow-lg hover:bg-gray-800 transition">+1</Button>
                        <Button onClick={() => updateScore(p.id, 10)} className="bg-black text-white font-bold rounded-full px-4 py-2 shadow-lg hover:bg-gray-800 transition">+10</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      
          {view === 'game' && history.length > 0 && (
            <div className="p-4">
              <h2 className="text-3xl font-bold text-center mb-4">📋 Historial de Rondas</h2>
              <table className="w-full bg-purple-700 text-white rounded-lg overflow-hidden table-fixed">
                <thead className="bg-purple-800">
                  <tr>
                    <th className="px-4 py-2 text-center">Jugador</th>
                    {Array.from(new Set(history.flatMap(h => Object.keys(h).filter(k => k.startsWith('ronda'))))).sort((a, b) => +a.replace('ronda','') - +b.replace('ronda','')).map((r, i) => (
                      <th key={i} className="px-4 py-2 text-center">Ronda {r.replace('ronda','')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {history
                    .map(h => ({
                      ...h,
                      total: Object.entries(h).filter(([k]) => k.startsWith('ronda')).reduce((sum, [, pts]) => sum + pts, 0)
                    }))
                    .sort((a, b) => b.total - a.total)
                    .map((h, i) => (
                    <tr key={i} className="bg-purple-900">
                      <td className="px-4 py-2 font-bold text-center">{h.name}</td>
                      {Array.from(new Set(history.flatMap(x => Object.keys(x).filter(k => k.startsWith('ronda'))))).sort((a, b) => +a.replace('ronda','') - +b.replace('ronda','')).map((r, j) => (
                        <td key={j} className="px-4 py-2 text-center">{h[r] || 0}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>);
} // fin ScoreApp
