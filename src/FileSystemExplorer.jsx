import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import csrfAxios from './csrfAxios';
import './FileSystemExplorer.css';

const File = ({ file, extension, onDoubleClick }) => {
    const handleDoubleClick = () => {
        onDoubleClick?.(file); // call parent with JSON data
    };

    return (
        <div className="file"  onDoubleClick={handleDoubleClick}>
            📄 {file.file_name}
            {extension && <span>.{extension}</span>}
        </div>
    );
};


const Folder = ({ folder, selectedFolder, onFolderSelect, onFileDoubleClick }) => {
    const [expanded, setExpanded] = useState(false);

    const toggle = () => {
        setExpanded(!expanded);
        onFolderSelect(folder);
    };

    const isSelected = selectedFolder?.id === folder.id;

    return (
        <div className="folder">
            <div
                className={`folder-name ${isSelected ? 'selected' : ''}`}
                onClick={toggle}
            >
                {expanded ? '📂' : '📁'} {folder.folder_name}
            </div>
            {expanded && (
                <div className="folder-contents">
                    {folder.files.map((file, idx) => (
                        <File
                            key={idx}
                            file={{ ...file, folder_id: folder.id }}
                            onDoubleClick={onFileDoubleClick}
                        />
                    ))}
                    {folder.subfolders.map((sub, idx) => (
                        <Folder
                            key={sub.id || idx}
                            folder={sub}
                            selectedFolder={selectedFolder}
                            onFolderSelect={onFolderSelect}
                            onFileDoubleClick={onFileDoubleClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileSystemExplorer = ({ selectedFolder, onFolderSelect, refreshTrigger, onFileDoubleClick }) => {
    const { user } = useAuth();
    const [filesystem, setFilesystem] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const fetchData = async () => {
        try {
            const response = await csrfAxios.get('/api/filesystem/');
            console.log("Filesystem data:", response.data);
            setFilesystem(response.data);
        } catch (error) {
            console.error("Failed to fetch filesystem data:", error.response?.data || error.message);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, refreshTrigger]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            alert("Please enter a valid folder name.");
            return;
        }

        if (!selectedFolder) {
            alert("Please select a folder first.");
            return;
        }

        try {
            const parentFolderId = selectedFolder.id;
            const response = await csrfAxios.post('/api/folders/', {
                folder_name: newFolderName,
                parent: parentFolderId,
            });

            //Reset File tree data
            await fetchData();

            // Reset folder creation state
            setNewFolderName('');
            setIsCreatingFolder(false);
        } catch (error) {
            console.error("Failed to create folder:", error.response?.data || error.message);
        }
    };

    return (
        <div className="filesystem">
            <div className="add-folder">
                {isCreatingFolder ? (
                    <div className="create-folder-form">
                        <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="Enter folder name"
                        />
                        <button onClick={handleCreateFolder}>Create Folder</button>
                        <button onClick={() => setIsCreatingFolder(false)}>Cancel</button>
                    </div>
                ) : (
                    <button onClick={() => setIsCreatingFolder(true)}>+ Add Folder</button>
                )}
            </div>

            {filesystem.map((folder, idx) => (
                <Folder
                    key={folder.id || idx}
                    folder={folder}
                    selectedFolder={selectedFolder}
                    onFolderSelect={onFolderSelect}
                    onFileDoubleClick={onFileDoubleClick}
                />
            ))}
        </div>
    );
};

export default FileSystemExplorer;



