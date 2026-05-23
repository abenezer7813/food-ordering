"use client";
import { useState } from "react";
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
  ActionIcon,
  Box,
} from "@mantine/core";
import {
  IconShoppingCart,
  IconClock,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Order } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  confirmed: "blue",
  preparing: "orange",
  ready: "teal",
  collected: "gray",
};

function ExpandedItems({
  order,
  type,
  onUpdateStatus,
  actionLoading,
}: {
  order: Order;
  type: "pending" | "preparing" | "ready";
  onUpdateStatus: (orderId: string, status: "preparing" | "ready") => void;
  actionLoading: boolean;
}) {
  const hasItems = order.order_items && order.order_items.length > 0;
  return (
    <Box
      p="md"
      style={(theme) => ({
        background: "var(--mantine-color-default-hover)",
        borderRadius: theme.radius.sm,
      })}
    >
      <Stack gap="md">
        {!hasItems ? (
          <Text size="sm" c="dimmed" fs="italic">
            No item details available
          </Text>
        ) : (
          <Stack gap="xs">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed">
              Items
            </Text>
            <Table withTableBorder withColumnBorders fz="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th ta="center">Qty</Table.Th>
                  <Table.Th>Instructions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {order.order_items!.map((item, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td fw={500}>
                      {item.menu_item?.name || "Unknown"}
                    </Table.Td>
                    <Table.Td ta="center">{item.quantity}</Table.Td>
                    <Table.Td>
                      <Text
                        size="xs"
                        c="dimmed"
                        fs={item.special_instructions ? undefined : "italic"}
                      >
                        {item.special_instructions || "None"}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        )}

        {/* Action button lives here inside the detail */}
        <Group justify="flex-end">
          {type === "pending" && (
            <Button
              size="sm"
              color="orange"
              leftSection={<IconClock size={14} />}
              loading={actionLoading}
              onClick={() => onUpdateStatus(order.id, "preparing")}
            >
              Start Preparing
            </Button>
          )}
          {type === "preparing" && (
            <Button
              size="sm"
              color="teal"
              leftSection={<IconShoppingCart size={14} />}
              loading={actionLoading}
              onClick={() => onUpdateStatus(order.id, "ready")}
            >
              Mark Ready
            </Button>
          )}
        </Group>
      </Stack>
    </Box>
  );
}

function OrdersTable({
  data,
  type,
  onUpdateStatus,
  actionLoading,
}: {
  data: Order[];
  type: "pending" | "preparing" | "ready";
  onUpdateStatus: (orderId: string, status: "preparing" | "ready") => void;
  actionLoading: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  if (data.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        No orders here
      </Text>
    );
  }

  return (
    <ScrollArea>
      <Table striped withTableBorder highlightOnHover={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={32} />
            <Table.Th>Order ID</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Time</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((order) => (
            <>
              <Table.Tr
                key={order.id}
                style={{ cursor: "pointer" }}
                onClick={() => toggle(order.id)}
                bg={
                  expandedId === order.id
                    ? "var(--mantine-color-default-hover)"
                    : undefined
                }
              >
                <Table.Td>
                  <ActionIcon variant="subtle" size="xs" color="gray">
                    {expandedId === order.id ? (
                      <IconChevronDown size={14} />
                    ) : (
                      <IconChevronRight size={14} />
                    )}
                  </ActionIcon>
                </Table.Td>
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
              </Table.Tr>

              {expandedId === order.id && (
                <Table.Tr key={`${order.id}-expanded`}>
                  <Table.Td colSpan={6} p={0}>
                    <ExpandedItems
                      order={order}
                      type={type}
                      onUpdateStatus={onUpdateStatus}
                      actionLoading={actionLoading}
                    />
                  </Table.Td>
                </Table.Tr>
              )}
            </>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

export default function CookOrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  const pendingOrders = orders?.filter((o) => o.status === "confirmed") || [];
  const preparingOrders = orders?.filter((o) => o.status === "preparing") || [];
  const readyOrders = orders?.filter((o) => o.status === "ready") || [];

  const handleUpdateStatus = (orderId: string, status: "preparing" | "ready") => {
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
                <Tabs.Tab
                  value="pending"
                  leftSection={<IconShoppingCart size={16} />}
                >
                  Confirmed ({pendingOrders.length})
                </Tabs.Tab>
                <Tabs.Tab
                  value="preparing"
                  leftSection={<IconClock size={16} />}
                >
                  Preparing ({preparingOrders.length})
                </Tabs.Tab>
                <Tabs.Tab value="ready">
                  Ready ({readyOrders.length})
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="pending" p="md">
                {isLoading ? (
                  <Center py="xl">
                    <Loader />
                  </Center>
                ) : (
                  <OrdersTable
                    data={pendingOrders}
                    type="pending"
                    onUpdateStatus={handleUpdateStatus}
                    actionLoading={updateStatusMutation.isPending}
                  />
                )}
              </Tabs.Panel>

              <Tabs.Panel value="preparing" p="md">
                {isLoading ? (
                  <Center py="xl">
                    <Loader />
                  </Center>
                ) : (
                  <OrdersTable
                    data={preparingOrders}
                    type="preparing"
                    onUpdateStatus={handleUpdateStatus}
                    actionLoading={updateStatusMutation.isPending}
                  />
                )}
              </Tabs.Panel>

              <Tabs.Panel value="ready" p="md">
                {isLoading ? (
                  <Center py="xl">
                    <Loader />
                  </Center>
                ) : (
                  <OrdersTable
                    data={readyOrders}
                    type="ready"
                    onUpdateStatus={handleUpdateStatus}
                    actionLoading={updateStatusMutation.isPending}
                  />
                )}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
