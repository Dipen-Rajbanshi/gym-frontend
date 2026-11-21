import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { type Customer, type CustomerInput } from "../types";

type Field = { name: keyof CustomerInput; label: string; full?: boolean };

const fields: Field[] = [
  { name: "firstname", label: "First name" },
  { name: "lastname", label: "Last name" },
  { name: "streetaddress", label: "Street address", full: true },
  { name: "postcode", label: "Postcode" },
  { name: "city", label: "City" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
];

type Props = {
  customer: Customer | null;
  onClose: () => void;
  onSave: (data: CustomerInput) => Promise<void>;
};

export default function CustomerFormDialog({ customer, onClose, onSave }: Props) {
  const [form, setForm] = useState<CustomerInput>({
    firstname: customer?.firstname ?? "",
    lastname: customer?.lastname ?? "",
    streetaddress: customer?.streetaddress ?? "",
    postcode: customer?.postcode ?? "",
    city: customer?.city ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);

  const emailOk = /\S+@\S+\.\S+/.test(form.email);
  const valid = fields.every((f) => form[f.name].trim() !== "") && emailOk;

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      streetaddress: form.streetaddress.trim(),
      postcode: form.postcode.trim(),
      city: form.city.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    setSaving(false);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{customer ? "Edit customer" : "Add customer"}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            pt: 1,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          {fields.map((f) => (
            <TextField
              key={f.name}
              label={f.label}
              value={form[f.name]}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
              required
              size="small"
              error={f.name === "email" && form.email !== "" && !emailOk}
              helperText={
                f.name === "email" && form.email !== "" && !emailOk
                  ? "Enter a valid email"
                  : undefined
              }
              sx={{ gridColumn: f.full ? "1 / -1" : undefined }}
            />
          ))}
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