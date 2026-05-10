"use client";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOrders, useUpdateOrderStatus } from "@/hooks/queries/useOrders";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Button,
  Badge,
  Table,
  ScrollArea,
  Loader,
  Center,
  Tabs,
} from "@mantine/core";
import { IconShoppingCart, IconClock } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Order } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  confirmed: "blue",
  preparing: "orange",
  ready: "teal",
  collected: "gray",
};

export default function CookOrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  const pendingOrders =
    orders?.filter((o) => o.status === "confirmed") || [];
  const preparingOrders = orders?.filter((o) => o.status === "preparing") || [];
  const readyOrders = orders?.filter((o) => o.status === "ready") || [];

  const handleUpdateStatus = (
    orderId: string,
    status: "preparing" | "ready"
  ) => {
    updateStatusMutation.mutate(
      { orderId, status },
      {
        onSuccess: () =>
          notifications.show({
            title: "Updated",
            message: `Order marked as ${status}`,
            color: "teal",
          }),
        onError: (err: any) =>
          notifications.show({
            title: "Error",
            message: err.message || "Failed to update order",
            color: "red",
          }),
      }
    );
  };

  const renderTable = (data: Order[], type: "pending" | "preparing" | "ready") => (
    <ScrollArea>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Order ID</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Time</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Text ta="center" c="dimmed" py="xl">
                  No orders here
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            data.map((order) => (
              <Table.Tr key={order.id}>
                <Table.Td>
                  <Text size="xs" ff="monospace">
                    #{order.id.slice(0, 8)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="outline" size="sm">
                    {order.order_type === "walk_in" ? "Walk-in" : "Online"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text fw={500}>
                    {parseFloat(order.total_amount).toFixed(2)} ETB
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={STATUS_COLORS[order.status]} variant="light">
                    {order.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {type === "pending" && (
                    <Button
                      size="xs"
                      color="orange"
                      leftSection={<IconClock size={12} />}
                      loading={updateStatusMutation.isPending}
                      onClick={() => handleUpdateStatus(order.id, "preparing")}
                    >
                      Start Preparing
                    </Button>
                  )}
                  {type === "preparing" && (
                    <Button
                      size="xs"
                      color="teal"
                      leftSection={<IconShoppingCart size={12} />}
                      loading={updateStatusMutation.isPending}
                      onClick={() => handleUpdateStatus(order.id, "ready")}
                    >
                      Mark Ready
                    </Button>
                  )}
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );

  return (
    <DashboardShell allowedRoles={["cook"]}>
      <Container size="xl">
        <Stack gap="xl">
          <div>
            <Title order={2}>Orders</Title>
            <Text c="dimmed" size="sm">
              Manage kitchen order statuses
            </Text>
          </div>

          <Paper shadow="sm" radius="md" withBorder>
            <Tabs defaultValue="pending">
              <Tabs.List px="md" pt="xs">
                <Tabs.Tab value="pending" leftSection={<IconShoppingCart size={16} />}>
                  Confirmed ({pendingOrders.length})
                </Tabs.Tab>
                <Tabs.Tab value="preparing" leftSection={<IconClock size={16} />}>
                  Preparing ({preparingOrders.length})
                </Tabs.Tab>
                <Tabs.Tab value="ready">
                  Ready ({readyOrders.length})
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="pending" p="md">
                {isLoading ? (
                  <Center py="xl"><Loader /></Center>
                ) : (
                  renderTable(pendingOrders, "pending")
                )}
              </Tabs.Panel>

              <Tabs.Panel value="preparing" p="md">
                {isLoading ? (
                  <Center py="xl"><Loader /></Center>
                ) : (
                  renderTable(preparingOrders, "preparing")
                )}
              </Tabs.Panel>

              <Tabs.Panel value="ready" p="md">
                {isLoading ? (
                  <Center py="xl"><Loader /></Center>
                ) : (
                  renderTable(readyOrders, "ready")
                )}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
