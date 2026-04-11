import http from '../../../httpCommon';

const listUsers = (params = {}) => http.get('/chat/users', { params });

const listConversations = () => http.get('/chat/conversations');

const getUnreadCount = () => http.get('/chat/unread-count');

const createConversation = (targetUserId) =>
	http.post('/chat/conversations', { targetUserId });

const listMessages = (conversationId, params = {}) =>
	http.get(`/chat/conversations/${conversationId}/messages`, { params });

const sendMessage = (conversationId, payload = {}) =>
	http.post(`/chat/conversations/${conversationId}/messages`, payload);

export const ChatService = {
	listUsers,
	listConversations,
	getUnreadCount,
	createConversation,
	listMessages,
	sendMessage,
};
