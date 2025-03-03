import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faEdit, faTrashAlt, faSearch, faPlus, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import avatar from "../assets/images.png";
import Slidebar from '../component/Slidebar';
import Topbar from '../component/topbar';
import { Pagination } from 'react-bootstrap';

const Dataruangan = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [show, setShow] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [ruanganData, setRuanganData] = useState({
        id: '',
        kode_ruangan: '',
        nama_ruangan: '',
        deskripsi_ruangan: '',
        jurusanId: ''
    });
    
    
    const [koderuanganError, setKodeRuanganError] = useState(false);
    const [namaruanganError, setNamaRuanganError] = useState(false);
    const [jurusanIdError, setJurusanIdError] = useState(false);
    const [duplicateKodeRuanganError, setDuplicateKodeRuanganError] = useState(false);

    const validateForm = () => {
        let isValid = true;
    
        // Validasi input 
        if (!ruanganData.kode_ruangan) {
            setKodeRuanganError(true);
            isValid = false;
        } else {
            setKodeRuanganError(false);
        }
        
        // Check for duplicate kode jurusan
        if (ruangan.some(item => item.kode_ruangan === ruanganData.kode_ruangan)) {
            setDuplicateKodeRuanganError(true);
            isValid = false;
        } else {
            setDuplicateKodeRuanganError(false);
        }

        if (!ruanganData.nama_ruangan) {
            setNamaRuanganError(true);
            isValid = false;
        } else {
            setNamaRuanganError(false);
        }

        if (!ruanganData.jurusanId) {
            setJurusanIdError(true);
            isValid = false;
        } else {
            setJurusanIdError(false);
        }

        return isValid;
    };

    const [ruangan, setRuangan] = useState([]);

    const [jurusans, setJurusan] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [dataPerPage] = useState(10); // Ubah sesuai kebutuhan Anda

    const handleSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
        setCurrentPage(1);
    };

    useEffect(() => {
        console.log("keywd:" , searchTerm);
        fetchDataJurusan();
        fetchDataRuangan();
    }, []);



    const fetchDataJurusan = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/jurusans');
            setJurusan(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const fetchDataRuangan = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/ruangans');
            setRuangan(response.data);
            console.log(response.data);
            
        } catch (error) {
            console.error('Error fetching data:', error);
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

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    const filteredData = ruangan.filter((ruangan) => {
        const jurusan = jurusans.find(j => j.id === ruangan.jurusan_id)?.nama_jurusan.toLowerCase();
        return (
            ruangan.nama_ruangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ruangan.deskripsi_ruangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            jurusan.includes(searchTerm.toLowerCase()) // tambahkan kondisi untuk pencarian berdasarkan jurusan
        );
    });
    

    // Hitung startIndex dan endIndex berdasarkan currentPage dan perPage
    const startIndex = (currentPage - 1) * dataPerPage + 1;
    const endIndex = Math.min(startIndex + dataPerPage - 1, filteredData.length);

    // Potong data sesuai dengan indeks data awal dan akhir
    const currentData = filteredData.slice(startIndex - 1, endIndex);

    // Hitung jumlah total halaman
    const totalPages = Math.ceil(filteredData.length / dataPerPage);


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeModal = () => {
        window.location.reload();
        setShow(false);
    };

    const showModal = (ruanganData) => {
        setRuanganData({
            ...ruanganData,
            jurusanId: ruanganData.jurusan_id // Atur nilai jurusanId berdasarkan nilai jurusan_id dari ruanganData
        });
        setShow(true);
    };

    const closeModalDelete = () => {
        setShowDelete(false);
    };

    const showModalDelete = (ruanganData) => {
        setRuanganData(ruanganData);
        setShowDelete(true);
    };

    const closeModalAdd = () => {
        window.location.reload();
        setShowAdd(false);
    };

    const showModalAdd = () => {
        setShowAdd(true);
    };

    const AddDataRuangan = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            const formData = new FormData();
            formData.append('jurusan_id', ruanganData.jurusanId);
            formData.append('kode_ruangan', ruanganData.kode_ruangan);
            formData.append('nama_ruangan', ruanganData.nama_ruangan);
            formData.append('deskripsi_ruangan', ruanganData.deskripsi_ruangan);

            const response = await axios.post('http://localhost:8000/api/ruangans', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(response.data); // Output respons dari server

            // Atur pesan sukses atau perbarui data yang ditampilkan ke pengguna
            fetchDataRuangan(); // Ambil data terbaru setelah berhasil menambahkan
            window.location.reload();
        } catch (error) {
            console.error('Error adding data:', error);
            // Tambahkan logika untuk menampilkan pesan kesalahan di sini
        }
    };

    const DeleteDataRuangan = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/ruangans/${ruanganData.id}`);
            setShowDelete(false);
            fetchDataRuangan();
            window.location.reload();
            alert("Data berhasil dihapus");
        } catch (error) {
            console.error('Error deleting user:', error);
            alert("Data gagal dihapus");
        }
    };

    const UpdateDataRuangan = async (e) => {
        e.preventDefault();
        console.log('Data yang akan dikirim:', ruanganData);

        let isValid = true;
        if (!ruanganData.nama_ruangan) {
            setNamaRuanganError(true);
            isValid = false;
        } else {
            setNamaRuanganError(false);
        }
         // Validasi input jurusan dipilih
         if (!ruanganData.jurusanId) {
            setJurusanIdError(true);
            return;
        } else {
            setJurusanIdError(false);
        }
        const updatedRuanganData = {
            ...ruanganData,
            jurusan_id: parseInt(ruanganData.jurusanId) // atau Number(ruanganData.jurusanId)
        };
        // Validasi input nama ruangan
        
        try {
            const response = await axios.put(`http://localhost:8000/api/ruangans/update/${ruanganData.id}`, updatedRuanganData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        
            console.log(response.data); // Output respons dari server
            fetchDataRuangan(); // Ambil data terbaru setelah berhasil mengupdate
            setShow(false);
            // window.location.reload();
        } catch (error) {
            console.error('Error updating data:', error);
            // Menangani kesalahan dan menampilkan pesan kesalahan kepada pengguna
            if (error.response) {
                console.log(error.response.data); // Pesan kesalahan dari server
                // Tambahkan logika untuk menampilkan pesan kesalahan kepada pengguna
            } else if (error.request) {
                console.log(error.request); // Kesalahan koneksi jaringan
                // Tambahkan logika untuk menampilkan pesan kesalahan kepada pengguna
            } else {
                console.log('Error', error.message); // Kesalahan lainnya
                // Tambahkan logika untuk menampilkan pesan kesalahan kepada pengguna
            }
        }
    };

    return (
        <div>
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <Slidebar />
            </div>
            <div className={`main ${isSidebarOpen ? 'shifted' : ''}`}>
            <Topbar toggleSidebar={toggleSidebar} onSearch={handleSearch} />

                <div className='datapengguna' >
                    <div className='body-flex'>
                        <div className='flex mx-6 d-flex justify-content-center'>
                            <div className='col-11 p-6'>
                                <h2 className='mb-3' style={{ backgroundColor: '#436850', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', color: 'white' }}>Data Ruangan</h2>
                                {/* Modal DELETE */}
                                <Modal show={showDelete} onHide={closeModalDelete} centered>
                                    
                                    <Modal.Body className="text-center" style={{ borderBottom: 'none' }}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger mb-3" style={{ fontSize: '6em' }} />
                                        <h4>Apakah anda yakin?</h4>
                                        <p>Data yang sudah dihapus mungkin tidak bisa dikembalikan lagi!</p>
                                        <Button variant="primary" onClick={closeModalDelete}>Batal</Button>
                                        &nbsp;
                                        &nbsp;
                                        <Button variant="danger" onClick={DeleteDataRuangan}>Hapus</Button>
                                    </Modal.Body>
                                </Modal>

                                <Modal show={show} onHide={closeModal}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Form Update Data</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form onSubmit={UpdateDataRuangan}>
                                            <Form.Group className="mb-3" controlId="exampleForm.ControlInputKodeRuangan">
                                                <Form.Label>Kode Ruangan</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    autoFocus
                                                    readOnly
                                                    value={ruanganData.kode_ruangan}
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="exampleForm.ControlInputNamaRuangan">
                                                <Form.Label>Nama Ruangan</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => {
                                                        setRuanganData({...ruanganData, nama_ruangan: e.target.value});
                                                        setNamaRuanganError(false);
                                                    }}
                                                    value={ruanganData.nama_ruangan}
                                                />
                                                {namaruanganError && <p style={{ color: 'red' }}>Nama Ruangan wajib diisi!</p>}
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="exampleForm.ControlInputDeskripsi">
                                                <Form.Label>Deskripsi</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    onChange={(e) => setRuanganData({...ruanganData, deskripsi_ruangan: e.target.value})}
                                                    value={ruanganData.deskripsi_ruangan}
                                                />
                                            </Form.Group>
                                            <Form.Group controlId="exampleForm.ControlSelectJurusan">
                                                    <Form.Label>Jurusan</Form.Label>
                                                    <Form.Control 
                                                        as="select" 
                                                        onChange={(e) => setRuanganData({...ruanganData, jurusanId: e.target.value})} // Pastikan nilai jurusanId diatur dengan benar
                                                        value={ruanganData.jurusanId}
                                                    >
                                                        <option value="">Pilih Jurusan</option>
                                                        {jurusans.map(jurusan => (
                                                            <option key={jurusan.id} value={jurusan.id}>{jurusan.nama_jurusan}</option>
                                                        ))}
                                                    </Form.Control>
                                                    {jurusanIdError && <p style={{ color: 'red' }}>Jurusan wajib dipilih!</p>}
                                            </Form.Group>
                                            
                                            <Button type='submit' color="primary" className="px-4 mt-3" >Simpan</Button>
                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={closeModal}>Close</Button>
                                    </Modal.Footer>
                                </Modal>

                                {/* Modal ADD */}
                                <Modal show={showAdd} onHide={closeModalAdd}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Tambah Data</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form onSubmit={AddDataRuangan}>
                                            <Form.Group className="mb-3" controlId="exampleForm.ControlInputKodeRuangan">
                                                <Form.Label>Kode Ruangan</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    autoFocus
                                                    onChange={(e) => {
                                                        setRuanganData({...ruanganData, kode_ruangan: e.target.value}); 
                                                        setKodeRuanganError(false);
                                                        setDuplicateKodeRuanganError(false);
                                                    }}
                                                    value={ruanganData.kode_ruangan}
                                                />
                                                {koderuanganError && <p style={{ color: 'red' }}>Kode Ruangan wajib diisi!</p>}
                                                {duplicateKodeRuanganError && <p style={{ color: 'red' }}>Kode Ruangan sudah ada!</p>}
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="exampleForm.ControlInputNamaRuangan">
                                                <Form.Label>Nama Ruangan</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    onChange={(e) => {
                                                        setRuanganData({...ruanganData, nama_ruangan: e.target.value});
                                                        setNamaRuanganError(false);
                                                    }}
                                                    value={ruanganData.nama_ruangan}
                                                />
                                                {namaruanganError && <p style={{ color: 'red' }}>Nama Ruangan wajib diisi!</p>}
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="exampleForm.ControlInputDeskripsi">
                                                <Form.Label>Deskripsi</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    onChange={(e) => setRuanganData({...ruanganData, deskripsi_ruangan: e.target.value})}
                                                    value={ruanganData.deskripsi_ruangan}
                                                />
                                            </Form.Group>
                                            <Form.Group controlId="exampleForm.ControlSelectJurusan">
                                                <Form.Label>Jurusan</Form.Label>
                                                <Form.Control as="select" onChange={(e) => setRuanganData({...ruanganData, jurusanId: e.target.value})} value={ruanganData.jurusanId}>
                                                    <option value="">Pilih Jurusan</option>
                                                    {jurusans.map(jurusan => (
                                                        <option key={jurusan.id} value={jurusan.id}>{jurusan.nama_jurusan}</option>
                                                    ))}
                                                </Form.Control>
                                                {jurusanIdError && <p style={{ color: 'red' }}>Jurusan wajib dipilih!</p>}
                                            </Form.Group>
                                            <Button type='submit' color="primary" className="px-4 mt-3">Tambah</Button>
                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={closeModalAdd}>Close</Button>
                                    </Modal.Footer>
                                </Modal>

                                <Button className='mt-3 mb-3' variant="success" onClick={showModalAdd}>
                                    <FontAwesomeIcon icon={faPlus} /> Tambah Data
                                </Button>
                                <Table striped bordered hover responsive className="font-ubuntu" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                                    <thead style={{ backgroundColor: '#436850', color: 'white' }}>
                                        <tr>
                                            <th>No</th>
                                            <th>Nama Ruangan</th>
                                            <th>Deskripsi</th>
                                            <th>Jurusan</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentData.map((ruangan, index) => (
                                            <tr key={ruangan.id}>
                                                <td>{startIndex + index}</td>
                                                <td>{ruangan.nama_ruangan}</td>
                                                <td>{ruangan.deskripsi_ruangan}</td>
                                                <td>{jurusans.find(j => j.id === ruangan.jurusan_id)?.nama_jurusan}</td>

                                                <td>
                                                    <Button variant="primary" onClick={() => showModal(ruangan)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </Button>
                                                    &nbsp;
                                                    <Button variant="danger" onClick={() => showModalDelete(ruangan)}>
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                 {/* Tampilkan informasi jumlah data yang ditampilkan */}
        <div className='d-flex justify-content-between align-items-center mt-2'>
            <p style={{ fontSize: '14px', color: 'grey' }}>Showing {startIndex} to {endIndex} of {filteredData.length} results</p>
        
                                {/* Pagination */}
            {/* Pagination */}
            <Pagination>
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item key={index + 1} active={index + 1 === currentPage} onClick={() => handlePageChange(index + 1)}>
                        {index + 1}
                    </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            </Pagination>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dataruangan;
