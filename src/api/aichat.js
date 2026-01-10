import request from '@/utils/request'

// AI聊天：通过GET请求后端 /AIChat 接口，传递用户消息
export const aiChatApi = (message) =>
	request.get('/AIChat', {
		params: { message }
	})

// 清空AI聊天上下文：DELETE /AIChat
export const clearAiChatApi = () => request.delete('/AIChat')

