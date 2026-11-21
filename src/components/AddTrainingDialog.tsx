import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { type Customer } from "../types";

export type TrainingInput = { date: string; activity: string; duration: number };

type Props = {
  customer: Customer;
  onClose: () => void;
  onSave: (data: TrainingInput) => Promise<void>;
};

export default function AddTrainingDialog({ customer, onClose, onSave }: Props) {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  const valid =
    date !== null &&
    date.isValid() &&
    activity.trim() !== "" &&
    Number(duration) > 0;

  const handleSave = async () => {
    if (!date) return;
    setSaving(true);
    await onSave({
      date: date.toISOString(), // ISO-8601, as the API requires
      activity: activity.trim(),
      duration: Number(duration),
    });
    setSaving(false);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Add training for {customer.firstname} {customer.lastname}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date and time"
              value={date}
              onChange={setDate}
              ampm={false}
              format="DD.MM.YYYY HH:mm"
              slotProps={{ textField: { size: "small", required: true } }}
            />
          </LocalizationProvider>

          <TextField
            label="Activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            required
            size="small"
          />

          <TextField
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            size="small"
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!valid || saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}