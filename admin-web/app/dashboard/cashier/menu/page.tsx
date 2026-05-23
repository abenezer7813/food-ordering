"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useMenu, useToggleMenuItemAvailability } from "@/hooks/queries/useMenu";
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
  Switch,
  ScrollArea,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
  Tabs,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconEdit,
  IconChefHat,
  IconToolsKitchen2,
  IconGlass,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { MenuItem } from "@/lib/api";
import { MenuItemDrawer } from "@/components/domain/MenuItemDrawer";

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "🌅 Breakfast",
  lunch: "☀️ Lunch",
  dinner: "🌙 Dinner",
  all_day: "🕐 All Day",
};

const DRINK_TYPE_LABELS: Record<string, string> = {
  juice: "🍊 Juice",
  coffee: "☕ Coffee",
  tea: "🍵 Tea",
  water: "💧 Water",
  soda: "🥤 Soda",
  smoothie: "🥛 Smoothie",
  other: "🫙 Other",
};

function MenuTable({
  items,
  type,
  togglingId,
  onToggle,
  onEdit,
}: {
  items: MenuItem[];
  type: "food" | "drink";
  togglingId: string | null;
  onToggle: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
}) {
  if (items.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <IconChefHat size={40} color="gray" />
          <Text c="dimmed">
            No {type === "food" ? "food items" : "drinks"} yet. Add your first item.
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <ScrollArea>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>{type === "food" ? "Meal Type" : "Drink Type"}</Table.Th>
            <Table.Th>Price</Table.Th>
            <Table.Th>Prep Time</Table.Th>
            <Table.Th>Available</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                <Text fw={500}>{item.name}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed" lineClamp={1}>
                  {item.description || "—"}
                </Text>
              </Table.Td>
              <Table.Td>
                {type === "food" && item.meal_type ? (
                  <Badge size="sm" color="teal" variant="light">
                    {MEAL_TYPE_LABELS[item.meal_type] ?? item.meal_type}
                  </Badge>
                ) : type === "drink" && item.drink_type ? (
                  <Badge size="sm" color="violet" variant="light">
                    {DRINK_TYPE_LABELS[item.drink_type] ?? item.drink_type}
                  </Badge>
                ) : (
                  <Text size="xs" c="dimmed">—</Text>
                )}
              </Table.Td>
              <Table.Td>
                <Text fw={500}>{parseFloat(item.price).toFixed(2)} ETB</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{item.estimated_preparation_time} min</Text>
              </Table.Td>
              <Table.Td>
                <Switch
                  checked={item.is_available}
                  onChange={() => onToggle(item)}
                  disabled={togglingId === item.id}
                  color="teal"
                />
              </Table.Td>
              <Table.Td>
                <Tooltip label="Edit">
                  <ActionIcon variant="subtle" onClick={() => onEdit(item)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

export default function CashierMenuPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: menuItems, isLoading } = useMenu();
  const toggleMutation = useToggleMenuItemAvailability();

  const foodItems = menuItems?.filter((i) => i.category === "food" || (!i.category && i.meal_type)) ?? [];
  const drinkItems = menuItems?.filter((i) => i.category === "drink" || (!i.category && i.drink_type)) ?? [];
  // uncategorised items — show in food tab as fallback
  const uncategorised = menuItems?.filter((i) => !i.category && !i.meal_type && !i.drink_type) ?? [];
  const allFoodRows = [...foodItems, ...uncategorised];

  const handleEdit = (item: MenuItem) => {
    setEditItem(item);
    open();
  };

  const handleAdd = () => {
    setEditItem(null);
    open();
  };

  const handleToggle = (item: MenuItem) => {
    if (togglingId) return;
    setTogglingId(item.id);
    toggleMutation.mutate(
      { itemId: item.id, isAvailable: !item.is_available },
      {
        onSuccess: () =>
          notifications.show({
            title: "Updated",
            message: `${item.name} marked as ${!item.is_available ? "available" : "unavailable"}`,
            color: "teal",
          }),
        onError: (err: any) =>
          notifications.show({ title: "Error", message: err.message, color: "red" }),
        onSettled: () => setTogglingId(null),
      }
    );
  };

  return (
    <DashboardShell allowedRoles={["cashier"]}>
      <MenuItemDrawer opened={opened} onClose={close} editItem={editItem} />

      <Container size="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <div>
              <Title order={2}>Menu Management</Title>
              <Text c="dimmed" size="sm">
                Add, edit, and manage availability of menu items
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
              Add Item
            </Button>
          </Group>

          <Paper shadow="sm" radius="md" withBorder>
            {isLoading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : (
              <Tabs defaultValue="food">
                <Tabs.List px="md" pt="xs">
                  <Tabs.Tab
                    value="food"
                    leftSection={<IconToolsKitchen2 size={16} />}
                  >
                    Food ({allFoodRows.length})
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="drink"
                    leftSection={<IconGlass size={16} />}
                  >
                    Drinks ({drinkItems.length})
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="food" p="md">
                  <MenuTable
                    items={allFoodRows}
                    type="food"
                    togglingId={togglingId}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="drink" p="md">
                  <MenuTable
                    items={drinkItems}
                    type="drink"
                    togglingId={togglingId}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                  />
                </Tabs.Panel>
              </Tabs>
            )}
          </Paper>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
