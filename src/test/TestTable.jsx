import React, { useEffect, useState } from "react";
import axios from "axios";

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ViewAppointment`);
        console.log("Fetched Appointments:", response.data);
        setAppointments(response.data);
      } catch (err) {
        setError("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Appointments</h2>
      {Array.isArray(appointments) && appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="border p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                {appointment.patientFirstName} {appointment.patientLastName}
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {appointment.patientEmail}</p>
                <p><span className="font-medium">Phone:</span> {appointment.patientPhone}</p>
                <p><span className="font-medium">DOB:</span> {appointment.patientDOB}</p>
                <p><span className="font-medium">Clinic:</span> {appointment.bookedClinic}</p>
                <p><span className="font-medium">Doctor:</span> {appointment.doctor}</p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span className={`font-bold ${
                    appointment.appointmentStatus === 'pending' ? 'text-yellow-500' : 
                    appointment.appointmentStatus === 'Completed' ? 'text-green-500' :
                    appointment.appointmentStatus === 'Cancelled' ? 'text-red-500' :
                    'text-blue-500'
                  }`}>
                    {appointment.appointmentStatus}
                  </span>
                </p>
                <p><span className="font-medium">Appointment Date:</span> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                
                <div>
                  <p className="font-medium">Time Slots:</p>
                  <ul className="list-disc pl-5">
                    {Array.isArray(appointment.appointmentTimeFrom) && appointment.appointmentTimeFrom.length > 0
                      ? appointment.appointmentTimeFrom.map((time, index) => (
                          <li key={`${appointment._id}-time-${index}`} className="text-sm">
                            {time}
                          </li>
                        ))
                      : <li className="text-sm text-gray-500">No time slots available</li>
                    }
                  </ul>
                </div>

                <div>
                  <p className="font-medium">Services:</p>
                  <ul className="list-disc pl-5">
                    {Array.isArray(appointment.appointmentType) && appointment.appointmentType.length > 0
                      ? appointment.appointmentType.map((type, index) => (
                          <li key={`${appointment._id}-type-${index}`} className="text-sm">
                            {type}
                          </li>
                        ))
                      : <li className="text-sm text-gray-500">No services specified</li>
                    }
                  </ul>
                </div>

                {appointment.fee && (
                  <p><span className="font-medium">Fee:</span> ${appointment.fee}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  );
};

export default AppointmentsList;
