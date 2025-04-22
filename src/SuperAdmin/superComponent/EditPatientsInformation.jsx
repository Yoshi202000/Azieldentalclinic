import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../admin/dashboard/Dashboard.css';
import './SuperPatientsInformation.css';

const EditPatientsInformation = () => {
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
  const [token, setToken] = useState(null);

  // Get user info from token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      try {
        // Parse token just to ensure it's valid, but don't check roles
        JSON.parse(atob(storedToken.split('.')[1]));
        // No permission checks - allow all authenticated users to edit
      } catch (error) {
        console.error('Error decoding token:', error);
        setError('Authentication error. Please log in again.');
      }
    } else {
      setError('Not authenticated. Please log in.');
    }
  }, []);

  // Fetch patients once we have the token
  useEffect(() => {
    if (token) {
      fetchPatients();
    }
  }, [token]);

  // Function to fetch all patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      // Get all users with complete information
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/UserInformation`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Filter users with role 'patient'
      const patientUsers = response.data.filter(user => user.role === 'patient');
      console.log('Patient users:', patientUsers);
      
      // Ensure all patients have _id field and all required data
      const patientsWithIds = patientUsers.map(patient => {
        return {
          ...patient,
          _id: patient._id || patient.id, // Ensure _id is set
          firstName: patient.firstName || '',
          lastName: patient.lastName || '',
          email: patient.email || '',
          phoneNumber: patient.phoneNumber || '',
          dob: patient.dob || ''
        };
      });
      
      setPatients(patientsWithIds);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.response?.data?.message || 'Failed to fetch patient information');
      setLoading(false);
    }
  };

  // Function to handle starting edit for a patient
  const handleEditPatient = async (patientId) => {
    console.log('Editing patient with ID:', patientId);
    setSuccessMessage('');
    setError(null);
    setLoading(true);
    
    if (!patientId) {
      setError('Invalid patient ID. Please try again.');
      setLoading(false);
      return;
    }
    
    try {
      // Get the patient from the already loaded list first
      const patientFromList = patients.find(p => p._id === patientId);
      
      // Set initial data from the list while loading detailed data
      if (patientFromList) {
        setEditingPatient(patientFromList);
        setFormData({
          firstName: patientFromList.firstName || '',
          lastName: patientFromList.lastName || '',
          phoneNumber: patientFromList.phoneNumber || '',
          dob: patientFromList.dob || '',
          email: patientFromList.email || ''
        });
      }
      
      // Try to get detailed information with authorization
      try {
        // First try the detailed endpoint
        const detailedResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/userInformation/${patientId}`,
          {
            headers: { 
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const patientData = detailedResponse.data;
        console.log('Patient data from detailed endpoint:', patientData);
        
        // Update with the detailed data
        setEditingPatient(patientData);
        setFormData({
          firstName: patientData.firstName || '',
          lastName: patientData.lastName || '',
          phoneNumber: patientData.phoneNumber || '',
          dob: patientData.dob || '',
          email: patientData.email || ''
        });
      } catch (detailError) {
        console.error('Error with detailed endpoint, falling back to basic endpoint:', detailError);
        
        if (!patientFromList) {
          // If we don't have the patient from the list, try the basic endpoint
          const basicResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/UserInformation/${patientId}`
          );
          
          const patientData = basicResponse.data;
          console.log('Patient data from basic endpoint:', patientData);
          
          setEditingPatient({
            ...patientData,
            _id: patientId
          });
          
          setFormData({
            firstName: patientData.firstName || '',
            lastName: patientData.lastName || '',
            phoneNumber: patientData.phoneNumber || '',
            dob: patientData.dob || '',
            email: patientData.email || ''
          });
        }
      }
      
      console.log('Final form data:', formData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError('Failed to fetch patient details for editing. ' + (err.response?.data?.message || err.message || ''));
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Format date for display in the date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse the date
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Format to YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingPatient || !editingPatient._id) {
      setError('Invalid patient ID. Please try again.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      console.log(`Updating patient with ID: ${editingPatient._id}`);
      
      // Simplified request - just the form data, no role information
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateAccount/${editingPatient._id}`,
        formData,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Update response:', response.data);
      setSuccessMessage(response.data.message || 'Patient information updated successfully!');
      
      // Refresh the patients list
      fetchPatients();
      
      // Close the edit form after a delay
      setTimeout(() => {
        setEditingPatient(null);
        setSuccessMessage('');
      }, 2000);
    } catch (err) {
      console.error('Error updating patient information:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update patient information');
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

  if (error && !patients.length) {
    return <div className="error-container">{error}</div>;
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
          {loading ? (
            <div className="loading-container">Loading patient data...</div>
          ) : (
            <form onSubmit={handleSubmit} className="edit-patient-form">
              <div className="patient-info-card">
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
                    value={formData.phoneNumber || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formatDateForInput(formData.dob)}
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
                    value={formData.email || ''}
                    readOnly
                    disabled
                    className="readonly-input"
                  />
                </div>
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
          )}
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
