import React from 'react';
import csrfAxios from './csrfAxios';

const SaveFile = ({ selectedFolder, code, fileName, handleSaveNotification }) => {
    const handleSave = async () => {
        if (!selectedFolder) {
            alert("Please select a folder before saving.");
            return;
        }

        if (!fileName.trim()) {
            alert("You must name the file.");
            return;
        }

        try {
            const response = await csrfAxios.post('/api/files/', {
                folder: selectedFolder.id,
                "file_name": fileName,
                "extension": "c",
                "file_content": code,
            });
            alert("Code saved successfully!");
            handleSaveNotification();
        } catch (error) {
            console.error("Failed to save code:", error.response?.data || error.message);
            alert("Failed to save code.");
        }
    };

    return (
        <button onClick={handleSave} disabled={!selectedFolder}>
            Save Code
        </button>
    );
};

export default SaveFile;
