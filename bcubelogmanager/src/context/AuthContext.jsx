import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    const savedProject = sessionStorage.getItem("project");

    if (token && savedProject) {
      setProject(JSON.parse(savedProject));
    }

    setLoading(false);
  }, []);

  const login = (projectData, accessToken) => {
    sessionStorage.setItem("access_token", accessToken);
    sessionStorage.setItem("project", JSON.stringify(projectData));

    setProject(projectData);
  };

  const logout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("project");
    setProject(null);
  };

  return (
    <AuthContext.Provider
      value={{
        project,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
