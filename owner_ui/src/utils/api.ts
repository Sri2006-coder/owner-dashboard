import { Platform } from 'react-native';

// Standard React Native emulator routing: 
// On Android, '10.0.2.2' points to the developer machine's host machine loopback.
// On iOS/Web, 'localhost' is used.
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080/api',
  default: 'http://localhost:8080/api',
});

const getHeaders = () => ({
  'Content-Type': 'application/json',
});

export const api = {
  // Owner CRUD
  async createOwner(data: any) {
    const response = await fetch(`${BASE_URL}/owners`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create owner');
    return response.json();
  },

  async getOwner(id: number | string) {
    const response = await fetch(`${BASE_URL}/owners/${id}`);
    if (!response.ok) throw new Error('Failed to fetch owner');
    return response.json();
  },

  // Property CRUD
  async createProperty(ownerId: number | string, data: any) {
    const response = await fetch(`${BASE_URL}/properties?ownerId=${ownerId}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create property');
    return response.json();
  },

  async getPropertiesByOwner(ownerId: number | string) {
    const response = await fetch(`${BASE_URL}/properties/owner/${ownerId}`);
    if (!response.ok) throw new Error('Failed to fetch properties');
    return response.json();
  },

  async deleteProperty(id: number | string) {
    const response = await fetch(`${BASE_URL}/properties/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete property');
  },

  // Appointments
  async getAppointmentsByOwner(ownerId: number | string) {
    const response = await fetch(`${BASE_URL}/appointments/owner/${ownerId}`);
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return response.json();
  },

  async createAppointment(data: any) {
    const response = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create appointment');
    return response.json();
  },

  async updateAppointmentStatus(id: number | string, status: string) {
    const response = await fetch(`${BASE_URL}/appointments/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to update appointment status');
    return response.json();
  },

  // Notifications
  async getNotificationsByOwner(ownerId: number | string) {
    const response = await fetch(`${BASE_URL}/notifications/owner/${ownerId}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  async markNotificationAsRead(id: number | string) {
    const response = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  // Reviews
  async getReviewsByProperty(propertyId: number | string) {
    const response = await fetch(`${BASE_URL}/reviews/property/${propertyId}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  async createReview(data: any) {
    const response = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create review');
    return response.json();
  },

  async replyToReview(id: number | string, replyMessage: string) {
    const response = await fetch(`${BASE_URL}/reviews/${id}/reply?replyMessage=${encodeURIComponent(replyMessage)}`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to reply to review');
    return response.json();
  },

  // Verification
  async getVerificationByOwner(ownerId: number | string) {
    const response = await fetch(`${BASE_URL}/verifications/owner/${ownerId}`);
    if (!response.ok) throw new Error('Failed to fetch verification');
    return response.json();
  },

  async uploadVerificationDocument(ownerId: number | string, type: string, file: File | any) {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);
    
    const response = await fetch(`${BASE_URL}/verifications/owner/${ownerId}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload document');
    return response.json();
  },

  async deleteVerificationDocument(ownerId: number | string, type: string) {
    const response = await fetch(`${BASE_URL}/verifications/owner/${ownerId}/document/${type}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
    return response.json();
  },

  async submitVerification(ownerId: number | string) {
    const response = await fetch(`${BASE_URL}/verifications/owner/${ownerId}/submit`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to submit verification');
    return response.json();
  }
};
