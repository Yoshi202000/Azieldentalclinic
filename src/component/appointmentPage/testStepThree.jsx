import React, { useState } from 'react';
import AppointmentStepThree from './AppointmentStepThree';

const ParentComponent = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    phoneNumber: '',
    email: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  return (
    <AppointmentStepThree
      formData={formData}
      handleInputChange={handleInputChange}
    />
  );
};

export default ParentComponent;
