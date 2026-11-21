import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export type ToastState = { message: string; severity: "success" | "error" } | null;

type Props = {
  toast: ToastState;
  onClose: () => void;
};

export default function Toast({ toast, onClose }: Props) {
  return (
    <Snackbar
      open={toast !== null}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={toast?.severity ?? "success"} variant="filled" onClose={onClose}>
        {toast?.message}
      </Alert>
    </Snackbar>
  );
}