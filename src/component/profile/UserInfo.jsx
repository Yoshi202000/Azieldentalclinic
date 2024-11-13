import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserInfo() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/updateAccount`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user info:', err);
      setError('Failed to fetch user information');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading user information...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return null;

  return (
    <div className="user-info">
      <h2>User Information</h2>
      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phoneNumber}</p>
      <p><strong>Date of Birth:</strong> {user.dob}</p>
    </div>
  );
}

export default UserInfo;
