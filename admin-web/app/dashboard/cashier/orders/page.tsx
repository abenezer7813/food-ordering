"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  useOrders,
  useMarkOrderCollected,
  useCreateWalkInOrder,
} from "@/hooks/queries/useOrders";
import { useMenu } from "@/hooks/queries/useMenu";
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
  Modal,
  Select,
  NumberInput,
  ActionIcon,
  Divider,
  ScrollArea,
  Tabs,
  Loader,
  Center,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconTrash,
  IconShoppingCart,
  IconCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Order, OrderItem } from "@/lib/api";
import { WalkInOrderDrawer } from "@/components/domain/WalkinOrderDrawer";

const STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  confirmed: "blue",
  preparing: "orange",
  ready: "teal",
  collected: "gray",
};


  

export default function CashierOrdersPage() {
  const [activeTab, setActiveTab] = useState<string>("active");
  const [opened, { open, close }] = useDisclosure(false);

  const { data: orders, isLoading } = useOrders();
  const markCollectedMutation = useMarkOrderCollected();

  const activeOrders = orders?.filter((o) =>
    ["pending", "confirmed", "preparing", "ready"].includes(o.status)
  ) || [];

  const collectedOrders = orders?.filter((o) => o.status === "collected") || [];

  const handleCollect = (orderId: string) => {
    markCollectedMutation.mutate(orderId, {
      onSuccess: () =>
        notifications.show({ title: "Success", message: "Order marked as collected", color: "green" }),
      onError: (err: any) =>
        notifications.show({ title: "Error", message: err.message, color: "red" }),
    });
  };

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
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Text ta="center" c="dimmed" py="xl">No orders found</Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            data.map((order) => (
              <Table.Tr key={order.id}>
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
                <Table.Td>
                  {order.status === "ready" && (
                    <Button
                      size="xs"
                      color="teal"
                      leftSection={<IconCheck size={12} />}
                      loading={markCollectedMutation.isPending}
                      onClick={() => handleCollect(order.id)}
                    >
                      Collect
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
    <DashboardShell allowedRoles={["cashier"]}>
      <Container size="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <div>
              <Title order={2}>Orders</Title>
              <Text c="dimmed" size="sm">Manage walk-in and online orders</Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={open}>
              New Walk-in Order
            </Button>
          </Group>

          <Paper shadow="sm" radius="md" withBorder>
            <Tabs value={activeTab} onChange={(v) => setActiveTab(v || "active")}>
              <Tabs.List px="md" pt="xs">
                <Tabs.Tab value="active" leftSection={<IconShoppingCart size={16} />}>
                  Active ({activeOrders.length})
                </Tabs.Tab>
                <Tabs.Tab value="collected">
                  Collected ({collectedOrders.length})
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="active" p="md">
                {isLoading ? (
                  <Center py="xl"><Loader /></Center>
                ) : renderTable(activeOrders)}
              </Tabs.Panel>

              <Tabs.Panel value="collected" p="md">
                {isLoading ? (
                  <Center py="xl"><Loader /></Center>
                ) : renderTable(collectedOrders)}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Container>
      <WalkInOrderDrawer opened={opened} onClose={close} />
    </DashboardShell>
  );
}
