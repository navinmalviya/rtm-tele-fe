'use client';

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Avatar, Box, Card, Chip, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useUpdateTaskStatus } from '@/hooks/task/useUpdateTaskStatus';
import { TaskDetailDrawer } from '@/modules/tasks';
import { openDrawer } from '@/lib/store/slices/drawer-slice';

const COLUMNS = [
	{ id: 'OPEN', title: 'To Do' },
	{ id: 'IN_PROGRESS', title: 'In Progress' },
	{ id: 'RESOLVED', title: 'Resolved' },
	{ id: 'CLOSED', title: 'Closed' },
];

const TaskBoard = ({ tasks = [], isLoading }) => {
	const { mutate: updateStatus } = useUpdateTaskStatus();
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
					display: 'flex',
					gap: 3,
					width: '100%',
					height: 'calc(100vh - 350px)',
					overflowX: 'auto',
					pb: 2,
				}}
			>
				{COLUMNS.map((column) => (
					<Box
						key={column.id}
						sx={{
							flex: 1,
							minWidth: 320,
							bgcolor: 'background.default',
							borderRadius: 4,
							p: 2,
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="center"
							sx={{ mb: 2, px: 1 }}
						>
							<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
								{column.title.toUpperCase()}
							</Typography>
							<Chip
								label={boardData[column.id]?.length || 0}
								size="small"
								sx={{
									bgcolor: 'background.paper',
									fontWeight: 900,
									color: 'text.secondary',
									fontSize: '0.7rem',
								}}
							/>
						</Stack>

						<Droppable droppableId={column.id}>
							{(provided) => (
								<Box
									{...provided.droppableProps}
									ref={provided.innerRef}
									sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 100 }}
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

													<Stack direction="row" justifyContent="space-between" alignItems="center">
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
														<Stack direction="row" spacing={1} alignItems="center">
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
									{provided.placeholder}
								</Box>
							)}
						</Droppable>
					</Box>
				))}
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
