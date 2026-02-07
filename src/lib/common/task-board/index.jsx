'use client';

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Avatar, Box, Card, Chip, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useUpdateTaskStatus } from '@/hooks/task/useUpdateTaskStatus';

const COLUMNS = [
	{ id: 'OPEN', title: 'To Do' },
	{ id: 'IN_PROGRESS', title: 'In Progress' },
	{ id: 'RESOLVED', title: 'Resolved' },
	{ id: 'CLOSED', title: 'Closed' },
];

const TaskBoard = ({ tasks = [], isLoading }) => {
	const { mutate: updateStatus } = useUpdateTaskStatus();

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
							bgcolor: '#F1F5F9',
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
							<Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569' }}>
								{column.title.toUpperCase()}
							</Typography>
							<Chip
								label={boardData[column.id]?.length || 0}
								size="small"
								sx={{
									bgcolor: 'white',
									fontWeight: 900,
									color: '#64748B',
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
													sx={{
														mb: 2,
														p: 2,
														borderRadius: 3,
														bgcolor: 'white',
														boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
														borderLeft:
															task.priority === 'HIGH' || task.priority === 'CRITICAL'
																? '5px solid #EF4444'
																: '1px solid transparent',
														'&:hover': {
															boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
														},
													}}
												>
													<Typography
														variant="body2"
														sx={{
															fontWeight: 700,
															mb: 1.5,
															color: '#1E293B',
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
																bgcolor: '#F8FAFC',
															}}
														/>
														<Stack direction="row" spacing={1} alignItems="center">
															<Typography
																variant="caption"
																sx={{ fontWeight: 800, color: '#94A3B8' }}
															>
																{task.priority}
															</Typography>

															{/* Tooltip added here for assignee name hover */}
															<Tooltip title={task.assignedTo?.name || 'Unassigned'} arrow>
																<Avatar
																	sx={{
																		width: 24,
																		height: 24,
																		fontSize: '0.65rem',
																		bgcolor: '#3B82F6',
																		cursor: 'pointer',
																	}}
																>
																	{task.assignedTo?.name?.substring(0, 2).toUpperCase() || '??'}
																</Avatar>
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
