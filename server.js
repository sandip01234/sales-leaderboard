const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));   // ← This serves index.html

// In-memory storage
let agentStats = new Map();

// Sample data
function loadSampleData() {
  const samples = [
    { agentName: "Ram Sharma", amount: 500000, deals: 12 },
    { agentName: "Sita Karki", amount: 420000, deals: 15 },
    { agentName: "Subas Kandel", amount: 380000, deals: 8 },
    { agentName: "Aarav Thapa", amount: 310000, deals: 10 },
    { agentName: "Priya Sharma", amount: 310000, deals: 14 }
  ];
  samples.forEach(s => addSale(s.agentName, s.amount, s.deals));
}

function addSale(agentName, amount, deals) {
  if (!agentStats.has(agentName)) agentStats.set(agentName, { totalAmount: 0, totalDeals: 0 });
  const stat = agentStats.get(agentName);
  stat.totalAmount += amount;
  stat.totalDeals += deals;
}

loadSampleData();

// APIs
app.post('/api/sales', (req, res) => {
  const { agentName, amount, deals } = req.body;
  if (!agentName || typeof amount !== 'number' || typeof deals !== 'number' || amount <= 0 || deals <= 0) {
    return res.status(400).json({ success: false, message: "Invalid data" });
  }
  addSale(agentName, amount, deals);
  res.json({ success: true, message: `Sale recorded for ${agentName}` });
});

app.get('/api/leaderboard', (req, res) => {
  const agents = Array.from(agentStats.entries()).map(([agentName, stats]) => ({
    agentName, totalSales: stats.totalAmount, totalDeals: stats.totalDeals
  }));

  agents.sort((a, b) => b.totalSales - a.totalSales || b.totalDeals - a.totalDeals);

  let rank = 1;
  const leaderboard = agents.map((agent, i) => {
    if (i > 0 && agent.totalSales < agents[i-1].totalSales) rank++;
    return { rank, ...agent };
  });

  res.json(leaderboard);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
  console.log(` Open → http://localhost:${PORT}`);
});