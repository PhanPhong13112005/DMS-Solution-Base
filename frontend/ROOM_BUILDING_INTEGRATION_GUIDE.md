# Integration Guide: Room Building Service + Portals

## 🔗 How to Integrate Room Building Service with Your Portal Structure

### Current Architecture
```
App.vue (Provide/Inject)
├── StudentPortal.vue (inject appData + appActions)
├── AdminPortal.vue (inject appData + appActions)
└── StaffPortal.vue (inject appData + appActions)
```

### New: Add Room Building Service
```
App.vue (Provide/Inject)
├── Provide appData (from API)
├── Provide appActions
├── onMounted → loadData()
│   ├── Load main API data
│   └── Load Room Building API data ← NEW
│
├── StudentPortal.vue
│   ├── inject appData
│   └── useRoomBuilding() ← NEW
│
├── AdminPortal.vue
│   ├── inject appData
│   └── useRoomBuilding() ← NEW
│
└── StaffPortal.vue
    ├── inject appData
    └── useRoomBuilding() ← NEW
```

---

## 📝 Step-by-Step Integration

### Step 1: Update App.vue to Load Room Building Data

```typescript
// Add import
import { useRoomBuilding } from './composables/useRoomBuilding';

export default {
  setup() {
    const { loadAllData } = useRoomBuilding();
    
    const loadData = async () => {
      // Load existing data
      // ...
      
      // Load Room Building data
      console.log('Loading Room Building data...');
      await loadAllData(); // ← This uses the composable
    };
    
    onMounted(() => {
      loadData();
    });
  }
}
```

**Alternative**: Load directly in App.vue without composable

```typescript
import roomBuildingApi from './services/room-building.service';

const roomBuildingData = ref({
  rooms: [],
  buildings: [],
  beds: [],
  amenities: []
});

onMounted(async () => {
  const data = await roomBuildingApi.getAllRoomBuildingData();
  roomBuildingData.value = data;
  
  // Provide to all children
  provide('roomBuildingData', roomBuildingData);
});
```

---

### Step 2: Update StudentPortal to Show Rooms

**Before:**
```vue
<script setup>
const rooms = computed(() => appData?.rooms?.value ?? []);
</script>

<template>
  <div v-for="room in rooms" :key="room.id">
    {{ room.roomNumber }}
  </div>
</template>
```

**After** (Using Room Building API):
```vue
<script setup>
import { useRoomBuilding } from '@/composables/useRoomBuilding';

const { rooms, buildings, beds, loading, getBedsByRoomId } = useRoomBuilding();

onMounted(async () => {
  // Already loaded in App.vue, but can reload if needed
  // await loadAllData();
});

// Get beds in specific room
const getBedsInRoom = (roomId) => {
  return getBedsByRoomId(roomId);
};
</script>

<template>
  <div v-if="loading" class="spinner">Loading...</div>
  <div v-else>
    <!-- Show rooms from Room Building Service -->
    <div v-for="room in rooms" :key="room.id" class="room-card">
      <h3>Phòng {{ room.roomNumber }} - {{ room.building }}</h3>
      <p>Sức chứa: {{ room.capacity }}</p>
      
      <!-- Show beds in this room -->
      <div class="beds">
        <div v-for="bed in getBedsInRoom(room.id)" :key="bed.id">
          <span>Giường {{ bed.bedNumber }}</span>
          <span v-if="bed.occupiedBy" class="occupied">Đã có người</span>
          <span v-else class="available">Còn trống</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.beds {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.occupied {
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.available {
  background: #27ae60;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
```

---

### Step 3: Update AdminPortal to Manage Rooms

```vue
<script setup>
import { useRoomBuilding } from '@/composables/useRoomBuilding';
import { ref } from 'vue';

const { 
  rooms, 
  buildings, 
  createNewRoom, 
  updateRoomInfo, 
  loading 
} = useRoomBuilding();

const showCreateForm = ref(false);
const newRoomForm = ref({
  roomNumber: '',
  buildingId: '',
  capacity: 4,
  floor: 1
});

const handleCreateRoom = async () => {
  const newRoom = await createNewRoom(newRoomForm.value);
  if (newRoom) {
    showCreateForm.value = false;
    newRoomForm.value = {
      roomNumber: '',
      buildingId: '',
      capacity: 4,
      floor: 1
    };
  }
};
</script>

<template>
  <div v-if="loading">Loading rooms...</div>
  <div v-else>
    <!-- Create Room Form -->
    <div v-if="showCreateForm" class="form">
      <input v-model="newRoomForm.roomNumber" placeholder="Số phòng" />
      <select v-model="newRoomForm.buildingId">
        <option v-for="building in buildings" :key="building.id" :value="building.id">
          {{ building.name }}
        </option>
      </select>
      <input v-model.number="newRoomForm.capacity" type="number" placeholder="Sức chứa" />
      <button @click="handleCreateRoom">Tạo phòng</button>
    </div>

    <!-- Rooms List -->
    <div class="rooms-list">
      <div v-for="room in rooms" :key="room.id" class="room-item">
        <h4>{{ room.roomNumber }} - {{ room.building }}</h4>
        <p>Sức chứa: {{ room.capacity }}</p>
        <p>Giới tính: {{ room.gender }}</p>
      </div>
    </div>

    <button @click="showCreateForm = !showCreateForm">
      {{ showCreateForm ? 'Hủy' : 'Tạo phòng mới' }}
    </button>
  </div>
</template>
```

---

### Step 4: Update StaffPortal to Assign Beds

