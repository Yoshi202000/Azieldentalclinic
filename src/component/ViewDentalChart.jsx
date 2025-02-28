import React, { useState } from 'react';
import axios from 'axios';

const ViewDentalChart = () => {
    const [email, setEmail] = useState('');
    const [patientData, setPatientData] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [dentalRecords, setDentalRecords] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Function to fetch patient records by email
    const fetchPatientRecords = async () => {
        if (!email) {
            setError('Please enter an email address');
            return;
        }

        setLoading(true);
        setError('');
        setPatientData(null);
        setDentalRecords(null);
        setSelectedDate('');

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/get-dental-chart/${email}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.adultDentalChart || response.data.childDentalChart) {
                setPatientData(response.data);
            } else {
                setError('No dental record found for this email.');
            }
        } catch (err) {
            console.error('Error fetching dental chart:', err);
            setError('Failed to fetch dental chart. Please try again.');
        }

        setLoading(false);
    };

    // Handle date selection
    const handleDateSelection = (date) => {
        setSelectedDate(date);

        // Fetch the corresponding record for the selected date
        const adultRecord = patientData.adultDentalChart && patientData.adultDentalChart.date === date
            ? patientData.adultDentalChart
            : null;

        const childRecord = patientData.childDentalChart && patientData.childDentalChart.date === date
            ? patientData.childDentalChart
            : null;

        setDentalRecords({ adultDentalChart: adultRecord, childDentalChart: childRecord });
    };

    return (
        <div className="dentalChart-view">
            <h2>View Dental Chart</h2>

            {/* Email Input */}
            <div>
                <input
                    type="email"
                    placeholder="Enter patient's email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button onClick={fetchPatientRecords} disabled={loading}>
                    {loading ? 'Fetching...' : 'Search Patient'}
                </button>
            </div>

            {/* Error Message */}
            {error && <p className="dentalChart-error">{error}</p>}

            {/* Show Patient Info and Date Selection */}
            {patientData && (
                <div className="dentalChart-patient-info">
                    <h3>Patient Details</h3>
                    <p><strong>Name:</strong> {patientData.adultDentalChart?.firstName || patientData.childDentalChart?.firstName} {patientData.adultDentalChart?.lastName || patientData.childDentalChart?.lastName}</p>
                    <p><strong>Email:</strong> {email}</p>

                    {/* Date Selection */}
                    <h3>Select a Date</h3>
                    <div className="dentalChart-date-list">
                        {patientData.adultDentalChart && (
                            <button className={`dentalChart-date-button ${selectedDate === patientData.adultDentalChart.date ? 'active' : ''}`} onClick={() => handleDateSelection(patientData.adultDentalChart.date)}>
                                {patientData.adultDentalChart.date}
                            </button>
                        )}
                        {patientData.childDentalChart && (
                            <button className={`dentalChart-date-button ${selectedDate === patientData.childDentalChart.date ? 'active' : ''}`} onClick={() => handleDateSelection(patientData.childDentalChart.date)}>
                                {patientData.childDentalChart.date}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Display Dental Chart for Selected Date */}
            {dentalRecords && (
                <div className="dentalChart-results">
                    <h3>Dental Record for {selectedDate}</h3>
                    <p><strong>Patient Name:</strong> {patientData.adultDentalChart?.firstName || patientData.childDentalChart?.firstName} {patientData.adultDentalChart?.lastName || patientData.childDentalChart?.lastName}</p>


                    {/* Adult Chart */}
                    {dentalRecords.adultDentalChart && (
                        <>
                            <h3>Adult Dental Chart</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tooth</th>
                                        <th>Status</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(dentalRecords.adultDentalChart.teeth).map(([tooth, data]) => (
                                        <tr key={tooth}>
                                            <td>{tooth}</td>
                                            <td>{data.status || 'N/A'}</td>
                                            <td>{data.notes || 'No notes'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Child Chart */}
                    {dentalRecords.childDentalChart && (
                        <>
                            <h3>Child Dental Chart</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tooth</th>
                                        <th>Status</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(dentalRecords.childDentalChart.teeth).map(([tooth, data]) => (
                                        <tr key={tooth}>
                                            <td>{tooth}</td>
                                            <td>{data.status || 'N/A'}</td>
                                            <td>{data.notes || 'No notes'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewDentalChart;
