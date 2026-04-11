'use client';

import {
	AttachFile,
	ChatBubbleOutline,
	Description,
	Send,
} from '@mui/icons-material';
import {
	Alert,
	Autocomplete,
	Avatar,
	Box,
	Button,
	Chip,
	Divider,
	IconButton,
	InputAdornment,
	List,
	ListItemButton,
	ListItemText,
	Paper,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
	useChatConversations,
	useChatMessages,
	useChatUsers,
	useCreateChatConversation,
	useSendChatMessage,
} from '@/hooks/chat';
import { useToast } from '@/hooks/common';

const formatDateTime = (value) => {
	if (!value) return '-';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';
	return date.toLocaleString();
};

const fileToBase64 = (file) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(new Error('Unable to read file'));
		reader.readAsDataURL(file);
	});

export default function ChatModule() {
	const { data: session } = useSession();
	const showToast = useToast();
	const [search, setSearch] = useState('');
	const [targetUser, setTargetUser] = useState(null);
	const [selectedConversationId, setSelectedConversationId] = useState('');
	const [messageText, setMessageText] = useState('');
	const [selectedFile, setSelectedFile] = useState(null);
	const fileInputRef = useRef(null);
	const messagesBottomRef = useRef(null);

	const { data: users = [], isLoading: usersLoading } = useChatUsers(search);
	const { data: conversations = [], isLoading: conversationsLoading } =
		useChatConversations();
	const { mutateAsync: createConversation, isPending: creatingConversation } =
		useCreateChatConversation();
	const currentConversation = useMemo(
		() => conversations.find((conversation) => conversation.id === selectedConversationId) || null,
		[conversations, selectedConversationId]
	);
	const { data: messages = [], isLoading: messagesLoading } = useChatMessages(
		currentConversation?.id
	);
	const { mutateAsync: sendMessage, isPending: sendingMessage } = useSendChatMessage();

	useEffect(() => {
		if (!selectedConversationId && conversations.length > 0) {
			setSelectedConversationId(conversations[0].id);
		}
	}, [conversations, selectedConversationId]);

	useEffect(() => {
		messagesBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleStartChat = async () => {
		if (!targetUser?.id) return;
		const conversation = await createConversation(targetUser.id);
		if (conversation?.id) {
			setSelectedConversationId(conversation.id);
			setTargetUser(null);
		}
	};

	const handleSelectFile = (event) => {
		const file = event.target.files?.[0] || null;
		if (!file) return;
		if (file.size > 10 * 1024 * 1024) {
			showToast('Attachment exceeds 10 MB limit.', 'warning');
			event.target.value = '';
			return;
		}
		setSelectedFile(file);
	};

	const handleSendMessage = async () => {
		if (!currentConversation?.id) return;
		const text = messageText.trim();
		if (!text && !selectedFile) return;

		let attachment = null;
		if (selectedFile) {
			const contentBase64 = await fileToBase64(selectedFile);
			attachment = {
				fileName: selectedFile.name,
				mimeType: selectedFile.type || 'application/octet-stream',
				contentBase64,
			};
		}

		await sendMessage({
			conversationId: currentConversation.id,
			payload: { text, attachment },
		});

		setMessageText('');
		setSelectedFile(null);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	return (
		<Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={2}
				justifyContent="space-between"
				alignItems={{ xs: 'flex-start', md: 'center' }}
			>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 800 }}>
						Team Chat
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Direct chat with documents between all users.
					</Typography>
				</Box>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', md: 520 } }}>
					<Autocomplete
						fullWidth
						options={users}
						value={targetUser}
						loading={usersLoading}
						noOptionsText={search ? 'No matching users' : 'No users available'}
						onChange={(_event, value) => setTargetUser(value)}
						onInputChange={(_event, value) => setSearch(value)}
						getOptionLabel={(option) =>
							`${option.name} (${option.designation || option.role || option.username})`
						}
						renderInput={(params) => (
							<TextField {...params} label="Start chat with user" />
						)}
					/>
					<Button
						variant="contained"
						onClick={handleStartChat}
						disabled={!targetUser || creatingConversation}
						sx={{ minWidth: 140 }}
					>
						Start Chat
					</Button>
				</Stack>
			</Stack>

			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={2}
				sx={{ minHeight: { xs: 520, md: 'calc(100vh - 210px)' } }}
			>
				<Paper
					variant="outlined"
					sx={{
						width: { xs: '100%', md: 350 },
						borderRadius: 3,
						overflow: 'hidden',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
							Conversations
						</Typography>
					</Box>
					<List sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
						{conversationsLoading ? (
							<Box sx={{ p: 2 }}>
								<Typography variant="body2" color="text.secondary">
									Loading conversations...
								</Typography>
							</Box>
						) : conversations.length ? (
							conversations.map((conversation) => (
								<ListItemButton
									key={conversation.id}
									selected={conversation.id === currentConversation?.id}
									onClick={() => setSelectedConversationId(conversation.id)}
									sx={{ alignItems: 'flex-start', py: 1.5 }}
								>
									<Avatar sx={{ width: 32, height: 32, mr: 1.5 }}>
										{conversation.peer?.name?.[0] || 'U'}
									</Avatar>
									<ListItemText
										primary={conversation.peer?.name || '-'}
										secondary={
											<Box component="span">
												<Typography
													component="span"
													variant="caption"
													color="text.secondary"
													sx={{ display: 'block' }}
												>
													{conversation.peer?.designation || conversation.peer?.role || '-'}
												</Typography>
												<Typography
													component="span"
													variant="body2"
													color="text.primary"
													sx={{
														display: 'block',
														maxWidth: 220,
														whiteSpace: 'nowrap',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
													}}
												>
													{conversation.lastMessage?.text ||
														(conversation.lastMessage?.attachmentName
															? `Attachment: ${conversation.lastMessage.attachmentName}`
															: 'No messages yet')}
												</Typography>
											</Box>
										}
									/>
								</ListItemButton>
							))
						) : (
							<Box sx={{ p: 2 }}>
								<Typography variant="body2" color="text.secondary">
									No conversations yet.
								</Typography>
							</Box>
						)}
					</List>
				</Paper>

				<Paper
					variant="outlined"
					sx={{
						flex: 1,
						borderRadius: 3,
						display: 'flex',
						flexDirection: 'column',
						overflow: 'hidden',
					}}
				>
					{currentConversation ? (
						<>
							<Box
								sx={{
									px: 2,
									py: 1.5,
									borderBottom: '1px solid',
									borderColor: 'divider',
								}}
							>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									{currentConversation.peer?.name || '-'}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{currentConversation.peer?.designation ||
										currentConversation.peer?.role ||
										currentConversation.peer?.username}
								</Typography>
							</Box>

							<Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
								{messagesLoading ? (
									<Typography variant="body2" color="text.secondary">
										Loading messages...
									</Typography>
								) : messages.length ? (
									<Stack spacing={1.5}>
										{messages.map((message) => {
											const mine = message.senderId === session?.user?.id;
											return (
												<Box
													key={message.id}
													sx={{
														alignSelf: mine ? 'flex-end' : 'flex-start',
														maxWidth: '80%',
														bgcolor: mine ? 'primary.main' : 'action.hover',
														color: mine ? 'primary.contrastText' : 'text.primary',
														borderRadius: 2,
														px: 1.5,
														py: 1,
													}}
												>
													{message.text ? (
														<Typography variant="body2">{message.text}</Typography>
													) : null}
													{message.attachmentUrl ? (
														<Stack
															direction="row"
															spacing={0.75}
															alignItems="center"
															sx={{ mt: message.text ? 0.75 : 0 }}
														>
															<Description sx={{ fontSize: 16 }} />
															<Typography
																component="a"
																href={message.attachmentUrl}
																target="_blank"
																rel="noreferrer"
																variant="caption"
																sx={{
																	color: mine
																		? 'primary.contrastText'
																		: 'primary.main',
																	textDecoration: 'underline',
																}}
															>
																{message.attachmentName || 'Open attachment'}
															</Typography>
														</Stack>
													) : null}
													<Typography
														variant="caption"
														sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}
													>
														{formatDateTime(message.createdAt)}
													</Typography>
												</Box>
											);
										})}
										<div ref={messagesBottomRef} />
									</Stack>
								) : (
									<Typography variant="body2" color="text.secondary">
										No messages yet. Send the first message.
									</Typography>
								)}
							</Box>

							<Divider />

							<Box sx={{ p: 1.5 }}>
								{selectedFile ? (
									<Alert
										severity="info"
										sx={{ mb: 1 }}
										action={
											<Button color="inherit" size="small" onClick={() => setSelectedFile(null)}>
												Remove
											</Button>
										}
									>
										Attached: {selectedFile.name}
									</Alert>
								) : null}
								<Stack direction="row" spacing={1}>
									<TextField
										fullWidth
										multiline
										minRows={1}
										maxRows={4}
										value={messageText}
										onChange={(event) => setMessageText(event.target.value)}
										placeholder="Type a message..."
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<input
														ref={fileInputRef}
														type="file"
														hidden
														onChange={handleSelectFile}
													/>
													<Tooltip title="Attach document">
														<IconButton
															size="small"
															onClick={() => fileInputRef.current?.click()}
														>
															<AttachFile fontSize="small" />
														</IconButton>
													</Tooltip>
												</InputAdornment>
											),
										}}
									/>
									<Button
										variant="contained"
										onClick={handleSendMessage}
										disabled={sendingMessage || (!messageText.trim() && !selectedFile)}
										endIcon={<Send fontSize="small" />}
									>
										Send
									</Button>
								</Stack>
							</Box>
						</>
					) : (
						<Stack
							sx={{ flex: 1 }}
							alignItems="center"
							justifyContent="center"
							spacing={1}
						>
							<ChatBubbleOutline sx={{ fontSize: 36, color: 'text.secondary' }} />
							<Typography variant="h6">Select or start a conversation</Typography>
							<Chip label="Attachments supported up to 10 MB" color="primary" variant="outlined" />
						</Stack>
					)}
				</Paper>
			</Stack>
		</Box>
	);
}
