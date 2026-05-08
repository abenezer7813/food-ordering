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

const STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  confirmed: "blue",
  preparing: "orange",
  ready: "teal",
  collected: "gray",
};

// Walk-in order modal
function WalkInOrderModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const { data: menuItems, isLoading: menuLoading } = useMenu("");
  const createOrderMutation = useCreateWalkInOrder();

  const [orderItems, setOrderItems] = useState<
    { menu_item_id: string; quantity: number; name: string; price: number }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const addItem = () => {
    if (!selectedItem) return;
    const menuItem = menuItems?.find((m) => m.id === selectedItem);
    if (!menuItem) return;

    const existing = orderItems.find((i) => i.menu_item_id === selectedItem);
    if (existing) {
      setOrderItems((prev) =>
        prev.map((i) =>
          i.menu_item_id === selectedItem
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      setOrderItems((prev) => [
        ...prev,
        {
          menu_item_id: selectedItem,
          quantity,
          name: menuItem.name,
          price: parseFloat(menuItem.price),
        },
      ]);
    }
    setSelectedItem(null);
    setQuantity(1);
  };

  const removeItem = (id: string) => {
    setOrderItems((prev) => prev.filter((i) => i.menu_item_id !== id));
  };

  const total = orderItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const handleSubmit = () => {
    if (orderItems.length === 0) {
      notifications.show({ title: "Error", message: "Add at least one item", color: "red" });
      return;
    }
    const payload: { items: OrderItem[]; payment_method: string } = {
      items: orderItems.map(({ menu_item_id, quantity }) => ({
        menu_item_id,
        quantity,
      })),
      payment_method: paymentMethod,
    };
    createOrderMutation.mutate(payload, {
      onSuccess: () => {
        notifications.show({ title: "Success", message: "Walk-in order created", color: "green" });
        setOrderItems([]);
        setPaymentMethod("cash");
        onClose();
      },
      onError: (err: any) => {
        notifications.show({ title: "Error", message: err.message || "Failed to create order", color: "red" });
      },
    });
  };

  const menuOptions =
    menuItems
      ?.filter((m) => m.is_available)
      .map((m) => ({
        value: m.id,
        label: `${m.name} — ${m.price} ETB`,
      })) || [];

  return (
    <Modal opened={opened} onClose={onClose} title="New Walk-in Order" size="lg">
      <Stack gap="md">
        {menuLoading ? (
          <Center py="xl"><Loader /></Center>
        ) : (
          <>
            <Group align="flex-end">
              <Select
                label="Menu Item"
                placeholder="Select item"
                data={menuOptions}
                value={selectedItem}
                onChange={setSelectedItem}
                searchable
                style={{ flex: 1 }}
              />
              <NumberInput
                label="Qty"
                value={quantity}
                onChange={(v) => setQuantity(Number(v))}
                min={1}
                max={99}
                w={80}
              />
              <Button onClick={addItem} disabled={!selectedItem}>
                Add
              </Button>
            </Group>

            {orderItems.length > 0 && (
              <Paper withBorder p="sm" radius="md">
                <Stack gap="xs">
                  {orderItems.map((item) => (
                    <Group key={item.menu_item_id} justify="space-between">
                      <Text size="sm">
                        {item.name} × {item.quantity}
                      </Text>
                      <Group gap="xs">
                        <Text size="sm" fw={500}>
                          {(item.price * item.quantity).toFixed(2)} ETB
                        </Text>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          size="sm"
                          onClick={() => removeItem(item.menu_item_id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  ))}
                  <Divider />
                  <Group justify="space-between">
                    <Text fw={600}>Total</Text>
                    <Text fw={700} size="lg">
                      {total.toFixed(2)} ETB
                    </Text>
                  </Group>
                </Stack>
              </Paper>
            )}

            <Select
              label="Payment Method"
              data={[
                { value: "cash", label: "Cash" },
                { value: "wallet", label: "Wallet" },
              ]}
              value={paymentMethod}
              onChange={(v) => setPaymentMethod(v || "cash")}
            />

            <Button
              fullWidth
              onClick={handleSubmit}
              loading={createOrderMutation.isPending}
              disabled={orderItems.length === 0}
            >
              Place Order
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
}

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

      <WalkInOrderModal opened={opened} onClose={close} />
    </DashboardShell>
  );
}
