import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/EditContent.css';

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
    const [medicines, setMedicines] = useState([]);
    const [faqs, setFaqs] = useState([]); // For storing FAQ items
    const [editedService, setEditedService] = useState({
      name: '',
      description: '',
      image: '',
      clinic: 'both',
      fees: [],
      duration: '',
      servicesSlot: 1 // Default to 1 slot
    });
    
    // Initialize medicine with default values
    const defaultMedicine = {
      medicineName: '',
      medicineAmount: 0,
      medicineDescription: '',
      discountApplicable: false,
      fees: [{
        feeType: 'Default',
        amount: 0,
        description: ''
      }]
    };

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
            medicines: fetchedMedicines,
            faqs: fetchedFaqs,
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
            
          // Set services with proper image and fees handling
          setServices(
            (fetchedServices || []).map(service => {
              return {
                ...service,
                image: service.image || null,
                imageUpdated: false,
                clinic: service.clinic || 'both',
                fees: service.fees || [{ feeType: 'Default', amount: 0, description: '' }]
              };
            })
          );          
          
          // Set medicines with proper fee handling
          setMedicines(
            (fetchedMedicines || []).map(medicine => ({
              ...medicine,
              fees: medicine.fees || [{ ...defaultMedicine.fees[0] }]
            }))
          );
          
          // Set FAQs
          setFaqs(fetchedFaqs || []);
        }
      })
      .catch(error => {
        console.error('Error fetching clinic data:', error);
      });
  }, []);
  
  

  // Adds a new service to the services array with default values for name, description, image, and clinic.
  const addService = () => {
    setServices(prev => [...prev, {
      name: '',
      description: '',
      image: '',
      clinic: 'both',
      fees: [],
      duration: '',
      servicesSlot: 1
    }]);
  };

  // Removes a service from the services array by its index.
  // If the service has an ID, it attempts to delete the service from the backend as well.
  const removeService = (serviceIndex, serviceId) => {
    if (serviceId) {
      // If the service has an ID, delete it from the backend
      const token = localStorage.getItem('token');
      axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/services/${serviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setServices(prev => prev.filter((_, index) => index !== serviceIndex));
      })
      .catch(error => {
        console.error('Error deleting service:', error);
      });
    } else {
      // If the service doesn't have an ID, just remove it from the state
      setServices(prev => prev.filter((_, index) => index !== serviceIndex));
    }
  };

  // Updates a specific field (e.g., name, description, or clinic) of a service at a given index.
  const handleServiceChange = (serviceIndex, field, value) => {
    setServices(prev => {
      const updatedServices = [...prev];
      updatedServices[serviceIndex] = {
        ...updatedServices[serviceIndex],
        [field]: value
      };
      return updatedServices;
    });
  };

  // Modify the handleServiceImageUpload function to use the correct endpoint
  const handleServiceImageUpload = async (index, file) => {
    if (!file) {
      console.log('No file selected for service image upload');
      return;
    }

    try {
      console.log(`Uploading image for service at index ${index}, ID: ${services[index]._id}`);
      const formData = new FormData();
      formData.append('serviceImage', file);

      // Log the file being uploaded
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Update the endpoint URL to match your backend route structure
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/clinic/service-image/${services[index]._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Upload response:', response.data);

      if (response.data.path) {
        setServices(prev => {
          const updatedServices = [...prev];
          updatedServices[index] = {
            ...updatedServices[index],
            image: response.data.path,
            imagePreview: `${import.meta.env.VITE_BACKEND_URL}${response.data.path}`
          };
          return updatedServices;
        });
      }
    } catch (error) {
      console.error('Error uploading service image:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Error uploading service image: ' + (error.response?.data?.message || error.message));
    }
  };

  // Modify the existing handleServiceImageChange function to preserve the original image path
  const handleServiceImageChange = async (index, file) => {
    if (!file) {
      console.log('No file provided');
      return;
    }

    console.log(`Changing image for service at index ${index}`, file);
    
    // Create a preview immediately
    const previewUrl = URL.createObjectURL(file);
    
    // Store the original image path before updating
    const originalImage = services[index].image;
    
    setServices(prevServices => {
      const updatedServices = [...prevServices];
      updatedServices[index] = {
        ...updatedServices[index],
        originalImage: originalImage, // Store the original image path
        image: file,
        imagePreview: previewUrl,
        imageUpdated: true
      };
      return updatedServices;
    });

    // If the service has an ID, upload the image immediately
    if (services[index]._id) {
      console.log(`Service has ID ${services[index]._id}, uploading immediately`);
      try {
        await handleServiceImageUpload(index, file);
      } catch (error) {
        // If upload fails, revert to the original image
        setServices(prevServices => {
          const updatedServices = [...prevServices];
          updatedServices[index] = {
            ...updatedServices[index],
            image: originalImage,
            imagePreview: null,
            imageUpdated: false
          };
          return updatedServices;
        });
        
        // Clean up the preview URL
        URL.revokeObjectURL(previewUrl);
        
        // Re-throw the error to be handled by the caller
        throw error;
      }
    } else {
      console.log('New service without ID, image will be uploaded on form submission');
    }
  };

  
  // Function to handle responsiveBg file selection
  const handleResponsiveBgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResponsiveBg(file);
      setResponsiveBgPreview(URL.createObjectURL(file));
    }
  };
  
  const handlemainImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImg(file);
      setMainImgPreview(URL.createObjectURL(file));
    }
  };

  const handleGcashQRChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGcashQR(file);
      setGcashQRPreview(URL.createObjectURL(file));
    }
  };

  const handleClinicImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setClinicLogo(file);
      setClinicLogoPreview(URL.createObjectURL(file));
    }
  }

  // Update the getServiceImageUrl function to handle paths correctly
  const getServiceImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('blob:')) return imagePath;
    if (imagePath.startsWith('/uploads/')) {
      return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
    }
    // Handle both old and new format service image paths
    if (imagePath.startsWith('Service')) {
      return `${import.meta.env.VITE_BACKEND_URL}/api/uploads/${imagePath}`;
    }
    // For any other case, assume it's a relative path and construct the URL
    return `${import.meta.env.VITE_BACKEND_URL}/api/uploads/${imagePath}`;
  };

  // Update handleSubmit to properly handle image uploads
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data');
    const formData = new FormData();

    // Append all text fields first
    formData.append('nameOne', nameOne || '');
    formData.append('nameTwo', nameTwo || '');
    formData.append('description', clinicDescription);
    formData.append('address', clinicAddress);
    formData.append('addressTwo', clinicAddressTwo);
    formData.append('clinicCatchLine', clinicCatchLine);
    formData.append('clinicHeader', clinicHeader);
    formData.append('loginMessage', loginMessage);
    formData.append('loginDescription', loginDescription);
    formData.append('welcomeMessage', welcomeMessage);
    formData.append('signupMessage', signupMessage);
    formData.append('signupDescription', signupDescription);
    formData.append('nameOnePhone', nameOnePhone || '');
    formData.append('nameTwoPhone', nameTwoPhone || '');
    formData.append('termsAndConditions', termsAndConditions || '');

    // Add questions
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

    // Add images if they exist
    if (responsiveBg) formData.append('responsiveBg', responsiveBg);
    if (mainImg) formData.append('mainImg', mainImg);
    if (gcashQR) formData.append('gcashQR', gcashQR);
    if (clinicLogo) formData.append('clinicLogo', clinicLogo);

    // Add services count to help backend process the data
    formData.append('servicesCount', services.length);

    // Handle services with fees
    services.forEach((service, index) => {
      formData.append(`service_name_${index}`, service.name || '');
      formData.append(`service_description_${index}`, service.description || '');
      formData.append(`service_clinic_${index}`, service.clinic || 'both');
      
      if (service._id) {
        formData.append(`service_id_${index}`, service._id);
      }

      // Handle fees
      if (service.fees && service.fees.length > 0) {
        // Append the number of fees for this service
        formData.append(`service_fees_count_${index}`, service.fees.length);
        
        // Append each fee's data
        service.fees.forEach((fee, feeIndex) => {
          formData.append(`service_fee_type_${index}_${feeIndex}`, fee.feeType || 'Default');
          formData.append(`service_fee_amount_${index}_${feeIndex}`, fee.amount || 0);
          formData.append(`service_fee_description_${index}_${feeIndex}`, fee.description || '');
        });
      } else {
        // If no fees, set count to 0
        formData.append(`service_fees_count_${index}`, 0);
      }

      // Handle image upload for services
      if (service.imageUpdated) {
        if (service.image instanceof File) {
          formData.append(`service_image_${index}`, service.image);
        } else if (service.image === null) {
          formData.append(`service_image_remove_${index}`, 'true');
        } else if (typeof service.image === 'string') {
          formData.append(`service_image_path_${index}`, service.image);
        }
      } else if (service.image) {
        if (typeof service.image === 'string') {
          formData.append(`service_image_path_${index}`, service.image);
        }
      }
    });

    // Add medicines with fees and discount flag
    medicines.forEach((medicine, index) => {
      formData.append(`medicine_name_${index}`, medicine.medicineName);
      formData.append(`medicine_amount_${index}`, medicine.medicineAmount);
      formData.append(`medicine_description_${index}`, medicine.medicineDescription);
      formData.append(`medicine_discount_${index}`, medicine.discountApplicable || false);

      // Add medicine fees
      medicine.fees.forEach((fee, feeIndex) => {
        formData.append(`medicine_fee_type_${index}_${feeIndex}`, fee.feeType);
        formData.append(`medicine_fee_amount_${index}_${feeIndex}`, fee.amount);
        formData.append(`medicine_fee_description_${index}_${feeIndex}`, fee.description || '');
      });
    });

    // Append FAQs to form data
    formData.append('faqsCount', faqs.length);
    faqs.forEach((faq, index) => {
      formData.append(`faq_question_${index}`, faq.question || '');
      formData.append(`faq_answer_${index}`, faq.answer || '');
      formData.append(`faq_isActive_${index}`, faq.isActive ? 'true' : 'false');
    });

    // Log the form data for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      // Send the update request
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/clinic`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Clean up preview URLs
      services.forEach(service => {
        if (service.imagePreview) {
          URL.revokeObjectURL(service.imagePreview);
        }
      });

      if (response.status === 200) {
        alert('Clinic updated successfully!');
        // Optionally refresh the data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating clinic:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Error updating clinic: ' + (error.response?.data?.message || error.message));
    }
  };
  
  // Add function to handle fee changes
  const handleFeeChange = (serviceIndex, feeIndex, field, value) => {
    setServices(prev => {
      const updatedServices = [...prev];
      if (!updatedServices[serviceIndex].fees) {
        updatedServices[serviceIndex].fees = [];
      }
      updatedServices[serviceIndex].fees[feeIndex] = {
        ...updatedServices[serviceIndex].fees[feeIndex],
        [field]: value
      };
      return updatedServices;
    });
  };

  // Add function to add new fee to a service
  const addFee = (serviceIndex) => {
    setServices(prev => {
      const updatedServices = [...prev];
      if (!updatedServices[serviceIndex].fees) {
        updatedServices[serviceIndex].fees = [];
      }
      updatedServices[serviceIndex].fees.push({
        feeType: 'Default',
        amount: 0,
        description: ''
      });
      return updatedServices;
    });
  };

  // Add function to remove fee from a service
  const removeFee = (serviceIndex, feeIndex) => {
    setServices(prev => {
      const updatedServices = [...prev];
      updatedServices[serviceIndex].fees.splice(feeIndex, 1);
      return updatedServices;
    });
  };
  
  // Add medicine handlers
  const addMedicine = () => {
    setMedicines(prev => [...prev, { ...defaultMedicine }]);
  };

  const removeMedicine = (index) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines(prev => {
      const updatedMedicines = [...prev];
      updatedMedicines[index][field] = value;
      return updatedMedicines;
    });
  };

  // Add medicine fee handlers
  const addMedicineFee = (medicineIndex) => {
    setMedicines(prev => {
      const updatedMedicines = [...prev];
      if (!updatedMedicines[medicineIndex].fees) {
        updatedMedicines[medicineIndex].fees = [];
      }
      updatedMedicines[medicineIndex].fees.push({
        feeType: '',
        amount: 0,
        description: ''
      });
      return updatedMedicines;
    });
  };

  const removeMedicineFee = (medicineIndex, feeIndex) => {
    setMedicines(prev => {
      const updatedMedicines = [...prev];
      updatedMedicines[medicineIndex].fees.splice(feeIndex, 1);
      return updatedMedicines;
    });
  };

  const handleMedicineFeeChange = (medicineIndex, feeIndex, field, value) => {
    setMedicines(prev => {
      const updatedMedicines = [...prev];
      if (!updatedMedicines[medicineIndex].fees) {
        updatedMedicines[medicineIndex].fees = [];
      }
      if (!updatedMedicines[medicineIndex].fees[feeIndex]) {
        updatedMedicines[medicineIndex].fees[feeIndex] = { ...defaultMedicine.fees[0] };
      }
      updatedMedicines[medicineIndex].fees[feeIndex][field] = value;
      return updatedMedicines;
    });
  };
  
  const handleSlotChange = (index, value) => {
    setServices(prev => {
      const updatedServices = [...prev];
      updatedServices[index] = {
        ...updatedServices[index],
        servicesSlot: parseInt(value)
      };
      return updatedServices;
    });
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/services`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Function to add a new FAQ
  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '', isActive: true }]);
  };
  
  // Function to remove a FAQ
  const removeFaq = (index) => {
    const updatedFaqs = [...faqs];
    updatedFaqs.splice(index, 1);
    setFaqs(updatedFaqs);
  };
  
  // Function to handle FAQ changes
  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  return (
    <div  className='edit-content-container'>
      <h2>Edit Clinic Content</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
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
          className="form-control"  
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
          className="form-control"
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
          className="form-control"
            type="text"
            name="welcomeMessage"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
          ></textarea>
        </label>
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
                  type="text"
                  className="form-control-plaintext"
                  value={service.name || ''}
                  onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                />
              </label>
              
              <label>
                Service Description:
                <textarea
                  className="form-control"
                  value={service.description || ''}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                ></textarea>
              </label>

              <label>
                Clinic:
                <select
                  className="form-select"
                  value={service.clinic || 'both'}
                  onChange={(e) => handleServiceChange(index, 'clinic', e.target.value)}
                >
                  <option value="both">Both</option>
                  <option value="clinicOne">{nameOne}</option>
                  <option value="clinicTwo">{nameTwo}</option>
                </select>
              </label>

              {/* Fees Section */}
              <div className="fees-section mt-3">
                <h5>Service Fees</h5>
                {(service.fees || []).map((fee, feeIndex) => (
                  <div key={feeIndex} className="feeInput p-3 border rounded mb-2">
                    <label>
                      Fee Type:
                      <input
                        type="text"
                        className="form-control"
                        value={fee.feeType || ''}
                        onChange={(e) => handleFeeChange(index, feeIndex, 'feeType', e.target.value)}
                        placeholder="Enter fee type"
                      />
                    </label>
                    <label>
                      Amount:
                      <input
                        type="number"
                        className="form-control"
                        value={fee.amount || 0}
                        onChange={(e) => handleFeeChange(index, feeIndex, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                      />
                    </label>
                    <label>
                      Description:
                      <input
                        type="text"
                        className="form-control"
                        value={fee.description || ''}
                        onChange={(e) => handleFeeChange(index, feeIndex, 'description', e.target.value)}
                        placeholder="Enter description"
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm mt-2"
                      onClick={() => removeFee(index, feeIndex)}
                    >
                      Remove Fee
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => addFee(index)}
                >
                  Add Fee
                </button>
              </div>

              <label className="mt-3">
                Service Image:
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    className="form-control"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleServiceImageChange(index, e.target.files[0])}
                    style={{ flex: '1' }}
                  />
                  {(service.image || service.imagePreview) && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img
                        className="img-thumbnail"
                        src={service.imagePreview || getServiceImageUrl(service.image)}
                        alt={`Service ${index + 1}`}
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (service.imagePreview) {
                            URL.revokeObjectURL(service.imagePreview);
                          }
                          handleServiceChange(index, 'image', null);
                          handleServiceChange(index, 'imagePreview', null);
                          handleServiceChange(index, 'imageUpdated', true);
                        }}
                        className="btn btn-danger btn-sm mt-1"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </label>

              <button
                type="button"
                className="btn btn-danger mt-3"
                onClick={() => removeService(index, service._id)}
              >
                Remove Service
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addService}
          >
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

        <div className="medicineSection">
          <h3>Medicine List</h3>
          {medicines.map((medicine, medicineIndex) => (
            <div key={medicineIndex} className="medicineInput">
              <label>
                Medicine Name:
                <input
                  type="text"
                  className="form-control-plaintext"
                  value={medicine.medicineName}
                  onChange={(e) => handleMedicineChange(medicineIndex, 'medicineName', e.target.value)}
                  placeholder="Enter medicine name"
                />
              </label>
              <label>
                Amount:
                <input
                  type="number"
                  className="form-control-plaintext"
                  value={medicine.medicineAmount}
                  onChange={(e) => handleMedicineChange(medicineIndex, 'medicineAmount', parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </label>
              <label>
                Description:
                <textarea
                  className="form-control"
                  value={medicine.medicineDescription}
                  onChange={(e) => handleMedicineChange(medicineIndex, 'medicineDescription', e.target.value)}
                  placeholder="Enter medicine description"
                />
              </label>
              <label className="checkbox-label">
                Discount Applicable:
                <input
                  type="checkbox"
                  checked={medicine.discountApplicable || false}
                  onChange={(e) => handleMedicineChange(medicineIndex, 'discountApplicable', e.target.checked)}
                />
              </label>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeMedicine(medicineIndex)}
              >
                Remove Medicine
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addMedicine}
          >
            Add Medicine
          </button>
        </div>

        <div className="faqsSection">
          <h3>Frequently Asked Questions</h3>
          {faqs.map((faq, index) => (
            <div key={index} className="faqInput p-3 border rounded mb-3">
              <label>
                Question {index + 1}:
                <input
                  type="text"
                  className="form-control"
                  value={faq.question}
                  onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                  placeholder="Enter question"
                />
              </label>
              <label>
                Answer:
                <textarea
                  className="form-control"
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                  placeholder="Enter answer"
                  rows="4"
                ></textarea>
              </label>
              <div className="form-check mt-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`faq-active-${index}`}
                  checked={faq.isActive}
                  onChange={(e) => handleFaqChange(index, 'isActive', e.target.checked)}
                />
                <label className="form-check-label" htmlFor={`faq-active-${index}`}>
                  Active
                </label>
              </div>
              <button
                type="button"
                className="btn btn-danger mt-2"
                onClick={() => removeFaq(index)}
              >
                Remove FAQ
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary mb-3"
            onClick={addFaq}
          >
            Add FAQ
          </button>
        </div>

        <input type="submit" value="Update" />
      </form>
    </div>
  );
};

// Add some CSS for the new fee section
const styles = `
.feesSection {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.feeInput {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr auto;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.feeInput label {
  display: flex;
  flex-direction: column;
}

.feeInput input {
  margin-top: 5px;
}
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default EditContent;
