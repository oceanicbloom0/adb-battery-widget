<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Settings = {
  adb: { mode: 'usb' | 'tcp' | 'wireless'; host: string; port: number; customPath: string; pairingCode: string }
  startup: { openAtLogin: boolean }
  updates: { autoCheck: boolean }
  display: { batteryStyle: 'circular' | 'horizontal' }
}

const settings = ref<Settings | null>(null)
const saving = ref(false)
const pairingDialog = ref(false)
const pairingInProgress = ref(false)
const pairingOutput = ref('')

async function load() {
  const loadedSettings = await window.api.getSettings()
  // 确保设置对象包含所有必需的字段
  settings.value = {
    ...loadedSettings,
    adb: {
      mode: loadedSettings.adb?.mode || 'usb',
      host: loadedSettings.adb?.host || '127.0.0.1',
      port: loadedSettings.adb?.port || 5555,
      customPath: loadedSettings.adb?.customPath || '',
      pairingCode: (loadedSettings.adb as any)?.pairingCode || ''
    }
  }
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
      customPath: settings.value.adb.customPath,
      pairingCode: settings.value.adb.pairingCode || ''
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

async function pairDevice() {
  if (!settings.value) return
  
  pairingDialog.value = true
  pairingInProgress.value = true
  pairingOutput.value = '正在配对设备...\n'
  
  try {
    const result = await window.api.pairDevice(
      settings.value.adb.host,
      settings.value.adb.port,
      settings.value.adb.pairingCode
    )
    pairingOutput.value += '配对成功！设备已连接。\n'
    pairingOutput.value += result
    pairingInProgress.value = false
  } catch (error: any) {
    pairingOutput.value += `配对失败: ${error.message}\n`
    pairingInProgress.value = false
    console.error('Pairing error:', error)
  }
}


onMounted(() => {
  load()
})
</script>

<template>
  <v-app>
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
                    { title: 'TCP/IP', value: 'tcp' },
                    { title: '无线配对', value: 'wireless' }
                  ]"
                  v-model="settings.adb.mode"
                />
              </v-col>
            </v-row>
            <v-row dense v-if="settings.adb.mode === 'tcp'">
              <v-col cols="12" md="8">
                <v-text-field label="主机" v-model="settings.adb.host" placeholder="192.168.1.10" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field type="number" label="端口" v-model.number="settings.adb.port" />
              </v-col>
            </v-row>
            <v-row dense v-if="settings.adb.mode === 'wireless'">
              <v-col cols="12" md="8">
                <v-text-field label="主机" v-model="settings.adb.host" placeholder="192.168.1.10" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field type="number" label="端口" v-model.number="settings.adb.port" />
              </v-col>
              <v-col cols="12">
                <v-text-field 
                  label="配对码" 
                  v-model="settings.adb.pairingCode" 
                  placeholder="123456"
                  hint="在手机上查看无线调试获取配对码"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12">
                <v-btn 
                  color="primary" 
                  @click="pairDevice"
                  :disabled="!settings.adb.host || !settings.adb.port || !settings.adb.pairingCode"
                  block
                >
                  <v-icon icon="mdi-link" class="mr-2" />
                  立即配对
                </v-btn>
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
                <v-switch
                  inset
                  hide-details
                  color="primary"
                  v-model="settings.startup.openAtLogin"
                  label="开机自启"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  inset
                  hide-details
                  color="primary"
                  v-model="settings.updates.autoCheck"
                  label="自动检查更新"
                />
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
    
    <!-- 配对进度对话框 -->
    <v-dialog v-model="pairingDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-link" class="mr-2" />
          设备配对
        </v-card-title>
        <v-card-text>
          <div class="text-center mb-4" v-if="pairingInProgress">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
              width="4"
            />
            <div class="mt-2">正在配对设备，请稍候...</div>
          </div>
          
          <v-textarea
            v-model="pairingOutput"
            readonly
            outlined
            rows="6"
            hide-details
            class="pairing-output"
            placeholder="配对输出将显示在这里..."
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn 
            color="primary" 
            @click="pairingDialog = false"
            :disabled="pairingInProgress"
          >
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style scoped>
/* Vuetify 提供大部分样式，这里仅做极简补充 */
.loading {
  color: #666;
}
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
