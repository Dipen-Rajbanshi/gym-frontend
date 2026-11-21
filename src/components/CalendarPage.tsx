
import { useEffect, useState } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

import type { EventClickArg, EventInput } from "@fullcalendar/core";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
  Chip,
  Stack,
} from "@mui/material";

import dayjs from "dayjs";

import type { Training } from "../types";
import { API_URL } from "../types";

// Assign a different colour to each training activity
function getActivityColor(activity: string): string {
  const name = activity.toLowerCase();

  if (name.includes("gym")) return "#1976d2";
  if (name.includes("fitness")) return "#00897b";
  if (name.includes("zumba")) return "#8e24aa";
  if (name.includes("running") || name.includes("jogging")) return "#ef6c00";
  if (name.includes("spinning")) return "#3949ab";

  return "#607d8b";
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTraining, setSelectedTraining] =
    useState<Training | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  // Load training sessions from the API
  useEffect(() => {
    const loadTrainings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/gettrainings`);

        if (!response.ok) {
          throw new Error(
            `Failed to load trainings: ${response.status} ${response.statusText}`
          );
        }

        const data: unknown = await response.json();

        // API returns a plain JSON array
        if (!Array.isArray(data)) {
          throw new Error("Invalid API response. Expected a list of trainings.");
        }

        const trainingList = data as Training[];

        setTrainings(trainingList);

        // Convert API training records into calendar events
        const calendarEvents: EventInput[] = trainingList
          .filter(
            (training) =>
              training.date &&
              dayjs(training.date).isValid()
          )
          .map((training) => {
            const customerName = [
              training.customer?.firstname ?? "",
              training.customer?.lastname ?? "",
            ]
              .join(" ")
              .trim();

            const startDate = dayjs(training.date);
            const endDate = startDate.add(
              training.duration,
              "minute"
            );

            const color = getActivityColor(training.activity);

            return {
              id: String(training.id),
              title: `${training.activity} - ${customerName}`,
              start: training.date,
              end: endDate.toISOString(),

              backgroundColor: color,
              borderColor: color,
              textColor: "#ffffff",

              extendedProps: {
                training,
              },
            };
          });

        setEvents(calendarEvents);

        console.log("Trainings loaded:", trainingList);
        console.log("Calendar events:", calendarEvents);
      } catch (err) {
        console.error("Calendar loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrainings();
  }, []);

  // Open training details when clicking an event
  const handleEventClick = (info: EventClickArg) => {
    const training = info.event.extendedProps
      .training as Training | undefined;

    if (training) {
      setSelectedTraining(training);
      setDialogOpen(true);
    }
  };

  // Close details popup
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTraining(null);
  };

  // Calculate dashboard summary
  const totalMinutes = trainings.reduce(
    (total, training) => total + (Number(training.duration) || 0),
    0
  );

  const totalCustomers = new Set(
    trainings.map((training) => {
      const customer = training.customer;

      return customer
        ? `${customer.firstname} ${customer.lastname}`
        : "";
    }).filter(Boolean)
  ).size;

  return (
    <Box className="calendar-page">

      {/* Page heading */}
      <Box className="page-header">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Training Calendar
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Manage and view all customer training sessions.
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary cards */}
      {!loading && !error && (
        <Box className="calendar-summary">

          <Paper className="summary-card" elevation={0}>
            <Typography variant="body2" color="text.secondary">
              Total sessions
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {trainings.length}
            </Typography>
          </Paper>

          <Paper className="summary-card" elevation={0}>
            <Typography variant="body2" color="text.secondary">
              Training hours
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {(totalMinutes / 60).toFixed(1)}
            </Typography>
          </Paper>

          <Paper className="summary-card" elevation={0}>
            <Typography variant="body2" color="text.secondary">
              Customers
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {totalCustomers}
            </Typography>
          </Paper>

        </Box>
      )}

      {/* Activity colour legend */}
      {!loading && !error && (
        <Paper className="calendar-legend" elevation={0}>
          <Typography sx={{ fontWeight: 600 }} variant="body2">
            Activity colours
          </Typography>

          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
            {[
              { name: "Gym", color: "#1976d2" },
              { name: "Fitness", color: "#00897b" },
              { name: "Zumba", color: "#8e24aa" },
              { name: "Running", color: "#ef6c00" },
              { name: "Spinning", color: "#3949ab" },
              { name: "Other", color: "#607d8b" },
            ].map((item) => (
              <Chip
                key={item.name}
                label={item.name}
                size="small"
                sx={{
                  backgroundColor: item.color,
                  color: "#ffffff",
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Loading indicator */}
      {loading ? (
        <Box className="calendar-loading">
          <CircularProgress />
          <Typography color="text.secondary">
            Loading training sessions...
          </Typography>
        </Box>
      ) : (
        /* Calendar */
        <Paper className="calendar-container" elevation={0}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}

            initialView="dayGridMonth"

            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}

            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
            }}

            events={events}
            eventClick={handleEventClick}

            eventDisplay="block"

            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}

            height="auto"
            dayMaxEvents={3}
            fixedWeekCount={false}
            nowIndicator={true}

            eventContent={(arg) => {
              const training = arg.event.extendedProps
                .training as Training;

              const customerName = [
                training.customer?.firstname ?? "",
                training.customer?.lastname ?? "",
              ]
                .join(" ")
                .trim();

              return (
                <Box className="calendar-event-content">
                  <Typography className="calendar-event-activity">
                    {training.activity}
                  </Typography>

                  <Typography className="calendar-event-customer">
                    {customerName}
                  </Typography>
                </Box>
              );
            }}
          />
        </Paper>
      )}

      {/* Training details popup */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Training Details
        </DialogTitle>

        <DialogContent dividers>
          {selectedTraining && (
            <Stack spacing={2}>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Activity
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {selectedTraining.activity}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Customer
                </Typography>

                <Typography>
                  {selectedTraining.customer?.firstname}{" "}
                  {selectedTraining.customer?.lastname}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Date
                </Typography>

                <Typography>
                  {dayjs(selectedTraining.date).format("DD.MM.YYYY")}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Starting time
                </Typography>

                <Typography>
                  {dayjs(selectedTraining.date).format("HH:mm")}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>

                <Typography>
                  {selectedTraining.duration} minutes
                </Typography>
              </Box>

            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
