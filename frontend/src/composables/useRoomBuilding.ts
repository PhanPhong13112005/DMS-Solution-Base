import { ref, computed, onMounted } from 'vue';
import roomBuildingApi from '../services/room-building.service';
import type { Room } from '../types';

/**
 * Composable hook để quản lý dữ liệu từ Room Building Service
 * Sử dụng: const { rooms, buildings, beds, amenities, loading } = useRoomBuilding()
 */
export const useRoomBuilding = () => {
  // ============ STATE ============
  const rooms = ref<any[]>([]);
  const buildings = ref<any[]>([]);
  const beds = ref<any[]>([]);
  const amenities = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ============ COMPUTED ============
  const isLoading = computed(() => loading.value);
  const hasError = computed(() => !!error.value);

  /**
   * Lấy danh sách phòng theo tòa nhà
   */
  const getRoomsByBuildingName = computed(() => {
    return (buildingName: string) => {
      return rooms.value.filter((room: any) => room.building === buildingName);
    };
  });

  /**
   * Lấy thông tin tòa nhà theo tên
   */
  const getBuildingByName = computed(() => {
    return (buildingName: string) => {
      return buildings.value.find((b: any) => b.name === buildingName);
    };
  });

  /**
   * Lấy danh sách giường theo phòng
   */
  const getBedsByRoomId = computed(() => {
    return (roomId: string) => {
      return beds.value.filter((bed: any) => bed.roomId === roomId);
    };
  });

  /**
   * Đếm giường trống theo phòng
   */
  const getAvailableBedCount = computed(() => {
    return (roomId: string) => {
      return beds.value.filter((bed: any) => bed.roomId === roomId && !bed.occupiedBy).length;
    };
  });

  // ============ METHODS ============
  /**
   * Tải tất cả dữ liệu
   */
  const loadAllData = async () => {
    loading.value = true;
    error.value = null;

    try {
      const data = await roomBuildingApi.getAllRoomBuildingData();

      if (data.success) {
        buildings.value = data.buildings;
        rooms.value = data.rooms;
        beds.value = data.beds;
        amenities.value = data.amenities;
        console.log('✅ Đã nạp dữ liệu từ Room Building Service');
      } else {
        throw new Error('Lỗi nạp dữ liệu từ API');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Lỗi không xác định';
      console.error('❌ Lỗi:', error.value);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Tạo phòng mới
   */
  const createNewRoom = async (roomData: any) => {
    try {
      const newRoom = await roomBuildingApi.createRoom(roomData);
      if (newRoom) {
        rooms.value.push(newRoom);
        return newRoom;
      }
    } catch (err) {
      console.error('Lỗi tạo phòng:', err);
    }
    return null;
  };

  /**
   * Cập nhật thông tin phòng
   */
  const updateRoomInfo = async (roomId: string, roomData: any) => {
    try {
      const updated = await roomBuildingApi.updateRoom(roomId, roomData);
      if (updated) {
        const index = rooms.value.findIndex((r: any) => r.id === roomId);
        if (index !== -1) {
          rooms.value[index] = updated;
        }
        return updated;
      }
    } catch (err) {
      console.error('Lỗi cập nhật phòng:', err);
    }
    return null;
  };

  /**
   * Gán sinh viên cho giường
   */
  const assignStudentBed = async (bedId: string, studentId: string) => {
    try {
      const updated = await roomBuildingApi.assignStudentToBed(bedId, studentId);
      if (updated) {
        const index = beds.value.findIndex((b: any) => b.id === bedId);
        if (index !== -1) {
          beds.value[index] = updated;
        }
        return updated;
      }
    } catch (err) {
      console.error('Lỗi gán sinh viên vào giường:', err);
    }
    return null;
  };

  /**
   * Giải phóng giường
   */
  const releaseBed = async (bedId: string) => {
    try {
      const updated = await roomBuildingApi.unassignBed(bedId);
      if (updated) {
        const index = beds.value.findIndex((b: any) => b.id === bedId);
        if (index !== -1) {
          beds.value[index] = updated;
        }
        return updated;
      }
    } catch (err) {
      console.error('Lỗi giải phóng giường:', err);
    }
    return null;
  };

  /**
   * Thêm tiện nghi vào phòng
   */
  const addAmenityToRoom = async (roomId: string, amenityId: string) => {
    try {
      const result = await roomBuildingApi.addAmenityToRoom(roomId, amenityId);
      if (result) {
        // Reload room amenities
        const roomAmenities = await roomBuildingApi.getAmenitiesByRoom(roomId);
        return roomAmenities;
      }
    } catch (err) {
      console.error('Lỗi thêm tiện nghi:', err);
    }
    return null;
  };

  /**
   * Kiểm tra kết nối API
   */
  const checkApiHealth = async () => {
    try {
      const isHealthy = await roomBuildingApi.healthCheck();
      if (isHealthy) {
        console.log('✅ API Room Building Service khỏe mạnh');
      } else {
        console.warn('⚠️ API Room Building Service không khả dụng');
      }
      return isHealthy;
    } catch (err) {
      console.error('❌ Lỗi kiểm tra kết nối:', err);
      return false;
    }
  };

  return {
    // State
    rooms,
    buildings,
    beds,
    amenities,
    loading,
    error,

    // Computed
    isLoading,
    hasError,
    getRoomsByBuildingName,
    getBuildingByName,
    getBedsByRoomId,
    getAvailableBedCount,

    // Methods
    loadAllData,
    createNewRoom,
    updateRoomInfo,
    assignStudentBed,
    releaseBed,
    addAmenityToRoom,
    checkApiHealth
  };
};

export default useRoomBuilding;
