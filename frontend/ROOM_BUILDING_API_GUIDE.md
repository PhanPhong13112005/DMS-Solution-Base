# Room Building Service API Usage Guide

## 📚 Overview

`room-building.service.ts` cung cấp các hàm để gọi API của RoomBuildingService (.NET backend) quản lý:
- **Buildings** (Tòa nhà)
- **Rooms** (Phòng)
- **Beds** (Giường)
- **Room Amenities** (Tiện nghi phòng)
- **Bed Assignment Events** (Sự kiện gán giường)

---

## 🚀 Quick Start

### 1. Import Service
```typescript
import roomBuildingApi from '@/services/room-building.service';
// hoặc import từng function
import { getRooms, getBuildingById, assignStudentToBed } from '@/services/room-building.service';
```

### 2. Use with Composable (Recommended)
```typescript
import { useRoomBuilding } from '@/composables/useRoomBuilding';

const { 
  rooms, 
  buildings, 
  beds, 
  amenities, 
  loading, 
  error,
  loadAllData, 
  assignStudentBed 
} = useRoomBuilding();

// Load tất cả dữ liệu
await loadAllData();

// Access data
console.log(rooms.value);     // Danh sách phòng
console.log(buildings.value); // Danh sách tòa nhà
```

### 3. Use Directly
```typescript
// Lấy danh sách tất cả phòng
const allRooms = await roomBuildingApi.getRooms();

// Lấy chi tiết một phòng
const room = await roomBuildingApi.getRoomById('room-123');

// Tạo phòng mới
const newRoom = await roomBuildingApi.createRoom({
  roomNumber: '301',
  buildingId: 'building-1',
  capacity: 4,
  floor: 3
});
```

---

## 📡 API Endpoints & Functions

### Buildings (Tòa nhà)

#### Get All Buildings
```typescript
const buildings = await roomBuildingApi.getBuildings();
// GET /api/buildings
```

#### Get Building by ID
```typescript
const building = await roomBuildingApi.getBuildingById('building-1');
// GET /api/buildings/building-1
```

#### Create Building
```typescript
const newBuilding = await roomBuildingApi.createBuilding({
  name: 'Tòa A',
  description: 'Tòa ký túc xá A',
  floors: 5
});
// POST /api/buildings
```

#### Update Building
```typescript
const updated = await roomBuildingApi.updateBuilding('building-1', {
  name: 'Tòa A - Renovated'
});
// PUT /api/buildings/building-1
```

#### Delete Building
```typescript
const success = await roomBuildingApi.deleteBuilding('building-1');
// DELETE /api/buildings/building-1
// Returns: boolean
```

---

### Rooms (Phòng)

#### Get All Rooms
```typescript
const rooms = await roomBuildingApi.getRooms();
// GET /api/rooms
// Returns: Room[]
```

#### Get Rooms by Building
```typescript
const roomsInBuilding = await roomBuildingApi.getRoomsByBuilding('building-1');
// GET /api/buildings/building-1/rooms
// Returns: Room[]
```

#### Get Room by ID
```typescript
const room = await roomBuildingApi.getRoomById('room-101');
// GET /api/rooms/room-101
// Returns: Room | null
```

#### Create Room
```typescript
const newRoom = await roomBuildingApi.createRoom({
  roomNumber: '101',
  buildingId: 'building-1',
  floor: 1,
  capacity: 4,
  size: 25.5,
  gender: 'Nam'  // 'Nam' | 'Nữ'
});
// POST /api/rooms
// Returns: Room | null
```

#### Update Room
```typescript
const updated = await roomBuildingApi.updateRoom('room-101', {
  capacity: 6,
  floor: 2
});
// PUT /api/rooms/room-101
// Returns: Room | null
```

#### Delete Room
```typescript
const success = await roomBuildingApi.deleteRoom('room-101');
// DELETE /api/rooms/room-101
// Returns: boolean
```

---

### Beds (Giường)

#### Get All Beds
```typescript
const beds = await roomBuildingApi.getBeds();
// GET /api/beds
// Returns: Bed[]
```

