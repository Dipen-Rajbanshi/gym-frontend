import { useEffect, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, type ColDef } from "ag-grid-community";
import { type Customer, API_URL } from "../types";
import { extractList } from "../utils";
import SortSelect from "./SortSelect";

ModuleRegistry.registerModules([AllCommunityModule]);

const sortOptions = [
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
  const [error, setError] = useState("");

  const columnDefs: ColDef<Customer>[] = [
    { colId: "firstname", field: "firstname", headerName: "First name" },
    { colId: "lastname", field: "lastname", headerName: "Last name" },
    { colId: "streetaddress", field: "streetaddress", headerName: "Address" },
    { colId: "postcode", field: "postcode", headerName: "Postcode" },
    { colId: "city", field: "city", headerName: "City" },
    { colId: "email", field: "email", headerName: "Email" },
    { colId: "phone", field: "phone", headerName: "Phone" },
  ];

  useEffect(() => {
    fetch(`${API_URL}/customers`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        console.log("customers response:", data);
        setCustomers(extractList<Customer>(data, "customers"));
      })
      .catch((err) => setError("Could not load customers: " + err.message));
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
      <h2>Customers</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Search customers..."
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
          rowData={customers}
          columnDefs={columnDefs}
          defaultColDef={{
            sortable: true,
            unSortIcon: true, // always show the sort arrows
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