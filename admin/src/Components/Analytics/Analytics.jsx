import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import './Analytics.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Analytics = () => {
    const [timeFrame, setTimeFrame] = useState('week');
    const [salesData, setSalesData] = useState({
        totalSales: 0,
        totalOrders: 0,
        categoryData: { women: 0, men: 0, kid: 0 },
        sizeData: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        priceRanges: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSalesData(timeFrame);
    }, [timeFrame]);

    const fetchSalesData = async (period) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:4000/api/analytics/${period}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token')
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch analytics data');
            }
            setSalesData({
                totalSales: data.totalSales || 0,
                totalOrders: data.totalOrders || 0,
                categoryData: data.categoryData || { women: 0, men: 0, kid: 0 },
                sizeData: data.sizeData || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
                priceRanges: data.priceRanges || []
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const salesBySize = {
        labels: ['S', 'M', 'L', 'XL', 'XXL'],
        datasets: [{
            label: 'Sales by Size',
            data: [
                salesData.sizeData.S,
                salesData.sizeData.M,
                salesData.sizeData.L,
                salesData.sizeData.XL,
                salesData.sizeData.XXL
            ],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const salesByPrice = {
        labels: salesData.priceRanges.map(range => `$${range.min}-${range.max}`),
        datasets: [{
            label: 'Sales by Price Range',
            data: salesData.priceRanges.map(range => range.count),
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
        }]
    };

    if (isLoading) {
        return (
            <div className="analytics-container">
                <div className="loading">Loading analytics data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-container">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => fetchSalesData(timeFrame)} className="retry-button">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h1>Sales Analytics</h1>
                <div className="time-frame-selector">
                    <button 
                        className={timeFrame === 'today' ? 'active' : ''} 
                        onClick={() => setTimeFrame('today')}
                    >
                        Today
                    </button>
                    <button 
                        className={timeFrame === 'week' ? 'active' : ''} 
                        onClick={() => setTimeFrame('week')}
                    >
                        Last Week
                    </button>
                    <button 
                        className={timeFrame === 'month' ? 'active' : ''} 
                        onClick={() => setTimeFrame('month')}
                    >
                        Last Month
                    </button>
                    <button 
                        className={timeFrame === 'year' ? 'active' : ''} 
                        onClick={() => setTimeFrame('year')}
                    >
                        Last Year
                    </button>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="chart-container">
                    <h2>Sales by Size</h2>
                    <Bar data={salesBySize} />
                </div>
                
                <div className="chart-container">
                    <h2>Sales by Price Range</h2>
                    <Bar data={salesByPrice} />
                </div>

                <div className="stats-container">
                    <div className="stat-card">
                        <h3>Total Sales</h3>
                        <p>${salesData.totalSales.toFixed(2)}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Orders</h3>
                        <p>{salesData.totalOrders}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Average Order Value</h3>
                        <p>${((salesData.totalSales / salesData.totalOrders) || 0).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;