"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOrders } from "@/hooks/queries/useOrders";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Badge,
  Table,
  ScrollArea,
  Loader,
  Center,
  Tabs,
} from "@mantine/core";
import { IconShoppingCart, IconCheck } from "@tabler/icons-react";
import { Order } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  confirmed: "blue",
  preparing: "orange",
  ready: "teal",
  collected: "gray",
};

export default function ManagerOrdersPage() {
  const [activeTab, setActiveTab] = useState("active");
  const { data: orders, isLoading } = useOrders();

  const activeOrders =
    orders?.filter((o) =>
      ["pending", "confirmed", "preparing", "ready"].includes(o.status)
    ) || [];

  const collectedOrders =
    orders?.filter((o) => o.status === "collected") || [];

  const renderTable = (data: Order[]) => (
    <ScrollArea>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Order ID</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Time</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text ta="center" c="dimmed" py="xl">
                  No orders found
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
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );

  return (
    <DashboardShell allowedRoles={["lounge_manager"]}>
      <Container size="xl">
        <Stack gap="xl">
          <div>
            <Title order={2}>Orders</Title>
            <Text c="dimmed" size="sm">
              View all orders for your lounge
            </Text>
          </div>

          <Paper shadow="sm" radius="md" withBorder>
            <Tabs
              value={activeTab}
              onChange={(v) => setActiveTab(v || "active")}
            >
              <Tabs.List px="md" pt="xs">
                <Tabs.Tab
                  value="active"
                  leftSection={<IconShoppingCart size={16} />}
                >
                  Active ({activeOrders.length})
                </Tabs.Tab>
                <Tabs.Tab
                  value="collected"
                  leftSection={<IconCheck size={16} />}
                >
                  Collected ({collectedOrders.length})
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="active" p="md">
                {isLoading ? (
                  <Center py="xl">
                    <Loader />
                  </Center>
                ) : (
                  renderTable(activeOrders)
                )}
              </Tabs.Panel>

              <Tabs.Panel value="collected" p="md">
                {isLoading ? (
                  <Center py="xl">
                    <Loader />
                  </Center>
                ) : (
                  renderTable(collectedOrders)
                )}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
