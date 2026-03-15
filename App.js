import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { 
  Activity, Trophy, Calendar, Plus, Trash2, Star, X, 
  Flame, TrendingUp, Zap, Map as MapIcon, Brain,
  Flag, Timer, BarChart3, Info, AlertOctagon, Target, ChevronRight
} from 'lucide-react';

// --- CONFIG ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'f1-2026-berk-final';
const apiKey = ""; // Runtime provides the key

const GP_POINTS = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };
const SPRINT_POINTS = { 1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1 };

// --- 2026 UPDATED DATA ---
const TRACKS_2026 = [
  { name: "Avustralya", date: "2026-03-15", lat: -37.8497, lng: 144.968 },
  { name: "Çin", date: "2026-03-29", lat: 31.3389, lng: 121.22 },
  { name: "Japonya", date: "2026-04-12", lat: 34.8431, lng: 136.541 },
  { name: "Bahreyn", date: "2026-04-26", lat: 26.0325, lng: 50.5106 },
  { name: "Suudi Arabistan", date: "2026-05-10", lat: 21.503, lng: 39.105 },
  { name: "ABD (Miami)", date: "2026-05-17", lat: 25.958, lng: -80.239 },
  { name: "Kanada", date: "2026-06-07", lat: 45.500, lng: -73.522 },
  { name: "Monako", date: "2026-06-14", lat: 43.734, lng: 7.420 },
  { name: "İspanya", date: "2026-06-28", lat: 41.570, lng: 2.261 },
  { name: "Avusturya", date: "2026-07-12", lat: 47.219, lng: 14.764 },
  { name: "İngiltere", date: "2026-07-26", lat: 52.078, lng: -1.016 },
  { name: "Belçika", date: "2026-08-09", lat: 50.437, lng: 5.971 },
  { name: "Macaristan", date: "2026-08-23", lat: 47.583, lng: 19.250 },
  { name: "Hollanda", date: "2026-08-30", lat: 52.388, lng: 4.540 },
  { name: "İtalya", date: "2026-09-13", lat: 45.615, lng: 9.281 },
  { name: "İspanya (Madrid)", date: "2026-09-20", lat: 40.416, lng: -3.703 },
  { name: "Azerbaycan", date: "2026-10-04", lat: 40.372, lng: 49.853 },
  { name: "Singapur", date: "2026-10-11", lat: 1.291, lng: 103.864 },
  { name: "ABD (Austin)", date: "2026-10-25", lat: 30.132, lng: -97.641 },
  { name: "Meksika", date: "2026-11-01", lat: 19.404, lng: -99.090 },
  { name: "Brezilya", date: "2026-11-15", lat: -23.703, lng: -46.699 },
  { name: "Las Vegas (ABD)", date: "2026-11-21", lat: 36.114, lng: -115.172 },
  { name: "Katar", date: "2026-11-29", lat: 25.490, lng: 51.454 },
  { name: "Abu Dabi", date: "2026-12-06", lat: 24.467, lng: 54.603 }
];

const TEAMS_2026 = [
  { id: 'MER', name: 'Mercedes', color: '#27F4D2' },
  { id: 'FER', name: 'Ferrari', color: '#E32219' },
  { id: 'MCL', name: 'McLaren', color: '#FF8000' },
  { id: 'RBR', name: 'Red Bull Racing', color: '#3671C6' },
  { id: 'RBA', name: 'Racing Bulls', color: '#6692FF' },
  { id: 'AST', name: 'Aston Martin', color: '#229971' },
  { id: 'ALP', name: 'Alpine', color: '#0093CC' },
  { id: 'WIL', name: 'Williams', color: '#64C4FF' },
  { id: 'HAA', name: 'Haas F1 Team', color: '#B6BABD' },
  { id: 'AUD', name: 'Audi', color: '#F50537' },
  { id: 'CAD', name: 'Cadillac', color: '#E6B800' }
];

