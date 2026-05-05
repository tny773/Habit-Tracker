import React, { useEffect, useState } from "react";

function WeeklyReview() {
  const [data, setData] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch(`http://localhost:5000/weekly/${user.id}`)
      .then((res) => res.json())
      .then((d) => setData(d));
  }, []);

  // count moods
  const moodCount = {};
  data.forEach((d) => {
    if (d.mood) {
      moodCount[d.mood] = (moodCount[d.mood] || 0) + 1;
    }
  });

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Weekly Review</h2>

      {/* MOOD SUMMARY */}
      <div style={card}>
        <h3>Mood Summary</h3>
        {Object.keys(moodCount).map((m) => (
          <div key={m} style={row}>
            <span>{m}</span>
            <div style={{ ...bar, width: `${moodCount[m] * 20}px` }} />
          </div>
        ))}
      </div>

      {/* JOURNAL ACTIVITY */}
      <div style={card}>
        <h3>Journal Activity</h3>
        {data.map((d) => (
          <div key={d.date} style={row}>
            <span>{d.date}</span>
            <span>{d.has_journal ? "✔" : "✘"}</span>
          </div>
        ))}
      </div>

      {/* REFLECTIONS */}
      <div style={card}>
        <h3>Reflections</h3>
        {data.map((d) =>
          d.reflection ? (
            <p key={d.date}>
              <strong>{d.date}:</strong> {d.reflection}
            </p>
          ) : null
        )}
      </div>
    </div>
  );
}

/* styles */
const card = {
  marginBottom: "20px",
  padding: "20px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(12px)",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const bar = {
  height: "10px",
  background: "#d8a7b1",
  borderRadius: "6px",
};

export default WeeklyReview;