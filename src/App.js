import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './App.css';

const INITIAL_PARTIES = [
  { id: 'BJP', name: 'BJP', fullName: 'Bharatiya Janata Party', color: '#FF9933', alliance: 'NDA', seats: 240, votes: 36.6, leading: 12, won: 228 },
  { id: 'INC', name: 'INC', fullName: 'Indian National Congress', color: '#00BFFF', alliance: 'INDIA', seats: 99, votes: 21.2, leading: 4, won: 95 },
  { id: 'SP', name: 'SP', fullName: 'Samajwadi Party', color: '#FF0000', alliance: 'INDIA', seats: 37, votes: 6.1, leading: 3, won: 34 },
  { id: 'AITC', name: 'TMC', fullName: 'All India Trinamool Congress', color: '#00CED1', alliance: 'INDIA', seats: 29, votes: 5.5, leading: 2, won: 27 },
  { id: 'DMK', name: 'DMK', fullName: 'Dravida Munnetra Kazhagam', color: '#C0392B', alliance: 'INDIA', seats: 22, votes: 2.2, leading: 1, won: 21 },
  { id: 'TDP', name: 'TDP', fullName: 'Telugu Desam Party', color: '#FFD700', alliance: 'NDA', seats: 16, votes: 2.7, leading: 1, won: 15 },
  { id: 'JDU', name: 'JD(U)', fullName: 'Janata Dal (United)', color: '#27AE60', alliance: 'NDA', seats: 12, votes: 1.8, leading: 1, won: 11 },
  { id: 'SHIV', name: 'Shiv Sena', fullName: 'Shiv Sena (UBT)', color: '#F39C12', alliance: 'INDIA', seats: 9, votes: 1.2, leading: 0, won: 9 },
  { id: 'NCP', name: 'NCP', fullName: 'Nationalist Congress Party', color: '#8E44AD', alliance: 'NDA', seats: 8, votes: 0.9, leading: 0, won: 8 },
  { id: 'OTH', name: 'Others', fullName: 'Other Parties & Independents', color: '#95A5A6', alliance: 'Others', seats: 71, votes: 21.8, leading: 5, won: 66 },
];

const TOTAL_SEATS = 543;
const MAJORITY = 272;

const STATE_RESULTS = [
  { state: 'Uttar Pradesh', total: 80, bjp: 33, inc: 6, sp: 37, others: 4 },
  { state: 'Maharashtra', total: 48, bjp: 9, inc: 13, sp: 0, others: 26 },
  { state: 'West Bengal', total: 42, bjp: 12, inc: 1, sp: 0, others: 29 },
  { state: 'Bihar', total: 40, bjp: 12, inc: 3, sp: 0, others: 25 },
  { state: 'Tamil Nadu', total: 39, bjp: 0, inc: 9, sp: 0, others: 30 },
  { state: 'Madhya Pradesh', total: 29, bjp: 29, inc: 0, sp: 0, others: 0 },
  { state: 'Rajasthan', total: 25, bjp: 14, inc: 8, sp: 0, others: 3 },
  { state: 'Karnataka', total: 28, bjp: 17, inc: 9, sp: 0, others: 2 },
];

const TIMELINE = [
  { time: '8:00 AM', event: 'Counting begins across all constituencies', type: 'info' },
  { time: '9:30 AM', event: 'Early trends show NDA leading in 180+ seats', type: 'trend' },
  { time: '11:00 AM', event: 'BJP crosses 150 seats mark', type: 'milestone' },
  { time: '12:30 PM', event: 'INDIA bloc leads in 120 seats combined', type: 'trend' },
  { time: '2:00 PM', event: 'NDA projected to form government', type: 'milestone' },
  { time: '3:30 PM', event: 'BJP secures 200+ seats, NDA majority confirmed', type: 'milestone' },
  { time: '5:00 PM', event: 'Final results: NDA wins 293 seats total', type: 'result' },
];

function SeatBar({ party }) {
  const pct = (party.seats / TOTAL_SEATS) * 100;
  return (
    <div className="seat-bar-row">
      <div className="party-label">
        <span className="party-dot" style={{ background: party.color }}></span>
        <span className="party-name">{party.name}</span>
      </div>
      <div className="bar-container">
        <div className="bar-fill" style={{ width: `${pct}%`, background: party.color }}></div>
      </div>
      <div className="seat-count">{party.seats}</div>
    </div>
  );
}

function AllianceCard({ name, seats, color, parties }) {
  const pct = ((seats / TOTAL_SEATS) * 100).toFixed(1);
  const majority = seats >= MAJORITY;
  return (
    <div className={`alliance-card ${majority ? 'majority' : ''}`}>
      {majority && <div className="majority-badge">MAJORITY</div>}
      <div className="alliance-name" style={{ color }}>{name}</div>
      <div className="alliance-seats">{seats}</div>
      <div className="alliance-seats-label">seats ({pct}%)</div>
      <div className="alliance-progress">
        <div className="progress-bar" style={{ width: `${Math.min(pct, 100)}%`, background: color }}></div>
      </div>
      <div className="alliance-parties">{parties.join(' + ')}</div>
    </div>
  );
}

