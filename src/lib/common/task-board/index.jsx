'use client';

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Autorenew, DeleteOutline, DoneAll, PendingActions, TaskAlt } from '@mui/icons-material';
import {
	Avatar,
	Box,
	Card,
	Chip,
	IconButton,
	Paper,
	Skeleton,
	Stack,
	Tooltip,
	Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useDeleteTask } from '@/hooks/task';
import { useUpdateTaskStatus } from '@/hooks/task/useUpdateTaskStatus';
import { openDrawer } from '@/lib/store/slices/drawer-slice';
import { TaskDetailDrawer } from '@/modules/tasks';

const COLUMNS = [
	{ id: 'OPEN', title: 'To Do' },
	{ id: 'IN_PROGRESS', title: 'In Progress' },
	{ id: 'RESOLVED', title: 'Resolved' },
	{ id: 'CLOSED', title: 'Closed' },
];

const STATUS_META = {
	OPEN: { icon: PendingActions, color: 'warning.main', tone: 'warning' },
	IN_PROGRESS: { icon: Autorenew, color: 'info.main', tone: 'info' },
	RESOLVED: { icon: TaskAlt, color: 'success.main', tone: 'success' },
	CLOSED: { icon: DoneAll, color: 'text.secondary', tone: 'grey' },
};

const isFailureDetailsPending = (task) =>
	task.type === 'FAILURE' &&
	(!task.failure || !task.failure.type || !task.failure.cause || !task.failure.failureInTime);

