import { ref, computed, onMounted } from 'vue';
import roomBuildingApi from '../services/room-building.service';
import type { Room, Building, Bed, RoomAmenity } from '../types';

/**
 * Composable hook để quản lý dữ liệu từ Room Building Service
 * Sử dụng: const { rooms, buildings, beds, amenities, loading } = useRoomBuilding()
 */
export const useRoomBuilding = () => {
  // ============ STATE ============
  const rooms = ref<Room[]>([]);
  const buildings = ref<Building[]>([]);
  const beds = ref<Bed[]>([]);
  const amenities = ref<RoomAmenity[]>([]);
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
      return rooms.value.filter((room: Room) => room.building === buildingName);
    };
  });

  /**
   * Lấy thông tin tòa nhà theo tên
   */
  const getBuildingByName = computed(() => {
    return (buildingName: string) => {
      return buildings.value.find((b: Building) => b.name === buildingName);
    };
  });

  /**
   * Lấy danh sách giường theo phòng
   */
  const getBedsByRoomId = computed(() => {
    return (roomId: number) => {
      return beds.value.filter((bed: Bed) => bed.roomId === roomId);
    };
  });

  /**
   * Đếm giường trống theo phòng
   */
  const getAvailableBedCount = computed(() => {
    return (roomId: number) => {
      return beds.value.filter((bed: Bed) => bed.roomId === roomId && bed.isAvailable).length;
    };
  });

  // ============ METHODS ============
  /**
   * Tải tất cả dữ liệu từ các API grouped
   */
  const loadAllData = async () => {
    loading.value = true;
    error.value = null;

    try {
      const [buildingsData, roomsData, bedsData, amenitiesData] = await Promise.all([
        roomBuildingApi.buildings.getAll(),
        roomBuildingApi.rooms.getAll(),
        roomBuildingApi.beds.getAll(),
        roomBuildingApi.amenities.getAll(),
      ]);

      buildings.value = buildingsData;
      rooms.value = roomsData;
      beds.value = bedsData;
      amenities.value = amenitiesData;
      console.log('✅ Đã nạp dữ liệu từ Room Building Service');
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
  const createNewRoom = async (roomData: Omit<Room, 'id'>) => {
    try {
      const newRoom = await roomBuildingApi.rooms.create(roomData);
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
  const updateRoomInfo = async (roomId: number, roomData: Partial<Room>) => {
    try {
      await roomBuildingApi.rooms.update(roomId, roomData);
      // Reload rooms sau khi update
      const updatedRooms = await roomBuildingApi.rooms.getAll();
      rooms.value = updatedRooms;
      return roomData;
    } catch (err) {
      console.error('Lỗi cập nhật phòng:', err);
    }
    return null;
  };

  /**
   * Gán sinh viên cho giường
   */
  const assignStudentBed = async (bedId: number, studentId: string) => {
    try {
      await roomBuildingApi.beds.assignBed(bedId, { isAvailable: false, studentId });
      // Reload beds
      const updatedBeds = await roomBuildingApi.beds.getAll();
      beds.value = updatedBeds;
      return true;
    } catch (err) {
      console.error('Lỗi gán sinh viên vào giường:', err);
    }
    return null;
  };

  /**
   * Giải phóng giường
   */
  const releaseBed = async (bedId: number) => {
    try {
      await roomBuildingApi.beds.assignBed(bedId, { isAvailable: true, studentId: null });
      // Reload beds
      const updatedBeds = await roomBuildingApi.beds.getAll();
      beds.value = updatedBeds;
      return true;
    } catch (err) {
      console.error('Lỗi giải phóng giường:', err);
    }
    return null;
  };

  /**
   * Thêm tiện nghi vào phòng
   */
  const addAmenityToRoom = async (roomId: number, amenityName: string, condition: string = 'Good') => {
    try {
      const result = await roomBuildingApi.amenities.create({ roomId, amenityName, condition });
      if (result) {
        // Reload amenities
        const updatedAmenities = await roomBuildingApi.amenities.getAll();
        amenities.value = updatedAmenities;
        return result;
      }
    } catch (err) {
      console.error('Lỗi thêm tiện nghi:', err);
    }
    return null;
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
  };
};

export default useRoomBuilding;

