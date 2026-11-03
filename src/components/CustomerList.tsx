import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { type Customer, API_URL } from "../types";
import { extractList } from "../utils";
import ListToolbar, { type SortOption } from "./ListToolbar";

ModuleRegistry.registerModules([AllCommunityModule]);

const sortOptions: SortOption[] = [
  { value: "firstname:asc", label: "First name (A-Z)" },
  { value: "firstname:desc", label: "First name (Z-A)" },
  { value: "lastname:asc", label: "Last name (A-Z)" },
  { value: "lastname:desc", label: "Last name (Z-A)" },
  { value: "city:asc", label: "City (A-Z)" },
  { value: "city:desc", label: "City (Z-A)" },
];

export default function CustomerList() {
  const gridRef = useRef<AgGridReact<Customer>>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [shownCount, setShownCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const columnDefs: ColDef<Customer>[] = [
    { colId: "firstname", field: "firstname", headerName: "First name" },
    { colId: "lastname", field: "lastname", headerName: "Last name" },
    { colId: "streetaddress", field: "streetaddress", headerName: "Address" },
    { colId: "postcode", field: "postcode", headerName: "Postcode", maxWidth: 130 },
    { colId: "city", field: "city", headerName: "City" },
    { colId: "email", field: "email", headerName: "Email", minWidth: 200 },
    { colId: "phone", field: "phone", headerName: "Phone" },
  ];

  useEffect(() => {
    fetch(`${API_URL}/customers`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => setCustomers(extractList<Customer>(data, "customers")))
      .catch((err) => setError("Could not load customers: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  // Dropdown -> grid
  const handleSortChange = (value: string) => {
    setSortValue(value);
    const [colId, sort] = value.split(":");
    gridRef.current?.api.applyColumnState({
      state: value ? [{ colId, sort: sort as "asc" | "desc" }] : [],
      defaultState: { sort: null },
    });
  };

  // Grid (header click) -> dropdown
  const handleSortChanged = () => {
    const sorted = gridRef.current?.api.getColumnState().find((c) => c.sort);
    setSortValue(sorted ? `${sorted.colId}:${sorted.sort}` : "");
  };

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 500 }}>
        Customers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Search, sort and browse all gym customers.
      </Typography>

      <Paper elevation={1} sx={{ p: 2 }}>
        <ListToolbar
          searchPlaceholder="Search customers..."
          search={search}
          onSearchChange={setSearch}
          sortOptions={sortOptions}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          shownCount={shownCount}
          totalCount={customers.length}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <div style={{ height: 4, marginBottom: 8 }}>
          {loading && <LinearProgress />}
        </div>

        <div className="grid-wrapper">
          <AgGridReact
            ref={gridRef}
            rowData={customers}
            columnDefs={columnDefs}
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
    </>
  );
}