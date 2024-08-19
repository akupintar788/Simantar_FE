// Topbar.js
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { faBars, faSearch, faExclamationTriangle, faCheckCircle, faTimesCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import avatar from "../assets/images.png";
import axios from 'axios';
import "../Data Peminjaman/Dashboard.css";
import dayjs from 'dayjs';

function Topbar({ toggleSidebar, onSearch }) {
    const [searchTerm, setSearchTerm] = useState('');
    const modalRef = useRef(null);
    const [count, setCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [overdueItems, setOverdueItems] = useState([]);

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    useEffect(() => {
        fetchNotificationCount();
        const interval = setInterval(fetchNotificationCount, 30000); // Perbarui setiap 30 detik
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showModal) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setShowModal(false);
        }
    };

    const fetchNotificationCount = async () => {
        try {
            const currentUserId = localStorage.getItem('userid');
            const currentUserRole = localStorage.getItem('role');
            const response = await axios.get(`http://localhost:8000/api/peminjamans/get`);

            let filteredData;
            if (currentUserRole === 'ketua_program' || currentUserRole === 'sarpras') {
                filteredData = response.data.filter(item =>
                    (item.barang.user_id === parseInt(currentUserId) && item.status_peminjaman === 'Diajukan') ||
                    (item.peminjaman.user_id === parseInt(currentUserId) && (
                        item.status_peminjaman === 'Disetujui' ||
                        item.status_peminjaman === 'Tidak Disetujui' ||
                        item.status_peminjaman === 'Dipinjam' ||
                        item.status_peminjaman === 'Dikembalikan' ||
                        item.status_peminjaman === 'Terlambat'
                    ))
                );
            } else if (currentUserRole === 'siswa' || currentUserRole === 'guru') {
                filteredData = response.data.filter(item =>
                    item.peminjaman.user_id === parseInt(currentUserId) && (
                        item.status_peminjaman === 'Disetujui' ||
                        item.status_peminjaman === 'Tidak Disetujui' ||
                        item.status_peminjaman === 'Dipinjam' ||
                        item.status_peminjaman === 'Dikembalikan' ||
                        item.status_peminjaman === 'Terlambat'
                    )
                );
            } else {
                console.error('Role pengguna tidak valid');
                return;
            }

            const today = new Date();
            const notifications = filteredData.map(item => {
                let type = '';
                if (item.status_peminjaman === 'Dipinjam') {
                    const dueDate = new Date(item.peminjaman.tgl_pengembalian);
                    const timeDiff = dueDate - today;
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    let message = '';

                    if (daysDiff > 3) {
                        return null;
                    } else if (daysDiff === 3) {
                        message = `Batas pengembalian barang tinggal 3 hari untuk ${item.barang.nama_barang}.`;
                        type = 'warning';
                    } else if (daysDiff === 2) {
                        message = `Batas pengembalian barang tinggal 2 hari untuk ${item.barang.nama_barang}.`;
                        type = 'warning';
                    } else if (daysDiff === 1) {
                        message = `Besok adalah batas pengembalian barang untuk ${item.barang.nama_barang}.`;
                        type = 'warning';
                    } else if (daysDiff === 0) {
                        message = `Hari ini adalah batas pengembalian barang untuk ${item.barang.nama_barang}.`;
                        type = 'warning';
                    } else {
                        return null;
                    }

                    return {
                        name: item.peminjaman.nama_peminjam,
                        description: message,
                        type: type
                    };
                } else if (item.status_peminjaman === 'Terlambat') {
                    if (item.peminjaman.user_id === parseInt(currentUserId) && item.barang.user_id === parseInt(currentUserId)) {
                        let messagePeminjam = `Peminjaman barang ${item.barang.nama_barang} telah melewati batas waktu pengembalian. Mohon segera mengembalikannya.`;
                        let messagePemilik = `Peminjaman Barang ${item.barang.nama_barang} atas nama ${item.peminjaman.nama_peminjam} telah melewati batas waktu pengembalian.`;

                        return [
                            {
                                name: item.peminjaman.nama_peminjam,
                                description: messagePeminjam,
                                type: 'warning'
                            },
                            {
                                name: `Pemberitahuan`,
                                description: messagePemilik,
                                type: 'warning'
                            }
                        ];
                    } else if (item.peminjaman.user_id === parseInt(currentUserId)) {
                        let message = `Peminjaman barang ${item.barang.nama_barang} telah melewati batas waktu pengembalian. Mohon segera mengembalikannya.`;
                        return {
                            name: item.peminjaman.nama_peminjam,
                            description: message,
                            type: 'warning'
                        };
                    } else if (item.barang.user_id === parseInt(currentUserId)) {
                        let message = `Barang ${item.barang.nama_barang} atas nama ${item.peminjaman.nama_peminjam} telah melewati batas waktu pengembalian.`;
                        return {
                            name: `Pemberitahuan`,
                            description: message,
                            type: 'warning'
                        };
                    }
                } else if (item.status_peminjaman === 'Tidak Disetujui' || item.status_peminjaman === 'Dikembalikan') {
                    const updatedAt = new Date(item.updated_at);
                    const timeDiff = today - updatedAt;
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if (daysDiff > 5) {
                        return null;
                    } else {
                        return {
                            name: item.notifikasi.split(': ')[0],
                            description: item.notifikasi.split(': ')[1],
                            type: 'info'
                        };
                    }
                } else {
                    return {
                        name: item.notifikasi.split(': ')[0],
                        description: item.notifikasi.split(': ')[1],
                        type: 'info'
                    };
                }
            }).filter(notification => Array.isArray(notification) ? notification.every(notif => notif !== null && notif.description !== "") : (notification !== null && notification.description !== ""));

            const flattenedNotifications = notifications.flat();

            setCount(flattenedNotifications.length);
            setCartItems(flattenedNotifications);
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return { icon: faCheckCircle, style: { color: 'green', marginRight: '10px', fontSize: '44px' } };
            case 'error':
                return { icon: faTimesCircle, style: { color: 'red', marginRight: '10px', fontSize: '44px' } };
            case 'warning':
                return { icon: faExclamationTriangle, style: { color: 'red', marginRight: '10px', fontSize: '44px' } };
            case 'info':
            default:
                return { icon: faInfoCircle, style: { color: 'blue', marginRight: '10px', fontSize: '44px' } };
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    useEffect(() => {
        const fetchDataAndUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                const userResponse = await axios.post("http://localhost:8000/api/auth/me");
                const userData = userResponse.data;

                setUserId(userData.id);
                setUserRole(userData.role);

                const peminjamanResponse = await axios.get('http://localhost:8000/api/peminjamans', {
                    params: {
                        user_id: userData.id
                    }
                });

                const peminjamanData = peminjamanResponse.data;

                const overdue = peminjamanData
                    .filter(peminjamanBarang => {
                        const returnDate = dayjs(peminjamanBarang.tgl_pengembalian);
                        return returnDate.isBefore(dayjs()) && peminjamanBarang.status !== 'Dikembalikan';
                    })
                    .map(peminjamanBarang => {
                        updateStatusToLate(peminjamanBarang.id);
                        return {
                            ...peminjamanBarang,
                            status_peminjaman: 'Terlambat',
                            description: `Peminjaman Anda terlambat dengan tanggal pengembalian ${peminjamanBarang.tgl_pengembalian}`
                        };
                    });

                setOverdueItems(overdue);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchDataAndUserData();
    }, []);

    const updateStatusToLate = async (peminjamanId) => {
        try {
            await axios.patch(`http://localhost:8000/api/peminjamans/${peminjamanId}`, {
                status_peminjaman: 'Terlambat'
            });
            console.log(`Peminjaman ID ${peminjamanId} status updated to 'Terlambat'`);
        } catch (error) {
            console.error(`Error updating status for peminjaman ID ${peminjamanId}:`, error);
        }
    };

    return (
        <div className="topbar">
            <div className="toggle" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faBars} />
            </div>
            <div className="search">
                <label>
                    <input type="text" placeholder="Search here" value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} />
                    <FontAwesomeIcon className="icon" icon={faSearch} onClick={handleSearch} />
                </label>
            </div>
            <div className="user-notification">
                <div className="notification-bell" onClick={handleOpenModal}>
                    <svg className="bell-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                        <path d="M12 2C7.03 2 3 6.03 3 11v5.42l-1.71 1.71A.996.996 0 0 0 2 20h20a.996.996 0 0 0 .71-1.71L21 16.42V11c0-4.97-4.03-9-9-9zm-1 19c0 .55.45 1 1 1s1-.45 1-1h-2z" fill="none" stroke="black" strokeWidth="2" />
                    </svg>
                    {count > 0 && <span className="notification-count">{count}</span>}
                    {showModal && (
                        <div className="custom-modal" style={{ right: '0px', top: '60px' }}>
                            <div ref={modalRef} className="modal-content" style={{ borderRadius: '15px' }}>
                                {cartItems.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', padding: '10px', borderRadius: '20%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <FontAwesomeIcon icon={getNotificationIcon(item.type).icon} style={getNotificationIcon(item.type).style} />
                                            <div>
                                                <strong>{item.name}</strong>
                                                <br />
                                                {item.description}
                                            </div>
                                        </div>
                                        {index < cartItems.length - 1 && <hr style={{ width: '100%', borderTop: '3px solid #A09E9E', margin: '0px 0' }} />}
                                    </div>
                                ))}
                                {(userRole === 'siswa' || userRole === 'guru') && (
                                    <ul>
                                        {overdueItems.map(item => (
                                            <li key={item.id}>
                                                {item.description} - Status: {item.status_peminjaman}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="user">
                    <Link to="/pengaturan">
                        <img src={avatar} alt="Avatar" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Topbar;
