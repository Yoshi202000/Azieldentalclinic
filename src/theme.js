// src/theme.js
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#42C2FF', // Blue
    },
    secondary: {
      main: '#85F4FF', // Lightblue
    },
    background: {
      default: '#EFFFFD', // White
    },
    text: {
      primary: '#000000', // Black
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#42C2FF', // Blue
    },
    secondary: {
      main: '#85F4FF', // Lightblue
    },
    background: {
      default: '#333333',
    },
    text: {
      primary: '#ffffff',
    },
  },
});
