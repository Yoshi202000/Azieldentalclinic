import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ViewDentalChart.css';

const ViewDentalChart = ({ email }) => {
    const [emailInput, setEmail] = useState(email || '');
    const [patientData, setPatientData] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [dentalRecords, setDentalRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Dental status codes for displaying descriptions
    const statusCodeMap = {
        'H': 'Healthy',
        'C': 'Caries',
        'Co': 'Composite',
        'M': 'Missing',
        'Am': 'Amalgam',
        'A': 'Abutment',
        'Cr': 'Crown',
        'P': 'Pontic',
        'Ab': 'Abrasion',
        'X': 'Extraction',
        'U': 'Unerupted',
        'RF': 'Root Fragment',
        'B': 'Bridge'
    };

    // Function to fetch patient records by email
    const fetchPatientRecords = async () => {
        if (!emailInput) {
            setError('Please enter an email address');
            return;
        }

        setLoading(true);
        setError('');
        setPatientData(null);
        setDentalRecords([]);
        setSelectedDate('');

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/get-dental-chart/${emailInput}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Process adult records - add type property
            const adultRecords = response.data.adultDentalCharts?.map(record => ({
                ...record,
                type: 'adult'
            })) || [];
            
            // Process child records - add type property
            const childRecords = response.data.childDentalCharts?.map(record => ({
                ...record,
                type: 'child'
            })) || [];
            
            // Combine and sort all records by date (newest first)
            const allRecords = [...adultRecords, ...childRecords].sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );
            
            if (allRecords.length > 0) {
                // Use the newest record for patient info
                setPatientData({
                    firstName: allRecords[0].firstName,
                    lastName: allRecords[0].lastName,
                    email: emailInput
                });
                setDentalRecords(allRecords);
                setSelectedDate(allRecords[0].date); // Select most recent record by default
            } else {
                setError('No dental records found for this email.');
            }
        } catch (err) {
            console.error('Error fetching dental charts:', err);
            setError('Failed to fetch dental records. Please try again.');
        }

        setLoading(false);
    };

    // Handle date selection
    const handleDateSelection = (date) => {
        setSelectedDate(date);
    };

    // Get the selected record based on date
    const getSelectedRecord = () => {
        return dentalRecords.find(record => record.date === selectedDate);
    };

    // Organize teeth into quadrants (for visual representation)
    const organizeTeeth = (teeth, type) => {
        if (!teeth) return {};
        
        if (type === 'adult') {
            // Upper right (1-8), Upper left (9-16), Lower left (17-24), Lower right (25-32)
            const upperRight = Array.from({ length: 8 }, (_, i) => String(i + 1))
                .filter(tooth => teeth[tooth]);
            const upperLeft = Array.from({ length: 8 }, (_, i) => String(i + 9))
                .filter(tooth => teeth[tooth]);
            const lowerLeft = Array.from({ length: 8 }, (_, i) => String(i + 17))
                .filter(tooth => teeth[tooth]);
            const lowerRight = Array.from({ length: 8 }, (_, i) => String(i + 25))
                .filter(tooth => teeth[tooth]);
                
            return { upperRight, upperLeft, lowerLeft, lowerRight };
        } else {
            // For children's teeth (A-T), split into upper (A-J) and lower (K-T)
            const upperTeeth = 'ABCDEFGHIJ'.split('').filter(tooth => teeth[tooth]);
            const lowerTeeth = 'KLMNOPQRST'.split('').filter(tooth => teeth[tooth]);
            
            return { upperTeeth, lowerTeeth };
        }
    };

    const renderToothBox = (tooth, teethData) => {
        if (!teethData[tooth]) return null;
        
        const statusCode = teethData[tooth].status || 'H';
        const statusDesc = statusCodeMap[statusCode] || statusCode;
        
        return (
            <div key={tooth} className={`tooth-box status-${statusCode}`}>
                <div className="tooth-number">Tooth {tooth}</div>
                <div className="tooth-status">{statusCode} - {statusDesc}</div>
                {teethData[tooth].notes && (
                    <div className="tooth-notes">{teethData[tooth].notes}</div>
                )}
            </div>
        );
    };

    useEffect(() => {
        if (email) {
            fetchPatientRecords();
        }
    }, [email]);

    const selectedRecord = getSelectedRecord();

    return (
        <div className="dentalChart-view">
            <h2>Dental Records</h2>

            {/* Email Search Section */}
            <div className="search-section">
                <input
                    type="email"
                    placeholder="Enter patient's email"
                    value={emailInput}
                    onChange={(e) => setEmail(e.target.value)}
                    className="email-input"
                    required
                />
                <button 
                    onClick={fetchPatientRecords} 
                    disabled={loading}
                    className="search-button"
                >
                    {loading ? 'Searching...' : 'Search Records'}
                </button>
            </div>

            {/* Error Message */}
            {error && <p className="error-message">{error}</p>}

            {/* Show Patient Info and Records */}
            {patientData && dentalRecords.length > 0 && (
                <div className="patient-section">
                    <div className="patient-info">
                        <h3>Patient Information</h3>
                        <p><strong>Name:</strong> {patientData.firstName} {patientData.lastName}</p>
                        <p><strong>Email:</strong> {patientData.email}</p>
                        <p><strong>Total Records:</strong> {dentalRecords.length}</p>
                    </div>

                    {/* Date Selection */}
                    <div className="records-navigation">
                        <h3>Dental Record History</h3>
                        <div className="date-list">
                            {dentalRecords.map((record, index) => (
                                <button 
                                    key={`${record.type}-${record.date}-${index}`}
                                    className={`date-button ${selectedDate === record.date && dentalRecords.indexOf(selectedRecord) === index ? 'active' : ''}`} 
                                    onClick={() => handleDateSelection(record.date)}
                                >
                                    {new Date(record.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                    <span className="record-type">{record.type}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Display Selected Dental Chart */}
                    {selectedRecord && (
                        <div className="dental-chart">
                            <h3>Dental Chart - {new Date(selectedRecord.date).toLocaleDateString()}</h3>
                            
                            {/* Status Legend */}
                            <div className="status-legend">
                                <h4>Status Legend</h4>
                                <div className="legend-grid">
                                    {Object.entries(statusCodeMap).map(([code, desc]) => (
                                        <div key={code} className={`legend-item status-${code}`}>
                                            <span className="code">{code}</span>
                                            <span className="description">{desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Visual Dental Chart */}
                            <div className="visual-chart">
                                <h4>Dental Chart View</h4>
                                
                                {selectedRecord.type === 'adult' ? (
                                    <div className="adult-chart">
                                        <div className="chart-section">
                                            <h5>Upper Teeth (1-16)</h5>
                                            <div className="teeth-grid">
                                                {organizeTeeth(selectedRecord.teeth, 'adult').upperRight.map(
                                                    tooth => renderToothBox(tooth, selectedRecord.teeth)
                                                )}
                                                {organizeTeeth(selectedRecord.teeth, 'adult').upperLeft.map(
                                                    tooth => renderToothBox(tooth, selectedRecord.teeth)
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="chart-section">
                                            <h5>Lower Teeth (17-32)</h5>
                                            <div className="teeth-grid">
                                                {organizeTeeth(selectedRecord.teeth, 'adult').lowerLeft.map(
                                                    tooth => renderToothBox(tooth, selectedRecord.teeth)
                                                )}
                                                {organizeTeeth(selectedRecord.teeth, 'adult').lowerRight.map(
                                                    tooth => renderToothBox(tooth, selectedRecord.teeth)
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="child-chart">
                                        <div className="chart-section">
                                            <h5>Upper Teeth (A-J)</h5>
                                            <div className="teeth-grid">
                                                {organizeTeeth(selectedRecord.teeth, 'child').upperTeeth.map(
                                                    tooth => renderToothBox(tooth, selectedRecord.teeth)
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="chart-section">
                                            <h5>Lower Teeth (K-T)</h5>
                                            <div className="teeth-grid">
                                                {organizeTeeth(selectedRecord.teeth, 'child').lowerTeeth.map(
                                                    tooth => renderToothBox(tooth, selectedRecord.teeth)
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Tabular Dental Data */}
                            <div className="tabular-chart">
                                <h4>Detailed Tooth Information</h4>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Tooth</th>
                                            <th>Status</th>
                                            <th>Description</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(selectedRecord.teeth).map(([tooth, data]) => (
                                            <tr key={tooth} className={`row-status-${data.status}`}>
                                                <td>{tooth}</td>
                                                <td>{data.status || 'H'}</td>
                                                <td>{statusCodeMap[data.status] || data.status}</td>
                                                <td>{data.notes || 'No notes'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewDentalChart;
