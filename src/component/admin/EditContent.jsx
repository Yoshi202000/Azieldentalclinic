import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/EditContent.css';

const EditContent = () => {
  const [clinicName, setClinicName] = useState('');
  const [clinicDescription, setClinicDescription] = useState('');
  const [services, setServices] = useState([{ name: '', description: '', image: null }]);

  useEffect(() => {
    // Fetch existing clinic data from the backend
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`)
      .then(response => {
        if (response.data) {
          const { name, description, services } = response.data;
          console.log('Fetched Clinic Data:', response.data);
          setClinicName(name);
          setClinicDescription(description);
          setServices(services.length > 0 ? services : [{ name: '', description: '', image: null }]);
        }
      })
      .catch(error => {
        console.error('Error fetching clinic data:', error);
      });
  }, []);

  const addService = () => {
    console.log('Adding new service input');
    setServices([...services, { name: '', description: '', image: null }]);
  };

  const removeService = (index, serviceId) => {
    console.log(`Removing service at index ${index}, Service ID: ${serviceId || 'No ID'}`);
    if (serviceId) {
      axios.delete(`${import.meta.env.VITE_BACKEND_URL}/clinic/service/${serviceId}`)
        .then(() => {
          console.log(`Service with ID: ${serviceId} removed successfully`);
          setServices(services.filter((_, i) => i !== index));
        })
        .catch(error => {
          console.error('Error removing service:', error);
        });
    } else {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const handleServiceChange = (index, field, value) => {
    console.log(`Updating service at index ${index}, Field: ${field}, Value: ${value}`);
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const handleServiceImageChange = (index, file) => {
    console.log(`Updating image for service at index ${index}`);
    const newServices = [...services];
    newServices[index].image = file;
    setServices(newServices);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data');
    const formData = new FormData();
    formData.append('name', clinicName);
    formData.append('description', clinicDescription);
  
    services.forEach((service, index) => {
      console.log(`Adding service to form data: Index ${index}`, service);
      formData.append(`service_name_${index}`, service.name);
      formData.append(`service_description_${index}`, service.description);
      
      if (service.image && !(typeof service.image === 'string')) {
        formData.append(`service_image_${index}`, service.image);
      }
    });
  
    axios.put(`${import.meta.env.VITE_BACKEND_URL}/clinic`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        console.log('Clinic data saved successfully:', response.data);
      })
      .catch(error => {
        console.error('Error saving clinic data:', error);
      });
  };
  
  

  return (
    <div className="editContentContainer">
      <h2>Edit Clinic Content</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Clinic Name:
          <input type="text" name="clinicName" value={clinicName} onChange={(e) => {
            console.log('Updating clinic name:', e.target.value);
            setClinicName(e.target.value);
          }} />
        </label>
        <label>
          Clinic Description:
          <textarea name="clinicDescription" rows="5" cols="30" value={clinicDescription} onChange={(e) => {
            console.log('Updating clinic description:', e.target.value);
            setClinicDescription(e.target.value);
          }}></textarea>
        </label>

        <div className="servicesSection">
          <h3>Clinic Services</h3>
          {services.map((service, index) => (
            <div key={index} className="serviceInput">
              <label>
                Clinic Service {index + 1}:
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                />
              </label>
              <label>
                Service Description:
                <textarea
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                  rows="3"
                  cols="30"
                ></textarea>
              </label>
              <label>
                Service Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleServiceImageChange(index, e.target.files[0])}
                />
              </label>
              <button type="button" onClick={() => removeService(index, service._id)}>
                Remove Service
              </button>
            </div>
          ))}
          <button type="button" onClick={addService}>Add Service</button>
        </div>

        <input type="submit" value="Submit" />
      </form>
      <button>Cancel</button>
    </div>
  );
};

export default EditContent;
