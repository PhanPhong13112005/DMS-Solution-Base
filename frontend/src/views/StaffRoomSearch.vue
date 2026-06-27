<template>
  <div class="staff-search-container">
    <div class="filter-card">
      <div class="filter-group">
        <label class="filter-label">Tòa nhà</label>
        <select v-model="filters.buildingId" class="custom-select">
          <option value="">Tất cả tòa</option>
          <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Tầng số</label>
        <input type="number" v-model.number="filters.floor" placeholder="Nhập tầng..." class="custom-input" />
      </div>

      <div class="filter-group">
        <label class="filter-label">Tình trạng phòng</label>
        <select v-model="filters.status" class="custom-select">
          <option value="">Tất cả trạng thái</option>
          <option value="Còn chỗ">Còn chỗ</option>
          <option value="Đã đầy">Hết chỗ</option>
        </select>
      </div>

      <button @click="handleSearch" class="btn-action-search">
        🔍 Tìm kiếm / Tra cứu
      </button>
    </div>

    <div class="table-responsive">
      <table class="styled-table">
        <thead>
          <tr>
            <th>Mã Phòng</th>
            <th>Tòa Nhà</th>
            <th>Số Phòng</th>
            <th>Tầng</th>
            <th>Loại Phòng</th>
            <th>Giá Cả</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in roomList" :key="room.id">
            <td>#{{ room.id }}</td>
            <td><span class="badge-building">{{ room.building }}</span></td>
            <td><strong>{{ room.roomNumber }}</strong></td>
            <td>Tầng {{ room.floorNumber }}</td>
            <td>{{ room.roomType }}</td>
            <td class="price-text">{{ room.price.toLocaleString() }}đ/tháng</td>
            <td>
              <span :class="room.status === 'Còn chỗ' ? 'status-avai' : 'status-full'">
                ● {{ room.status }}
              </span>
            </td>
          </tr>
          <tr v-if="roomList.length === 0">
            <td colspan="7" class="empty-row">
              🛈 Không tìm thấy phòng nào phù hợp với bộ lọc hiện tại.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StaffRoomSearch',
  data() {
    return {
      buildings: [],
      filters: {
        buildingId: '',
        floor: null,
        status: ''
      },
      roomList: []
    };
  },
  methods: {
    async fetchBuildings() {
      try {
        const response = await axios.get('http://localhost:5000/api/Buildings');
        this.buildings = response.data;
      } catch (error) {
        console.error("Lỗi lấy danh sách tòa nhà:", error);
      }
    },
    async handleSearch() {
      try {
        const response = await axios.get('http://localhost:5000/api/Rooms/staff/search', {
          params: {
            buildingId: this.filters.buildingId || null,
            floor: this.filters.floor || null,
            status: this.filters.status || null
          }
        });
        this.roomList = response.data;
      } catch (error) {
        console.error("Lỗi tra cứu phòng:", error);
        alert("Hệ thống mất kết nối backend hoặc lỗi Gateway!");
      }
    }
  },
  mounted() {
    this.fetchBuildings();
    this.handleSearch();
  }
};
</script>

<style scoped>
.staff-search-container {
  padding: 24px;
  background-color: #fcfbf7;
  min-height: 100%;
  font-family: sans-serif;
}
.filter-card {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  margin-bottom: 24px;
  align-items: flex-end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 160px;
}
.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #555;
}
.custom-select, .custom-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
  background-color: #fff;
}
.custom-select:focus, .custom-input:focus {
  border-color: #737f6b;
}
.btn-action-search {
  padding: 11px 24px;
  background-color: #5b6955;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 0.2s;
}
.btn-action-search:hover {
  background-color: #454f40;
}
.table-responsive {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.styled-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}
.styled-table th {
  background-color: #737f6b;
  color: white;
  padding: 14px 16px;
  font-weight: 600;
}
.styled-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #edf0f2;
  color: #333;
}
.styled-table tbody tr:hover {
  background-color: #f9fafb;
}
.status-avai {
  color: #2e7d32;
  font-weight: 600;
  background: #e8f5e9;
  padding: 4px 8px;
  border-radius: 6px;
}
.status-full {
  color: #c62828;
  font-weight: 600;
  background: #ffebee;
  padding: 4px 8px;
  border-radius: 6px;
}
.badge-building {
  background-color: #efebe4;
  color: #5d5347;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
}
.price-text {
  font-weight: 600;
  color: #444;
}
.empty-row {
  text-align: center;
  padding: 40px !important;
  color: #888;
  font-size: 15px;
}
</style>