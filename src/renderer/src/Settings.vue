<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

type Settings = {
  adb: { mode: 'usb' | 'tcp'; host: string; port: number; customPath: string }
  startup: { openAtLogin: boolean }
  updates: { autoCheck: boolean }
  display: { batteryStyle: 'circular' | 'horizontal' }
}

const settings = ref<Settings | null>(null)
const saving = ref(false)
const isDark = ref(false)

// 检测系统主题
function detectSystemTheme() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mediaQuery.matches

  // 监听系统主题变化
  mediaQuery.addEventListener('change', (e) => {
    isDark.value = e.matches
  })
}

// 计算主题
const theme = computed(() => isDark.value ? 'dark' : 'light')

async function load() {
  settings.value = await window.api.getSettings()
}

async function save() {
  if (!settings.value) return
  saving.value = true

  // 创建纯对象副本，避免 Vue 响应式代理导致的克隆错误
  const settingsToSave = {
    adb: {
      mode: settings.value.adb.mode,
      host: settings.value.adb.host,
      port: settings.value.adb.port,
      customPath: settings.value.adb.customPath
    },
    startup: {
      openAtLogin: settings.value.startup.openAtLogin
    },
    updates: {
      autoCheck: settings.value.updates.autoCheck
    },
    display: {
      batteryStyle: settings.value.display.batteryStyle
    }
  }

  await window.api.setSettings(settingsToSave)
  saving.value = false
}

onMounted(() => {
  load()
  detectSystemTheme()
})
</script>

<template>
  <v-app :theme="theme">
    <v-container class="pa-4" style="max-width: 520px">
      <v-card elevation="2">
        <v-card-title>设置</v-card-title>
        <v-card-text>
          <template v-if="settings">
            <v-divider class="mb-4" />

            <!-- ADB 连接设置 -->
            <div class="text-subtitle-2 mb-2">ADB 连接</div>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select
                  label="模式"
                  :items="[
                    { title: 'USB', value: 'usb' },
                    { title: 'TCP/IP', value: 'tcp' }
                  ]"
                  v-model="settings.adb.mode"
                />
              </v-col>
            </v-row>
            <v-row dense v-if="settings.adb.mode==='tcp'">
              <v-col cols="12" md="8">
                <v-text-field label="主机" v-model="settings.adb.host" placeholder="192.168.1.10" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field type="number" label="端口" v-model.number="settings.adb.port" />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  label="自定义 ADB 路径"
                  v-model="settings.adb.customPath"
                  placeholder="C:\adb\adb.exe 或 /usr/bin/adb"
                  hint="留空使用系统默认路径"
                  persistent-hint
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- 显示设置 -->
            <div class="text-subtitle-2 mb-2">显示设置</div>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select
                  label="电池样式"
                  :items="[
                    { title: '圆形进度条', value: 'circular' },
                    { title: '横向电池条', value: 'horizontal' }
                  ]"
                  v-model="settings.display.batteryStyle"
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- 通用设置 -->
            <div class="text-subtitle-2 mb-2">通用</div>
            <v-row>
              <v-col cols="12" md="6">
                <v-switch inset hide-details color="primary" v-model="settings.startup.openAtLogin" label="开机自启" />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch inset hide-details color="primary" v-model="settings.updates.autoCheck" label="自动检查更新" />
              </v-col>
            </v-row>
          </template>
          <template v-else>
            <v-progress-circular indeterminate color="primary" class="mr-2" /> 正在加载设置…
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" color="secondary" @click="checkNow">检查更新</v-btn>
          <v-btn color="primary" :loading="saving" @click="save">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-app>
</template>

<style scoped>
/* Vuetify 提供大部分样式，这里仅做极简补充 */
.loading { color: #666; }
</style>

<script lang="ts">
export default {
  methods: {
    checkNow() {
      window.api.checkForUpdatesNow()
    }
  }
}
</script>


