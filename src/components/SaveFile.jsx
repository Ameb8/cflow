import React from 'react';
import csrfAxios from '../utils/csrfAxios.js';

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
            // Step 1: Try to find the existing file
            const getResponse = await csrfAxios.get('/api/files/', {
                params: {
                    folder: selectedFolder.id,
                    file_name: fileName,
                    extension: "c",
                }
            });

            const existingFile = getResponse.data.find(
                f => f.folder === selectedFolder.id && f.file_name === fileName && f.extension === "c"
            );

            if (existingFile) {
                // Step 2: Update via PUT
                await csrfAxios.put(`/api/files/${existingFile.id}/`, {
                    ...existingFile,
                    file_content: code,
                });
                alert("File updated successfully!");
            } else {
                // Step 3: Create via POST
                await csrfAxios.post('/api/files/', {
                    folder: selectedFolder.id,
                    file_name: fileName,
                    extension: "c",
                    file_content: code,
                });
                alert("File created successfully!");
            }

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

