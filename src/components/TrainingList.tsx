import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import dayjs from "dayjs";
import { type Training, API_URL } from "../types";
import { extractList } from "../utils";
import SortSelect from "./SortSelect";

ModuleRegistry.registerModules([AllCommunityModule]);

const formatDate = (value: string) =>
  value ? dayjs(value).format("DD.MM.YYYY HH:mm") : "";

const sortOptions = [
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
  const [error, setError] = useState("");

  const columnDefs: ColDef<Training>[] = [
    {
      colId: "date",
      field: "date",
      headerName: "Date",
      valueFormatter: (p) => formatDate(p.value),
      getQuickFilterText: (p) => formatDate(p.value),
    },
    { colId: "duration", field: "duration", headerName: "Duration (min)" },
    { colId: "activity", field: "activity", headerName: "Activity" },
    {
      colId: "customer",
      headerName: "Customer",
      valueGetter: (p) =>
        p.data?.customer
          ? `${p.data.customer.firstname} ${p.data.customer.lastname}`
          : "",
    },
  ];

  useEffect(() => {
    fetch(`${API_URL}/gettrainings`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => setTrainings(extractList<Training>(data, "trainings")))
      .catch((err) => setError("Could not load trainings: " + err.message));
  }, []);

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
      <h2>Trainings</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search trainings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 260 }}
        />
        <SortSelect options={sortOptions} value={sortValue} onChange={handleSortChange} />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ height: 500, width: "100%" }}>
        <AgGridReact
          ref={gridRef}
          rowData={trainings}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            unSortIcon: true,
            filter: true,
            flex: 1,
            minWidth: 120,
          }}
          onSortChanged={handleSortChanged}
          quickFilterText={search}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </>
  );
}