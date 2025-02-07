import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    clinic: { type: String, required: true },
    services: [
      {
        type: String,
        required: true,
      },
    ],
    date: { type: Date, required: true },
    slots: [
      {
        timeFrom: { type: String, required: true }, // HH:mm format
        timeTo: { type: String, required: true },   // HH:mm format
        status: { type: String, default: "available" }, // Default status is available
      },
    ],
  },
  { timestamps: true }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);

export const generateDailySchedule = async (doctor, date) => {
  const slots = [];
  let startTime = new Date(date);
  startTime.setHours(9, 0, 0); // Start at 9:00 AM

  const endTime = new Date(date);
  endTime.setHours(18, 0, 0); // End at 6:00 PM

  while (startTime < endTime) {
    const timeFrom = startTime.toTimeString().slice(0, 5); // Format as HH:mm
    startTime.setMinutes(startTime.getMinutes() + 30); // Increment by 30 minutes
    const timeTo = startTime.toTimeString().slice(0, 5); // Format as HH:mm

    slots.push({ timeFrom, timeTo, status: "available" });
  }

  const schedule = new Schedule({
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    email: doctor.email,
    clinic: doctor.clinic,
    services: doctor.services,
    date,
    slots,
  });

  await schedule.save();
  console.log("Daily schedule with all slots has been generated and saved.");
};

export default Schedule;
