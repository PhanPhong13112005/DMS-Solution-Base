<!-- Example: How to use useAppData composable -->

<template>
  <div class="example-usage">
    <!-- ============ LOADING INDICATOR ============ -->
    <div v-if="isLoading" class="loading-spinner">
      <div class="spinner"></div>
      <p>⏳ Đang tải dữ liệu...</p>
    </div>

    <!-- ============ ERROR DISPLAY ============ -->
    <div v-if="hasError" class="error-banner">
      <p>❌ Lỗi: {{ apiError }}</p>
      <button @click="actions.loadData()" class="retry-btn">
        🔄 Thử lại
      </button>
    </div>

    <!-- ============ DATA DISPLAY ============ -->
    <div v-if="!isLoading && !hasError" class="data-section">
      <!-- User Info -->
      <div class="user-card">
        <h3>👤 Thông tin người dùng</h3>
        <p>Tên: {{ user?.name ?? 'Chưa xác định' }}</p>
        <p>ID: {{ user?.id ?? 'N/A' }}</p>
      </div>

      <!-- Rooms List -->
      <div class="rooms-section">
        <h3>🏠 Danh sách phòng ({{ rooms.length }} phòng)</h3>
        <div v-if="rooms.length > 0" class="rooms-grid">
          <div v-for="room in rooms" :key="room.id" class="room-card">
            <h4>Phòng {{ room.roomNumber }} - {{ room.building }}</h4>
            <p>Sức chứa: {{ room.capacity }} người</p>
            <p>Còn trống: {{ room.available }} giường</p>
            <p>Giá: {{ new Intl.NumberFormat('vi-VN').format(room.price ?? 0) }}đ/tháng</p>
          </div>
        </div>
        <p v-else class="empty-state">Không có phòng nào</p>
      </div>

      <!-- Invoices List -->
      <div class="invoices-section">
        <h3>💰 Danh sách hóa đơn ({{ invoices.length }} hóa đơn)</h3>
        <table v-if="invoices.length > 0" class="data-table">
          <thead>
            <tr>
              <th>Phòng</th>
              <th>Tháng</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in invoices" :key="inv.id">
              <td>{{ inv.roomNumber }}</td>
              <td>{{ inv.month }}</td>
              <td>{{ new Intl.NumberFormat('vi-VN').format(inv.amount) }}đ</td>
              <td :class="inv.status === 'Paid' ? 'paid' : 'unpaid'">
                {{ inv.status === 'Paid' ? '✅ Đã thanh toán' : '❌ Chưa thanh toán' }}
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-state">Không có hóa đơn nào</p>
      </div>

      <!-- Maintenance Requests -->
      <div class="maintenance-section">
        <h3>🔧 Danh sách phiếu bảo trì ({{ maintenanceRequests.length }} phiếu)</h3>
        <div v-if="maintenanceRequests.length > 0" class="maintenance-list">
          <div v-for="req in maintenanceRequests" :key="req.id" class="maintenance-item">
            <h4>{{ req.title }}</h4>
            <p>Phòng: {{ req.roomNumber }}</p>
            <p>Mô tả: {{ req.description }}</p>
            <p>Ưu tiên: {{ req.priority === 'Critical' ? '🔴 Khẩn cấp' : '🟡 Thường' }}</p>
            <p>Trạng thái: {{ req.status }}</p>
            <button @click="actions.updateMaintenanceStatus(req.id, 'Resolved')" class="update-btn">
              ✅ Đánh dấu đã xong
            </button>
          </div>
        </div>
        <p v-else class="empty-state">Không có phiếu bảo trì nào</p>
      </div>
    </div>

    <style scoped>
      .example-usage {
        padding: 20px;
        font-family: Arial, sans-serif;
      }

      .loading-spinner {
        text-align: center;
        padding: 40px;
      }

      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .error-banner {
        background-color: #fee;
        border-left: 4px solid #c33;
        padding: 15px;
        margin: 15px 0;
        border-radius: 4px;
      }

      .retry-btn {
        background-color: #c33;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      }

      .retry-btn:hover {
        background-color: #a22;
      }

      .data-section {
        display: grid;
        gap: 30px;
      }

      .user-card,
      .rooms-section,
      .invoices-section,
      .maintenance-section {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
      }

      h3 {
        margin: 0 0 15px 0;
        font-size: 18px;
        color: #333;
      }

      .rooms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
      }

      .room-card {
        background: white;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 6px;
      }

      .room-card h4 {
        margin: 0 0 10px 0;
        color: #2c3e50;
      }

      .room-card p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }

      .data-table th,
      .data-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }

      .data-table th {
        background-color: #f0f0f0;
        font-weight: bold;
      }

      .data-table .paid {
        color: #27ae60;
      }

      .data-table .unpaid {
        color: #e74c3c;
      }

      .maintenance-list {
        display: grid;
        gap: 15px;
      }

      .maintenance-item {
        background: white;
        padding: 15px;
        border-left: 4px solid #f39c12;
        border-radius: 4px;
      }

      .maintenance-item h4 {
        margin: 0 0 10px 0;
        color: #2c3e50;
      }

      .maintenance-item p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
      }

      .update-btn {
        background-color: #27ae60;
        color: white;
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
      }

      .update-btn:hover {
        background-color: #229954;
      }

      .empty-state {
        text-align: center;
        color: #999;
        padding: 20px;
        font-style: italic;
      }
    </style>
  </div>
</template>

<script setup lang="ts">
import { useAppData } from '../composables/useAppData';

// Sử dụng composable
const {
  isLoading,
  apiError,
  hasError,
  user,
  rooms,
  invoices,
  maintenanceRequests,
  actions
} = useAppData();
</script>

<!-- 
  ============ USAGE EXAMPLES ============
  
  1. Import composable:
     import { useAppData } from '@/composables/useAppData'
  
  2. Use in component:
     const { isLoading, user, rooms, actions } = useAppData()
  
  3. Access data:
     - {{ isLoading }}        // Show loading spinner
     - {{ user?.name }}       // Safe access with optional chaining
     - {{ rooms.length }}     // Get array length
  
  4. Call actions:
     - @click="actions.logout()"
     - @click="actions.payInvoice('inv-123')"
     - @click="actions.updateMaintenanceStatus(id, 'Resolved')"
-->
