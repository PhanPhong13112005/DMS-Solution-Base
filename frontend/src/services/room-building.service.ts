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

/**
 * GET: Lấy danh sách tất cả tòa nhà
 */
export const buildingsApi = {
  getAll: () => apiRequest.get<Building[]>('/Buildings'),

  /**
   * GET: Lấy thông tin chi tiết một tòa nhà
   * @param id - Building ID
   */
  getById: (id: number) => apiRequest.get<Building>(`/Buildings/${id}`),

  /**
   * POST: Tạo tòa nhà mới
   * @param data - Building data
   */
  create: (data: Omit<Building, 'id'>) => apiRequest.post<Building>('/Buildings', data),

  /**
   * PUT: Cập nhật thông tin tòa nhà
   * @param id - Building ID
   * @param data - Updated building data
   */
  update: (id: number, data: Partial<Building>) =>
    apiRequest.put<void>(`/Buildings/${id}`, data),

  /**
   * DELETE: Xóa tòa nhà
   * @param id - Building ID
   */
  delete: (id: number) => apiRequest.delete<void>(`/Buildings/${id}`),
};

// ============ ROOMS API ============

export const roomsApi = {
  /**
   * GET: Lấy danh sách tất cả phòng
   */
  getAll: () => apiRequest.get<Room[]>('/Rooms'),

  /**
   * GET: Lấy thông tin chi tiết một phòng
   * @param id - Room ID
   */
  getById: (id: number) => apiRequest.get<Room>(`/Rooms/${id}`),

  /**
   * GET: Lấy danh sách phòng theo tòa nhà
   * @param buildingId - Building ID
   */
  getByBuilding: (buildingId: number) =>
    apiRequest.get<Room[]>(`/Rooms/ByBuilding/${buildingId}`),

  /**
   * GET: Lấy danh sách phòng trống (available rooms)
   * @param gender - Optional: Filter by gender (Nam/Nữ/...)
   */
  getAvailable: (gender?: string) =>
    apiRequest.get<Room[]>('/Rooms/available', { params: { gender } }),

  /**
   * POST: Tạo phòng mới
   * @param data - Room data
   */
  create: (data: Omit<Room, 'id'>) => apiRequest.post<Room>('/Rooms', data),

  /**
   * PUT: Cập nhật thông tin phòng
   * @param id - Room ID
   * @param data - Updated room data
   */
  update: (id: number, data: Partial<Room>) =>
    apiRequest.put<void>(`/Rooms/${id}`, data),

  /**
   * DELETE: Xóa phòng
   * @param id - Room ID
   */
  delete: (id: number) => apiRequest.delete<void>(`/Rooms/${id}`),
};

// ============ BEDS API ============

export const bedsApi = {
  /**
   * GET: Lấy danh sách tất cả giường
   */
  getAll: () => apiRequest.get<Bed[]>('/Beds'),

  /**
   * GET: Lấy thông tin chi tiết một giường
   * @param id - Bed ID
   */
  getById: (id: number) => apiRequest.get<Bed>(`/Beds/${id}`),

  /**
   * POST: Tạo giường mới
   * @param data - Bed data
   */
  create: (data: Omit<Bed, 'id'>) => apiRequest.post<Bed>('/Beds', data),

  /**
   * PUT: Cập nhật thông tin giường
   * @param id - Bed ID
   * @param data - Updated bed data
   */
  update: (id: number, data: Partial<Bed>) =>
    apiRequest.put<void>(`/Beds/${id}`, data),

  /**
   * DELETE: Xóa giường
   * @param id - Bed ID
   */
  delete: (id: number) => apiRequest.delete<void>(`/Beds/${id}`),

  /**
   * PUT: Gán giường cho sinh viên / Giải phóng giường
   * @param id - Bed ID
   * @param data - { isAvailable: boolean, studentId?: string }
   */
  assignBed: (id: number, data: { isAvailable: boolean; studentId?: string | null }) =>
    apiRequest.put<void>(`/Beds/Assign/${id}`, data),
};

// ============ ROOM AMENITIES API ============

