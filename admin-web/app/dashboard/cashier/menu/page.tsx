"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  useMenu,
  useCreateMenuItem,
  useUpdateMenuItem,
  useToggleMenuItemAvailability,
} from "@/hooks/queries/useMenu";
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
  TextInput,
  NumberInput,
  Textarea,
  Switch,
  ScrollArea,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { IconPlus, IconEdit, IconChefHat } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { MenuItem } from "@/lib/api";

// Add / Edit Modal
function MenuItemModal({
  opened,
  onClose,
  editItem,
}: {
  opened: boolean;
  onClose: () => void;
  editItem: MenuItem | null;
}) {
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();

  const form = useForm({
    initialValues: {
      name: editItem?.name || "",
      description: editItem?.description || "",
      price: editItem ? parseFloat(editItem.price) : 0,
      estimated_preparation_time: editItem?.estimated_preparation_time || 10,
      image_url: editItem?.image_url || "",
    },
  });

  // Reset when editItem changes
  useState(() => {
    form.setValues({
      name: editItem?.name || "",
      description: editItem?.description || "",
      price: editItem ? parseFloat(editItem.price) : 0,
      estimated_preparation_time: editItem?.estimated_preparation_time || 10,
      image_url: editItem?.image_url || "",
    });
  });

  const handleSubmit = form.onSubmit((values) => {
    if (editItem) {
      updateMutation.mutate(
        { itemId: editItem.id, data: values },
        {
          onSuccess: () => {
            notifications.show({ title: "Success", message: "Menu item updated", color: "green" });
            onClose();
          },
          onError: (err: any) =>
            notifications.show({ title: "Error", message: err.message, color: "red" }),
        }
      );
    } else {
      createMutation.mutate(
        {
          name: values.name,
          description: values.description || undefined,
          price: values.price,
          estimated_preparation_time: values.estimated_preparation_time,
          image_url: values.image_url || undefined,
        },
        {
          onSuccess: () => {
            notifications.show({ title: "Success", message: "Menu item created", color: "green" });
            form.reset();
            onClose();
          },
          onError: (err: any) =>
            notifications.show({ title: "Error", message: err.message, color: "red" }),
        }
      );
    }
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editItem ? "Edit Menu Item" : "Add Menu Item"}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput label="Name" placeholder="e.g. Tibs" required {...form.getInputProps("name")} />
          <Textarea
            label="Description"
            placeholder="Brief description (optional)"
            rows={2}
            {...form.getInputProps("description")}
          />
          <Group grow>
            <NumberInput
              label="Price (ETB)"
              placeholder="0.00"
              min={0}
              decimalScale={2}
              required
              {...form.getInputProps("price")}
            />
            <NumberInput
              label="Prep Time (min)"
              placeholder="10"
              min={1}
              required
              {...form.getInputProps("estimated_preparation_time")}
            />
          </Group>
          <TextInput
            label="Image URL"
            placeholder="https://... (optional)"
            {...form.getInputProps("image_url")}
          />
          <Button type="submit" fullWidth loading={isLoading}>
            {editItem ? "Save Changes" : "Add Item"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

export default function CashierMenuPage() {
  const [opened, { open, close }] = useDisclosure(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  
  const { data: menuItems, isLoading } = useMenu("");
  const toggleMutation = useToggleMenuItemAvailability();

  const handleEdit = (item: MenuItem) => {
    setEditItem(item);
    open();
  };

  const handleAdd = () => {
    setEditItem(null);
    open();
  };

  const handleToggle = (item: MenuItem) => {
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
      }
    );
  };

  return (
    <DashboardShell allowedRoles={["cashier"]}>
      <Container size="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <div>
              <Title order={2}>Menu Management</Title>
              <Text c="dimmed" size="sm">Add, edit, and manage availability of menu items</Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
              Add Item
            </Button>
          </Group>

          <Paper shadow="sm" radius="md" withBorder>
            {isLoading ? (
              <Center py="xl"><Loader /></Center>
            ) : !menuItems || menuItems.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="xs">
                  <IconChefHat size={40} color="gray" />
                  <Text c="dimmed">No menu items yet. Add your first item.</Text>
                </Stack>
              </Center>
            ) : (
              <ScrollArea>
                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Description</Table.Th>
                      <Table.Th>Price</Table.Th>
                      <Table.Th>Prep Time</Table.Th>
                      <Table.Th>Available</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {menuItems.map((item) => (
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
                          <Text fw={500}>{parseFloat(item.price).toFixed(2)} ETB</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{item.estimated_preparation_time} min</Text>
                        </Table.Td>
                        <Table.Td>
                          <Switch
                            checked={item.is_available}
                            onChange={() => handleToggle(item)}
                            disabled={toggleMutation.isPending}
                            color="teal"
                          />
                        </Table.Td>
                        <Table.Td>
                          <Tooltip label="Edit">
                            <ActionIcon
                              variant="subtle"
                              onClick={() => handleEdit(item)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Paper>
        </Stack>
      </Container>

      <MenuItemModal opened={opened} onClose={close} editItem={editItem} />
    </DashboardShell>
  );
}
