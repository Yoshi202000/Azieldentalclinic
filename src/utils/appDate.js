// date.js
export const generateAvailableDates = () => {
  const dates = {};
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    dates[dateString] = true;
  }
  
  return dates;
};
