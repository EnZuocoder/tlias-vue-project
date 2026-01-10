<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { aiChatApi, clearAiChatApi } from '@/api/aichat'
import { ElMessage } from 'element-plus'

const pageTitle = ref('AI 助手')

// 消息列表：role: 'user' | 'ai'
const messages = ref([
  { role: 'ai', text: '你好，我是 AI 助手，随时为你解答问题。' }
])
const inputMessage = ref('')
const loading = ref(false)
const clearing = ref(false)
const chatBoxRef = ref(null)

const scrollToBottom = () => {
  const el = chatBoxRef.value
  if (el) el.scrollTop = el.scrollHeight
}

onMounted(() => nextTick(scrollToBottom))

const sendMessage = async () => {
  const content = inputMessage.value.trim()
  if (!content || loading.value) return
  messages.value.push({ role: 'user', text: content })
  inputMessage.value = ''
  await nextTick()
  scrollToBottom()

  loading.value = true
  try {
    const res = await aiChatApi(content)
    const ok = res && res.code === 1 && res.data && typeof res.data.AIResponse !== 'undefined'
    const reply = ok ? String(res.data.AIResponse) : '抱歉，服务暂不可用，请稍后重试。'
    messages.value.push({ role: 'ai', text: reply })
  } catch (e) {
    messages.value.push({ role: 'ai', text: '请求失败，请检查网络或稍后重试。' })
  } finally {
    loading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

const clearChat = async () => {
  if (clearing.value) return
  clearing.value = true
  try {
    await clearAiChatApi()
    messages.value = [{ role: 'ai', text: '聊天已重置，我能帮你做些什么？' }]
    ElMessage.success('已清空上下文')
  } catch (e) {
    // 本地也重置，以保证界面清爽；如需保留原消息可以改为只提示错误
    messages.value = [{ role: 'ai', text: '聊天已重置，但服务清空失败，请稍后重试。' }]
    ElMessage.error('清空上下文失败')
  } finally {
    await nextTick()
    scrollToBottom()
    clearing.value = false
  }
}

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<template>
  <div class="ai-page">
    <el-divider content-position="center" class="title-bar">
      <el-icon class="mr-6"><ChatLineSquare /></el-icon>
      <span class="title-text">{{ pageTitle }}</span>
    </el-divider>

    <div class="content">
      <el-card shadow="never" class="chat-card">
        <div class="chat-toolbar">
          <el-button type="default" size="small" @click="clearChat" :loading="clearing">
            <el-icon class="mr-4"><Delete /></el-icon>清空聊天
          </el-button>
        </div>

        <div class="chat-box" ref="chatBoxRef">
          <transition-group name="fade" tag="div">
            <div v-for="(m, idx) in messages" :key="idx" class="msg" :class="m.role">
              <div class="avatar" :class="m.role">
                <el-avatar size="small">{{ m.role === 'ai' ? 'AI' : '我' }}</el-avatar>
              </div>
              <div class="bubble" :class="m.role">
                <div class="text">{{ m.text }}</div>
                <div v-if="m.role === 'ai'" class="actions">
                  <el-tooltip content="复制回复" placement="top">
                    <el-button link size="small" @click="copyText(m.text)">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </transition-group>

          <div v-if="loading" class="msg ai typing">
            <div class="avatar ai"><el-avatar size="small">AI</el-avatar></div>
            <div class="bubble ai"><span class="dots"><i></i><i></i><i></i></span></div>
          </div>
        </div>

        <div class="input-area" @keydown="handleKeydown">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="输入消息，Enter 发送，Shift+Enter 换行"
            class="msg-input"
          />
          <el-button type="primary" round :loading="loading" @click="sendMessage" class="send-btn">
            <el-icon class="mr-6"><Promotion /></el-icon>
            发送
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
  
</template>

<style scoped>
.ai-page { display: flex; flex-direction: column; }
.title-bar { margin: 8px 0 12px; }
.title-text { font-size: 18px; font-weight: 600; }
.mr-6 { margin-right: 6px; }
.mr-4 { margin-right: 4px; }
.content { padding: 8px; }

.chat-card { overflow: hidden; }
.chat-toolbar { display: flex; justify-content: flex-end; margin-bottom: 8px; }
.chat-box {
  height: calc(100vh - 260px);
  min-height: 320px;
  overflow-y: auto;
  padding: 12px 8px;
  background: linear-gradient(180deg, #fafafa 0%, #f7f9fc 100%);
  border-radius: 8px;
}

.msg { display: flex; align-items: flex-end; margin: 10px 0; }
.msg.ai { flex-direction: row; }
.msg.user { flex-direction: row-reverse; }

.avatar { display: flex; align-items: center; }
.avatar.ai :deep(.el-avatar) { background-color: #409EFF22; color: #409EFF; }
.avatar.user :deep(.el-avatar) { background-color: #67C23A22; color: #67C23A; }

.bubble { max-width: 70%; padding: 10px 12px; border-radius: 12px; position: relative; }
.bubble.ai { background: #ffffff; border: 1px solid #e6e8eb; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.bubble.user { background: linear-gradient(135deg, #409EFF, #66b1ff); color: #fff; box-shadow: 0 2px 10px rgba(64,158,255,0.25); }
.bubble .text { white-space: pre-wrap; word-break: break-word; }

.msg.ai .bubble::after { content: ''; position: absolute; left: -6px; top: 12px; width: 6px; height: 6px; background: #fff; border-left: 1px solid #e6e8eb; border-bottom: 1px solid #e6e8eb; transform: rotate(45deg); }
.msg.user .bubble::after { content: ''; position: absolute; right: -6px; top: 12px; width: 6px; height: 6px; background: #66b1ff; transform: rotate(45deg); }

.actions { margin-top: 6px; display: flex; gap: 6px; opacity: 0.75; }

.input-area { display: flex; gap: 10px; padding: 12px 8px; border-top: 1px dashed #e6e8eb; align-items: center; }
.msg-input { flex: 1; }
.send-btn { padding: 0 16px; }

/* 打字中动画 */
.typing .bubble { display: inline-flex; align-items: center; }
.dots { display: inline-flex; gap: 6px; }
.dots i { width: 6px; height: 6px; border-radius: 50%; background: #909399; opacity: 0.5; animation: blink 1.2s infinite ease-in-out; }
.dots i:nth-child(2) { animation-delay: 0.2s; }
.dots i:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; } 40% { transform: scale(1); opacity: 0.9; } }

/* 进出场动画 */
.fade-enter-active, .fade-leave-active { transition: all .25s ease; }
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to { opacity: 0; transform: translateY(-8px); }
</style>