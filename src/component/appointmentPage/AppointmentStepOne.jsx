import React from 'react';
import Card from '../Card';

const AppointmentStepOne = ({ 
  selectedCard, 
  handleCardSelect, 
  formData, 
  handleInputChange,
  services, // Services passed from Appointment component
  doctors
}) => {
  // Add this function to filter services based on selected doctor
  const getFilteredServices = () => {
    if (!formData.selectedDoctor) return services;
    
    const selectedDoctor = doctors.find(doctor => doctor.email === formData.selectedDoctor);
    return services.filter(service => 
      selectedDoctor?.services.some(doctorService => doctorService.name === service.name)
    );
  };

  // Add this function to filter doctors based on selected service
  const getFilteredDoctors = () => {
    if (!selectedCard) return doctors;
    
    return doctors.filter(doctor =>
      doctor.services.some(service => service.name === selectedCard)
    );
  };

  return (
    <div className="appointment-type">
      <h2>Schedule Your Appointment</h2>
      
      {/* Clinic Selection */}
      <h2>Choose Your Clinic</h2>
      <select 
        name="bookedClinic" 
        value={formData.bookedClinic} 
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Choose your clinic</option>
        <option value="Aziel Dental Clinic">Aziel Dental Clinic</option>
        <option value="Arts of Millennials Dental Clinic">Arts of Millennials Dental Clinic</option>
      </select>

      {/* Doctor Selection */}
      <h2>Choose Your Doctor</h2>
      <select
        name="selectedDoctor"
        value={formData.selectedDoctor || ''}
        onChange={(e) => {
          handleInputChange(e);
          // Reset service selection if doctor changes
          if (selectedCard) {
            handleCardSelect(null);
          }
        }}
        required
      >
        <option value="" disabled>Select a doctor</option>
        {getFilteredDoctors().map((doctor) => (
          <option key={doctor._id} value={doctor.email}>
            Dr. {doctor.firstName} {doctor.lastName}
          </option>
        ))}
      </select>

      {/* Services Selection */}
      <h2>Choose Your Service</h2>
      <div className="app-card-container">
        {getFilteredServices().map((service, index) => (
          <label key={index}>
            <Card
              name={service.name}
              description={service.description}
              image={service.image ? `data:image/png;base64,${service.image}` : null}
              isSelected={selectedCard === service.name}
              onClick={() => {
                handleCardSelect(service.name);
                // Reset doctor selection if service changes and doctor doesn't offer this service
                if (formData.selectedDoctor) {
                  const currentDoctor = doctors.find(doc => doc.email === formData.selectedDoctor);
                  if (!currentDoctor.services.some(s => s.name === service.name)) {
                    handleInputChange({ target: { name: 'selectedDoctor', value: '' } });
                  }
                }
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default AppointmentStepOne;
