import express from "express";

const router = express.Router();
let messageLogged = false;
let namePrinted = false; // Prevent multiple prints of "Name"

// Print "Hello, World!" once when the server starts
if (!messageLogged) {
    console.log("Hello, World!");
    messageLogged = true;
}

// Function to check time every minute
function checkTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Months are zero-based, so add 1
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    

    // Check if the date is March 2, 2025, and the time is 16:19 (4:19 PM)
    if (year === 2025 && month === 3 && day === 2 && hours === 20 && minutes === 27 && !namePrinted) {
        console.log("hhjk");
        //text: `Dear ${patientFirstName} ${patientLastName},\n\nYour appointment for ${appointmentType} 
        // on ${appointmentDate} at ${appointmentTimeFrom} at ${bookedClinic} has been booked successfully.\n\nThank you!`,

        namePrinted = true; // Prevent multiple prints
    }
}

// Execute time check every minute
setInterval(checkTime, 60 * 1000); // Runs every 60,000 ms (1 minute)

// Route to confirm the server is running
router.get("/check-time", (req, res) => {
    res.send("Server is running! 'Hello, World!' was printed when the server started.");
});

export default router;
