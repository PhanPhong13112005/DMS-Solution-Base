/**
 * Room Building Service API
 * N1 Service - Quản lý phòng, giường, tòa nhà, tiện nghi
 *
 * Endpoints:
 * - Buildings: GET/POST /Buildings, GET/PUT/DELETE /Buildings/{id}
 * - Rooms: GET/POST /Rooms, GET/PUT/DELETE /Rooms/{id}, /Rooms/ByBuilding/{id}, /Rooms/available
 * - Beds: GET/POST /Beds, GET/PUT/DELETE /Beds/{id}, /Beds/Assign/{id}
 * - RoomAmenities: GET/POST /RoomAmenities, GET/PUT/DELETE /RoomAmenities/{id}
 */

import { apiRequest } from './api.service';
import type { Building, Room, Bed, RoomAmenity } from '../types';

// ============ BUILDINGS API ============

export const buildingsApi = {
  getAll: () => apiRequest.get<Building[]>('/Buildings'),
  getById: (id: number) => apiRequest.get<Building>(`/Buildings/${id}`),
  create: (data: Omit<Building, 'id'>) => apiRequest.post<Building>('/Buildings', data),
  update: (id: number, data: Partial<Building>) => apiRequest.put<void>(`/Buildings/${id}`, data),
  delete: (id: number) => apiRequest.delete<void>(`/Buildings/${id}`),
};

// ============ ROOMS API ============

export const roomsApi = {
  getAll: () => apiRequest.get<Room[]>('/Rooms'),
  getById: (id: number) => apiRequest.get<Room>(`/Rooms/${id}`),
  getByBuilding: (buildingId: number) => apiRequest.get<Room[]>(`/Rooms/ByBuilding/${buildingId}`),
  getAvailable: (gender?: string) => apiRequest.get<Room[]>('/Rooms/available', { params: { gender } }),
  create: (data: Omit<Room, 'id'>) => apiRequest.post<Room>('/Rooms', data),
  update: (id: number, data: Partial<Room>) => apiRequest.put<void>(`/Rooms/${id}`, data),
  delete: (id: number) => apiRequest.delete<void>(`/Rooms/${id}`),
};

// ============ BEDS API ============

export const bedsApi = {
  getAll: () => apiRequest.get<Bed[]>('/Beds'),
  getById: (id: number) => apiRequest.get<Bed>(`/Beds/${id}`),
  create: (data: Omit<Bed, 'id'>) => apiRequest.post<Bed>('/Beds', data),
  update: (id: number, data: Partial<Bed>) => apiRequest.put<void>(`/Beds/${id}`, data),
  delete: (id: number) => apiRequest.delete<void>(`/Beds/${id}`),
  assignBed: (id: number, data: { isAvailable: boolean; studentId?: string | null }) =>
    apiRequest.put<void>(`/Beds/Assign/${id}`, data),
};

// ============ ROOM AMENITIES API ============

export const roomAmenitiesApi = {
  getAll: () => apiRequest.get<RoomAmenity[]>('/RoomAmenities'),
  getById: (id: number) => apiRequest.get<RoomAmenity>(`/RoomAmenities/${id}`),
  create: (data: Omit<RoomAmenity, 'id'>) => apiRequest.post<RoomAmenity>('/RoomAmenities', data),
  update: (id: number, data: Partial<RoomAmenity>) => apiRequest.put<void>(`/RoomAmenities/${id}`, data),
  delete: (id: number) => apiRequest.delete<void>(`/RoomAmenities/${id}`),
};

// ============ EXPORT GROUPED API ============

export const roomBuildingApi = {
  buildings: buildingsApi,
  rooms: roomsApi,
  beds: bedsApi,
  amenities: roomAmenitiesApi,
};

export default roomBuildingApi;