```vue
<script setup>
import { useRoomBuilding } from '@/composables/useRoomBuilding';
import { ref } from 'vue';

const { 
  beds, 
  rooms, 
  assignStudentBed, 
  getAvailableBedCount 
} = useRoomBuilding();

const selectedRoomId = ref('');
const selectedBedId = ref('');
const studentIdToAssign = ref('');

const handleAssign = async () => {
  if (!selectedBedId.value || !studentIdToAssign.value) {
    alert('Vui lòng chọn giường và nhập ID sinh viên');
    return;
  }
  
  const result = await assignStudentBed(selectedBedId.value, studentIdToAssign.value);
  if (result) {
    alert('✅ Đã gán sinh viên vào giường');
    selectedBedId.value = '';
    studentIdToAssign.value = '';
  }
};

const availableBeds = computed(() => {
  if (!selectedRoomId.value) return [];
  return beds.value.filter(b => 
    b.roomId === selectedRoomId.value && !b.occupiedBy
  );
});
</script>

<template>
  <div class="assign-form">
    <h3>Gán sinh viên vào giường</h3>
    
    <!-- Select Room -->
    <select v-model="selectedRoomId">
      <option value="">-- Chọn phòng --</option>
      <option v-for="room in rooms" :key="room.id" :value="room.id">
        Phòng {{ room.roomNumber }} ({{ getAvailableBedCount(room.id) }} giường trống)
      </option>
    </select>

    <!-- Select Available Bed -->
    <select v-model="selectedBedId" v-if="availableBeds.length > 0">
      <option value="">-- Chọn giường --</option>
      <option v-for="bed in availableBeds" :key="bed.id" :value="bed.id">
        Giường {{ bed.bedNumber }}
      </option>
    </select>

    <!-- Input Student ID -->
    <input 
      v-model="studentIdToAssign" 
      type="text" 
      placeholder="ID Sinh viên"
    />

    <!-- Assign Button -->
    <button @click="handleAssign">Gán sinh viên</button>
  </div>
</template>

<style scoped>
.assign-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
}

input, select {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #27ae60;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

button:hover {
  background: #229954;
}
</style>
```

---

## 🔄 Data Sync Between App.vue and Composables

### Option 1: Load Once in App.vue
```typescript
// App.vue
const roomBuildingData = ref({ rooms: [], buildings: [], beds: [], amenities: [] });

onMounted(async () => {
  const data = await roomBuildingApi.getAllRoomBuildingData();
  roomBuildingData.value = data;
  
  provide('roomBuildingData', roomBuildingData); // ← Provide to children
});

// Portal Component
const { rooms } = inject('roomBuildingData'); // ← Use from App
```

### Option 2: Load in Each Component
```typescript
// Portal Component
const { rooms, loading, loadAllData } = useRoomBuilding();

onMounted(async () => {
  await loadAllData(); // ← Load in component
});
```

### Option 3: Hybrid (Recommended)
```typescript
// App.vue
onMounted(async () => {
  const { loadAllData } = useRoomBuilding();
  await loadAllData(); // ← Load in App
});

// Portal Component
const { rooms } = useRoomBuilding(); // ← Use composable
// Data already loaded from App.vue
```

---

## 🎯 Best Practices

### 1. **Load Data Once**
```typescript
// ✅ Good
onMounted(async () => {
  const data = await roomBuildingApi.getAllRoomBuildingData();
  // Use this for all rooms, buildings, beds, amenities
});

// ❌ Bad - Loads same data multiple times
getRooms();
getBuildings();
getBeds();
getAmenities();
```

### 2. **Use Computed Properties for Filtering**
```typescript
// ✅ Good
const availableBeds = computed(() => {
  return beds.value.filter(bed => !bed.occupiedBy);
});

// ❌ Bad - Recalculates on every access
function getAvailableBeds() {
  return beds.value.filter(bed => !bed.occupiedBy);
}
```

### 3. **Handle Loading and Error States**
```typescript
// ✅ Good
<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>
    <!-- Show data -->
  </div>
</template>

// ❌ Bad - No loading/error handling
<template>
  <div>{{ rooms.length }} rooms</div>
</template>
```

### 4. **Use Type Safety**
```typescript
// ✅ Good
import type { Room, Bed, Building } from '@/types';

const rooms = ref<Room[]>([]);
const beds = ref<Bed[]>([]);

// ❌ Bad - No types
const rooms = ref([]);
const beds = ref([]);
```

---

## ✅ Integration Checklist

- [ ] Created `room-building.service.ts`
- [ ] Created `useRoomBuilding.ts` composable
- [ ] Updated `.env.development` with `VITE_ROOM_BUILDING_API`
- [ ] Updated `App.vue` to load Room Building data
- [ ] Updated `StudentPortal.vue` to use room/bed data
- [ ] Updated `AdminPortal.vue` to manage rooms
- [ ] Updated `StaffPortal.vue` to assign beds
- [ ] Tested API calls with Network tab in DevTools
- [ ] Added loading/error handling to all Portals
- [ ] Backend endpoints implemented

---

## 📞 Common Issues

### Issue: Data not updating in Portal
**Solution**: Ensure `App.vue` provides data BEFORE Portal mounts
```typescript
// App.vue
provide('roomBuildingData', roomBuildingData);
```

### Issue: Type errors with Room/Bed objects
**Solution**: Update `types.ts` to match backend models
```typescript
export interface Room {
  id: string;
  roomNumber: string;
  building: string;
  // ... match backend exactly
}
```

### Issue: API timeout
**Solution**: Increase timeout in `room-building.service.ts`
```typescript
const instance = axios.create({
  timeout: 20000, // 20 seconds
});
```

---

## 📚 References

- [Room Building API Guide](./ROOM_BUILDING_API_GUIDE.md)
- [API Integration Guide](./API_INTEGRATION_GUIDE.md)
- [Example Component](./src/components/ExampleAppDataUsage.vue)
