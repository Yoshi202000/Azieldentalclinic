// date.js

// Function to get the next 30 days starting from today
export function getNext30Days() {
  const days = [];
  const today = new Date();

  for (let i = 0; i < 60; i++) {
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + i);
    
    const day = nextDate.getDate();
    const month = nextDate.getMonth() + 1; // Months are 0-based, so add 1
    const year = nextDate.getFullYear();

    // Format the date as DD/MM/YYYY
    days.push(`${day}/${month}/${year}`);
  }

  return days;
}

// Function to check if a given date is on a weekend (Saturday or Sunday)
export function isWeekend(dateString) {
  const dateParts = dateString.split('/');
  const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`); // Convert DD/MM/YYYY to Date object
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

// Function to generate available dates and their respective time slots
export function generateAvailableDates() {
  const availableDates = getNext30Days().reduce((acc, date) => {
    if (isWeekend(date)) {
      acc[date] = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']; // Weekend time slots
    } else {
      acc[date] = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']; // Weekday time slots
    }
    return acc;
  }, {});
  
  return availableDates;
}



