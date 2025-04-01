import React, { useEffect, useState } from 'react';
import Card from '../Card';

const AppointmentStepOne = ({ 
  handleClinicSelect, 
  formData, 
  handleInputChange,
  services, 
  doctors,
  nameOne,
  nameTwo
}) => {
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  
  // Filter doctors based on selected clinic
  useEffect(() => {
    if (formData.bookedClinic) {
      const filtered = doctors.filter(doctor =>
        doctor.clinic === formData.bookedClinic
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
        doctorService === service.name
      )
    );
  };

  // Get available services based on the selected doctor
  const availableServices = getFilteredServices();

  // Calculate required slots based on selected services
  const calculateRequiredSlots = (services) => {
    // Default is 1 slot per service
    return services.length > 0 ? services.length : 1;
  };

  // Handle service selection (multiple)
  const handleServiceSelect = (serviceName) => {
    setSelectedServices(prev => {
      // If already selected, remove it
      if (prev.includes(serviceName)) {
        const updated = prev.filter(name => name !== serviceName);
        
        // Calculate required slots
        const requiredSlots = calculateRequiredSlots(updated);
        
        // Update form data with the selected services and slots
        handleInputChange({ 
          target: { 
            name: "selectedServices", 
            value: updated 
          } 
        });
        
        handleInputChange({ 
          target: { 
            name: "requiredSlots", 
            value: requiredSlots 
          } 
        });
        
        // Update appointmentType as an array
        handleInputChange({
          target: {
            name: "appointmentType",
            value: updated
          }
        });
        
        return updated;
      } 
      // Otherwise add it
      else {
        const updated = [...prev, serviceName];
        
        // Calculate required slots
        const requiredSlots = calculateRequiredSlots(updated);
        
        // Update form data with the selected services and slots
        handleInputChange({ 
          target: { 
            name: "selectedServices", 
            value: updated 
          } 
        });
        
        handleInputChange({ 
          target: { 
            name: "requiredSlots", 
            value: requiredSlots 
          } 
        });
        
        // Update appointmentType as an array
        handleInputChange({
          target: {
            name: "appointmentType",
            value: updated
          }
        });
        
        return updated;
      }
    });
  };

  // Initialize selectedServices from formData if it exists
  useEffect(() => {
    if (formData.selectedServices && Array.isArray(formData.selectedServices)) {
      setSelectedServices(formData.selectedServices);
      
      // Also update the required slots
      const requiredSlots = calculateRequiredSlots(formData.selectedServices);
      handleInputChange({ 
        target: { 
          name: "requiredSlots", 
          value: requiredSlots 
        } 
      });
    }
  }, [formData.selectedServices]);

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
          handleInputChange(e);
          handleClinicSelect(selectedClinic);
        }}
        required
      >
        <option value="" disabled>Choose your clinic</option>
        <option value={nameOne}>{nameOne}</option>
        <option value={nameTwo}>{nameTwo}</option>
      </select>
      {/* Doctor Selection */}
      <h4>Choose Your Doctor</h4>
      <div className="app-card-container">
        {filteredDoctors.map((doctor) => (
          <Card
            key={doctor._id}
            name={`Dr. ${doctor.firstName} ${doctor.lastName}`}
            description={doctor.specialization}
            image={
              doctor.doctorImage
                ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api/${doctor.doctorImage.replace(/^\/+/, '')}`
                : null
            }            isSelected={formData.selectedDoctor === doctor.email}
            onClick={() => {
              if (formData.bookedClinic) {
                handleInputChange({ target: { name: "selectedDoctor", value: doctor.email } });
                // Reset selected services when doctor changes
                setSelectedServices([]);
                handleInputChange({ target: { name: "selectedServices", value: [] } });
                handleInputChange({ target: { name: "requiredSlots", value: 0 } });
              }
            }}
          />
        ))}
      </div>
      {/* Services Selection (Multiple) */}
      {formData.selectedDoctor && (
        <>
          <h3>Choose Your Service(s)</h3>
          <p className="text-muted">You can select multiple services</p>
          <div className="app-card-container">
            {availableServices.map((service, index) => (
              <label key={index}>
                <Card
                  name={service.name}
                  description={service.description}
                  image={
                    service.image
                      ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api/${service.image.replace(/^\/+/, '')}`
                      : null
                  }                                    isSelected={selectedServices.includes(service.name)}
                  onClick={() => handleServiceSelect(service.name)}
                  fee={service.fee}
                />
              </label>
            ))}
          </div>
          {selectedServices.length > 0 && (
            <div className="selected-services mt-3">
              <h4>Selected Services:</h4>
              <ul className="list-group">
                {selectedServices.map((serviceName, idx) => {
                  const service = availableServices.find(s => s.name === serviceName);
                  return (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      {serviceName}
                      {service?.fee && <span className="badge bg-primary rounded-pill">₱{service.fee}</span>}
                    </li>
                  );
                })}
              </ul>
              
              <div className="mt-3 alert alert-info">
                <strong>Time Slots Required:</strong> {formData.requiredSlots || selectedServices.length}
                <p className="small mb-0">Each service requires one time slot</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentStepOne;
