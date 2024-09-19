const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://yoshikiyamaguchi2000:lehxluBffegWRtc7@cluster0.k4i93.mongodb.net/azielDental?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB js');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });