import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import csrfAxios from './csrfAxios';
import './FileSystemExplorer.css';

const File = ({ file_name, extension }) => {
    return (
        <div className="file">
            📄 {file_name}
            {extension && <span>.{extension}</span>}
        </div>
    );
};


const Folder = ({ folder, selectedFolder, onFolderSelect }) => {
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
                        <File key={idx} {...file} />
                    ))}
                    {folder.subfolders.map((sub, idx) => (
                        <Folder
                            key={sub.id || idx}
                            folder={sub}
                            selectedFolder={selectedFolder}
                            onFolderSelect={onFolderSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const FileSystemExplorer = ({ selectedFolder, onFolderSelect, refreshTrigger }) => {
    const { user } = useAuth();
    const [filesystem, setFilesystem] = useState([]);
    //const [selectedFolder, setSelectedFolder] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await csrfAxios.get('/api/filesystem/');
                console.log("Filesystem data:", response.data);
                setFilesystem(response.data);
            } catch (error) {
                console.error("Failed to fetch filesystem data:", error.response?.data || error.message);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, refreshTrigger]);

    return (
        <div className="filesystem">
            {filesystem.map((folder, idx) => (
                <Folder
                    key={folder.id || idx}
                    folder={folder}
                    selectedFolder={selectedFolder}
                    onFolderSelect={onFolderSelect}
                />
            ))}
        </div>
    );
};

export default FileSystemExplorer;