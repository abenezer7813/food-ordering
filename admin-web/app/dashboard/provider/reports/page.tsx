"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useSalesReport } from "@/hooks/queries/useReports";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  SimpleGrid,
  SegmentedControl,
  Loader,
  Center,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconReportAnalytics,
  IconCash,
  IconShoppingCart,
  IconCalendar,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Period = "daily" | "weekly" | "monthly";

function StatBox({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Paper withBorder p="lg" radius="md">
      <Group>
        <ThemeIcon size="xl" radius="md" color={color} variant="light">
          {icon}
        </ThemeIcon>
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}

export default function ManagerReportsPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [date, setDate] = useState<Date | null>(null);

  const dateStr = date ? date.toISOString().split("T")[0] : undefined;
  const { data: report, isLoading } = useSalesReport(period, dateStr);

  const chartData = report
    ? [
        {
          name:
            period === "daily"
              ? "Today"
              : period === "weekly"
              ? "This Week"
              : "This Month",
          sales: parseFloat(report.total_sales || "0"),
          orders: report.total_orders,
        },
      ]
    : [];

  return (
    <DashboardShell allowedRoles={["lounge_manager"]}>
      <Container size="xl">
        <Stack gap="xl">
          <div>
            <Title order={2}>Sales Reports</Title>
            <Text c="dimmed" size="sm">
              View sales performance for your lounge
            </Text>
          </div>

          {/* Controls */}
          <Paper withBorder p="md" radius="md">
            <Group>
              <div>
                <Text size="sm" fw={500} mb={4}>
                  Period
                </Text>
                <SegmentedControl
                  value={period}
                  onChange={(v) => setPeriod(v as Period)}
                  data={[
                    { label: "Daily", value: "daily" },
                    { label: "Weekly", value: "weekly" },
                    { label: "Monthly", value: "monthly" },
                  ]}
                />
              </div>
              <div>
                <Text size="sm" fw={500} mb={4}>
                  Date (optional)
                </Text>
                <DatePickerInput
                  placeholder="Pick a date"
                  value={date}
                  onChange={setDate}
                  clearable
                  leftSection={<IconCalendar size={16} />}
                  w={200}
                />
              </div>
            </Group>
          </Paper>

          {/* Content */}
          {isLoading ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : !report ? (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <IconReportAnalytics size={40} color="gray" />
                <Text c="dimmed">No report data available for this period.</Text>
              </Stack>
            </Center>
          ) : (
            <>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <StatBox
                  label="Total Sales"
                  value={`${parseFloat(report.total_sales).toFixed(2)} ETB`}
                  icon={<IconCash size={22} />}
                  color="teal"
                />
                <StatBox
                  label="Total Orders"
                  value={report.total_orders}
                  icon={<IconShoppingCart size={22} />}
                  color="blue"
                />
              </SimpleGrid>

              <Paper withBorder p="lg" radius="md">
                <Text fw={600} mb="md">
                  Overview
                </Text>
                <Divider mb="md" />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) =>
                        name === "sales"
                          ? [`${Number(value).toFixed(2)} ETB`, "Sales"]
                          : [value, "Orders"]
                      }
                    />
                    <Bar
                      dataKey="sales"
                      fill="#12b886"
                      radius={[4, 4, 0, 0]}
                      name="sales"
                    />
                    <Bar
                      dataKey="orders"
                      fill="#228be6"
                      radius={[4, 4, 0, 0]}
                      name="orders"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>

              <Paper withBorder p="md" radius="md">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Period</Text>
                  <Text size="sm" fw={500} tt="capitalize">{report.period_type}</Text>
                </Group>
                <Divider my="xs" />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">From</Text>
                  <Text size="sm">{new Date(report.period_start).toLocaleDateString()}</Text>
                </Group>
                <Divider my="xs" />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">To</Text>
                  <Text size="sm">{new Date(report.period_end).toLocaleDateString()}</Text>
                </Group>
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </DashboardShell>
  );
}