export const roomAmenitiesApi = {
  /**
   * GET: Lấy danh sách tất cả tiện nghi
   */
  getAll: () => apiRequest.get<RoomAmenity[]>('/RoomAmenities'),

  /**
   * GET: Lấy thông tin chi tiết một tiện nghi
   * @param id - RoomAmenity ID
   */
  getById: (id: number) => apiRequest.get<RoomAmenity>(`/RoomAmenities/${id}`),

  /**
   * POST: Tạo tiện nghi mới
   * @param data - RoomAmenity data
   */
  create: (data: Omit<RoomAmenity, 'id'>) =>
    apiRequest.post<RoomAmenity>('/RoomAmenities', data),

  /**
   * PUT: Cập nhật thông tin tiện nghi
   * @param id - RoomAmenity ID
   * @param data - Updated RoomAmenity data
   */
  update: (id: number, data: Partial<RoomAmenity>) =>
    apiRequest.put<void>(`/RoomAmenities/${id}`, data),

  /**
   * DELETE: Xóa tiện nghi
   * @param id - RoomAmenity ID
   */
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

  try {
    const response = await instance.get(`/rooms/${roomId}/beds`);
    return response.data || [];
  } catch (error) {
    handleError(error as AxiosError);
    return [];
  }
};

/**
 * Lấy chi tiết một giường
 * @param bedId - ID của giường
 */
export const getBedById = async (bedId: string) => {
  try {
    const response = await instance.get(`/beds/${bedId}`);
    return response.data || null;
  } catch (error) {
    handleError(error as AxiosError);
    return null;
  }
};

/**
 * Tạo giường mới
 * @param data - Dữ liệu giường (bedNumber, roomId, etc.)
 */
export const createBed = async (data: any) => {
  try {
    const response = await instance.post('/beds', data);
    return response.data || null;
  } catch (error) {
    handleError(error as AxiosError);
    return null;
  }
};

/**
 * Cập nhật thông tin giường
 * @param bedId - ID của giường
 * @param data - Dữ liệu cần cập nhật
 */
export const updateBed = async (bedId: string, data: any) => {
  try {
    const response = await instance.put(`/beds/${bedId}`, data);
    return response.data || null;
  } catch (error) {
    handleError(error as AxiosError);
    return null;
  }
};

/**
 * Xóa giường
 * @param bedId - ID của giường
 */
export const deleteBed = async (bedId: string) => {
  try {
    await instance.delete(`/beds/${bedId}`);
    return true;
  } catch (error) {
    handleError(error as AxiosError);
    return false;
  }
};

/**
 * Gán sinh viên cho giường
 * @param bedId - ID của giường
 * @param studentId - ID của sinh viên
 */
export const assignStudentToBed = async (bedId: string, studentId: string) => {
  try {
    const response = await instance.post(`/beds/${bedId}/assign`, { studentId });
    return response.data || null;
  } catch (error) {
    handleError(error as AxiosError);
    return null;
  }
};

/**
 * Giải phóng giường (loại bỏ sinh viên)
 * @param bedId - ID của giường
 */
export const unassignBed = async (bedId: string) => {
  try {
    const response = await instance.post(`/beds/${bedId}/unassign`);
    return response.data || null;
  } catch (error) {
    handleError(error as AxiosError);
    return null;
  }
};

// ============ ROOM AMENITIES API ============
/**
 * Lấy danh sách tất cả các tiện nghi
 */
export const getRoomAmenities = async () => {
  try {
    const response = await instance.get('/room-amenities');
    return response.data || [];
  } catch (error) {
    handleError(error as AxiosError);
    return [];
  }
};

/**
 * Lấy danh sách tiện nghi theo phòng
 * @param roomId - ID của phòng
 */
export const getAmenitiesByRoom = async (roomId: string) => {
  try {
    const response = await instance.get(`/rooms/${roomId}/amenities`);
    return response.data || [];
  } catch (error) {
    handleError(error as AxiosError);
    return [];
  }
};

/**
 * Lấy chi tiết một tiện nghi
 * @param amenityId - ID của tiện nghi
 */
export const getAmenityById = async (amenityId: string) => {
  try {
    const response = await instance.get(`/room-amenities/${amenityId}`);
    return response.data || null;
  } catch (error) {
    handleError(error as AxiosError);
    return null;
  }
};

/**
 * Tạo tiện nghi mới
 * @param data - Dữ liệu tiện nghi (name, description, etc.)
 */
export const createAmenity = async (data: any) => {
  try {
    const response = await instance.post('/room-amenities', data);
    return response.data || null;
  } catch (error) {
    handleError(error as AxiosError);
    return null;
  }
};

