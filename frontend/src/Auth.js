import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !username)) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    const url = isLogin
      ? "http://localhost:5000/login"
      : "http://localhost:5000/register";

    const body = isLogin
      ? { email, password }
      : { username, email, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user); // ✅ FIX (NO reload)
        toast.success("Welcome ✨");
      } else {
        toast.error(data.error || data.message);
      }
    } catch (err) {
      toast.error("Something went wrong");
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={card}
      >
        <h2 style={title}>BetterUp</h2>

        {!isLogin && (
          <FloatingInput
            label="Username"
            value={username}
            setValue={setUsername}
            onKeyDown={handleKeyPress}
          />
        )}

        <FloatingInput
          label="Email"
          value={email}
          setValue={setEmail}
          onKeyDown={handleKeyPress}
        />

        <div style={{ position: "relative" }}>
          <FloatingInput
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            setValue={setPassword}
            onKeyDown={handleKeyPress}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={eyeStyle}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...button, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
        </motion.button>

        <p style={switchText} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create account" : "Already have an account?"}
        </p>
      </motion.div>
    </div>
  );
}

/* 🔥 FLOATING INPUT */
function FloatingInput({ label, value, setValue, type = "text", onKeyDown }) {
  return (
    <div style={{ position: "relative", marginBottom: "18px" }}>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        style={input}
      />
      <label
        style={{
          ...labelStyle,
          top: value ? "-8px" : "50%",
          fontSize: value ? "12px" : "14px",
          color: value ? "#d8a7b1" : "#999",
        }}
      >
        {label}
      </label>
    </div>
  );
}

/* 🎨 STYLES */
const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f8f5f2",
};

const card = {
  width: "360px",
  padding: "40px",
  background: "white",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
};

const title = {
  textAlign: "center",
  marginBottom: "30px",
  color: "#4b3f3f",
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  outline: "none",
};

const labelStyle = {
  position: "absolute",
  left: "12px",
  transform: "translateY(-50%)",
  background: "white",
  padding: "0 4px",
  transition: "0.2s",
};

const button = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "none",
  background: "#d8a7b1",
  color: "white",
  cursor: "pointer",
};

const switchText = {
  textAlign: "center",
  marginTop: "15px",
  cursor: "pointer",
};

const eyeStyle = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
  fontSize: "12px",
  color: "#999",
};

export default Auth;