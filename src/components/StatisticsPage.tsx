
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { groupBy, sumBy } from "lodash";

import type { Training } from "../types";
import { API_URL } from "../types";

type ActivityStatistic = {
  activity: string;
  totalMinutes: number;
};

export default function StatisticsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [statistics, setStatistics] = useState<ActivityStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStatistics = async () => {
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

        if (!Array.isArray(data)) {
          throw new Error("Invalid API response. Expected a list of trainings.");
        }

        const trainingList = data as Training[];

        setTrainings(trainingList);

        // Group training records by activity using Lodash groupBy.
        const groupedTrainings = groupBy(
          trainingList,
          (training) => training.activity || "Other"
        );

        // Calculate total minutes for each activity using Lodash sumBy.
        const activityStatistics: ActivityStatistic[] = Object.entries(
          groupedTrainings
        ).map(([activity, activityTrainings]) => ({
          activity,
          totalMinutes: sumBy(
            activityTrainings,
            (training) => Number(training.duration) || 0
          ),
        }));

        // Show activities with the highest total minutes first.
        activityStatistics.sort(
          (a, b) => b.totalMinutes - a.totalMinutes
        );

        setStatistics(activityStatistics);
      } catch (err) {
        console.error("Statistics loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  const totalMinutes = sumBy(statistics, "totalMinutes");

  return (
    <Box className="statistics-page">
      <Box className="page-header">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Training Statistics
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Overview of total training minutes by activity.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 6,
          }}
        >
          <CircularProgress />
          <Typography color="text.secondary">
            Loading training statistics...
          </Typography>
        </Box>
      ) : (
        <>
          <Card
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography color="text.secondary" variant="body2">
                Total training minutes
              </Typography>

              <Typography
                variant="h3"
                sx={{ fontWeight: 700, mt: 1 }}
              >
                {totalMinutes.toLocaleString()}
              </Typography>

              <Typography color="text.secondary" variant="body2">
                Across {trainings.length} training sessions
              </Typography>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Minutes by Activity
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Total duration of training sessions for each activity.
              </Typography>

              {statistics.length === 0 ? (
                <Typography color="text.secondary">
                  No training data available.
                </Typography>
              ) : (
                <Box sx={{ width: "100%", height: 420 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statistics}
                      margin={{
                        top: 20,
                        right: 25,
                        left: 10,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="activity"
                        tick={{ fontSize: 12 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={65}
                      />

                      <YAxis
                        label={{
                          value: "Training minutes",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />

                      <Tooltip
                        formatter={(value) => [
                          `${Number(value).toLocaleString()} minutes`,
                          "Total duration",
                        ]}
                      />

                      <Bar
                        dataKey="totalMinutes"
                        name="Training minutes"
                        fill="#1976d2"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={75}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
