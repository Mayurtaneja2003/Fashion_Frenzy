import React from 'react';
import Navbar from './Components/Navbar/Navbar';
import Sidebar from './Components/Sidebar/Sidebar';
import AddProduct from './Components/AddProduct/AddProduct';
import ListProduct from './Components/ListProduct/ListProduct'; 
import Analytics from './Components/Analytics/Analytics';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <div className="admin-container">
                <Navbar />
                <div className="admin-content">
                    <Sidebar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<ListProduct />} />
                            <Route path="/addproduct" element={<AddProduct />} />
                            <Route path="/listproduct" element={<ListProduct />} />
                            <Route path="/analytics" element={<Analytics />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;