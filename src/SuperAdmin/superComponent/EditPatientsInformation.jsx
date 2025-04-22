import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../admin/dashboard/Dashboard.css';
import './SuperPatientsInformation.css';

const EditPatientsInformation = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dob: '',
    email: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all patients data on component mount
  useEffect(() => {

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/UserInformation`); // Ensure the correct URL
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      }
    };
    
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/userInformation/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(response.data);
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phoneNumber: response.data.phoneNumber || '',
          dob: response.data.dob || '',
          email: response.data.email || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user information. Please try again later.');
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateAccount/${editingPatient._id}`,
        formData,
        {
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setSuccessMessage('Patient information updated successfully!');
        // Refresh the patients list
        fetchPatients();
        // Close the edit form
        setEditingPatient(null);
      }
    } catch (err) {
      console.error('Error updating patient information:', err);
      setError(err.response?.data?.message || 'Failed to update patient information');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setEditingPatient(null);
    setError(null);
    setSuccessMessage('');
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           patient.phoneNumber?.includes(searchTerm);
  });

  if (loading && patients.length === 0) {
    return <div className="loading-container">Loading patients information...</div>;
  }

  return (
    <div className="patient-list-container">
      <h2>Patient Management</h2>
      
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      
      {editingPatient ? (
        <div className="edit-patient-container">
          <h3>Edit Patient: {editingPatient.firstName} {editingPatient.lastName}</h3>
          <form onSubmit={handleSubmit} className="edit-patient-form">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dob">Date of Birth (YYYY-MM-DD)</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email (Read Only)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                readOnly
                disabled
                className="readonly-input"
              />
            </div>
            
            <div className="button-group">
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="cancel-button" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="patients-table-container">
          {filteredPatients.length > 0 ? (
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Date of Birth</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.firstName} {patient.lastName}</td>
                    <td>{patient.email}</td>
                    <td>{patient.phoneNumber}</td>
                    <td>{patient.dob}</td>
                    <td>
                      <button 
                        className="edit-button"
                        onClick={() => handleEditPatient(patient._id)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">No patients found matching your search criteria.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditPatientsInformation;
