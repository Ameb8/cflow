import csrfAxios from "./csrfAxios.js";

export async function loadSavedFile(fileId) {
    const response = await csrfAxios.get(`/api/files/${fileId}/`);
    return response.data;
}
