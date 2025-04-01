import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DrawerComponent from './Drawers';
import Footer from './Footer'
import './Message.css';

const MessagePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [admins, setAdmins] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch logged-in user information
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    const fetchLoggedInUser = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
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

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/UserInformation`);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        
        // Filter users based on logged-in user's role
        if (loggedInUser?.role === 'patient') {
          const adminUsers = data.filter(user => user.role === 'admin');
          setAdmins(adminUsers);
          setPatients([]); // Empty the patients array
        } else if (loggedInUser?.role === 'admin') {
          const patientUsers = data.filter(user => user.role === 'patient');
          setPatients(patientUsers);
          setAdmins([]); // Empty the admins array
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (loggedInUser) {
      fetchUsers();
    }
  }, [loggedInUser]);

  // Fetch unread messages for the logged-in user
  const fetchUnreadMessages = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      const unread = data.filter(message => message.readAt === null && message.receiverId === loggedInUser.email);
      setUnreadMessages(unread);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  // Poll for unread messages every 5 seconds
  useEffect(() => {
    if (loggedInUser) {
      fetchUnreadMessages();
    }
  }, [loggedInUser]);

  // Fetch messages when a user is selected or periodically
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages/${selectedUser.email}`, {
          headers: {
            Authorization: token,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);

        // Mark messages as read
        await markMessagesAsRead(data);

        // Scroll to bottom when new messages arrive
        const chatMessages = document.querySelector('.chat-messages');
        // if (chatMessages) {
        //   chatMessages.scrollTop = chatMessages.scrollHeight;
        // }
      } catch (error) {
        // console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Set up periodic fetching (every 2 seconds)
    const intervalId = setInterval(fetchMessages, 2000);

    // Cleanup interval on unmount or when selected user changes
    return () => clearInterval(intervalId);
  }, [selectedUser]);

  const markMessagesAsRead = async (messagesToMark) => {
    const unreadMessages = messagesToMark.filter(msg => !msg.readAt && msg.receiverId === loggedInUser.email);

    if (unreadMessages.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages/read/${selectedUser.email}`, {
        method: 'PUT',
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) throw new Error('Failed to mark messages as read');

      // Update local state to mark messages as read instantly
      setMessages(prevMessages =>
        prevMessages.map(msg => (msg.readAt ? msg : { ...msg, readAt: new Date().toISOString() }))
      );
      console.log('Messages marked as read');
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]); // Clear messages when switching users
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          receiverId: selectedUser.email,
          content: newMessage,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const sentMessage = await response.json();

      // Update messages immediately after sending
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage('');

      // Scroll to bottom after sending
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        // chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Add auto-scroll effect when messages change
  useEffect(() => {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, [messages]);

  // Handle scroll event to check if user is at the bottom
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 1);
      
      // If the user scrolls up, do not scroll to the bottom
      if (!isAtBottom) {
        return;
      }
    }
  };

  // Add the scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messagesContainerRef]);

  // Scroll to the bottom when the chat is opened
  useEffect(() => {
    if (isChatVisible) {
      // Timeout to ensure the DOM is updated before scrolling
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [isChatVisible]);

  if (loading) {
    return <p>Loading...</p>;
  }

  // Sort users to show those with unread messages first
  const sortedAdmins = admins.sort((a, b) => {
    const aHasUnread = unreadMessages.some(message => message.senderId === a.email);
    const bHasUnread = unreadMessages.some(message => message.senderId === b.email);
    return (bHasUnread ? 1 : 0) - (aHasUnread ? 1 : 0);
  });

  const sortedPatients = patients.sort((a, b) => {
    const aHasUnread = unreadMessages.some(message => message.senderId === a.email);
    const bHasUnread = unreadMessages.some(message => message.senderId === b.email);
    return (bHasUnread ? 1 : 0) - (aHasUnread ? 1 : 0);
  });

  return (
    <>
    <DrawerComponent/>
    <div className="chat-page">
      <div className="users-sidebar">
        {/* Logged-in user section */}
        {loggedInUser && (
          <div className="logged-in-user">
            <div className="logged-in-header">
              <h3>Your Profile</h3>
            </div>
            <div className="logged-in-info">
              <div className="user-name">{loggedInUser.firstName} {loggedInUser.lastName}</div>
              <div className="user-role">{loggedInUser.role}</div>
              <div className="user-email">{loggedInUser.email}</div>
              {loggedInUser.phoneNumber && (
                <div className="user-phone">{loggedInUser.phoneNumber}</div>
              )}
            </div>
          </div>
        )}

        {/* Show Admins section only if user is a patient */}
        {loggedInUser?.role === 'patient' && sortedAdmins.length > 0 && (
          <div className="users-section">
            <div className="users-header">
              <h3>Available Admins</h3>
            </div>
            <div className="users-list">
              {sortedAdmins.map((user) => {
                const hasUnreadMessages = unreadMessages.some(message => message.senderId === user.email);
                return (
                  <div
                    key={user._id}
                    className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-info">
                      <span className="user-name" style={{ fontWeight: hasUnreadMessages ? 'bold' : 'normal' }}>
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="user-role">{user.role}</span>
                      {hasUnreadMessages && <span className="unread-count">({unreadMessages.length})</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Show Patients section only if user is an admin */}
        {loggedInUser?.role === 'admin' && sortedPatients.length > 0 && (
          <div className="users-section">
            <div className="users-header">
              <h3>Patients</h3>
            </div>
            <div className="users-list">
              {sortedPatients.map((user) => {
                const hasUnreadMessages = unreadMessages.some(message => message.senderId === user.email);
                return (
                  <div
                    key={user._id}
                    className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-info">
                      <span className="user-name" style={{ fontWeight: hasUnreadMessages ? 'bold' : 'normal' }}>
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="user-role">{user.role}</span>
                      {hasUnreadMessages && <span className="unread-count">({unreadMessages.length})</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <h2>{selectedUser ? `Chat with ${selectedUser.firstName} ${selectedUser.lastName}` : 'Select a user'}</h2>
        </div>
        
        <div className="chat-messages" ref={messagesContainerRef}>
          {messages.map((message) => (
            <div 
              key={message._id} 
              className={`message-item ${message.senderId === loggedInUser.email ? 'message-own' : ''}`}
            >
              <div className="message-content">
                <p className="message-text">{message.content}</p>
                <div className="message-info">
                  <span className="message-time">
                    {new Date(message.sentAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
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

        {selectedUser && (
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="chat-input"
            />
            <button type="submit" className="send-button">Send</button>
          </form>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default MessagePage;
