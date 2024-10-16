import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Box.css'; 
import MyContext from '../../configs/MyContext';

const ChatBox = ({ hotelId, userId, handleClose, avatarUrl }) => {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [socket, setSocket] = useState(null);
    const [state] = useContext(MyContext);
    const { user } = state;

    useEffect(() => {
        const newSocket = new WebSocket(`ws://localhost:8000/ws/chat/${hotelId}/`);

        newSocket.onopen = () => {
            console.log('Connected to WebSocket server');
            newSocket.send(JSON.stringify({ action: 'join_room', hotelId }));
        };

        newSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, message]);
            toast.info(`Tin nhắn mới từ ${message.userId}: ${message.content}`);
        };

        newSocket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [hotelId]);

    const sendMessage = () => {
        const message = {
            userId,
            content: messageInput,
            hotelId,
            timestamp: new Date().toLocaleString(), 
            avatarUrl,
        };
        socket.send(JSON.stringify(message));
        setMessageInput('');
    };

    return (
        <div className="chat-box border p-3 rounded">
            <button className="btn btn-danger" onClick={handleClose} style={{marginLeft: '340px'}}>X</button>

            {messages.map((msg, index) => {
                    console.log(`Message ${index}:`, msg); 
                    return (
                        <div key={index} className="message my-2 d-flex align-items-start">
                            <div>
                                {msg.avatarUrl && (
                                    <img 
                                        src={msg.avatarUrl} 
                                        alt="Avatar" 
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', marginLeft: '260px' }} 
                                    />
                                )}
                                <p style={{ marginTop: '5px', marginLeft: '260px' }}>{user.username}</p>
                            </div>
                            <div className={`message-content p-2 rounded ${msg.userId === userId ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
                                <p>{msg.content}</p>
                                <small className="text-muted">{msg.timestamp}</small>
                            </div>
                        </div>
                    );
                })}

            <div className="input-group my-2" >
                <input
                    type="text"
                    style={{ height: '40px', marginTop: '15px' }}
                    className="form-control"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Bạn có gì muốn nhắn..."
                />
                <button className="btn btn-primary" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatBox;
