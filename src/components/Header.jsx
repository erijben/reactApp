import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";
import PropTypes from 'prop-types';
const Header = ({ title, subtitle, actions, onSubtitleClick }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb="30px" display="flex" alignItems="center" justifyContent="space-between">
      <div>
        <Typography
          variant="h2"
          color={colors.grey[100]}
          fontWeight="bold"
          sx={{ m: "0 0 5px 0" }}
        >
          {title}
        </Typography>
        <Typography variant="h5" color={colors.greenAccent[400]}>
        {subtitle && (
        <h3 onClick={onSubtitleClick} style={{ cursor: 'pointer' }}>{subtitle}</h3>
      )}
        </Typography>
      </div>
      <div>
        {actions && actions}
      </div>
    </Box>
  );
};
Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  onSubtitleClick: PropTypes.func, // Ajoutez cette ligne pour valider la fonction de rappel
};
export default Header;