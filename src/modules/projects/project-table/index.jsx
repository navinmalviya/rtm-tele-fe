'use client';

import { CalendarMonth, Delete, Edit, Person, RocketLaunch, Timer } from '@mui/icons-material';
import { Box, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useProjects } from '@/hooks/project';
import RtmDataGrid from '@/lib/common/datagrid';

export default function ProjectTable() {
	// Calling the hook internally to fetch project data
	const { data: projects = [], isLoading } = useProjects();

	const getStatusColor = (status) => {
		const colors = {
			PLANNED: { bg: '#F1F5F9', text: '#475569' },
			ONGOING: { bg: '#EFF6FF', text: '#2563EB' },
			COMPLETED: { bg: '#F0FDF4', text: '#16A34A' },
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
								bgcolor: '#F0F9FF',
								borderRadius: 1.5,
								border: '1px solid #E0F2FE',
								color: '#0369A1',
								display: 'flex',
							}}
						>
							<RocketLaunch fontSize="small" />
						</Box>
						<Box>
							<Typography
								sx={{
									fontWeight: 800,
									color: '#0F172A',
									fontSize: '0.85rem',
									lineHeight: 1,
									mb: 0.5,
								}}
							>
								{params.value}
							</Typography>
							<Stack direction="row" spacing={0.5} alignItems="center">
								<Person sx={{ fontSize: 12, color: '#94A3B8' }} />
								<Typography
									sx={{
										color: '#94A3B8',
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
								sx={{ color: '#F1F5F9' }}
							/>
							{/* Progress Circle */}
							<CircularProgress
								variant="determinate"
								value={params.value || 0}
								size={40}
								thickness={4}
								sx={{
									color: (params.value || 0) >= 100 ? '#10B981' : '#3B82F6',
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
									sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#1E293B' }}
								>
									{`${Math.round(params.value || 0)}%`}
								</Typography>
							</Box>
						</Box>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>
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
							<CalendarMonth sx={{ fontSize: 14, color: '#94A3B8' }} />
							<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
								{new Date(params.value).toLocaleDateString('en-IN', {
									day: '2-digit',
									month: 'short',
								})}
							</Typography>
						</Stack>
						<Stack direction="row" spacing={1} alignItems="center">
							<Timer sx={{ fontSize: 14, color: '#CBD5E1' }} />
							<Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: '#94A3B8' }}>
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
				renderCell: () => (
					<Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
						<Tooltip title="Edit Project">
							<IconButton size="small" sx={{ color: '#94A3B8' }}>
								<Edit fontSize="small" />
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete">
							<IconButton size="small" sx={{ color: '#FDA4AF' }}>
								<Delete fontSize="small" />
							</IconButton>
						</Tooltip>
					</Stack>
				),
			},
		],
		[]
	);

	return (
		<Box sx={{ width: '100%', bgcolor: 'white' }}>
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
