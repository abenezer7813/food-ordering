"use client";
import { useState, useMemo } from "react";
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
  Collapse,
  ActionIcon,
  Divider,
  Box,
  TextInput,
} from "@mantine/core";
import { IconShoppingCart, IconCheck, IconChevronDown, IconChevronRight, IconSearch, IconX } from "@tabler/icons-react";
import { Order } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  confirmed: "blue",
  preparing: "orange",
  ready: "teal",
  collected: "gray",
};

function ExpandedItems({ order }: { order: Order }) {
  const hasItems = order.order_items && order.order_items.length > 0;
  return (
    <Box p="md" style={(theme) => ({ background: "var(--mantine-color-default-hover)", borderRadius: theme.radius.sm })}>
      {!hasItems ? (
        <Text size="sm" c="dimmed" fs="italic">No item details available</Text>
      ) : (
        <Stack gap="xs">
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">Items</Text>
          <Table withTableBorder withColumnBorders fz="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th ta="center">Qty</Table.Th>
                <Table.Th ta="right">Subtotal</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {order.order_items!.map((item, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td>{item.menu_item?.name || "Unknown"}</Table.Td>
                  <Table.Td ta="center">{item.quantity}</Table.Td>
                  <Table.Td ta="right">
                    {item.menu_item?.price
                      ? (parseFloat(item.menu_item.price) * item.quantity).toFixed(2)
                      : item.unit_price
                        ? (parseFloat(item.unit_price) * item.quantity).toFixed(2)
                        : "—"}{" "}ETB
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Group justify="flex-end">
            <Text size="sm" fw={700}>
              Total: {parseFloat(order.total_amount).toFixed(2)} ETB
            </Text>
          </Group>
        </Stack>
      )}
    </Box>
  );
}

function OrdersTable({ data, colSpan = 5 }: { data: Order[]; colSpan?: number }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  if (data.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        No orders found
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
                bg={expandedId === order.id ? "var(--mantine-color-default-hover)" : undefined}
              >
                <Table.Td>
                  <ActionIcon variant="subtle" size="xs" color="gray">
                    {expandedId === order.id
                      ? <IconChevronDown size={14} />
                      : <IconChevronRight size={14} />}
                  </ActionIcon>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" ff="monospace">#{order.id.slice(0, 8)}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="outline" size="sm">
                    {order.order_type === "walk_in" ? "Walk-in" : "Online"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text fw={500}>{parseFloat(order.total_amount).toFixed(2)} ETB</Text>
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
                    <ExpandedItems order={order} />
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

export default function ManagerOrdersPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: orders, isLoading } = useOrders();

  const activeOrders =
    orders?.filter((o) =>
      ["pending", "confirmed", "preparing", "ready"].includes(o.status)
    ) || [];

  const collectedOrders = orders?.filter((o) => o.status === "collected") || [];

  // Filter orders based on search query
  const filterOrders = (ordersList: Order[]) => {
    if (!searchQuery.trim()) return ordersList;

    const query = searchQuery.toLowerCase();
    return ordersList.filter((order) => {
      const orderId = order.id.toLowerCase();

      return orderId.includes(query);
    });
  };

  const filteredActiveOrders = useMemo(
    () => filterOrders(activeOrders),
    [activeOrders, searchQuery]
  );
  const filteredCollectedOrders = useMemo(
    () => filterOrders(collectedOrders),
    [collectedOrders, searchQuery]
  );

  return (
    <DashboardShell allowedRoles={["lounge_manager"]}>
      <Container size="xl">
        <Stack gap="xl">
          <div>
            <Title order={2}>Orders</Title>
            <Text c="dimmed" size="sm">View all orders for your lounge</Text>
          </div>

          <Paper shadow="sm" radius="md" withBorder>
            <Tabs value={activeTab} onChange={(v) => {
              setActiveTab(v || "active");
              setSearchQuery(""); // Clear search when switching tabs
            }}>
              <Tabs.List px="md" pt="xs">
                <Tabs.Tab value="active" leftSection={<IconShoppingCart size={16} />}>
                  Active ({filteredActiveOrders.length})
                </Tabs.Tab>
                <Tabs.Tab value="collected" leftSection={<IconCheck size={16} />}>
                  Collected ({filteredCollectedOrders.length})
                </Tabs.Tab>
              </Tabs.List>

              <Box px="md" pt="md">
                <TextInput
                  placeholder="Search by order ID or customer name..."
                  leftSection={<IconSearch size={16} />}
                  rightSection={
                    searchQuery ? (
                      <ActionIcon
                        variant="subtle"
                        onClick={() => setSearchQuery("")}
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    ) : null
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                />
              </Box>

              <Tabs.Panel value="active" p="md">
                {isLoading ? <Center py="xl"><Loader /></Center> : <OrdersTable data={filteredActiveOrders} />}
              </Tabs.Panel>

              <Tabs.Panel value="collected" p="md">
                {isLoading ? <Center py="xl"><Loader /></Center> : <OrdersTable data={filteredCollectedOrders} />}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
