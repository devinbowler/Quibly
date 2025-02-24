import axios from 'axios';

const API_URL = 'https://quibly.onrender.com'; // Update if backend URL changes
const LOCAL_URL = 'http://localhost:4000/';

// Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include the JWT token (if available)
axiosInstance.interceptors.request.use(
  (req) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// ----- Task / Note / Folder Endpoints -----

// Update a task
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await axiosInstance.patch(`/api/tasks/task/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Fetch note details
export const fetchNoteDetails = async (noteId) => {
  try {
    const response = await axiosInstance.get(`/api/tasks/note/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching note details:', error);
    throw error;
  }
};

// Fetch all items (folders, tasks, notes)
export const fetchAllItems = async () => {
  try {
    const response = await axiosInstance.get('/api/tasks');
    return response.data;
  } catch (error) {
    console.error('Error fetching all items:', error);
    throw error;
  }
};

// Create a new folder
export const createFolder = async (folderData) => {
  try {
    const response = await axiosInstance.post('/api/tasks/folder', folderData);
    return response.data;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

// Update folder (new endpoint)
export const updateFolder = async (folderId, folderData) => {
  try {
    const response = await axiosInstance.patch(`/api/tasks/folder/${folderId}`, folderData);
    return response.data;
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  // console.log('Creating task with data:', taskData); // Log the taskData payload
  try {
    const response = await axiosInstance.post('/api/tasks/task', taskData);
    // console.log('Task created successfully:', response.data); // Log the response from the server
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

// Create a new note
export const createNote = async (noteData) => {
  try {
    const response = await axiosInstance.post('/api/tasks/note', noteData);
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

// Save (update) a note
export const saveNote = async (noteId, noteData) => {
  try {
    const response = await axiosInstance.patch(`/api/tasks/note/${noteId}`, noteData);
    return response.data;
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
};

// Delete an item (task, note, or folder)
export const deleteItem = async (itemId, itemType) => {
  try {
    const response = await axiosInstance.delete(`/api/tasks/${itemId}/${itemType}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting ${itemType}:`, error);
    throw error;
  }
};

// ----- User Endpoints -----

// Update User Info (email & password)
export const updateUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/api/user/update', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete Account
export const deleteAccount = async () => {
  try {
    const response = await axiosInstance.delete('/api/user/delete');
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

