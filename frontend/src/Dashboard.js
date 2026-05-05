import React, { useEffect, useState } from "react";
import CalendarView from "./CalendarView";
import Analytics from "./Analytics";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import BackgroundBlobs from "./BackgroundBlobs";
import WeeklyReview from "./WeeklyReview";

function Dashboard({ setUser }) { // ✅ FIXED
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [streaks, setStreaks] = useState({});
  const [activeTab, setActiveTab] = useState("calendar");

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // ---------------- HABITS ----------------
  const loadHabits = async () => {
    try {
      const res = await fetch(`http://localhost:5000/habits/${user.id}`);
      const data = await res.json();
      setHabits(data);

      let streakData = {};
      for (let habit of data) {
        const res = await fetch(
          `http://localhost:5000/habits/${habit.id}/streak`
        );
        const s = await res.json();
        streakData[habit.id] = s.streak;
      }
      setStreaks(streakData);
    } catch (err) {
      console.error(err);
    }
  };

  const createHabit = async () => {
    if (!newHabit) return;

    await fetch("http://localhost:5000/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newHabit, user_id: user.id }),
    });

    setNewHabit("");
    loadHabits();
  };

  const markHabit = async (habitId) => {
    const res = await fetch(
      `http://localhost:5000/habits/${habitId}/check`,
      { method: "POST" }
    );

    const data = await res.json();

    res.status === 400
      ? toast.error(data.message)
      : toast.success(data.message);

    loadHabits();
  };

  const deleteHabit = async (habitId) => {
    if (!window.confirm("Delete this habit?")) return;

    const res = await fetch(
      `http://localhost:5000/habits/${habitId}`,
      { method: "DELETE" }
    );

    const data = await res.json();
    toast.success(data.message);

    loadHabits();
  };

  // ---------------- TODOS ----------------
  const loadTodos = async () => {
    const res = await fetch(`http://localhost:5000/todos/${user.id}`);
    setTodos(await res.json());
  };

  const createTodo = async () => {
    if (!newTodo) return;

    await fetch("http://localhost:5000/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTodo, user_id: user.id }),
    });

    setNewTodo("");
    loadTodos();
  };

  const toggleTodo = async (id) => {
    await fetch(`http://localhost:5000/todos/${id}/toggle`, {
      method: "POST",
    });
    loadTodos();
  };

  const deleteTodo = async (id) => {
    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "DELETE",
    });
    loadTodos();
  };

  useEffect(() => {
    loadHabits();
    loadTodos();
  }, []);

  if (!user) return <div>Please login</div>;

  return (
    <>
      <BackgroundBlobs />

      <div style={container}>
        {/* SIDEBAR */}
        <div style={sidebar}>
          <h2 style={logo}>BetterUp</h2>

          {["calendar", "habits", "todo", "analytics", "weekly"].map((tab) => (
            <motion.div
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              style={{
                ...tabStyle,
                background:
                  activeTab === tab
                    ? "linear-gradient(135deg, #d8a7b1, #c9d6ea)"
                    : "transparent",
                color: activeTab === tab ? "white" : "#444",
                boxShadow:
                  activeTab === tab
                    ? "0 4px 12px rgba(216,167,177,0.4)"
                    : "none",
              }}
            >
              {tab}
            </motion.div>
          ))}

          {/* ✅ LOGOUT BUTTON (ADDED, UI SAFE) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              localStorage.removeItem("user");
              setUser(null);
            }}
            style={{
              marginTop: "30px",
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background: "#ce7b69",
              color: "white",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Logout
          </motion.button>
        </div>

        {/* MAIN */}
        <div style={main}>
          <h1 style={heading}>Hi {user.username}</h1>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "calendar" && <CalendarView />}

              {activeTab === "habits" && (
                <>
                  <div style={inputRow}>
                    <input
                      placeholder="New habit..."
                      value={newHabit}
                      onChange={(e) => setNewHabit(e.target.value)}
                      style={input}
                    />
                    <button style={btnPrimary} onClick={createHabit}>
                      Add
                    </button>
                  </div>

                  {habits.map((habit) => (
                    <motion.div
                      key={habit.id}
                      style={card}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <span style={text}>
                        {habit.title} — {streaks[habit.id] || 0} days
                      </span>

                      <div>
                        <button onClick={() => markHabit(habit.id)} style={btn}>
                          Done
                        </button>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          style={btnDelete}
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              {activeTab === "todo" && (
                <>
                  <div style={inputRow}>
                    <input
                      placeholder="Add task..."
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      style={input}
                    />
                    <button style={btnPrimary} onClick={createTodo}>
                      Add
                    </button>
                  </div>

                  {todos.map((t) => (
                    <motion.div
                      key={t.id}
                      style={card}
                      whileHover={{ scale: 1.02 }}
                    >
                      <span
                        style={{
                          ...text,
                          textDecoration: t.completed
                            ? "line-through"
                            : "none",
                          opacity: t.completed ? 0.6 : 1,
                        }}
                      >
                        {t.title}
                      </span>

                      <div>
                        <button onClick={() => toggleTodo(t.id)} style={btn}>
                          Done
                        </button>
                        <button
                          onClick={() => deleteTodo(t.id)}
                          style={btnDelete}
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              {activeTab === "analytics" && <Analytics />}
              {activeTab === "weekly" && <WeeklyReview />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

/* 🎨 YOUR UI FULLY PRESERVED */
const container = {
  display: "flex",
  minHeight: "100vh",
  fontFamily: "Inter, sans-serif",
  background: "transparent",   // 🔥 IMPORTANT
  position: "relative",
  zIndex: 1,                   // 🔥 BRINGS UI ABOVE BLOBS
};

const sidebar = {
  width: "260px",
  padding: "40px 25px",
  backdropFilter: "blur(16px)",
  background: "rgba(255, 255, 255, 0.6)",
  borderRight: "1px solid rgba(255,255,255,0.3)",
};

const logo = {
  fontFamily: "Playfair Display, serif",
  fontSize: "26px",
  marginBottom: "40px",
};

const tabStyle = {
  padding: "14px 16px",
  borderRadius: "12px",
  marginBottom: "12px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "500",
};

const main = {
  flex: 1,
  padding: "50px",
};

const heading = {
  fontSize: "34px",
  marginBottom: "25px",
};

const inputRow = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
};

const input = {
  flex: 1,
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.1)",
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(10px)",
};

const btnPrimary = {
  background: "linear-gradient(135deg, #d8a7b1, #c9d6ea)",
  color: "white",
  padding: "12px 22px",
  borderRadius: "12px",
  border: "none",
  fontWeight: "500",
  cursor: "pointer",
};

const card = {
  background: "rgba(255, 255, 255, 0.6)",
  backdropFilter: "blur(14px)",
  padding: "18px",
  borderRadius: "18px",
  marginBottom: "14px",
  display: "flex",
  justifyContent: "space-between",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  border: "1px solid rgba(255,255,255,0.3)",
};

const text = {
  fontSize: "15px",
};

const btn = {
  marginLeft: "5px",
};

const btnDelete = {
  marginLeft: "5px",
  color: "white",
  background: "#ce7b69",
  border: "none",
  padding: "6px 12px",
  borderRadius: "8px",
};

export default Dashboard;