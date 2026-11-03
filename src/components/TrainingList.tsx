import { useCallback, useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import dayjs from "dayjs";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import { type Training, API_URL } from "../types";
import { extractList } from "../utils";
import { gridTheme } from "../gridTheme";
import ListToolbar, { type SortOption } from "./ListToolbar";

ModuleRegistry.registerModules([AllCommunityModule]);

const formatDate = (value: string) =>
  value ? dayjs(value).format("DD.MM.YYYY HH:mm") : "";

const sortOptions: SortOption[] = [
  { value: "date:asc", label: "Date (oldest first)" },
  { value: "date:desc", label: "Date (newest first)" },
  { value: "duration:asc", label: "Duration (shortest)" },
  { value: "duration:desc", label: "Duration (longest)" },
  { value: "activity:asc", label: "Activity (A-Z)" },
  { value: "activity:desc", label: "Activity (Z-A)" },
  { value: "customer:asc", label: "Customer (A-Z)" },
  { value: "customer:desc", label: "Customer (Z-A)" },
];

export default function TrainingList() {
  const gridRef = useRef<AgGridReact<Training>>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [search, setSearch] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [shownCount, setShownCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const columnDefs: ColDef<Training>[] = [
    {
      colId: "date",
      field: "date",
      headerName: "Date",
      valueFormatter: (p) => formatDate(p.value),
      getQuickFilterText: (p) => formatDate(p.value),
    },
    {
      colId: "duration",
      field: "duration",
      headerName: "Duration",
      valueFormatter: (p) => (p.value != null ? `${p.value} min` : ""),
    },
    {
      colId: "activity",
      field: "activity",
      headerName: "Activity",
      cellRenderer: (p: ICellRendererParams<Training>) =>
        p.value ? (
          <Chip label={p.value} size="small" color="primary" variant="outlined" />
        ) : null,
    },
    {
      colId: "customer",
      headerName: "Customer",
      valueGetter: (p) =>
        p.data?.customer
          ? `${p.data.customer.firstname} ${p.data.customer.lastname}`
          : "",
    },
  ];

  const loadTrainings = useCallback(() => {
    setLoading(true);
    setError("");
    fetch(`${API_URL}/gettrainings`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log("trainings response:", data);
        setTrainings(extractList<Training>(data, "trainings"));
      })
      .catch((err) => setError("Could not load trainings: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTrainings();
  }, [loadTrainings]);

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

  return (
    <>
      <div className="page-header">
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          Trainings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          All training sessions with their customers.
        </Typography>
      </div>

      <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
        <ListToolbar
          searchPlaceholder="Search trainings..."
          search={search}
          onSearchChange={setSearch}
          sortOptions={sortOptions}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          shownCount={shownCount}
          totalCount={trainings.length}
        />

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadTrainings}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!loading && !error && trainings.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No trainings found. The server returned an empty list.
          </Alert>
        )}

        <div style={{ height: 4, marginBottom: 8 }}>
          {loading && <LinearProgress />}
        </div>

        <div className="grid-wrapper">
          <AgGridReact
            ref={gridRef}
            theme={gridTheme}
            rowData={trainings}
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
    </>
  );
}