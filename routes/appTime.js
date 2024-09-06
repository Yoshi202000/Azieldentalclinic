import Appointment from '../models/AppTime.js'; // Import the Appointment model

// Function to generate available time slots for the next 30 days
export async function generateAndSaveAvailableAppointments() {
    const startTime = 9 * 60; // 9:00 AM in minutes
    const endTime = 18 * 60;  // 6:00 PM in minutes
    const interval = 15;      // 15 minutes interval

    // Loop over the next 30 days
    for (let day = 0; day < 30; day++) {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + day);
        const formattedDate = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        // Check if an appointment record for this date already exists
        let appointment = await Appointment.findOne({ appointmentDate: formattedDate });

        if (!appointment) {
            let timeslots = { "appointmentDate": formattedDate };

            // Generate time slots from 9:00 AM to 6:00 PM
            for (let time = startTime; time < endTime; time += interval) {
                const hours = Math.floor(time / 60);
                const minutes = time % 60;
                const timeKey = `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
                timeslots[timeKey] = ""; // No appointments taken, so all slots are available
            }

            // Create and save new appointment record
            await new Appointment(timeslots).save();
        }
    }
}
