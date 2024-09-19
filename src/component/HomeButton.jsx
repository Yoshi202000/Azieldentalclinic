import { useNavigate } from 'react-router-dom';
import '../styles/HomeButton.css'; 

const HomeButton = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  return (
    <button className="home-Button" onClick={() => navigate('/home')}>
      Home
    </button>
  );
};

export default HomeButton;