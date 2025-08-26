<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const batteryLevel = ref<number | null>(null)
const batteryStyle = ref<'circular' | 'horizontal'>('circular')

onMounted(async () => {
  // 获取电池样式设置
  const settings = await window.api.getSettings()
  batteryStyle.value = settings.display?.batteryStyle || 'circular'

  window.api.onBatteryLevelUpdate((_event, level) => {
    batteryLevel.value = typeof level === 'number' ? level : null
  })

  // 监听设置变化
  window.api.onSettingsChanged((_event, settings) => {
    batteryStyle.value = settings.display?.batteryStyle || 'circular'
  })
})

const levelColor = computed(() => {
  if (batteryLevel.value !== null && batteryLevel.value >= 60) return 'success'
  if (batteryLevel.value !== null && batteryLevel.value >= 30) return 'warning'
  return 'error'
})

const batteryText = computed(() =>
  batteryLevel.value === null ? '未连接' : `${batteryLevel.value}%`
)
</script>

<template>
  <div class="widget">
    <v-card class="surface pa-2" elevation="4">
      <div class="content">
        <template v-if="batteryLevel !== null">
          <!-- 圆形进度条样式 -->
          <template v-if="batteryStyle === 'circular'">
            <v-progress-circular
              :model-value="batteryLevel"
              :color="levelColor"
              size="56"
              width="6"
            >
              {{ batteryText }}
            </v-progress-circular>
          </template>

          <!-- 横向电池条样式 -->
          <template v-else>
            <div class="horizontal-battery">
              <div class="battery-outline">
                <div
                  class="battery-level"
                  :style="{ width: batteryLevel + '%', backgroundColor: getColorValue(levelColor) }"
                ></div>
                <div class="battery-text">{{ batteryText }}</div>
              </div>
            </div>
          </template>
        </template>

        <template v-else>
          <div class="disconnected">
            <v-icon icon="mdi-cellphone-link-off" size="28" class="mr-1" />
            <span>{{ batteryText }}</span>
          </div>
        </template>
      </div>
    </v-card>
    <div class="device">ADB Battery</div>
  </div>
</template>

<style>
/* 透明窗口与无滚动条 */
html,
body {
  margin: 0;
  padding: 0;
  background: transparent !important;
  overflow: hidden;
}
body::-webkit-scrollbar {
  display: none;
}
#app {
  background: transparent !important;
  overflow: hidden;
}

.widget {
  position: fixed;
  top: 0;
  right: 0;
  width: 124px;
  height: 96px;
  box-sizing: border-box;
  color: #fff;
  -webkit-app-region: drag;
}
.surface {
  background: rgba(0, 0, 0, 0.64) !important;
  border-radius: 8px;
}
.content {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.disconnected {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #ffb74d;
}
.device {
  margin-top: 6px;
  font-size: 12px;
  text-align: center;
  opacity: 0.9;
}

/* 横向电池条样式 */
.horizontal-battery {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.battery-outline {
  position: relative;
  width: 80px;
  height: 32px;
  border: 2px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}
.battery-level {
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 2px;
}
.battery-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 12px;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
</style>

<script lang="ts">
export default {
  methods: {
    getColorValue(color: string): string {
      const colorMap: Record<string, string> = {
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336'
      }
      return colorMap[color] || '#4caf50'
    }
  }
}
</script>
