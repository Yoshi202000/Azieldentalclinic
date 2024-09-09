// date.js
export const generateAvailableDates = () => {
    const appointments = {};
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      const formattedDate = nextDate.toISOString().split('T')[0];
      appointments[formattedDate] = []; // You can add time slots here if needed
    }
    return appointments;
  };
  