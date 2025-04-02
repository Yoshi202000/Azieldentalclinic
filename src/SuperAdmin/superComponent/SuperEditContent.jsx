import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/EditContent.css';
import servicesImage from '../../uploads/services0.png';

const SuperEditContent = () => {
    const [nameOne, setNameOne] = useState('');
    const [nameTwo, setNameTwo] = useState('');
    const [clinicDescription, setClinicDescription] = useState('');
    const [services, setServices] = useState([]);
    const [clinicAddress, setClinicAddress] = useState('');
    const [clinicAddressTwo, setClinicAddressTwo] = useState('');
    const [clinicCatchLine, setClinicCatchLine] = useState('');
    const [clinicHeader, setClinicHeader] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [loginDescription, setLoginDescription] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [signupMessage, setSignupMessage] = useState('');
    const [signupDescription, setSignupDescription] = useState('');
    const [responsiveBg, setResponsiveBg] = useState(null); // For storing the file
    const [responsiveBgPreview, setResponsiveBgPreview] = useState(''); // For previewing the image
    const [clinicLogo, setClinicLogo] = useState (null);
    const [clinicLogoPreview, setClinicLogoPreview] = useState ('');
    

  // Fetches existing clinic data from the backend when the component mounts
  // and initializes the state with the fetched data.
  useEffect(() => {
    // Fetch existing clinic data from the backend
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`)
      .then(response => {
        if (response.data) {
          const {
            nameOne,
            nameTwo,
            description,
            services: fetchedServices,
            address,
            addressTwo,
            clinicCatchLine,
            clinicHeader,
            loginMessage,
            loginDescription,
            welcomeMessage,
            signupMessage,
            signupDescription,
          } = response.data;
  
          console.log('Fetched Clinic Data:', response.data);
          setNameOne(nameOne || '');
          setNameTwo(nameTwo || '');
          setClinicDescription(description || '');
          setClinicAddress(address || '');
          setClinicAddressTwo(addressTwo || '');
          setClinicCatchLine(clinicCatchLine || '');
          setClinicHeader(clinicHeader || '');
          setLoginMessage(loginMessage || '');
          setLoginDescription(loginDescription || '');
          setWelcomeMessage(welcomeMessage || '');
          setSignupMessage(signupMessage || '');
          setSignupDescription(signupDescription || '');
  
          // Set services with default "both" for clinic
          setServices(
            (fetchedServices || []).map((service, index) => ({
              ...service,
              image: service.image || `../../uploads/services${index}.png`, // Use relative path for the image
              imageUpdated: false, // Track whether the image has been updated
              clinic: service.clinic || 'both',
            }))
          );          
        }
      })
      .catch(error => {
        console.error('Error fetching clinic data:', error);
      });
  }, []);
  
  

  // Adds a new service to the services array with default values for name, description, image, and clinic.
  const addService = () => {
    setServices(prev => [...prev, { name: '', description: '', image: null, clinic: 'both' }]);
  };

  // Removes a service from the services array by its index.
  // If the service has an ID, it attempts to delete the service from the backend as well.
  const removeService = (index, serviceId) => {
    console.log(`Removing service at index ${index}, Service ID: ${serviceId || 'No ID'}`);

    // Optimistically update the UI
    const serviceToRemove = services[index];
    setServices(prev => prev.filter((_, i) => i !== index));

    if (serviceId) {
      axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/clinic/service/${serviceId}`)
        .then(() => {
          console.log(`Service with ID: ${serviceId} removed successfully`);
        })
        .catch(error => {
          console.error('Error removing service:', error.response?.data?.message || error.message);
          // Revert the optimistic update on failure
          setServices(prev => {
            const updatedServices = [...prev];
            updatedServices.splice(index, 0, serviceToRemove);
            return updatedServices;
          });
        });
    }
  };

  // Updates a specific field (e.g., name, description, or clinic) of a service at a given index.
  const handleServiceChange = (index, field, value) => {
    setServices(prev => {
      const updatedServices = [...prev];
      updatedServices[index][field] = value;
      return updatedServices;
    });
  };

  // Updates the image of a specific service at a given index in the services array.
  const handleServiceImageChange = (index, file) => {
    console.log(`Updating image for service at index ${index}`);
    setServices((prevServices) => {
      if (index < 0 || index >= prevServices.length) {
        console.error(`Invalid index ${index} for services array`);
        return prevServices;
      }
  
      const updatedServices = [...prevServices];
      updatedServices[index] = {
        ...updatedServices[index],
        image: file,
        imageUpdated: true, // Mark image as updated
      };
  
      return updatedServices;
    });
  };   

  // Function to handle responsiveBg file selection
  const handleResponsiveBgChange = (e) => {
    const file = e.target.files[0];
    setResponsiveBg(file);

    // Preview the image
    const reader = new FileReader();
    reader.onload = () => {
      setResponsiveBgPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleClinicImageChange = (e) => {
    const file = e.target.files[0];
    setClinicLogo(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setClinicLogoPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  }

  // Handles form submission by sending clinic data to the backend.
  // Prepares and sends a FormData object containing clinic and service information.
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data');
    const formData = new FormData();
  
    // Append required fields
    formData.append('nameOne', nameOne || '');
    formData.append('nameTwo', nameTwo || '');
    formData.append('description', clinicDescription || '');
  
    // Append optional fields
    formData.append('address', clinicAddress || '');
    formData.append('addressTwo', clinicAddressTwo || '');
    formData.append('clinicCatchLine', clinicCatchLine || '');
    formData.append('clinicHeader', clinicHeader || '');
    formData.append('loginMessage', loginMessage || '');
    formData.append('loginDescription', loginDescription || '');
    formData.append('welcomeMessage', welcomeMessage || '');
    formData.append('signupMessage', signupMessage || '');
    formData.append('signupDescription', signupDescription || '');
  
    // Append services to form data
    services.forEach((service, index) => {
      console.log(`Adding service to form data: Index ${index}`, service);
  
      formData.append(`service_name_${index}`, service.name || '');
      formData.append(`service_description_${index}`, service.description || '');
      formData.append(`service_clinic_${index}`, service.clinic || 'both');
  
      // Check if image was updated
      if (service.imageUpdated && !(typeof service.image === 'string')) {
        // Append new image if updated
        formData.append(`service_image_${index}`, service.image);
      } else if (!service.imageUpdated && typeof service.image === 'string') {
        // Send a flag to preserve the existing image
        formData.append(`service_keep_existing_image_${index}`, 'true');
      } else {
        console.log(`No image provided for service at index ${index}`);
      }
    });
  
    // Append responsiveBg to form data
    if (responsiveBg) {
      console.log('Adding responsiveBg to form data');
      formData.append('responsiveBg', responsiveBg);
    } else {
      console.log('No responsiveBg provided');
    }

    // Append clinicLogo to form data
    if (clinicLogo) {
      console.log('Adding clinicLogo to form data');
      formData.append('clinicLogo', clinicLogo);
    } else {
      console.log('No clinicLogo provided');
    }
  
    // Log the form data for debugging
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    axios
      .put(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => {
        console.log('Clinic data saved successfully:', response.data);
      })
      .catch((error) => {
        console.error('Error saving clinic data:', error.response || error.message);
      });
  };
  
  
  

  return (
    <div className="editContentContainer">
      <h2>Edit Clinic Content</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Clinic Name One:
          <input
            type="text"
            name="nameOne"
            value={nameOne}
            onChange={(e) => setNameOne(e.target.value)}
          />
        </label>
        <label>
          Clinic Name Two:
          <input
            type="text"
            name="nameTwo"
            value={nameTwo}
            onChange={(e) => setNameTwo(e.target.value)}
          />
        </label>
        <label>
          Address:
          <input
            type="text"
            name="clinicAddress"
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
          />
        </label>
        <label>
          Address Two:
          <input
            type="text"
            name="clinicAddressTwo"
            value={clinicAddressTwo}
            onChange={(e) => setClinicAddressTwo(e.target.value)}
          />
        </label>
        <label>
          Clinic Description:
          <textarea
            name="clinicDescription"
            rows="5"
            cols="30"
            value={clinicDescription}
            onChange={(e) => setClinicDescription(e.target.value)}
          ></textarea>
        </label>
        <label>
          Clinic Catch Line:
          <input
            type="text"
            name="clinicCatchLine"
            value={clinicCatchLine}
            onChange={(e) => setClinicCatchLine(e.target.value)}
          />
        </label>
        <label>
          Clinic Header:
          <input
            type="text"
            name="clinicHeader"
            value={clinicHeader}
            onChange={(e) => setClinicHeader(e.target.value)}
          />
        </label>
        <div>
          <label htmlFor="clinicLogo">Clinic Logo</label>
          <input type="file"
          id='clinicLogo'
          name='clinicLogo'
          accept='image/png'
          onChange={handleClinicImageChange} 
          />
          {clinicLogoPreview && (
            <div>
              <p>preview: </p>
              <img src={clinicLogoPreview}
               alt="clinic Logo Preview"
               style={{width: '100%', maxWidth: '300px', height: 'auto'}} 
               />
            </div>
          )}
        </div>
        <div>
  <label htmlFor="responsiveBg">Responsive Background:</label>
  <input
  type="file"
  id="responsiveBg"
  name="responsiveBg" // This must match the expected field name
  accept="image/png"
  onChange={handleResponsiveBgChange}
/>
  {responsiveBgPreview && (
    <div>
      <p>Preview:</p>
      <img
        src={responsiveBgPreview}
        alt="Responsive Background Preview"
        style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
      />
    </div>
  )}
</div>
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
                ></textarea>
              </label>
              <label>
                Clinic:
                <select
                  value={service.clinic}
                  onChange={(e) => handleServiceChange(index, 'clinic', e.target.value)}
                >
                  <option value="both">Both</option>
                  <option value="clinicOne">{nameOne}</option>
                  <option value="clinicTwo">{nameTwo}</option>
                </select>
              </label>
              <label>
              Service Image:
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Input for file upload */}
                <input
                  type="file"
                  onChange={(e) => handleServiceImageChange(index, e.target.files[0])}
                  style={{ flex: '1' }}
                />
                {/* Display existing image if available */}
                {service.image && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <img
                    src={
                      typeof service.image === 'string'
                        ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')}/api/${service.image.replace(/^\/+/, '')}`
                        : service.image instanceof File
                        ? URL.createObjectURL(service.image)
                        : servicesImage
                    }
                    alt={`Service ${index + 1}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />

                    <button
                      type="button"
                      onClick={() => {
                        // Clear the existing image in the state
                        handleServiceChange(index, 'image', null);
                        handleServiceChange(index, 'imageUpdated', true); // Mark as updated
                      }}
                      style={{
                        marginTop: '5px',
                        padding: '5px',
                        backgroundColor: '#ff4d4d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            </label>

              <button
                type="button"
                onClick={() => removeService(index, service._id)}
              >
                Remove Service
              </button>
            </div>
          ))}
          <button type="button" onClick={addService}>
            Add Service
          </button>
        </div>

        <input type="submit" value="Update" />
      </form>
      <button>Cancel</button>
    </div>
  );
};

export default SuperEditContent;
