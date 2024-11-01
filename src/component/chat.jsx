import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import '../styles/Chat.css'; // Import your CSS

function Chat() {
  const navigate = useNavigate();
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]); // State to hold users
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingIntervalRef = useRef(null); // Ref to keep track of polling interval

  // Fetch logged-in user information
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchLoggedInUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/verify-token', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Session expired or invalid.');
        }

        const data = await response.json();
        setLoggedInUser(data.user);
        setLoading(false);
      } catch (error) {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      }
    };

    fetchLoggedInUser();
  }, [navigate]);

  // Fetch users based on logged-in user's role
  useEffect(() => {
    const fetchUsers = async () => {
      if (!loggedInUser) return;

      try {
        const response = await fetch('http://localhost:5000/UserInformation');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();

        // Filter users based on logged-in user's role
        if (loggedInUser.role === 'patient') {
          const adminUsers = data.filter(user => user.role === 'admin');
          setUsers(adminUsers);
        } else if (loggedInUser.role === 'admin') {
          const patientUsers = data.filter(user => user.role === 'patient');
          setUsers(patientUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [loggedInUser]);

  // Fetch unread messages count for all users when the component mounts
  useEffect(() => {
    const fetchUnreadMessagesCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token not found");
    
        const response = await fetch(`http://localhost:5000/api/messages/unread`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (response.status === 403) {
          alert("Session expired. Please log in again.");
          navigate('/login');
          return;
        }
    
        if (!response.ok) throw new Error('Failed to fetch unread messages count');
        const data = await response.json();
        console.log("Unread Messages Data:", data); // Log to check response structure
        setUnreadCount(data.unreadCount); // Set unread count based on data.unreadCount
      } catch (error) {
        console.error('Error fetching unread messages count:', error);
      }
    };
    
    
    

    fetchUnreadMessagesCount();

    // Poll unread count every 5 seconds to keep it updated
    const interval = setInterval(fetchUnreadMessagesCount, 5000);
    return () => clearInterval(interval); // Clear interval on unmount
  }, [loggedInUser]);

  // Start polling messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling(); // Cleanup polling when component unmounts or selectedUser changes
  }, [selectedUser]);

  const startPolling = () => {
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 2000); // Poll every 2 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Fetch messages for selected user
  const fetchMessages = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/${selectedUser.email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();

      setMessages(data);

      // Set the flag to mark messages as read when the chat becomes visible
      if (isChatVisible && selectedUser.email !== loggedInUser.email) {
        await markMessagesAsRead(data);
        await updateUnreadCount(); // Refresh unread count after marking as read
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Function to update unread count
  const updateUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/unread`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch unread messages count');
      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
    }
  };

  // Function to mark messages as read
  const markMessagesAsRead = async (messagesToMark) => {
    const unreadMessages = messagesToMark.filter(msg => !msg.readAt && msg.receiverId === loggedInUser.email);

    if (unreadMessages.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/read/${selectedUser.email}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to mark messages as read');

      // Update local state to mark messages as read instantly
      setMessages(prevMessages =>
        prevMessages.map(msg => 
          (!msg.readAt && msg.receiverId === loggedInUser.email 
            ? { ...msg, readAt: new Date().toISOString() } 
            : msg)
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Function to handle sending messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedUser.email,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const sentMessage = await response.json();

      // Update messages immediately after sending without waiting for polling
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage(''); // Clear input
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Function to handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]); // Clear messages when switching users
  };

  const handleBackToUserList = () => {
    setSelectedUser(null); // Reset selected user
    setMessages([]); // Clear messages when going back
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
 {/* Chat Icon in the lower-left corner */}
{loggedInUser && ( // Only render the chat icon if the user is logged in
  <div className="chat-icon" onClick={() => setIsChatVisible(!isChatVisible)}>
    <span role="img" aria-label="message" style={{ fontSize: '24px', marginRight: '8px' }}>💬</span> {/* Message emoji */}
    <div className="unread-count">{unreadCount}</div> {/* Show unread count even if it's 0 */}
  </div>
)}





      {/* Chat Box (conditionally visible) */}
      {isChatVisible && (
        <div className="chat">
          <div className="chat-title">
            <h1>Chat</h1>
            {selectedUser ? (
              <>
                <h2>Chat with {selectedUser.firstName}</h2>
                <button onClick={handleBackToUserList}>Back</button> {/* Back button */}
              </>
            ) : (
              <h2>Select a user</h2>
            )}
          </div>

          {/* User List (conditionally rendered) */}
          {!selectedUser && (
            <div className="user-list">
              {users.map((user) => (
                <div 
                  key={user._id} 
                  className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <span>{user.firstName} {user.lastName}</span>
                </div>
              ))}
            </div>
          )}

          <div className="messages">
            <div className="messages-content">
              {messages.map((message) => (
                <div 
                  key={message._id} 
                  className={`message-item ${message.senderId === loggedInUser.email ? 'message-own' : ''}`}
                >
                  <div className="message-content">
                    <p className="message-text">{message.content}</p>
                    <div className="message-info">
                      <span className="message-time">
                        {new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.readAt && (
                        <span className="message-read-status">
                          {`Read at: ${new Date(message.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="message-input"
              rows="3"
            />
            <button type="submit" className="message-submit">Send</button>
          </form>
        </div>
      )}

      <div className="bg"></div>
    </>
  );
}

export default Chat;
