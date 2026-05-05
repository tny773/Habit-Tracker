import React, { useState, useEffect } from "react";
import Dashboard from "./Dashboard";
import Auth from "./Auth";
import { Toaster } from "react-hot-toast";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <>
      <Toaster position="top-right" />

      {user ? (
        <Dashboard setUser={setUser} />
      ) : (
        <Auth setUser={setUser} />
      )}
    </>
  );
}

export default App;