#### Get Beds by Room
```typescript
const bedsInRoom = await roomBuildingApi.getBedsByRoom('room-101');
// GET /api/rooms/room-101/beds
// Returns: Bed[]
```

#### Get Bed by ID
```typescript
const bed = await roomBuildingApi.getBedById('bed-001');
// GET /api/beds/bed-001
// Returns: Bed | null
```

#### Create Bed
```typescript
const newBed = await roomBuildingApi.createBed({
  bedNumber: '1',
  roomId: 'room-101',
  position: 'left-top',
  condition: 'good'
});
// POST /api/beds
// Returns: Bed | null
```

#### Update Bed
```typescript
const updated = await roomBuildingApi.updateBed('bed-001', {
  condition: 'maintenance',
  position: 'right-bottom'
});
// PUT /api/beds/bed-001
// Returns: Bed | null
```

#### Delete Bed
```typescript
const success = await roomBuildingApi.deleteBed('bed-001');
// DELETE /api/beds/bed-001
// Returns: boolean
```

#### **Assign Student to Bed** ⭐
```typescript
const result = await roomBuildingApi.assignStudentToBed('bed-001', 'student-123');
// POST /api/beds/bed-001/assign
// Body: { studentId: 'student-123' }
// Returns: Bed | null
```

#### **Unassign Bed** ⭐
```typescript
const result = await roomBuildingApi.unassignBed('bed-001');
// POST /api/beds/bed-001/unassign
// Returns: Bed | null
```

---

### Room Amenities (Tiện nghi phòng)

#### Get All Amenities
```typescript
const amenities = await roomBuildingApi.getRoomAmenities();
// GET /api/room-amenities
// Returns: RoomAmenity[]
```

#### Get Amenities by Room
```typescript
const roomAmenities = await roomBuildingApi.getAmenitiesByRoom('room-101');
// GET /api/rooms/room-101/amenities
// Returns: RoomAmenity[]
```

#### Get Amenity by ID
```typescript
const amenity = await roomBuildingApi.getAmenityById('amenity-1');
// GET /api/room-amenities/amenity-1
// Returns: RoomAmenity | null
```

#### Create Amenity
```typescript
const newAmenity = await roomBuildingApi.createAmenity({
  name: 'Máy lạnh',
  description: 'Air conditioner',
  icon: '❄️'
});
// POST /api/room-amenities
// Returns: RoomAmenity | null
```

#### Update Amenity
```typescript
const updated = await roomBuildingApi.updateAmenity('amenity-1', {
  name: 'Máy lạnh inverter'
});
// PUT /api/room-amenities/amenity-1
// Returns: RoomAmenity | null
```

#### Delete Amenity
```typescript
const success = await roomBuildingApi.deleteAmenity('amenity-1');
// DELETE /api/room-amenities/amenity-1
// Returns: boolean
```

#### **Add Amenity to Room** ⭐
```typescript
const result = await roomBuildingApi.addAmenityToRoom('room-101', 'amenity-1');
// POST /api/rooms/room-101/amenities/amenity-1
// Returns: RoomAmenity | null
```

#### **Remove Amenity from Room** ⭐
```typescript
const success = await roomBuildingApi.removeAmenityFromRoom('room-101', 'amenity-1');
// DELETE /api/rooms/room-101/amenities/amenity-1
// Returns: boolean
```

---

### Bed Assignment Events

#### Get All Events
```typescript
const events = await roomBuildingApi.getBedAssignmentEvents();
// GET /api/bed-events
// Returns: BedAssignedEvent[]
```

#### Get Events by Student
```typescript
const studentEvents = await roomBuildingApi.getBedAssignmentEventsByStudent('student-123');
// GET /api/students/student-123/bed-events
// Returns: BedAssignedEvent[]
```

#### Get Events by Bed
```typescript
const bedEvents = await roomBuildingApi.getBedAssignmentEventsByBed('bed-001');
// GET /api/beds/bed-001/events
// Returns: BedAssignedEvent[]
```

---

### Batch Operations

#### Get All Data at Once
```typescript
const data = await roomBuildingApi.getAllRoomBuildingData();
// Parallel request to: buildings, rooms, beds, amenities

return {
  buildings: [],
  rooms: [],
  beds: [],
  amenities: [],
  success: boolean
}
```

