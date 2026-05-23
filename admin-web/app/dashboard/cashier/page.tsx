"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/domain/StatCard";
import { OrderCard } from "@/components/domain/OrderCard";
import { WalkInOrderDrawer } from "@/components/domain/WalkinOrderDrawer";
import { useOrders, useMarkOrderCollected } from "@/hooks/queries/useOrders";
import { useSalesReport } from "@/hooks/queries/useReports";
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Stack,
  Paper,
  Group,
  Button,
} from "@mantine/core";
import {
  IconCash,
  IconShoppingCart,
  IconWallet,
  IconPlus,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

export default function CashierDashboard() {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const router = useRouter();

  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: todayReport, isLoading: reportLoading } = useSalesReport("daily");
  const markCollectedMutation = useMarkOrderCollected();

  const handleOrderAction = (orderId: string, action: string) => {
    if (action === "mark-collected") {
      markCollectedMutation.mutate(orderId, {
        onSuccess: () => {
          notifications.show({
            title: "Success",
            message: "Order marked as collected",
            color: "green",
          });
        },
        onError: (error) => {
          notifications.show({
            title: "Error",
            message: error.message || "Failed to update order",
            color: "red",
          });
        },
      });
    }
  };

  const readyOrders = orders?.filter((o) => o.status === "ready").length || 0;

  return (
    <DashboardShell allowedRoles={["cashier"]}>
      <WalkInOrderDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
      />

      <Container size="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>Cashier Dashboard</Title>
              <Text c="dimmed" size="sm">
                Manage orders and transactions
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              size="sm"
              onClick={() => setDrawerOpened(true)}
            >
              New Walk-in Order
            </Button>
          </Group>

          {/* Stats */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <StatCard
              title="Today's Sales"
              value={`${todayReport?.total_sales || "0.00"} ETB`}
              icon={<IconCash size={20} />}
              color="teal"
              isLoading={reportLoading}
            />
            <StatCard
              title="Orders Today"
              value={todayReport?.total_orders || 0}
              icon={<IconShoppingCart size={20} />}
              color="blue"
              isLoading={reportLoading}
            />
            <StatCard
              title="Ready for Pickup"
              value={readyOrders}
              icon={<IconWallet size={20} />}
              color="orange"
            />
          </SimpleGrid>

          {/* Orders List */}
          <Paper shadow="sm" p="md" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Title order={4}>Recent Orders</Title>
              <Button
                variant="light"
                size="xs"
                onClick={() => router.push("/dashboard/cashier/orders")}
              >
                View All
              </Button>
            </Group>

            {ordersLoading ? (
              <Text ta="center" c="dimmed" py="xl">
                Loading orders...
              </Text>
            ) : !orders || orders.length === 0 ? (
              <Text ta="center" c="dimmed" py="xl">
                No orders yet
              </Text>
            ) : (
              <Stack gap="sm">
                {orders.slice(0, 10).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAction={handleOrderAction}
                    actionLoading={markCollectedMutation.isPending}
                  />
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Container>
    </DashboardShell>
  );
}