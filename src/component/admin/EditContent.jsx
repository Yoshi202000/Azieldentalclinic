import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/EditContent.css';
import servicesImage from '../../uploads/services0.png'

const EditContent = () => {
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
    const [mainImg, setMainImg] = useState(null); // For storing the file
    const [mainImgPreview, setMainImgPreview] = useState(''); // For previewing the image
    const [gcashQR, setGcashQR] = useState(null);
    const [gcashQRPreview, setGcashQRPreview] = useState('');
    const [clinicLogo, setClinicLogo] = useState (null);
    const [clinicLogoPreview, setClinicLogoPreview] = useState ('');
    const [nameOnePhone, setNameOnePhone] = useState('null');
    const [nameTwoPhone, setNameTwoPhone] = useState('null');
    const[termsAndConditions, setTermsAndConditions] = useState('null');
    const[questionOne, setQuestionOne] = useState(null);
    const[questionTwo, setQuestionTwo] = useState(null);
    const[questionThree, setQuestionThree] = useState(null);
    const[questionFour, setQuestionFour] = useState(null);
    const[questionFive, setQuestionFive] = useState(null);
    const[questionSix, setQuestionSix] = useState(null);
    const[questionSeven, setQuestionSeven] = useState(null);
    const[questionEight, setQuestionEight] = useState(null);
    const[questionNine, setQuestionNine] = useState(null);
    const[questionTen, setQuestionTen] = useState(null);
    

  // Fetches existing clinic data from the backend when the component mounts
  // and initializes the state with the fetched data.
  useEffect(() => {
    // Fetch existing clinic data from the backend
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/clinic`)
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
            nameOnePhone,
            nameTwoPhone,
            termsAndConditions,
            questionOne,
            questionTwo,
            questionThree,
            questionFour,
            questionFive,
            questionSix,
            questionSeven,
            questionEight,
            questionNine,
            questionTen,
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
          setNameOnePhone(nameOnePhone || '');
          setNameTwoPhone(nameTwoPhone || '');
          setTermsAndConditions(termsAndConditions || '');
          setQuestionOne(questionOne || '');
          setQuestionTwo(questionTwo || '');
          setQuestionThree(questionThree || '');
          setQuestionFour(questionFour || '');
          setQuestionFive(questionFive || '');
          setQuestionSix(questionSix || '');
          setQuestionSeven(questionSeven || '');
          setQuestionEight(questionEight || '');
          setQuestionNine(questionNine || '');
          setQuestionTen(questionTen || '');
            
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
      axios.delete(`${import.meta.env.VITE_BACKEND_URL}/clinic/service/${serviceId}`)
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
        image: file, // Store the file temporarily
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
  
  const handlemainImgChange = (e) => {
    const file = e.target.files[0];
    setMainImg(file);

    // Preview the image
    const reader = new FileReader();
    reader.onload = () => {
      setMainImgPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleGcashQRChange = (e) => {
    const file = e.target.files[0];
    setGcashQR(file);
    
    // preview image
    const reader = new FileReader();
    reader.onload = () => {
      setGcashQRPreview(reader.result);
    }
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
    formData.append('nameOnePhone', nameOnePhone || '');
    formData.append('nameTwoPhone', nameTwoPhone || '');
    formData.append('termsAndConditions', termsAndConditions || '');
    formData.append('questionOne', questionOne || '');
    formData.append('questionTwo', questionTwo || '');
    formData.append('questionThree', questionThree || '');
    formData.append('questionFour', questionFour || '');
    formData.append('questionFive', questionFive || '');
    formData.append('questionSix', questionSix || '');
    formData.append('questionSeven', questionSeven || '');
    formData.append('questionEight', questionEight || '');
    formData.append('questionNine', questionNine || '');
    formData.append('questionTen', questionTen || '');



  
    // Append services to form data
    services.forEach((service, index) => {
      console.log(`Adding service to form data: Index ${index}`, service);
  
      formData.append(`service_name_${index}`, service.name || '');
      formData.append(`service_description_${index}`, service.description || '');
      formData.append(`service_clinic_${index}`, service.clinic || 'both');
  
      // Check if image was updated
      if (service.imageUpdated && !(typeof service.image === 'string')) {
        // Change the filename before appending
        const newFileName = `service_image_${index}.png`; // Change the filename as needed
        formData.append(`service_image_${index}`, service.image, newFileName); // Append new image with new filename
      } else if (!service.imageUpdated && typeof service.image === 'string') {
        // Use the existing image path
        formData.append(`service_image_${index}`, service.image); // Append existing image path
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

    if (mainImg) {
      console.log('Adding mainImg to form data');
      formData.append('mainImg', mainImg);
    } else {
      console.log('No mainImg provided');
    }

    if (gcashQR){
      console.log('Adding gcashQR to form data');
      formData.append('gcashQR', gcashQR);
    } else {
      console.log('no gcashQR provided');
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
      .put(`${import.meta.env.VITE_BACKEND_URL}/clinic`, formData, {
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
    <div  className='edit-content-container'>
      <h2>Edit Clinic Content</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Clinic Name One:
          <input
            type="text"
            className='form-control-plaintext'
            name="nameOne"
            value={nameOne}
            onChange={(e) => setNameOne(e.target.value)}
          />
        </label>
        <label>
          Clinic One PhoneNumber
          <input
            type="text"
            className='form-control-plaintext'
            name="nameOnePhone"
            value={nameOnePhone}
            onChange={(e) => setNameOnePhone(e.target.value)}
            />
        </label>
        <label>
          Clinic Name Two:
          <input
            className='form-control-plaintext'
            type="text"
            name="nameTwo"
            value={nameTwo}
            onChange={(e) => setNameTwo(e.target.value)}
          />
        </label>
        <label>
          Clinic Two PhoneNumber
          <input
            type="text"
            className='form-control-plaintext'
            name="nameTwoePhone"
            value={nameTwoPhone}
            onChange={(e) => setNameTwoPhone(e.target.value)}
            />
        </label>
        <label>
          Address:
          <input
            type="text"
            className='form-control-plaintext'
            name="clinicAddress"
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
          />
        </label>
        <label>
          Address Two:
          <input
            type="text"
            className='form-control-plaintext'
            name="clinicAddressTwo"
            value={clinicAddressTwo}
            onChange={(e) => setClinicAddressTwo(e.target.value)}
          />
        </label>
        <label>
          Terms and Conditions:
          <textarea
          class="form-control"  
            name="termsAndConditions"
            rows="5"
            cols="30"
            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
          ></textarea>
        </label>
        <label>
          Clinic Description:
          <textarea
          class="form-control"
            name="clinicDescription"
            rows="5"
            cols="30"
            value={clinicDescription}
            onChange={(e) => setClinicDescription(e.target.value)}
          ></textarea>
        </label>
        <label>
          Home Page Welcome Message:
          <textarea
          class="form-control"
            type="text"
            name="welcomeMessage"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
          ></textarea>
        </label>
        {/* <label>
          Clinic Description:
          <textarea
          class="form-control"
            name="clinicDescription"
            rows="5"
            cols="30"
            value={clinicDescription}
            onChange={(e) => setClinicDescription(e.target.value)}
          ></textarea>
        </label> */}
        <label>
          Clinic Catch Line:
          <input
                      className='form-control-plaintext'

            type="text"
            name="clinicCatchLine"
            value={clinicCatchLine}
            onChange={(e) => setClinicCatchLine(e.target.value)}
          />
        </label>
        <label>
          Login Message:
          <input
                      className='form-control-plaintext'

            type="text"
            name="loginMessage"
            value={loginMessage}
            onChange={(e) => setLoginMessage(e.target.value)}
          />
        </label>
        <label>
          Login Description:
          <input
                      className='form-control-plaintext'

            type="text"
            name="LoginDescription"
            value={loginDescription}
            onChange={(e) => setLoginDescription(e.target.value)}
          />
        </label>
        <label>
          Signup Message:
          <input
                      className='form-control-plaintext'

            type="text"
            name="signupMessage"
            value={signupMessage}
            onChange={(e) => setSignupMessage(e.target.value)}
          />
        </label>
        <label>
          Signup Description:
          <input
                      className='form-control-plaintext'

            type="text"
            name="SignupDescription"
            value={signupDescription}
            onChange={(e) => setSignupDescription(e.target.value)}
          />
        </label>
        <label>
          Clinic Header:
          <input
                      className='form-control-plaintext'

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
    name="responsiveBg" // Must match the expected field name
    accept="image/png, image/jpeg, image/jpg"
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

<div>
  <label htmlFor="mainImg">Main Small Image:</label>
  <input
    type="file"
    id="mainImg"
    name="mainImg" // Must match the expected field name
    accept="image/png, image/jpeg, image/jpg"
    onChange={handlemainImgChange}
  />
  {mainImgPreview && (
    <div>
      <p>Preview:</p>
      <img
        src={mainImgPreview}
        alt="mainImg preview"
        style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
      />
    </div>
  )}
</div>

<div>
  <label htmlFor="gcashQR">Gcash QR Code:</label>
  <input
    type="file"
    id="gcashQR"
    name="gcashQR" // Must match the expected field name
    accept="image/png, image/jpeg, image/jpg"
    onChange={handleGcashQRChange}
  />
  {gcashQRPreview && (
    <div>
      <p>Preview:</p>
      <img
        src={gcashQRPreview}
        alt="Gcash QR Code Preview"
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
                            className='form-control-plaintext'
                  type="text"
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                />
              </label>
              <label>
                Service Description:
                <textarea
                class="form-control"
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                ></textarea>
              </label>
              <label>
                Clinic:
                <select
                  class="form-select"
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
                class="form-control"
                  type="file"
                  onChange={(e) => handleServiceImageChange(index, e.target.files[0])}
                  style={{ flex: '1' }}
                />
                {/* Display existing image if available */}
                {service.image && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                      class="img-thumbnail"
                      src={service.image ? `src${service.image}` : servicesImage}
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
                      class="btn btn-primary btn-sm"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>
            </label>

              <button
                type="button" class="btn btn-primary btn-sm"
                onClick={() => removeService(index, service._id)}
              >
                Remove Service
              </button>
            </div>
            
          ))}
          <button type="button" class="btn btn-primary btn-sm" onClick={addService}>
            Add Service
          </button>
        </div>
        <label>
  Question 1: Health Record Question 1
  <input
    type="text"
    name="questionOne"
    value={questionOne}
    onChange={(e) => setQuestionOne(e.target.value)}
  />
</label>

<label>
  Question 2: Health Record Question 2
  <input
    type="text"
    name="questionTwo"
    value={questionTwo}
    onChange={(e) => setQuestionTwo(e.target.value)}
  />
</label>

<label>
  Question 3: Health Record Question 3
  <input
    type="text"
    name="questionThree"
    value={questionThree}
    onChange={(e) => setQuestionThree(e.target.value)}
  />
</label>

<label>
  Question 4: Health Record Question 4
  <input
    type="text"
    name="questionFour"
    value={questionFour}
    onChange={(e) => setQuestionFour(e.target.value)}
  />
</label>

<label>
  Question 5: Health Record Question 5
  <input
    type="text"
    name="questionFive"
    value={questionFive}
    onChange={(e) => setQuestionFive(e.target.value)}
  />
</label>

<label>
  Question 6: Health Record Question 6
  <input
    type="text"
    name="questionSix"
    value={questionSix}
    onChange={(e) => setQuestionSix(e.target.value)}
  />
</label>

<label>
  Question 7: Health Record Question 7
  <input
    type="text"
    name="questionSeven"
    value={questionSeven}
    onChange={(e) => setQuestionSeven(e.target.value)}
  />
</label>

<label>
  Question 8: Health Record Question 8
  <input
    type="text"
    name="questionEight"
    value={questionEight}
    onChange={(e) => setQuestionEight(e.target.value)}
  />
</label>

<label>
  Question 9: Health Record Question 9
  <input
    type="text"
    name="questionNine"
    value={questionNine}
    onChange={(e) => setQuestionNine(e.target.value)}
  />
</label>

<label>
  Question 10: Health Record Question 10
  <input
    type="text"
    name="questionTen"
    value={questionTen}
    onChange={(e) => setQuestionTen(e.target.value)}
  />
</label>

        <input type="submit" value="Update" />
      </form>
    </div>
  );
};

export default EditContent;
