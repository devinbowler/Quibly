import axios from 'axios';

const API_URL = 'https://quibly.onrender.com'; // Update if backend URL changes http://localhost:4000/api

// Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const updateTask = async (taskId, taskData) => {
  console.log(`Updating task with ID: ${taskId}...`);
  try {
      // Now the relative URL is "/tasks/task/<taskId>"
      const response = await axiosInstance.patch(`/tasks/task/${taskId}`, taskData);
      console.log('Task updated:', response.data);
      return response.data;
  } catch (error) {
      console.error('Error updating task:', error);
      throw error;
  }
};


// Add the interceptor to include the JWT token
axiosInstance.interceptors.request.use(
  (req) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fetch note details
export const fetchNoteDetails = async (noteId) => {
  console.log(`Fetching note details for note ID: ${noteId}`);
  try {
    const response = await axiosInstance.get(`/tasks/note/${noteId}`);
    console.log('Note details fetched:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error fetching note details:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Fetch all items (folders, tasks, notes)
export const fetchAllItems = async () => {
  console.log('Fetching all items...');
  try {
    const response = await axiosInstance.get('/tasks');
    console.log('All items fetched:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error fetching items:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Create a new folder
export const createFolder = async (folderData) => {
  console.log('Creating folder with data:', folderData);
  try {
    const response = await axiosInstance.post('/tasks/folder', folderData);
    console.log('Folder created:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error creating folder:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  console.log('Creating task with data:', taskData);
  try {
    const response = await axiosInstance.post('/tasks/task', taskData);
    console.log('Task created:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error creating task:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Create a new note
export const createNote = async (noteData) => {
  console.log('Creating note with data:', noteData);
  try {
    const response = await axiosInstance.post('/tasks/note', noteData);
    console.log('Note created:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error creating note:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Save (update) a note
export const saveNote = async (noteId, noteData) => {
  console.log(`Saving note with ID: ${noteId}, Data:`, noteData);
  try {
    const response = await axiosInstance.patch(`/tasks/note/${noteId}`, noteData);
    console.log('Note saved:', response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error saving note:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Delete an item (task/note/folder)
export const deleteItem = async (itemId, itemType) => {
  console.log(`Deleting ${itemType} with ID: ${itemId}`);
  try {
    const response = await axiosInstance.delete(`/tasks/${itemId}/${itemType}`);
    console.log(`${itemType} deleted:`, response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(`Error deleting ${itemType}:`, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};