export default function App() {
  const [parties, setParties] = useState(INITIAL_PARTIES);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  const ndaSeats = parties.filter(p => p.alliance === 'NDA').reduce((s, p) => s + p.seats, 0);
  const indiaSeats = parties.filter(p => p.alliance === 'INDIA').reduce((s, p) => s + p.seats, 0);
  const othersSeats = parties.filter(p => p.alliance === 'Others').reduce((s, p) => s + p.seats, 0);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      setParties(prev => prev.map(p => ({
        ...p,
        leading: Math.max(0, p.leading + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)),
      })));
    }, 30000);
    return () => clearInterval(interval);
  }, [isLive]);

  const pieData = [
    { name: 'NDA', value: ndaSeats, color: '#FF9933' },
    { name: 'INDIA', value: indiaSeats, color: '#00BFFF' },
    { name: 'Others', value: othersSeats, color: '#95A5A6' },
  ];

  const barData = parties.slice(0, 8).map(p => ({ name: p.name, seats: p.seats, color: p.color }));

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="india-flag">
            <div className="flag-saffron"></div>
            <div className="flag-white"><div className="ashoka-chakra">☸</div></div>
            <div className="flag-green"></div>
          </div>
          <div>
            <h1 className="title">India Election Live Tracker</h1>
            <p className="subtitle">General Elections 2024 — Lok Sabha Results</p>
          </div>
        </div>
        <div className="header-right">
          <div className={`live-badge ${isLive ? 'live' : 'paused'}`} onClick={() => setIsLive(!isLive)}>
            <span className="live-dot"></span>
            {isLive ? 'LIVE' : 'PAUSED'}
          </div>
          <div className="last-updated">Updated: {lastUpdated.toLocaleTimeString()}</div>
        </div>
      </header>

      <div className="majority-line">
        <span>Majority Mark: <strong>{MAJORITY} seats</strong> out of {TOTAL_SEATS}</span>
      </div>

      <div className="alliance-grid">
        <AllianceCard name="NDA" seats={ndaSeats} color="#FF9933" parties={['BJP', 'TDP', 'JD(U)', 'NCP']} />
        <AllianceCard name="INDIA" seats={indiaSeats} color="#00BFFF" parties={['INC', 'SP', 'TMC', 'DMK']} />
        <AllianceCard name="Others" seats={othersSeats} color="#95A5A6" parties={['AIMIM', 'AAP', 'Indep.']} />
      </div>

      <nav className="tabs">
        {['overview', 'parties', 'states', 'timeline'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main className="content">
        {activeTab === 'overview' && (
          <div className="overview">
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Alliance-wise Seat Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h3>Party-wise Seats Won</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="seats">
                      {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="seats-visualization">
              <h3>Seat Tally</h3>
              {parties.map(p => <SeatBar key={p.id} party={p} />)}
            </div>
          </div>
        )}

        {activeTab === 'parties' && (
          <div className="parties-table">
            <table>
              <thead>
                <tr>
                  <th>Party</th>
                  <th>Alliance</th>
                  <th>Won</th>
                  <th>Leading</th>
                  <th>Total</th>
                  <th>Vote %</th>
                </tr>
              </thead>
              <tbody>
                {parties.map(p => (
                  <tr key={p.id}>
                    <td><span className="party-dot" style={{ background: p.color }}></span>{p.name}</td>
                    <td><span className={`alliance-tag ${p.alliance.toLowerCase()}`}>{p.alliance}</span></td>
                    <td className="num">{p.won}</td>
                    <td className="num leading">{p.leading}</td>
                    <td className="num bold">{p.seats}</td>
                    <td className="num">{p.votes}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'states' && (
          <div className="states-grid">
            {STATE_RESULTS.map(s => (
              <div key={s.state} className="state-card">
                <h4>{s.state}</h4>
                <div className="state-total">{s.total} seats</div>
                <div className="state-bars">
                  <div className="state-bar-item">
                    <span style={{ color: '#FF9933' }}>BJP</span>
                    <div className="mini-bar"><div style={{ width: `${(s.bjp/s.total)*100}%`, background: '#FF9933' }}></div></div>
                    <span>{s.bjp}</span>
                  </div>
                  <div className="state-bar-item">
                    <span style={{ color: '#00BFFF' }}>INC</span>
                    <div className="mini-bar"><div style={{ width: `${(s.inc/s.total)*100}%`, background: '#00BFFF' }}></div></div>
                    <span>{s.inc}</span>
                  </div>
                  <div className="state-bar-item">
                    <span style={{ color: '#95A5A6' }}>Others</span>
                    <div className="mini-bar"><div style={{ width: `${(s.others/s.total)*100}%`, background: '#95A5A6' }}></div></div>
                    <span>{s.others}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="timeline">
            {TIMELINE.map((item, i) => (
              <div key={i} className={`timeline-item ${item.type}`}>
                <div className="timeline-time">{item.time}</div>
                <div className="timeline-dot"></div>
                <div className="timeline-event">{item.event}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Data based on Election Commission of India results | India Election Live Tracker 2024</p>
      </footer>
    </div>
  );
}
