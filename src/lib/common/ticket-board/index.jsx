'use client';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Avatar, Box, Card, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';

const initialData = {
	columns: {
		todo: { id: 'todo', title: 'To Do', taskIds: ['task-1', 'task-2'] },
		progress: { id: 'progress', title: 'In Progress', taskIds: ['task-3'] },
		done: { id: 'done', title: 'Testing', taskIds: [] },
	},
	tasks: {
		'task-1': {
			id: 'task-1',
			content: 'Cable Cut: Morwani Section',
			priority: 'High',
			code: 'FE-RT-01',
		},
		'task-2': {
			id: 'task-2',
			content: 'Socket Unresponsive: RTM',
			priority: 'Medium',
			code: 'FE-RT-05',
		},
		'task-3': {
			id: 'task-3',
			content: 'Battery Low: Bildi',
			priority: 'Critical',
			code: 'FE-RT-02',
		},
	},
};

export default function TicketBoard() {
	const [data, setData] = useState(initialData);

	const onDragEnd = (result) => {
		const { destination, source, draggableId } = result;
		if (!destination) return;
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		)
			return;

		const start = data.columns[source.droppableId];
		const finish = data.columns[destination.droppableId];

		if (start === finish) {
			const newTaskIds = Array.from(start.taskIds);
			newTaskIds.splice(source.index, 1);
			newTaskIds.splice(destination.index, 0, draggableId);
			const newColumn = { ...start, taskIds: newTaskIds };
			setData({
				...data,
				columns: { ...data.columns, [newColumn.id]: newColumn },
			});
			return;
		}

		// Moving between columns
		const startTaskIds = Array.from(start.taskIds);
		startTaskIds.splice(source.index, 1);
		const finishTaskIds = Array.from(finish.taskIds);
		finishTaskIds.splice(destination.index, 0, draggableId);

		setData({
			...data,
			columns: {
				...data.columns,
				[start.id]: { ...start, taskIds: startTaskIds },
				[finish.id]: { ...finish, taskIds: finishTaskIds },
			},
		});
	};

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Box
				sx={{
					display: 'flex',
					gap: 3,
					mt: 3,
					width: '100%', // Take full available width
					height: 'calc(100vh - 400px)', // Vertical fill
					overflowX: 'auto', // Scroll horizontally if needed
					pb: 2,
				}}
			>
				{Object.values(data.columns).map((column) => (
					<Box
						key={column.id}
						sx={{
							flex: 1, // Columns take equal width
							minWidth: 350, // Don't let columns get too squished
							bgcolor: '#F1F5F9',
							borderRadius: 4,
							p: 2,
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<Typography
							variant="subtitle2"
							sx={{
								fontWeight: 800,
								color: '#64748B',
								mb: 2,
								px: 1,
							}}
						>
							{column.title.toUpperCase()} •{' '}
							{column.taskIds.length}
						</Typography>

						<Droppable droppableId={column.id}>
							{(provided) => (
								<Box
									{...provided.droppableProps}
									ref={provided.innerRef}
									sx={{
										flexGrow: 1,
										overflowY: 'auto',
									}}
								>
									{column.taskIds.map(
										(taskId, index) => {
											const task =
												data
													.tasks[
													taskId
												];
											return (
												<Draggable
													key={
														task.id
													}
													draggableId={
														task.id
													}
													index={
														index
													}
												>
													{(
														provided
													) => (
														<Card
															ref={
																provided.innerRef
															}
															{...provided.draggableProps}
															{...provided.dragHandleProps}
															sx={{
																mb: 2,
																p: 2,
																borderRadius: 3,
																bgcolor: 'white',
																boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
																borderLeft:
																	task.priority ===
																	'Critical'
																		? '5px solid #EF4444'
																		: '1px solid transparent',
																'&:hover': {
																	boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
																},
															}}
														>
															<Typography
																variant="body1"
																sx={{
																	fontWeight: 700,
																	mb: 2,
																}}
															>
																{
																	task.content
																}
															</Typography>
															<Stack
																direction="row"
																justifyContent="space-between"
																alignItems="center"
															>
																<Chip
																	label={
																		task.priority
																	}
																	size="small"
																	sx={{
																		fontWeight: 700,
																		fontSize: '0.65rem',
																	}}
																/>
																<Stack
																	direction="row"
																	spacing={
																		1
																	}
																	alignItems="center"
																>
																	<Typography
																		variant="caption"
																		sx={{
																			fontWeight: 800,
																			color: '#64748B',
																		}}
																	>
																		{
																			task.code
																		}
																	</Typography>
																	<Avatar
																		sx={{
																			width: 28,
																			height: 28,
																			fontSize: '0.75rem',
																			fontWeight: 700,
																		}}
																	>
																		JD
																	</Avatar>
																</Stack>
															</Stack>
														</Card>
													)}
												</Draggable>
											);
										}
									)}
									{provided.placeholder}
								</Box>
							)}
						</Droppable>
					</Box>
				))}
			</Box>
		</DragDropContext>
	);
}