#### Health Check
```typescript
const isHealthy = await roomBuildingApi.healthCheck();
// GET /api/health
// Returns: boolean
```

---

## 💡 Usage Examples in Components

### Example 1: Display Rooms List
```vue
<script setup lang="ts">
import { useRoomBuilding } from '@/composables/useRoomBuilding';
import { onMounted } from 'vue';

const { rooms, loading, error, loadAllData } = useRoomBuilding();

onMounted(async () => {
  await loadAllData();
});
</script>

<template>
  <div>
    <div v-if="loading" class="spinner">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!loading" class="rooms-grid">
      <div v-for="room in rooms" :key="room.id" class="room-card">
        <h3>Phòng {{ room.roomNumber }} - {{ room.building }}</h3>
        <p>Sức chứa: {{ room.capacity }} người</p>
      </div>
    </div>
  </div>
</template>
```

### Example 2: Assign Student to Bed
```vue
<script setup lang="ts">
import { useRoomBuilding } from '@/composables/useRoomBuilding';

const { assignStudentBed } = useRoomBuilding();

const handleAssign = async (bedId: string, studentId: string) => {
  const result = await assignStudentBed(bedId, studentId);
  if (result) {
    console.log('✅ Đã gán sinh viên vào giường');
  }
};
</script>

<template>
  <button @click="handleAssign('bed-001', 'student-123')">
    Gán sinh viên
  </button>
</template>
```

### Example 3: Get Available Beds in Room
```vue
<script setup lang="ts">
import { useRoomBuilding } from '@/composables/useRoomBuilding';
import { computed } from 'vue';

const { beds } = useRoomBuilding();

const availableBeds = computed(() => {
  return beds.value.filter(bed => !bed.occupiedBy);
});
</script>

<template>
  <div>{{ availableBeds.length }} giường trống</div>
</template>
```

---

## ⚙️ Environment Configuration

### Development
```env
VITE_ROOM_BUILDING_API=http://localhost:5001/api
```

### Production
```env
VITE_ROOM_BUILDING_API=https://api.yourdomain.com/api
```

---

## 🛡️ Error Handling

Tất cả functions đều có error handling tích hợp:

```typescript
try {
  const rooms = await roomBuildingApi.getRooms();
  if (rooms && rooms.length > 0) {
    console.log('✅ Loaded:', rooms);
  }
} catch (error) {
  console.error('❌ Error:', error);
  // Fallback logic
}
```

---

## 📋 TypeScript Interfaces

```typescript
interface Building {
  id: string;
  name: string;
  description?: string;
  floors: number;
}

interface Room {
  id: string;
  roomNumber: string;
  building: string;
  buildingId: string;
  capacity: number;
  available: number;
  size: number;
  price: number;
  floor: number;
  gender: 'Nam' | 'Nữ';
  amenities: RoomAmenity[];
  occupants: string[];
}

interface Bed {
  id: string;
  bedNumber: string;
  roomId: string;
  position: string;
  condition: 'good' | 'fair' | 'maintenance';
  occupiedBy?: string; // Student ID or null
}

interface RoomAmenity {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface BedAssignedEvent {
  id: string;
  bedId: string;
  studentId: string;
  assignedAt: string;
  unassignedAt?: string;
}
```

---

## 🔄 Data Flow

```
Component
   ↓
useRoomBuilding() composable
   ↓
room-building.service.ts (functions)
   ↓
Axios Instance (configured with baseURL)
   ↓
Backend API (RoomBuildingService)
   ↓
Database
```

---

## ✅ Checklist

- [x] ✅ Service functions created
- [x] ✅ Composable hook created
- [x] ✅ Environment config updated
- [ ] ⚠️ Backend endpoints need implementation
- [ ] ⚠️ Integration tests needed

---

## 📞 Support

Nếu bạn cần thêm functions hoặc endpoints, hãy cập nhật:
1. `room-building.service.ts` - Thêm functions
2. Backend API - Implement endpoints
3. `useRoomBuilding.ts` - Wrap trong composable
