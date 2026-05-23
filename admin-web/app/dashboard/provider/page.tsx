"use client";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOrders } from "@/hooks/queries/useOrders";
import { useStaff } from "@/hooks/queries/useStaff";
import { useSalesReport } from "@/hooks/queries/useReports";
import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Paper,
  Group,
  Button,
  ThemeIcon,
  Loader,
} from "@mantine/core";
import {
  IconShoppingCart,
  IconUsers,
  IconCash,
  IconCurrencyDollar,
  IconArrowRight,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

function StatBox({
  label,
  value,
  icon,
  color,
  isLoading,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
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
          {isLoading ? (
            <Loader size="sm" mt={4} />
          ) : (
            <Text size="xl" fw={700}>
              {value}
            </Text>
          )}
        </div>
      </Group>
    </Paper>
  );
}

export default function ManagerDashboard() {
  const router = useRouter();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: staff, isLoading: staffLoading } = useStaff();
  const { data: dailyReport, isLoading: dailyLoading } = useSalesReport("daily");
  const { data: monthlyReport, isLoading: monthlyLoading } = useSalesReport("monthly");

  const activeOrders =
    orders?.filter((o) =>
      ["pending", "confirmed", "preparing", "ready"].includes(o.status)
    ).length || 0;

  const totalStaff = staff?.length || 0;

  const todaySales = dailyReport
    ? `${parseFloat(dailyReport.total_sales).toFixed(2)} ETB`
    : "0.00 ETB";

  const monthlySales = monthlyReport
    ? `${parseFloat(monthlyReport.total_sales).toFixed(2)} ETB`
    : "0.00 ETB";

  return (
    <DashboardShell allowedRoles={["lounge_manager"]}>
      <Container size="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <div>
              <Title order={2}>Manager Dashboard</Title>
              <Text c="dimmed" size="sm">
                Overview of your lounge
              </Text>
            </div>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            <StatBox
              label="Active Orders"
              value={activeOrders}
              icon={<IconShoppingCart size={22} />}
              color="blue"
              isLoading={ordersLoading}
            />
            <StatBox
              label="Staff Members"
              value={totalStaff}
              icon={<IconUsers size={22} />}
              color="violet"
              isLoading={staffLoading}
            />
            <StatBox
              label="Today's Sales"
              value={todaySales}
              icon={<IconCash size={22} />}
              color="teal"
              isLoading={dailyLoading}
            />
            <StatBox
              label="Monthly Revenue"
              value={monthlySales}
              icon={<IconCurrencyDollar size={22} />}
              color="orange"
              isLoading={monthlyLoading}
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Button
              variant="light"
              rightSection={<IconArrowRight size={16} />}
              onClick={() => router.push("/dashboard/provider/orders")}
            >
              View Orders
            </Button>
            <Button
              variant="light"
              color="violet"
              rightSection={<IconArrowRight size={16} />}
              onClick={() => router.push("/dashboard/provider/staff")}
            >
              Manage Staff
            </Button>
            <Button
              variant="light"
              color="teal"
              rightSection={<IconArrowRight size={16} />}
              onClick={() => router.push("/dashboard/provider/reports")}
            >
              View Reports
            </Button>
          </SimpleGrid>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
