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
  Button,
  Badge,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconReportAnalytics,
  IconCash,
  IconShoppingCart,
  IconCalendar,
  IconFileTypePdf,
  IconTrendingUp,
} from "@tabler/icons-react";

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

async function generatePDF(report: {
  period_type: string;
  period_start: string;
  period_end: string;
  total_sales: string;
  total_orders: number;
}) {
  // Dynamic import so jspdf is never bundled server-side
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // ── Header ──────────────────────────────────────────────
  doc.setFillColor(99, 102, 241); // indigo
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("UniLounge — Sales Report", 14, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${now.toLocaleString()}`, pageWidth - 14, 18, { align: "right" });

  // ── Period badge ─────────────────────────────────────────
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Period: ${report.period_type.charAt(0).toUpperCase() + report.period_type.slice(1)}`,
    14,
    40
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `From: ${new Date(report.period_start).toLocaleDateString()}   →   To: ${new Date(report.period_end).toLocaleDateString()}`,
    14,
    50
  );

  // ── Summary table ────────────────────────────────────────
  autoTable(doc, {
    startY: 60,
    head: [["Metric", "Value"]],
    body: [
      ["Total Sales", `${parseFloat(report.total_sales).toFixed(2)} ETB`],
      ["Total Orders", String(report.total_orders)],
      [
        "Average Order Value",
        report.total_orders > 0
          ? `${(parseFloat(report.total_sales) / report.total_orders).toFixed(2)} ETB`
          : "—",
      ],
    ],
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    styles: { fontSize: 11, cellPadding: 6 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 80 },
      1: { cellWidth: 80 },
    },
  });

  // ── Footer ───────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 16;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("UniLounge Admin Dashboard — Confidential", 14, finalY);

  const periodLabel =
    report.period_type === "daily"
      ? new Date(report.period_start).toLocaleDateString().replace(/\//g, "-")
      : `${new Date(report.period_start).toLocaleDateString().replace(/\//g, "-")}_${new Date(report.period_end).toLocaleDateString().replace(/\//g, "-")}`;

  doc.save(`sales-report-${report.period_type}-${periodLabel}.pdf`);
}

export default function CashierReportsPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [date, setDate] = useState<Date | null>(null);
  const [exporting, setExporting] = useState(false);

  const dateStr = date ? date.toISOString().split("T")[0] : undefined;
  const { data: report, isLoading } = useSalesReport(period, dateStr);

  const handleExport = async () => {
    if (!report) return;
    setExporting(true);
    try {
      await generatePDF(report);
    } finally {
      setExporting(false);
    }
  };

  const avgOrderValue =
    report && report.total_orders > 0
      ? (parseFloat(report.total_sales) / report.total_orders).toFixed(2)
      : "0.00";

  return (
    <DashboardShell allowedRoles={["cashier"]}>
      <Container size="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>Sales Reports</Title>
              <Text c="dimmed" size="sm">
                View and export sales reports for your lounge
              </Text>
            </div>
            {report && (
              <Button
                leftSection={<IconFileTypePdf size={16} />}
                color="red"
                variant="light"
                loading={exporting}
                onClick={handleExport}
              >
                Export PDF
              </Button>
            )}
          </Group>

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
                  onChange={(val) => setDate(val ? new Date(val) : null)}
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
              {/* Stat cards */}
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
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
                <StatBox
                  label="Avg. Order Value"
                  value={`${avgOrderValue} ETB`}
                  icon={<IconTrendingUp size={22} />}
                  color="violet"
                />
              </SimpleGrid>

              {/* Period details */}
              <Paper withBorder p="lg" radius="md">
                <Group justify="space-between" mb="md">
                  <Text fw={600}>Report Details</Text>
                  <Badge variant="light" color="indigo" tt="capitalize">
                    {report.period_type}
                  </Badge>
                </Group>
                <Divider mb="md" />

                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Period</Text>
                    <Text size="sm" fw={500} tt="capitalize">
                      {report.period_type}
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">From</Text>
                    <Text size="sm">
                      {new Date(report.period_start).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">To</Text>
                    <Text size="sm">
                      {new Date(report.period_end).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Total Revenue</Text>
                    <Text size="sm" fw={700} c="teal">
                      {parseFloat(report.total_sales).toFixed(2)} ETB
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Total Orders</Text>
                    <Text size="sm" fw={700} c="blue">
                      {report.total_orders}
                    </Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Average Order Value</Text>
                    <Text size="sm" fw={700} c="violet">
                      {avgOrderValue} ETB
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </DashboardShell>
  );
}
