import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

export default function RtmPopupMenu({ options }) {
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event) => {
		event.stopPropagation(); // Prevents row click events
		setAnchorEl(event.currentTarget);
	};

	const handleClose = (event) => {
		if (event) event.stopPropagation();
		setAnchorEl(null);
	};

	return (
		<div>
			<IconButton onClick={handleClick} size="small">
				<MoreVertIcon fontSize="small" />
			</IconButton>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				transformOrigin={{ horizontal: 'right', vertical: 'top' }}
				anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			>
				{options.map((option, index) => (
					<MenuItem
						key={index}
						onClick={(e) => {
							handleClose(e);
							option.action(e);
						}}
						sx={{ color: option.color || 'inherit' }}
					>
						{option.icon && (
							<ListItemIcon
								sx={{
									color:
										option.color ||
										'inherit',
									minWidth: '32px',
								}}
							>
								{option.icon}
							</ListItemIcon>
						)}
						<ListItemText primary={option.label} />
					</MenuItem>
				))}
			</Menu>
		</div>
	);
}
