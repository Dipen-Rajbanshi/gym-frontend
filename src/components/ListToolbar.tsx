import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

export type SortOption = { value: string; label: string };

type Props = {
  searchPlaceholder: string;
  search: string;
  onSearchChange: (value: string) => void;
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  shownCount: number;
  totalCount: number;
};

export default function ListToolbar({
  searchPlaceholder,
  search,
  onSearchChange,
  sortOptions,
  sortValue,
  onSortChange,
  shownCount,
  totalCount,
}: Props) {
  return (
    <div className="toolbar">
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 280 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="Clear search"
                  onClick={() => onSearchChange("")}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />

      <TextField
        select
        size="small"
        label="Sort by"
        value={sortValue}
        onChange={(e) => onSortChange(e.target.value)}
        sx={{ minWidth: 220 }}
        slotProps={{
          inputLabel: { shrink: true },
          select: { displayEmpty: true },
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {sortOptions.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>

      <span className="spacer" />

      <Typography variant="body2" color="text.secondary">
        Showing {shownCount} of {totalCount}
      </Typography>
    </div>
  );
}