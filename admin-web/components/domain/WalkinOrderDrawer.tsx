"use client";
import { useState } from "react";
import { useMenu } from "@/hooks/queries/useMenu";
import { useCreateWalkInOrder } from "@/hooks/queries/useOrders";
import {
  Drawer,
  Stack,
  Title,
  Text,
  Select,
  NumberInput,
  Button,
  Group,
  ActionIcon,
  Divider,
  Paper,
  Loader,
  Center,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { OrderItem } from "@/lib/api";

interface WalkInOrderDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function WalkInOrderDrawer({ opened, onClose }: WalkInOrderDrawerProps) {
  const { data: menuItems, isLoading: menuLoading } = useMenu();
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

  const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

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
        setSelectedItem(null);
        setQuantity(1);
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
        label: `${m.name} — ${parseFloat(m.price).toFixed(2)} ETB`,
      })) || [];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      padding="lg"
      title={
        <Stack gap={2}>
          <Title order={4}>New Walk-in Order</Title>
          <Text size="xs" c="dimmed">
            Select items and place the order
          </Text>
        </Stack>
      }
    >
      {menuLoading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <Stack gap="md">
          <Divider label="Select Items" labelPosition="left" />

          <Group align="flex-end">
            <Select
              label="Menu Item"
              placeholder="Search item..."
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

          {/* Order items list */}
          {orderItems.length > 0 && (
            <>
              <Divider label="Order Summary" labelPosition="left" />
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
            </>
          )}

          <Divider label="Payment" labelPosition="left" />

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
            mt="sm"
            onClick={handleSubmit}
            loading={createOrderMutation.isPending}
            disabled={orderItems.length === 0}
          >
            Place Order
          </Button>
          <Button variant="subtle" fullWidth onClick={onClose} disabled={createOrderMutation.isPending}>
            Cancel
          </Button>
        </Stack>
      )}
    </Drawer>
  );
}