import api from './api';

const reportService = {
  uploadReport: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getReports: async (searchTerm = '') => {
    const response = await api.get('/reports', {
      params: searchTerm ? { q: searchTerm } : {},
    });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  analyzeReport: async (id) => {
    const response = await api.post(`/reports/${id}/analyze`);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  downloadAnalysisPdf: async (id, filename) => {
    const response = await api.get(`/reports/${id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const namePart = filename ? filename.split('.')[0] : `report_${id}`;
    link.setAttribute('download', `MediBridge_Analysis_${namePart}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  },

  getQuestions: async (id) => {
    const response = await api.get(`/reports/${id}/questions`);
    return response.data;
  },

  askQuestion: async (id, question) => {
    const response = await api.post(`/reports/${id}/questions`, { question });
    return response.data;
  }
};

export default reportService;
