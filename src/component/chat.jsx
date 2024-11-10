import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import '../styles/Chat.css'; // Import your CSS

function Chat() {
  const navigate = useNavigate();
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingIntervalRef = useRef(null);

  // Fetch logged-in user information
  useEffect(() => {
    console.log('fetch information effect');
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
        console.error('Error fetching logged-in user:', error);
      }
    };

    fetchLoggedInUser();
  }, [navigate]);

  // Fetch users based on logged-in user's role
  useEffect(() => {
    console.log('fetch user based on logged in users role effect');
    const fetchUsers = async () => {
      if (!loggedInUser) return;

      try {
        const response = await fetch('http://localhost:5000/UserInformation');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();

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

  // Fetch unread messages count for all users
  useEffect(() => {
    console.log('fetch unread effect');
    const fetchUnreadMessagesCount = async () => {
      if (!loggedInUser) return;
      console.log('effect start');      
      /*
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/messages/${loggedInUser.email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
  
        const unreadMessages = data.filter(msg => msg.readAt == null && msg.receiverId === loggedInUser.email);
        setUnreadCount(unreadMessages.length);
        console.log('effect');
      } catch (error) {
        console.error('Error fetching messages:', error);
      }*/

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token not found");
        console.log(loggedInUser);
        const response = await fetch(`http://localhost:5000/api/messages/unread`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (response.status === 403) {
          alert("Session expired. Please log in again.");
          navigate('/login');
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch unread messages count');
        const data = await response.json();
        console.log(data);
        console.log(data.length);

        /*const unreadMessages = data.filter(message => message.readAt == null && message.receiverId === loggedInUser.email);

        console.log('data', unreadMessages);
        console.log('count',unreadMessages.length);*/
        //console.log("Fetched Unread Messages Count:", data.unreadCount);
        setUnreadCount(data.length);
        console.log('effect end');
      } catch (error) {
        console.error('Error fetching unread messages count:', error);
      }
    };

    fetchUnreadMessagesCount();

    const interval = setInterval(fetchUnreadMessagesCount, 5000);
    return () => clearInterval(interval);
  }, [loggedInUser, isChatVisible]);

  // Start polling messages when a user is selected
  useEffect(() => {
    console.log('polling effect');
    if (selectedUser) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [selectedUser]);

  const startPolling = () => {
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, 2000);
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

      if (isChatVisible && selectedUser.email !== loggedInUser.email) {
        await markMessagesAsRead(data);
        await updateUnreadCount();
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
      
      const unreads = data.filter(message => message.receiverId === loggedInUser.email && message.readAt === null);

      console.log('second unreads',unreads);

      //setUnreadCount(data.unreadCount);
      console.log('second unread');
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
    }
    /*
    const unreadMessages = messagesToMark.filter(msg => msg.readAt == null && msg.receiverId === loggedInUser.email);
    console.log('update count :'+unreadMessages.length);
    console.log('update const');
    */
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
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage('');
      //await updateUnreadCount();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setMessages([]);
  };

  const handleBackToUserList = () => {
    setSelectedUser(null);
    setMessages([]);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {loggedInUser && (
        <div className="chat-icon" onClick={() => setIsChatVisible(!isChatVisible)}>
          <span role="img" aria-label="message" style={{ fontSize: '24px', marginRight: '8px' }}>💬</span>
          <div className="unread-count">{unreadCount}</div>
        </div>
      )}

      {isChatVisible && (
        <div className="chat">
          <div className="chat-title">
            <h1>Chat</h1>
            {selectedUser ? (
              <>
                <h2>Chat with {selectedUser.firstName}</h2>
                <button onClick={handleBackToUserList}>Back</button>
              </>
            ) : (
              <h2>Select a user</h2>
            )}
          </div>

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