/**
 * Cập nhật thông tin tiện nghi
 * @param amenityId - ID của tiện nghi
 * @param data - Dữ liệu cần cập nhật
 */
export const updateAmenity = async (amenityId: string, data: any) => {
  try {
    const response = await instance.put(`/room-amenities/${amenityId}`, data);
    return response.data || null;
  } catch (error) {
    handleError(error as AxiosError);
    return null;
  }
};

/**
 * Xóa tiện nghi
 * @param amenityId - ID của tiện nghi
 */
export const deleteAmenity = async (amenityId: string) => {
  try {
    await instance.delete(`/room-amenities/${amenityId}`);
    return true;
  } catch (error) {
    handleError(error as AxiosError);
    return false;
  }
};

/**
 * Thêm tiện nghi vào phòng
 * @param roomId - ID của phòng
 * @param amenityId - ID của tiện nghi
 */
export const addAmenityToRoom = async (roomId: string, amenityId: string) => {
  try {
    const response = await instance.post(`/rooms/${roomId}/amenities/${amenityId}`);
    return response.data || null;
  } catch (error) {
    handleError(error as AxiosError);
    return null;
  }
};

/**
 * Xóa tiện nghi khỏi phòng
 * @param roomId - ID của phòng
 * @param amenityId - ID của tiện nghi
 */
export const removeAmenityFromRoom = async (roomId: string, amenityId: string) => {
  try {
    await instance.delete(`/rooms/${roomId}/amenities/${amenityId}`);
    return true;
  } catch (error) {
    handleError(error as AxiosError);
    return false;
  }
};

// ============ BED ASSIGNED EVENT API ============
/**
 * Lấy danh sách tất cả các sự kiện gán giường
 */
export const getBedAssignmentEvents = async () => {
  try {
    const response = await instance.get('/bed-events');
    return response.data || [];
  } catch (error) {
    handleError(error as AxiosError);
    return [];
  }
};

/**
 * Lấy danh sách sự kiện gán giường theo sinh viên
 * @param studentId - ID của sinh viên
 */
export const getBedAssignmentEventsByStudent = async (studentId: string) => {
  try {
    const response = await instance.get(`/students/${studentId}/bed-events`);
    return response.data || [];
  } catch (error) {
    handleError(error as AxiosError);
    return [];
  }
};

/**
 * Lấy danh sách sự kiện gán giường theo giường
 * @param bedId - ID của giường
 */
export const getBedAssignmentEventsByBed = async (bedId: string) => {
  try {
    const response = await instance.get(`/beds/${bedId}/events`);
    return response.data || [];
  } catch (error) {
    handleError(error as AxiosError);
    return [];
  }
};

// ============ BATCH OPERATIONS ============
/**
 * Lấy tất cả dữ liệu (rooms, beds, amenities) một lúc
 */
export const getAllRoomBuildingData = async () => {
  try {
    const [buildings, rooms, beds, amenities] = await Promise.all([
      getBuildings(),
      getRooms(),
      getBeds(),
      getRoomAmenities()
    ]);

    return {
      buildings,
      rooms,
      beds,
      amenities,
      success: true
    };
  } catch (error) {
    console.error('Error loading room building data:', error);
    return {
      buildings: [],
      rooms: [],
      beds: [],
      amenities: [],
      success: false
    };
  }
};

// ============ HEALTH CHECK ============
/**
 * Kiểm tra kết nối với API
 */
export const healthCheck = async () => {
  try {
    const response = await instance.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
};

// ============ AXIOS INSTANCE EXPORT ============
/**
 * Export axios instance để có thể custom trong các trường hợp đặc biệt
 */
export { instance as apiClient };

// ============ DEFAULT EXPORT ============
export default {
  // Buildings
  getBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,

  // Rooms
  getRooms,
  getRoomsByBuilding,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,

  // Beds
  getBeds,
  getBedsByRoom,
  getBedById,
  createBed,
  updateBed,
  deleteBed,
  assignStudentToBed,
  unassignBed,

  // Room Amenities
  getRoomAmenities,
  getAmenitiesByRoom,
  getAmenityById,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  addAmenityToRoom,
  removeAmenityFromRoom,

  // Bed Events
  getBedAssignmentEvents,
  getBedAssignmentEventsByStudent,
  getBedAssignmentEventsByBed,

  // Batch Operations
  getAllRoomBuildingData,

  // Utilities
  healthCheck,
  apiClient
};
