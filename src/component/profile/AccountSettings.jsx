// AccountSettings.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';



const AccountSettings = () => {
 
  return (
    <div>
      <h1>Account Settings</h1>
      <p>Name: John Doe</p>
      <p>Email: johndoe@example.com</p>
      <p>Phone: 123-456-7890</p>
      <button>Edit Profile</button>
    </div>
  );
};

export default AccountSettings;
