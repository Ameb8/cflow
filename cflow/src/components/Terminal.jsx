import { useState, useRef, useEffect } from 'react';

const ExecTerminalWithConnect = () => {
    const [folderIdInput, setFolderIdInput] = useState('');
    const [connectedFolderId, setConnectedFolderId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const socketRef = useRef(null);

    // Connect WebSocket when connectedFolderId changes
    useEffect(() => {
        if (!connectedFolderId) return;

        const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
        const wsUrl = `${wsProtocol}://localhost:8000/project/exec/${connectedFolderId}/`;

        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
            setMessages(prev => [...prev, `[Connected to folder ${connectedFolderId}]`]);
        };

        socketRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.error) {
                    setMessages(prev => [...prev, `[Error] ${data.error}`]);
                } else if (data.output) {
                    setMessages(prev => [...prev, data.output]);
                } else {
                    // If raw output or other format
                    setMessages(prev => [...prev, event.data]);
                }
            } catch {
                setMessages(prev => [...prev, event.data]);
            }
        };

        socketRef.current.onclose = () => {
            setMessages(prev => [...prev, '[Disconnected]']);
            socketRef.current = null;
            setConnectedFolderId(null);
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connectedFolderId]);

    const handleConnect = () => {
        if (folderIdInput.trim()) {
            setMessages([]);
            setConnectedFolderId(folderIdInput.trim());
        }
    };

    const handleInputSend = () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(input);
            setInput('');
        }
    };

    const onFolderIdKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleConnect();
        }
    };

    const onInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleInputSend();
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 12 }}>
                <input
                    type="text"
                    placeholder="Enter folder ID"
                    value={folderIdInput}
                    onChange={(e) => setFolderIdInput(e.target.value)}
                    onKeyDown={onFolderIdKeyDown}
                    style={{ marginRight: 8 }}
                />
                <button onClick={handleConnect}>Connect</button>
            </div>

            <div style={{ background: '#000', color: '#0f0', padding: '1rem', height: 300, overflowY: 'auto', fontFamily: 'monospace' }}>
                {messages.map((msg, idx) => (
                    <div key={idx}>{msg}</div>
                ))}
            </div>

            {connectedFolderId && (
                <input
                    type="text"
                    placeholder="Send input to code"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    style={{ width: '100%', marginTop: 8 }}
                />
            )}
        </div>
    );
};

export default ExecTerminalWithConnect;
