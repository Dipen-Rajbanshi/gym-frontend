import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { type Customer, type CustomerInput, API_URL } from "../types";
import { extractList, getCustomerId } from "../utils";
import { gridTheme } from "../gridTheme";
import ListToolbar, { type SortOption } from "./ListToolbar";
import CustomerFormDialog from "./CustomerFormDialog";
import AddTrainingDialog, { type TrainingInput } from "./AddTrainingDialog";
import ConfirmDialog from "./ConfirmDialog";
import Toast, { type ToastState } from "./Toast";

ModuleRegistry.registerModules([AllCommunityModule]);

const sortOptions: SortOption[] = [
  { value: "firstname:asc", label: "First name (A-Z)" },
  { value: "firstname:desc", label: "First name (Z-A)" },
  { value: "lastname:asc", label: "Last name (A-Z)" },
  { value: "lastname:desc", label: "Last name (Z-A)" },
  { value: "city:asc", label: "City (A-Z)" },
  { value: "city:desc", label: "City (Z-A)" },
];

const JSON_HEADERS = { "Content-Type": "application/json" };

export default function CustomerList() {
  const gridRef = useRef<AgGridReact<Customer>>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [shownCount, setShownCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog and message state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [trainingFor, setTrainingFor] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const columnDefs = useMemo<ColDef<Customer>[]>(
    () => [
      { colId: "firstname", field: "firstname", headerName: "First name" },
      { colId: "lastname", field: "lastname", headerName: "Last name" },
      { colId: "streetaddress", field: "streetaddress", headerName: "Address" },
      { colId: "postcode", field: "postcode", headerName: "Postcode", maxWidth: 130 },
      { colId: "city", field: "city", headerName: "City" },
      { colId: "email", field: "email", headerName: "Email", minWidth: 200 },
      { colId: "phone", field: "phone", headerName: "Phone" },
      {
        colId: "actions",
        headerName: "Actions",
        sortable: false,
        filter: false,
        unSortIcon: false,
        resizable: false,
        flex: 0,
        width: 160,
        cellRenderer: (p: ICellRendererParams<Customer>) => {
          const c = p.data;
          if (!c) return null;
          return (
            <div className="row-actions">
              <Tooltip title="Add training">
                <IconButton
                  size="small"
                  color="primary"
                  aria-label="Add training"
                  onClick={() => setTrainingFor(c)}
                >
                  <EventAvailableIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit customer">
                <IconButton
                  size="small"
                  aria-label="Edit customer"
                  onClick={() => {
                    setEditing(c);
                    setFormOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete customer">
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Delete customer"
                  onClick={() => setDeleting(c)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    []
  );

  const loadCustomers = useCallback(() => {
    setLoading(true);
    setError("");
    fetch(`${API_URL}/customers`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => setCustomers(extractList<Customer>(data, "customers")))
      .catch((err) => setError("Could not load customers: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // ---- Sorting ----
  const handleSortChange = (value: string) => {
    setSortValue(value);
    const [colId, sort] = value.split(":");
    gridRef.current?.api.applyColumnState({
      state: value ? [{ colId, sort: sort as "asc" | "desc" }] : [],
      defaultState: { sort: null },
    });
  };

  const handleSortChanged = () => {
    const sorted = gridRef.current?.api.getColumnState().find((c) => c.sort);
    setSortValue(sorted ? `${sorted.colId}:${sorted.sort}` : "");
  };

  // ---- Add / edit customer ----
  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const saveCustomer = async (data: CustomerInput) => {
    const isEdit = editing !== null;
    const url = isEdit
      ? `${API_URL}/customers/${getCustomerId(editing)}`
      : `${API_URL}/customers`;
    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      closeForm();
      setToast({
        message: isEdit ? "Customer updated" : "Customer added",
        severity: "success",
      });
      loadCustomers();
    } catch (err) {
      setToast({
        message: "Could not save customer: " + (err as Error).message,
        severity: "error",
      });
    }
  };

  // ---- Delete customer ----
  const confirmDelete = async () => {
    if (!deleting) return;
    const customer = deleting;
    setDeleting(null);
    try {
      const res = await fetch(`${API_URL}/customers/${getCustomerId(customer)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setToast({ message: "Customer deleted", severity: "success" });
      loadCustomers();
    } catch (err) {
      setToast({
        message: "Could not delete customer: " + (err as Error).message,
        severity: "error",
      });
    }
  };

  // ---- Add training ----
  const saveTraining = async (data: TrainingInput) => {
    if (!trainingFor) return;
    const customer = trainingFor;
    try {
      const res = await fetch(`${API_URL}/trainings`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ...data,
          customer: `${API_URL}/customers/${getCustomerId(customer)}`,
        }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setTrainingFor(null);
      setToast({
        message: `Training added for ${customer.firstname} ${customer.lastname}`,
        severity: "success",
      });
    } catch (err) {
      setToast({
        message: "Could not add training: " + (err as Error).message,
        severity: "error",
      });
    }
  };

  return (
    <>
      <div className="page-header">
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          Customers
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search, sort and manage all gym customers.
        </Typography>
      </div>

      <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
        <ListToolbar
          searchPlaceholder="Search customers..."
          search={search}
          onSearchChange={setSearch}
          sortOptions={sortOptions}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          shownCount={shownCount}
          totalCount={customers.length}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add customer
            </Button>
          }
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadCustomers}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <div style={{ height: 4, marginBottom: 8 }}>
          {loading && <LinearProgress />}
        </div>

        <div className="grid-wrapper">
          <AgGridReact
            ref={gridRef}
            theme={gridTheme}
            rowData={customers}
            columnDefs={columnDefs}
            rowHeight={48}
            headerHeight={48}
            defaultColDef={{
              sortable: true,
              unSortIcon: true,
              filter: true,
              flex: 1,
              minWidth: 120,
            }}
            onSortChanged={handleSortChanged}
            onModelUpdated={(e) => setShownCount(e.api.getDisplayedRowCount())}
            quickFilterText={search}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
          />
        </div>
      </Paper>

      {formOpen && (
        <CustomerFormDialog
          customer={editing}
          onClose={closeForm}
          onSave={saveCustomer}
        />
      )}

      {trainingFor && (
        <AddTrainingDialog
          customer={trainingFor}
          onClose={() => setTrainingFor(null)}
          onSave={saveTraining}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete customer?"
        message={
          deleting
            ? `Are you sure you want to delete ${deleting.firstname} ${deleting.lastname}? All of this customer's training sessions will be deleted too. This cannot be undone.`
            : ""
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}