const DRIVERS_2026 = [
  { name: 'George Russell', team: 'MER' }, { name: 'Kimi Antonelli', team: 'MER' },
  { name: 'Charles Leclerc', team: 'FER' }, { name: 'Lewis Hamilton', team: 'FER' },
  { name: 'Lando Norris', team: 'MCL' }, { name: 'Oscar Piastri', team: 'MCL' },
  { name: 'Max Verstappen', team: 'RBR' }, { name: 'Isack Hadjar', team: 'RBR' },
  { name: 'Liam Lawson', team: 'RBA' }, { name: 'Arvid Lindblad', team: 'RBA' },
  { name: 'Fernando Alonso', team: 'AST' }, { name: 'Lance Stroll', team: 'AST' },
  { name: 'Pierre Gasly', team: 'ALP' }, { name: 'Franco Colapinto', team: 'ALP' },
  { name: 'Carlos Sainz', team: 'WIL' }, { name: 'Alexander Albon', team: 'WIL' },
  { name: 'Esteban Ocon', team: 'HAA' }, { name: 'Oliver Bearman', team: 'HAA' },
  { name: 'Nico Hulkenberg', team: 'AUD' }, { name: 'Gabriel Bortoleto', team: 'AUD' },
  { name: 'Sergio Perez', team: 'CAD' }, { name: 'Valtteri Bottas', team: 'CAD' }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'racesv5'));
    const unsub = onSnapshot(q, (snap) => {
      setRaces(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => console.error("Firestore Error:", err));
    return () => unsub();
  }, [user]);

  const stats = useMemo(() => {
    const dStats = {};
    const tStats = {};
    DRIVERS_2026.forEach(d => dStats[d.name] = { ...d, points: 0, positions: [], wins: 0, podiums: 0 });
    TEAMS_2026.forEach(t => tStats[t.id] = { ...t, points: 0, podiums: 0 });

    const sortedRaces = [...races].sort((a,b) => new Date(a.date) - new Date(b.date));

    sortedRaces.forEach(race => {
      const processResults = (results, isSprint = false) => {
        results?.forEach(res => {
          if (!dStats[res.name]) return;
          const pos = res.pos?.toString().toUpperCase();
          if (!isNaN(parseInt(pos))) {
            const p = parseInt(pos);
            const pts = isSprint ? (SPRINT_POINTS[p] || 0) : (GP_POINTS[p] || 0);
            dStats[res.name].points += pts;
            const teamId = dStats[res.name].team;
            if (tStats[teamId]) tStats[teamId].points += pts;
            if (!isSprint) {
              dStats[res.name].positions.push(p);
              if (p === 1) dStats[res.name].wins++;
              if (p <= 3) {
                  dStats[res.name].podiums++;
                  if (tStats[teamId]) tStats[teamId].podiums++;
              }
            }
          } else if (!isSprint) {
            dStats[res.name].positions.push(22);
          }
        });
      };
      processResults(race.results, false);
      if (race.isSprint) processResults(race.sprintResults, true);
    });

    const powerRankings = Object.values(dStats).map(d => {
        const last3 = d.positions.slice(-3);
        const avgLast3 = last3.length ? last3.reduce((a,b)=>a+b,0)/last3.length : 20;
        const totalAvg = d.positions.length ? d.positions.reduce((a,b)=>a+b,0)/d.positions.length : 20;
        const score = (10 - (avgLast3 / 2)) * 0.7 + (10 - (totalAvg / 2)) * 0.3;
        const trend = avgLast3 < totalAvg ? '↑' : (avgLast3 > totalAvg ? '↓' : '→');
        return { ...d, powerScore: Math.max(0, score).toFixed(1), trend };
    }).sort((a,b) => b.powerScore - a.powerScore);

    const dStandings = Object.values(dStats).sort((a,b) => b.points - a.points);
    const tStandings = Object.values(tStats).sort((a,b) => b.points - a.points);

    // AI Prediction Calculation (Weighted Points + Form + Team Rank)
    const totalWeight = dStandings.slice(0, 8).reduce((acc, curr) => acc + (curr.points * 1.5) + (parseFloat(curr.powerScore) * 20), 0);
    const aiPredictions = dStandings.slice(0, 5).map(d => ({
        name: d.name,
        percentage: totalWeight > 0 ? Math.round((((d.points * 1.5) + (parseFloat(d.powerScore) * 20)) / totalWeight) * 100) : 20
    }));

    const seasonAvg = races.length ? (races.reduce((a,b) => a + Number(b.finalScore), 0) / races.length).toFixed(1) : 0;
    const dominance = dStandings[0] && tStandings.reduce((a,b)=>a+b.points,0) > 0 
        ? ((dStandings[0].points / tStandings.reduce((a,b)=>a+b.points, 0)) * 100).toFixed(0) : 0;

    return { dStandings, tStandings, powerRankings, sortedRaces, seasonAvg, aiPredictions, dominance };
  }, [races]);

  const nextRace = useMemo(() => {
    const now = new Date();
    const upcoming = TRACKS_2026
        .map(t => ({ ...t, dateObj: new Date(t.date) }))
        .filter(t => t.dateObj > now)
        .sort((a,b) => a.dateObj - b.dateObj)[0];
    
    if (upcoming) {
        const diffTime = upcoming.dateObj - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...upcoming, daysLeft: diffDays };
    }
    return null;
  }, []);

  const handleDeleteRace = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'racesv5', id));
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-zinc-100 pb-24 md:pb-10 font-sans">
      {/* Sidebar/Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#121215]/90 backdrop-blur-xl border-t border-zinc-800 flex justify-around p-4 z-[60] md:top-0 md:bottom-auto md:h-20 md:px-12 md:border-t-0 md:border-b">
        <div className="hidden md:flex items-center gap-4 mr-auto">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-black italic text-xl">F1</div>
            <div className="flex flex-col">
                <span className="font-black italic text-xs tracking-tighter uppercase">Berk Command</span>
                <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Season 2026 V5</span>
            </div>
        </div>
        <div className="flex justify-around w-full md:w-auto md:gap-8 items-center">
            <NavItem active={activeTab==='dashboard'} onClick={()=>setActiveTab('dashboard')} icon={<Activity/>} label="Panel" />
            <NavItem active={activeTab==='races'} onClick={()=>setActiveTab('races')} icon={<Flag/>} label="Yarışlar" />
            <NavItem active={activeTab==='standings'} onClick={()=>setActiveTab('standings')} icon={<Trophy/>} label="Sıralama" />
            <NavItem active={activeTab==='analysis'} onClick={()=>setActiveTab('analysis')} icon={<BarChart3/>} label="Analiz" />
            <NavItem active={activeTab==='tracks'} onClick={()=>setActiveTab('tracks')} icon={<MapIcon/>} label="Pistler" />
            <NavItem active={activeTab==='ai'} onClick={()=>setActiveTab('ai')} icon={<Brain/>} label="AI" />
        </div>
      </nav>

      <div className="p-4 md:p-12 pt-6 md:pt-32 max-w-[1400px] mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div className="space-y-1">
            <p className="text-red-500 font-black text-[9px] uppercase tracking-[0.3em] italic">Formula 1 2026 Core Engine</p>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                {activeTab === 'dashboard' ? "Dashboard" : activeTab === 'races' ? "Journal" : activeTab === 'standings' ? "Standings" : activeTab === 'analysis' ? "Deep Analysis" : activeTab === 'tracks' ? "Circuit Map" : "AI Neural Hub"}
            </h1>
          </div>
          {activeTab === 'races' && (
             <button onClick={() => window.dispatchEvent(new CustomEvent('open-modal'))} className="bg-red-600 p-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                <Plus size={24} />
             </button>
          )}
        </header>

        {activeTab === 'dashboard' && <Dashboard stats={stats} nextRace={nextRace} />}
        {activeTab === 'races' && <RacesTab races={stats.sortedRaces} onDelete={handleDeleteRace} onSelect={setSelectedRace} />}
        {activeTab === 'standings' && <StandingsTab stats={stats} />}
        {activeTab === 'analysis' && <AnalysisTab stats={stats} />}
        {activeTab === 'tracks' && <TracksTab stats={stats} />}
        {activeTab === 'ai' && <AiHub stats={stats} user={user} />}

        <RaceModal user={user} />
        {selectedRace && <RaceDetailModal race={selectedRace} onClose={()=>setSelectedRace(null)} />}
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-red-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}>
      <div className={`${active ? 'bg-red-500/10 p-2 rounded-lg' : ''}`}>{icon}</div>
      <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
    </button>
  );
}

// --- DASHBOARD ---
function Dashboard({ stats, nextRace }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-2 bg-[#121215] rounded-2xl p-8 border border-zinc-800 flex flex-col justify-between group overflow-hidden relative">
        <div className="relative z-10">
            <span className="bg-red-600 text-[8px] font-black px-2 py-1 rounded italic uppercase tracking-widest">Puan Li̇deri̇</span>
            <h2 className="text-5xl font-black italic uppercase mt-4 tracking-tighter">{stats.dStandings[0]?.name || '---'}</h2>
            <p className="text-zinc-500 font-bold uppercase text-xs mt-1">{stats.dStandings[0]?.team}</p>
            <div className="flex gap-6 mt-8">
                <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase">Toplam Puan</p>
                    <p className="text-3xl font-mono font-black">{stats.dStandings[0]?.points || 0}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase">Gali̇bi̇yet</p>
                    <p className="text-3xl font-mono font-black">{stats.dStandings[0]?.wins || 0}</p>
                </div>
            </div>
        </div>
        <Trophy className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform duration-700" size={240} />
      </div>

      <div className="bg-[#121215] rounded-2xl p-6 border border-zinc-800">
        <div className="flex justify-between items-start mb-4">
            <span className="text-[9px] font-black uppercase text-zinc-500 italic">Sıradaki Yarış</span>
            <Timer className="text-red-500" size={18}/>
        </div>
        {nextRace ? (
            <div className="space-y-4">
                <p className="text-2xl font-black italic uppercase leading-none">{nextRace.name}</p>
                <div className="bg-black/40 p-4 rounded-xl border border-zinc-800">
                    <p className="text-4xl font-mono font-black">{nextRace.daysLeft}</p>
                    <p className="text-[9px] font-black uppercase text-zinc-600 mt-1">Gün Kaldı</p>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase italic">{nextRace.date}</p>
            </div>
        ) : <p className="text-zinc-600 italic font-black uppercase text-xs">Sezon Tamamlandı</p>}
      </div>

      <div className="bg-[#121215] rounded-2xl p-6 border border-zinc-800">
        <div className="flex justify-between items-start mb-6">
            <span className="text-[9px] font-black uppercase text-zinc-500 italic">AI Şampi̇yonluk Tahmi̇ni̇</span>
            <Brain className="text-purple-500" size={18}/>
        </div>
        <div className="space-y-4">
            {stats.aiPredictions.map(p => (
                <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black uppercase italic">
                        <span className="text-zinc-400">{p.name.split(' ')[1]}</span>
                        <span>{p.percentage}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-purple-600 h-full transition-all duration-1000" style={{width: `${p.percentage}%`}}></div>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
      {/* Power Ranking Mini */}
      <div className="md:col-span-2 bg-[#121215] rounded-2xl p-6 border border-zinc-800">
        <div className="flex justify-between items-center mb-6">
            <span className="text-[9px] font-black uppercase text-zinc-500 italic">En Formda Pi̇lotlar</span>
            <TrendingUp className="text-green-500" size={18}/>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.powerRankings.slice(0, 4).map((p, i) => (
                <div key={p.name} className="bg-black/40 p-4 rounded-xl border border-zinc-800 flex flex-col items-center">
                    <span className="text-[9px] font-black text-zinc-600">#{i+1}</span>
                    <span className="text-[10px] font-black italic uppercase truncate w-full text-center mt-1">{p.name.split(' ')[1]}</span>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-xl font-mono font-black text-white">{p.powerScore}</span>
                        <span className={`text-[10px] font-black ${p.trend === '↑' ? 'text-green-500' : p.trend === '↓' ? 'text-red-500' : 'text-zinc-500'}`}>{p.trend}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="md:col-span-2 bg-[#121215] rounded-2xl p-6 border border-zinc-800 flex items-center justify-between">
        <div>
            <span className="text-[9px] font-black uppercase text-zinc-500 italic">Sezon Heyecan Skoru</span>
            <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-black italic text-orange-500">{stats.seasonAvg}</span>
                <span className="text-lg font-black text-zinc-700 italic">/ 10</span>
            </div>
        </div>
        <div className="text-right">
            <span className="text-[9px] font-black uppercase text-zinc-500 italic">Domi̇nans Metre</span>
            <div className="flex items-center gap-3 mt-2">
                <div className="w-32 bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-600 h-full" style={{width: `${stats.dominance}%`}}></div>
                </div>
                <span className="text-lg font-mono font-black italic">%{stats.dominance}</span>
            </div>
        </div>
      </div>
    </div>
  );
}

// --- RACES ---
function RacesTab({ races, onDelete, onSelect }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {races.map(r => (
                <div key={r.id} onClick={()=>onSelect(r)} className="bg-[#121215] rounded-2xl p-6 border border-zinc-800 hover:border-red-600/40 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onDelete(r.id); }} className="bg-black/80 p-2 rounded-lg text-zinc-500 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[9px] font-black uppercase text-zinc-600 italic">{r.date}</p>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mt-1">{r.track}</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-mono font-black text-white">{r.finalScore}</span>
                  