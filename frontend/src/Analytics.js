import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Analytics() {
  const [data, setData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(`http://localhost:5000/analytics/${user.id}`)
      .then((res) => res.json())
      .then((d) => setData(d));
  }, [user]);

  if (!data) return <div>Loading analytics...</div>;

  // 🔥 convert object → chart array
  const chartData = Object.entries(data.weekly_activity).map(
    ([date, count]) => ({
      date: date.slice(5), // show MM-DD
      count,
    })
  );

  return (
    <div>
      <h3 style={{ marginBottom: "20px", color: "#4b3f3f" }}>
        Your Progress
      </h3>

      {/* 💎 STAT CARDS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        <div style={card}>
          <p>Total Habits</p>
          <h2>{data.total_habits}</h2>
        </div>

        <div style={card}>
          <p>Total Completions</p>
          <h2>{data.total_completions}</h2>
        </div>
      </div>

      {/* 📊 BAR CHART */}
      <div style={{ height: "300px", background: "#fff", borderRadius: "12px", padding: "20px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#d8a7b1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 🎨 styles
const card = {
  background: "#f8f5f2",
  padding: "16px",
  borderRadius: "12px",
  width: "180px",
  textAlign: "center",
};

export default Analytics;