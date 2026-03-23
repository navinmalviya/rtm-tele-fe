'use client';

import { CalendarMonth, DeleteOutline, Edit, Person, RocketLaunch, Timer } from '@mui/icons-material';
import { Box, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useProjects } from '@/hooks/project';
import RtmDataGrid from '@/lib/common/datagrid';

export default function ProjectTable({ onEdit, onDelete }) {
	// Calling the hook internally to fetch project data
	const { data: projects = [], isLoading } = useProjects();
	const theme = useTheme();

	const getStatusColor = (status) => {
		const colors = {
			PLANNED: {
				bg: alpha(theme.palette.text.primary, 0.06),
				text: theme.palette.text.secondary,
			},
			ONGOING: {
				bg: alpha(theme.palette.primary.main, 0.12),
				text: theme.palette.primary.main,
			},
			COMPLETED: {
				bg: alpha(theme.palette.success.main, 0.12),
				text: theme.palette.success.main,
			},
		};
		return colors[status] || colors.PLANNED;
	};

	const columns = useMemo(
		() => [
			{
				field: 'name',
				headerName: 'PROJECT IDENTITY',
				flex: 1.5,
				renderCell: (params) => (
					<Stack direction="row" spacing={2} alignItems="center">
						<Box
							sx={{
								p: 1,
								bgcolor: alpha(theme.palette.primary.main, 0.1),
								borderRadius: 1.5,
								border: '1px solid',
								borderColor: alpha(theme.palette.primary.main, 0.2),
								color: theme.palette.primary.main,
								display: 'flex',
							}}
						>
							<RocketLaunch fontSize="small" />
						</Box>
						<Box>
							<Typography
								sx={{
									fontWeight: 800,
									color: 'text.primary',
									fontSize: '0.85rem',
									lineHeight: 1,
									mb: 0.5,
								}}
							>
								{params.value}
							</Typography>
							<Stack direction="row" spacing={0.5} alignItems="center">
								<Person sx={{ fontSize: 12, color: 'text.disabled' }} />
								<Typography
									sx={{
										color: 'text.disabled',
										fontSize: '0.72rem',
										fontWeight: 600,
										lineHeight: 1,
									}}
								>
									{params.row.owner?.name || 'Unknown Owner'}
								</Typography>
							</Stack>
						</Box>
					</Stack>
				),
			},
			{
				field: 'status',
				headerName: 'STATUS',
				flex: 0.8,
				renderCell: (params) => {
					const theme = getStatusColor(params.value);
					return (
						<Chip
							label={params.value}
							size="small"
							sx={{
								bgcolor: theme.bg,
								color: theme.text,
								fontWeight: 800,
								fontSize: '0.65rem',
								borderRadius: 1,
							}}
						/>
					);
				},
			},
			{
				field: 'totalProgress',
				headerName: 'WEIGHTED COMPLETION',
				flex: 1.2,
				renderCell: (params) => (
					<Stack direction="row" spacing={2} alignItems="center">
						<Box sx={{ position: 'relative', display: 'inline-flex' }}>
							{/* Background Circle */}
							<CircularProgress
								variant="determinate"
								value={100}
								size={40}
								thickness={4}
								sx={{ color: 'action.hover' }}
							/>
							{/* Progress Circle */}
							<CircularProgress
								variant="determinate"
								value={params.value || 0}
								size={40}
								thickness={4}
								sx={{
									color:
										(params.value || 0) >= 100
											? theme.palette.success.main
											: theme.palette.primary.main,
									position: 'absolute',
									left: 0,
								}}
							/>
							<Box
								sx={{
									top: 0,
									left: 0,
									bottom: 0,
									right: 0,
									position: 'absolute',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Typography
									variant="caption"
									component="div"
									sx={{ fontSize: '0.65rem', fontWeight: 900, color: 'text.primary' }}
								>
									{`${Math.round(params.value || 0)}%`}
								</Typography>
							</Box>
						</Box>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
							{params.row._count?.tasks || 0} Tasks
						</Typography>
					</Stack>
				),
			},
			{
				field: 'startDate',
				headerName: 'TIMELINE',
				flex: 1.2,
				renderCell: (params) => (
					<Stack spacing={0.5}>
						<Stack direction="row" spacing={1} alignItems="center">
							<CalendarMonth sx={{ fontSize: 14, color: 'text.disabled' }} />
							<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
								{new Date(params.value).toLocaleDateString('en-IN', {
									day: '2-digit',
									month: 'short',
								})}
							</Typography>
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center">
							<Timer sx={{ fontSize: 14, color: 'text.disabled' }} />
							<Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: 'text.disabled' }}>
								Target:{' '}
								{params.row.endDate
									? new Date(params.row.endDate).toLocaleDateString('en-IN', {
											day: '2-digit',
											month: 'short',
										})
									: 'Open'}
							</Typography>
						</Stack>
					</Stack>
				),
			},
			{
				field: 'actions',
				headerName: '',
				width: 100,
				sortable: false,
				align: 'right',
				renderCell: (params) => (
					<Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
						<Tooltip title="Edit Project">
							<IconButton
								size="small"
								sx={{ color: 'text.secondary' }}
								onClick={() => onEdit?.(params.row)}
							>
								<Edit fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete">
							<IconButton
								size="small"
								sx={{ color: 'error.light' }}
								onClick={() => onDelete?.(params.row)}
							>
								<DeleteOutline fontSize="small" />
							</IconButton>
						</Tooltip>
					</Stack>
				),
			},
		],
		[onDelete, onEdit, theme]
	);

	return (
		<Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
			<RtmDataGrid
				rows={projects}
				columns={columns}
				loading={isLoading}
				getRowId={(row) => row.id}
				rowHeight={75}
				disableRowSelectionOnClick
			/>
		</Box>
	);
}
