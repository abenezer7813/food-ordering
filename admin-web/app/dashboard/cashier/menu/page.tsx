"use client";
import { useState, useMemo } from "react";
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
  Select,
  Box,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconEdit,
  IconChefHat,
  IconToolsKitchen2,
  IconGlass,
  IconFilter,
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
  const [mealTypeFilter, setMealTypeFilter] = useState<string>("all");
  const [drinkTypeFilter, setDrinkTypeFilter] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("food");

  const { data: menuItems, isLoading } = useMenu();
  const toggleMutation = useToggleMenuItemAvailability();

  // Separate food and drink items first
  const allFoodItems = menuItems?.filter((i) => i.category === "food" || (!i.category && i.meal_type)) ?? [];
  const allDrinkItems = menuItems?.filter((i) => i.category === "drink" || (!i.category && i.drink_type)) ?? [];
  const uncategorised = menuItems?.filter((i) => !i.category && !i.meal_type && !i.drink_type) ?? [];

  // Apply filters to food items
  const filteredFoodItems = useMemo(() => {
    let items = [...allFoodItems, ...uncategorised];
    
    // Meal type filter
    if (mealTypeFilter !== "all") {
      items = items.filter((item) => item.meal_type === mealTypeFilter);
    }
    
    // Availability filter
    if (availabilityFilter === "available") {
      items = items.filter((item) => item.is_available);
    } else if (availabilityFilter === "unavailable") {
      items = items.filter((item) => !item.is_available);
    }
    
    return items;
  }, [allFoodItems, uncategorised, mealTypeFilter, availabilityFilter]);

  // Apply filters to drink items
  const filteredDrinkItems = useMemo(() => {
    let items = [...allDrinkItems];
    
    // Drink type filter
    if (drinkTypeFilter !== "all") {
      items = items.filter((item) => item.drink_type === drinkTypeFilter);
    }
    
    // Availability filter
    if (availabilityFilter === "available") {
      items = items.filter((item) => item.is_available);
    } else if (availabilityFilter === "unavailable") {
      items = items.filter((item) => !item.is_available);
    }
    
    return items;
  }, [allDrinkItems, drinkTypeFilter, availabilityFilter]);

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

  const hasActiveFilters = 
    (activeTab === "food" && mealTypeFilter !== "all") ||
    (activeTab === "drink" && drinkTypeFilter !== "all") ||
    availabilityFilter !== "all";

  const resetFilters = () => {
    setMealTypeFilter("all");
    setDrinkTypeFilter("all");
    setAvailabilityFilter("all");
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
              <Tabs value={activeTab} onChange={(v) => setActiveTab(v || "food")}>
                <Tabs.List px="md" pt="xs">
                  <Tabs.Tab
                    value="food"
                    leftSection={<IconToolsKitchen2 size={16} />}
                  >
                    Food ({filteredFoodItems.length})
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="drink"
                    leftSection={<IconGlass size={16} />}
                  >
                    Drinks ({filteredDrinkItems.length})
                  </Tabs.Tab>
                </Tabs.List>

                <Box px="md" pt="md">
                  <Group gap="md">
                    {activeTab === "food" ? (
                      <Select
                        placeholder="Meal Type"
                        leftSection={<IconFilter size={16} />}
                        data={[
                          { value: "all", label: "All Meal Types" },
                          { value: "breakfast", label: "🌅 Breakfast" },
                          { value: "lunch", label: "☀️ Lunch" },
                          { value: "dinner", label: "🌙 Dinner" },
                          { value: "all_day", label: "🕐 All Day" },
                        ]}
                        value={mealTypeFilter}
                        onChange={(value) => setMealTypeFilter(value || "all")}
                        style={{ flex: 1 }}
                      />
                    ) : (
                      <Select
                        placeholder="Drink Type"
                        leftSection={<IconFilter size={16} />}
                        data={[
                          { value: "all", label: "All Drink Types" },
                          { value: "juice", label: "🍊 Juice" },
                          { value: "coffee", label: "☕ Coffee" },
                          { value: "tea", label: "🍵 Tea" },
                          { value: "water", label: "💧 Water" },
                          { value: "soda", label: "🥤 Soda" },
                          { value: "smoothie", label: "🥛 Smoothie" },
                          { value: "other", label: "🫙 Other" },
                        ]}
                        value={drinkTypeFilter}
                        onChange={(value) => setDrinkTypeFilter(value || "all")}
                        style={{ flex: 1 }}
                      />
                    )}
                    <Select
                      placeholder="Availability"
                      data={[
                        { value: "all", label: "All Items" },
                        { value: "available", label: "Available" },
                        { value: "unavailable", label: "Unavailable" },
                      ]}
                      value={availabilityFilter}
                      onChange={(value) => setAvailabilityFilter(value || "all")}
                      style={{ flex: 1 }}
                    />
                    {hasActiveFilters && (
                      <Button variant="light" onClick={resetFilters}>
                        Reset Filters
                      </Button>
                    )}
                  </Group>
                </Box>

                <Tabs.Panel value="food" p="md">
                  <MenuTable
                    items={filteredFoodItems}
                    type="food"
                    togglingId={togglingId}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="drink" p="md">
                  <MenuTable
                    items={filteredDrinkItems}
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
