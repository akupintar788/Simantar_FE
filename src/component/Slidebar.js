import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUsers, faChevronDown, faChevronUp, faChartBar, faThLarge, faBox, faClipboardList, faCogs, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/smk ijo.jpg";
import "./sidebar.css";

const Slidebar = () => {
  const [isReportMenuOpen, setIsReportMenuOpen] = useState(false);

  const toggleReportMenu = () => {
    setIsReportMenuOpen(!isReportMenuOpen);
  };

  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.pathname);
  }, []);

  const role = localStorage.getItem('role');
  console.log(role);

  useEffect(() => {}, []);

  const logoutHandler = async () => {
    try {
      const token = localStorage.getItem('token');
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.post('http://localhost:8000/api/auth/logout');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token', response.data.access_token);
      window.location.href = "/";
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
      <div className="navigation">
        <ul>
          <li>
            <a href="#">
              <span className="">
                <div className="logo1">
                  {/* <img src={logo} alt="Logo" /> */}
                </div>
              </span>
              <span className="title">Si Mantar</span>
            </a>
          </li>

          <li className={(currentUrl === '/dashboard' || currentUrl === '/dashboarduser')? 'active' : ''}>
          <a href={role === 'siswa' || role === 'guru' ? "/dashboarduser" : "/dashboard"}>
              <span className="icon">
                <FontAwesomeIcon icon={faHome} />
              </span>
              <span className="title">Dashboard</span>
            </a>
          </li>

          {role === 'admin' && (
            <>
              <li className={currentUrl === '/datapengguna' ? 'active' : ''}>
                <a href="/datapengguna">
                  <span className="icon">
                    <FontAwesomeIcon icon={faUsers} />
                  </span>
                  <span className="title">Data Pengguna</span>
                </a>
              </li>
              <li className={currentUrl === '/datajurusan' ? 'active' : ''}>
                <a href="/datajurusan">
                  <span className="icon">
                    <FontAwesomeIcon icon={faChartBar} />
                  </span>
                  <span className="title">Data Program Keahlian</span>
                </a>
              </li>
              <li className={currentUrl === '/dataruangan' ? 'active' : ''}>
                <a href="/dataruangan">
                  <span className="icon">
                    <FontAwesomeIcon icon={faThLarge} />
                  </span>
                  <span className="title">Data Ruangan</span>
                </a>
              </li>
            </>
          )}

          <li className={currentUrl === '/databarang' ? 'active' : ''}>
            <a href="databarang">
              <span className="icon">
                <FontAwesomeIcon icon={faBox} />
              </span>
              <span className="title">Data Barang</span>
            </a>
          </li>
          
          <li className={currentUrl === '/datapeminjaman' ? 'active' : ''}>
            <a href="/datapeminjaman">
              <span className="icon">
                <FontAwesomeIcon icon={faClipboardList} />
              </span>
              <span className="title">Peminjaman</span>
            </a>
          </li>

          {role !== 'siswa' && role !== 'guru' &&(
            <li className={currentUrl === '/laporanbarang' ? 'active' : ''}>
              <a href="laporanbarang" >
                <span className="icon">
                  <FontAwesomeIcon icon={faClipboardList} />
                </span>
                <span className="title">Laporan Barang</span>
                
              </a>
              
            </li>
          )}


           {role !== 'siswa' && role !== 'guru' &&(
            <li className={currentUrl === '/laporanpeminjaman' ? 'active' : ''}>
              <a href="laporanpeminjaman" >
                <span className="icon">
                  <FontAwesomeIcon icon={faClipboardList} />
                </span>
                <span className="title">Laporan Peminjaman</span>
                
              </a>
              
            </li>
          )}

          <li className={currentUrl === '/pengaturan' ? 'active' : ''}>
            <a href="pengaturan">
              <span className="icon">
                <FontAwesomeIcon icon={faCogs} />
              </span>
              <span className="title">Pengaturan</span>
            </a>
          </li>
          
          <li >
            <a href="#" onClick={logoutHandler}>
              <span className="icon">
                <FontAwesomeIcon icon={faSignOutAlt} />
              </span>
              <span className="title">Logout</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Slidebar;
