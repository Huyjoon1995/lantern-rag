import { Box, Typography, Button } from "@mui/material";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
type SidebarProps = {
  onHandleNewChat: () => void;
  document: File | null;
};

const Sidebar = ({ onHandleNewChat, document }: SidebarProps) => {
  return (
    <Box
      component="aside"
      sx={{
        width: 260,
        flexShrink: 0,
        p: 3,
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: { xs: "none", md: "block" },
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Lantern
      </Typography>

      <Button
        fullWidth
        variant="contained"
        startIcon={<ChatBubbleOutlineOutlinedIcon />}
        onClick={onHandleNewChat}
      >
        New chat
      </Button>

      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: "block", mt: 4 }}
      >
        Attached document
      </Typography>

      <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
        {document?.name ?? "No document attached"}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Attach a text file to ask questions about its contents.
      </Typography>
    </Box>
  );
};

export default Sidebar;
