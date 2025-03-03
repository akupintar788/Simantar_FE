import React, { useState, useEffect } from "react";
import axios from "axios";
import "./login.css";
import { Link} from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [role, setuserRole] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUsername(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  useEffect(() => {
  fetchData();
}, []);


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData;
      formData.append('username', username);
      formData.append('password', password);
      const response = await axios.post(
        "http://localhost:8000/api/auth/login",
         formData,
         { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log(response.data.access_token); // Tampilkan respons dari backend (opsional)
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token',response.data.access_token);
      
      await fetchData(); // Panggil fungsi fetchData untuk mengambil data pengguna (termasuk role) 
      
    } catch (error) {
      console.error("Error during login:", error);
      setError("Login gagal. Periksa kembali username dan password Anda! *");
    }
};

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.post('http://localhost:8000/api/auth/me');
      localStorage.setItem('role', response.data.role); // Simpan role ke dalam localStorage
      localStorage.setItem('userid', response.data.id);
      setuserRole(response.data.role)
      if (response.data.role === 'siswa' || response.data.role === 'guru') {
        window.location.href = "/dashboarduser";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response && error.response.status === 401) {
        // Handle Unauthorized error
        console.log("Unauthorized access detected. Logging out...");
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userid');
        localStorage.removeItem("isLoggedIn");
        
      }
    }
  };

  return (
    <div>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login Form | Dan Aleko</title>
        <link rel="stylesheet" href="login.css" />
        <link
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bodylogin">
        <div className="wrapper">
          <form onSubmit={handleLoginSubmit}>
            <h1 className="h1login">Login</h1>
            <div className="input-box">
              <input
                type="text" // Ubah tipe input menjadi text untuk username
                name="username" // Ubah name menjadi username
                placeholder="Username" // Ubah placeholder menjadi Username
                value={username}
                onChange={handleLoginChange}
              />
              <i className="bx bxs-user"></i>
            </div>
            <div className="input-box">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={handleLoginChange}
              />
            </div>
            {error && <div style={{ color: 'red' }} className="error">{error}</div>}
            
            <button type="submit" className="btn">
              Login
            </button>
            <div className="Dasboard"></div>
          </form>
        </div>
      </body>
    </div>
  );
}

export default Login;
