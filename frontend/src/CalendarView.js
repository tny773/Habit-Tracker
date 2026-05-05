import React, { useEffect, useState } from "react";

const moods = ["😊", "😐", "😞", "😴", "😤"];

function CalendarView() {
  const [data, setData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);
  const [viewEntry, setViewEntry] = useState(null);
  const [selectedMood, setSelectedMood] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [reflection, setReflection] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const loadCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    fetch(`http://localhost:5000/calendar/${user.id}/${year}/${month}`)
      .then((res) => res.json())
      .then((d) => setData(d));
  };

  useEffect(() => {
    if (user) loadCalendar();
  }, [user]);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("date", selectedDate);
    formData.append("note", note);

    if (image) formData.append("image", image);

    await fetch("http://localhost:5000/journal", {
      method: "POST",
      body: formData,
    });

    setIsEditing(false);
    loadCalendar();
  };

  const saveMood = async (mood) => {
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("date", selectedDate);
    formData.append("mood", mood);

    await fetch("http://localhost:5000/mood", {
      method: "POST",
      body: formData,
    });

    setSelectedMood(mood);
    loadCalendar();
  };

  // ✅ NEW: SAVE REFLECTION
  const saveReflection = async () => {
    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("date", selectedDate);
    formData.append("text", reflection);

    await fetch("http://localhost:5000/reflection", {
      method: "POST",
      body: formData,
    });

    alert("Reflection saved ✨");
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>Calendar</h2>

      {/* GRID */}
      <div style={grid}>
        {days.map((day) => {
          const today = new Date();
          const date = `${today.getFullYear()}-${String(
            today.getMonth() + 1
          ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          const info = data[date];

          return (
            <div
              key={day}
              onClick={async () => {
                setSelectedDate(date);
                setSelectedMood(info?.mood || "");
                setIsEditing(false);

                const res = await fetch(
                  `http://localhost:5000/journal/${user.id}/${date}`
                );

                if (res.status === 200) {
                  const entry = await res.json();
                  setViewEntry(entry);
                  setNote(entry.note);
                } else {
                  setViewEntry(null);
                  setNote("");
                }

                // ✅ LOAD REFLECTION
                const refRes = await fetch(
                  `http://localhost:5000/reflection/${user.id}/${date}`
                );
                const refData = await refRes.json();
                setReflection(refData.text || "");
              }}
              style={{
                ...box,
                background:
                  info?.journal
                    ? "linear-gradient(135deg, #d8a7b1, #c9d6ea)"
                    : "rgba(255,255,255,0.6)",
              }}
            >
              {info?.image ? (
                <img
                  src={`http://localhost:5000/${info.image.replace("\\", "/")}`}
                  alt=""
                  style={img}
                />
              ) : (
                <span>{day}</span>
              )}

              {info?.mood && <span style={moodStyle}>{info.mood}</span>}
            </div>
          );
        })}
      </div>

      {/* PANEL */}
      {selectedDate && (
        <div style={card}>
          <h3>{selectedDate}</h3>

          {/* MOOD */}
          <div style={{ marginBottom: "10px" }}>
            {moods.map((m) => (
              <span
                key={m}
                onClick={() => saveMood(m)}
                style={{
                  fontSize: "22px",
                  marginRight: "10px",
                  cursor: "pointer",
                  opacity: selectedMood === m ? 1 : 0.4,
                }}
              >
                {m}
              </span>
            ))}
          </div>

          {/* VIEW MODE */}
          {viewEntry && !isEditing && (
            <>
              <p>{viewEntry.note}</p>

              {viewEntry.image && (
                <img
                  src={`http://localhost:5000/${viewEntry.image}`}
                  style={previewImg}
                />
              )}

              <button onClick={() => setIsEditing(true)} style={button}>
                Edit
              </button>
            </>
          )}

          {/* EDIT MODE */}
          {(!viewEntry || isEditing) && (
            <>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your thoughts..."
                style={textarea}
              />

              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />

              <button onClick={handleSubmit} style={button}>
                Save
              </button>
            </>
          )}

          {/* ✅ NEW: DAILY REFLECTION */}
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ marginBottom: "10px" }}>Daily Reflection</h4>

            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="How did today go? What did you learn?"
              style={textarea}
            />

            <button onClick={saveReflection} style={button}>
              Save Reflection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🎨 STYLES (UNCHANGED) */
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "10px",
};

const box = {
  height: "60px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  position: "relative",
  backdropFilter: "blur(10px)",
  cursor: "pointer",
};

const img = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "14px",
};

const moodStyle = {
  position: "absolute",
  bottom: "4px",
  right: "6px",
  fontSize: "12px",
};

const card = {
  marginTop: "25px",
  padding: "20px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(12px)",
};

const textarea = {
  width: "100%",
  marginTop: "10px",
  padding: "10px",
  borderRadius: "10px",
};

const button = {
  marginTop: "10px",
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#d8a7b1",
  color: "white",
};

const previewImg = {
  width: "100%",
  borderRadius: "12px",
  marginBottom: "10px",
};

export default CalendarView;