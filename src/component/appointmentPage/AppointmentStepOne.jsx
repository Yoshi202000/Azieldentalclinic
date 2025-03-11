  import React, { useEffect, useState } from 'react';
  import Card from '../Card';

  const AppointmentStepOne = ({ 
    selectedCard, 
    handleCardSelect, 
    handleClinicSelect, 
    formData, 
    handleInputChange,
    services, 
    doctors,
    nameOne,
    nameTwo
  }) => {
    const [filteredDoctors, setFilteredDoctors] = useState([]);


    
    // Filter doctors based on selected clinic
    useEffect(() => {
      if (formData.bookedClinic) {
        const filtered = doctors.filter(doctor =>
          doctor.clinic === formData.bookedClinic // Assuming doctor has a clinic property
        );
        setFilteredDoctors(filtered);
      } else {
        setFilteredDoctors([]);
      }
    }, [formData.bookedClinic, doctors]);

    // Function to get filtered services based on selected doctor
    const getFilteredServices = () => {
      if (!formData.selectedDoctor) return [];

      const selectedDoctor = doctors.find(doctor => doctor.email === formData.selectedDoctor);
      
      // If no doctor is found or doctor has no services defined, return all services
      if (!selectedDoctor || !selectedDoctor.services) {
        return services;
      }

      // Filter services based on doctor's services
      return services.filter(service => 
        selectedDoctor.services.some(doctorService => 
          doctorService.name === service.name || 
          doctorService === service.name // Handle case where doctor's service might be just the name
        )
      );
    };

    // Get available services based on the selected doctor
    const availableServices = getFilteredServices();

    return (
      <div className="appointment-type">
        <h2>Schedule Your Appointment</h2>
        
        {/* Clinic Selection */}
        <h4>Choose Your Clinic</h4>
        <select 
          name="bookedClinic" 
          className="form-select form-select-lg mb-3"
          value={formData.bookedClinic} 
          onChange={(e) => {
            const selectedClinic = e.target.value;
            handleInputChange(e); // Call the existing input change handler
            handleClinicSelect(selectedClinic);
          }}
          required
        >
          <option value=""  disabled>Choose your clinic</option>
          <option value={nameOne}>{nameOne}</option>
          <option value={nameTwo}>{nameTwo}</option>
        </select>

        {/* Doctor Selection */}
        <h4>Choose Your Doctor</h4>
        <select
          name="selectedDoctor"
          className="form-select form-select-lg mb-3"
          value={formData.selectedDoctor || ''}
          onChange={(e) => {
            handleInputChange(e);
            // Reset service selection if doctor changes
            if (selectedCard) {
              handleCardSelect(null);
            }
          }}
          required
          disabled={!formData.bookedClinic} // Disable if no clinic is selected
        >
          <option value="" disabled>Select a doctor</option>
          {filteredDoctors.map((doctor) => (
            <option key={doctor._id} value={doctor.email}>
              Dr. {doctor.firstName} {doctor.lastName}
            </option>
          ))}
        </select>

        {/* Services Selection */}
        {formData.selectedDoctor && ( // Only show services if a doctor is selected
          <>
            <h3>Choose Your Service</h3>
            <div className="app-card-container">
              {availableServices.map((service, index) => (
                <label key={index}>
                  <Card
                    name={service.name}
                    description={service.description}
                    image={service.image ? `${import.meta.env.VITE_BACKEND_URL}${service.image}` : null}
                    isSelected={selectedCard === service.name}
                    onClick={() => {
                      handleCardSelect(service.name);
                    }}
                    fee={service.fee}
                  />
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  export default AppointmentStepOne;