const TaskBoard = ({ tasks = [], isLoading }) => {
	const { data: session } = useSession();
	const { mutate: updateStatus } = useUpdateTaskStatus();
	const { mutate: deleteTask } = useDeleteTask();
	const theme = useTheme();
	const dispatch = useDispatch();

	const initialBoardData = useMemo(() => {
		const columns = {
			OPEN: [],
			IN_PROGRESS: [],
			RESOLVED: [],
			CLOSED: [],
		};

		for (const task of tasks) {
			if (columns[task.status]) {
				columns[task.status].push(task);
			}
		}
		return columns;
	}, [tasks]);

	const [boardData, setBoardData] = useState(initialBoardData);

	useEffect(() => {
		setBoardData(initialBoardData);
	}, [initialBoardData]);

	const onDragEnd = (result) => {
		const { destination, source, draggableId } = result;

		if (!destination) return;
		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		const sourceCol = [...boardData[source.droppableId]];
		const destCol = [...boardData[destination.droppableId]];
		const [movedTask] = sourceCol.splice(source.index, 1);

		const updatedTask = { ...movedTask, status: destination.droppableId };
		destCol.splice(destination.index, 0, updatedTask);

		setBoardData((prev) => ({
			...prev,
			[source.droppableId]: sourceCol,
			[destination.droppableId]: destCol,
		}));

		if (source.droppableId !== destination.droppableId) {
			updateStatus({ id: draggableId, status: destination.droppableId });
		}
	};

	if (isLoading) return <TaskBoardSkeleton />;

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Box
				sx={{
					display: 'grid',
					gap: 3,
					width: '100%',
					gridTemplateColumns: {
						xs: 'repeat(1, minmax(0, 1fr))',
						md: 'repeat(2, minmax(0, 1fr))',
						xl: 'repeat(4, minmax(0, 1fr))',
					},
					minHeight: 'calc(100vh - 350px)',
					pb: 2,
				}}
			>
				{COLUMNS.map((column) => {
					const meta = STATUS_META[column.id];
					const StatusIcon = meta.icon;
					return (
						<Paper
							key={column.id}
							variant="outlined"
							sx={{
								minWidth: 0,
								borderRadius: 4,
								p: 2,
								display: 'flex',
								flexDirection: 'column',
								borderColor: alpha(theme.palette[meta.tone]?.main || theme.palette.divider, 0.5),
								bgcolor: alpha(
									theme.palette[meta.tone]?.main || '#000',
									theme.palette.mode === 'dark' ? 0.08 : 0.04
								),
							}}
						>
							<Stack
								direction="row"
								justifyContent="space-between"
								alignItems="center"
								sx={{ mb: 2, px: 1 }}
							>
								<Stack direction="row" spacing={1} alignItems="center">
									<Box
										sx={{
											width: 28,
											height: 28,
											borderRadius: '50%',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											bgcolor: alpha(theme.palette[meta.tone]?.main || '#000', 0.14),
											color: meta.color,
										}}
									>
										<StatusIcon sx={{ fontSize: 18 }} />
									</Box>
									<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
										{column.title}
									</Typography>
								</Stack>
								<Chip
									label={boardData[column.id]?.length || 0}
									size="small"
									sx={{
										bgcolor: alpha(theme.palette[meta.tone]?.main || '#000', 0.14),
										fontWeight: 900,
										color: meta.color,
										fontSize: '0.7rem',
									}}
								/>
							</Stack>

							<Droppable droppableId={column.id}>
								{(provided) => (
									<Box
										{...provided.droppableProps}
										ref={provided.innerRef}
										sx={{
											flexGrow: 1,
											overflowY: 'auto',
											minHeight: 180,
											maxHeight: { xs: 'unset', xl: 'calc(100vh - 450px)' },
											pr: 0.5,
										}}
									>
										{boardData[column.id]?.map((task, index) => (
											<Draggable key={task.id} draggableId={task.id} index={index}>
												{(provided) => (
													<Card
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														onClick={() => {
															if (!task?.id) return;
															dispatch(
																openDrawer({
																	drawerName: 'taskDetailDrawer',
																	taskId: task.id,
																})
															);
														}}
														sx={{
															mb: 2,
															p: 2,
															borderRadius: 3,
															bgcolor: 'background.paper',
															boxShadow: 1,
															borderLeft:
																task.priority === 'HIGH' || task.priority === 'CRITICAL'
																	? `5px solid ${theme.palette.error.main}`
																	: '1px solid transparent',
															'&:hover': {
																boxShadow: 3,
															},
														}}
													>
														<Typography
															variant="body2"
															sx={{
																fontWeight: 700,
																mb: 1.5,
																color: 'text.primary',
															}}
														>
															{task.title}
														</Typography>

														{isFailureDetailsPending(task) && (
															<Chip
																label="Details Pending"
																size="small"
																sx={{
																	mb: 1.5,
																	height: 20,
																	fontSize: '0.62rem',
																	fontWeight: 800,
																	bgcolor: alpha(theme.palette.warning.main, 0.16),
																	color: 'warning.dark',
																	border: '1px solid',
																	borderColor: alpha(theme.palette.warning.main, 0.4),
																}}
															/>
														)}

														<Stack
															direction="row"
															justifyContent="space-between"
															alignItems="center"
														>
															<Chip
																label={task.type}
																size="small"
																sx={{
																	fontWeight: 800,
																	fontSize: '0.6rem',
																	height: 20,
																	bgcolor: 'action.hover',
																}}
															/>
															<Stack direction="row" spacing={0.5} alignItems="center">
																{(session?.user?.role === 'SUPER_ADMIN' ||
																	session?.user?.role === 'ADMIN' ||
																	session?.user?.role === 'TESTROOM' ||
																	task.ownerId === session?.user?.id) && (
																	<Tooltip title="Delete task">
																		<IconButton
																			size="small"
																			onClick={(event) => {
																				event.stopPropagation();
																				const confirmDelete = window.confirm(
																					'Delete this task from workflow overview?'
																				);
																				if (!confirmDelete) return;
																				deleteTask(task.id);
																			}}
																			sx={{ color: 'error.main' }}
																		>
																			<DeleteOutline sx={{ fontSize: 16 }} />
																		</IconButton>
																	</Tooltip>
																)}
																<Typography
																	variant="caption"
																	sx={{ fontWeight: 800, color: 'text.disabled' }}
																>
																	{task.priority}
																</Typography>

																<Tooltip title={task.assignedTo?.name || 'Unassigned'} arrow>
																	<Box component="span">
																		<Avatar
																			sx={{
																				width: 24,
																				height: 24,
																				fontSize: '0.65rem',
																				bgcolor: 'primary.main',
																				cursor: 'pointer',
																			}}
																		>
																			{task.assignedTo?.name?.substring(0, 2).toUpperCase() || '??'}
																		</Avatar>
																	</Box>
																</Tooltip>
															</Stack>
														</Stack>
													</Card>
												)}
											</Draggable>
										))}
										{(boardData[column.id] || []).length === 0 && (
											<Box
												sx={{
													minHeight: 120,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													border: '1px dashed',
													borderColor: 'divider',
													borderRadius: 3,
													bgcolor: 'background.paper',
												}}
											>
												<Typography
													variant="caption"
													sx={{ color: 'text.secondary', fontWeight: 700 }}
												>
													No tasks in {column.title}
												</Typography>
											</Box>
										)}
										{provided.placeholder}
									</Box>
								)}
							</Droppable>
						</Paper>
					);
				})}
			</Box>
			<TaskDetailDrawer />
		</DragDropContext>
	);
};

const TaskBoardSkeleton = () => {
	return (
		<Stack direction="row" spacing={3} sx={{ mt: 3, overflowX: 'hidden' }}>
			{[1, 2, 3, 4].map((i) => (
				<Skeleton key={i} variant="rounded" width={320} height={500} sx={{ borderRadius: 4 }} />
			))}
		</Stack>
	);
};

export default TaskBoard;
