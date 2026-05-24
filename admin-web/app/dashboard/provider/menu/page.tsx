"use client";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  Container,
  Title,
  Text,
  Paper,
  Table,
  Badge,
  Group,
  Stack,
  LoadingOverlay,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconCoffee, IconToolsKitchen2 } from "@tabler/icons-react";
import { useMenu } from "@/hooks/queries/useMenu";
import { useActiveLoungeStore } from "@/lib/active-lounge-store";

export default function ProviderMenuPage() {
  const { activeLoungeId } = useActiveLoungeStore();
  const { data: menuItems, isLoading, error } = useMenu();

  if (!activeLoungeId) {
    return (
      <DashboardShell allowedRoles={["lounge_manager"]}>
        <Container size="xl" py="xl">
          <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
            Please select a lounge from the dropdown to view its menu.
          </Alert>
        </Container>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell allowedRoles={["lounge_manager"]}>
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header */}
          <div>
            <Title order={2} mb="xs">
              Menu Items
            </Title>
            <Text c="dimmed" size="sm">
              View all menu items for the selected lounge
            </Text>
          </div>

          {/* Menu Items Table */}
          <Paper shadow="sm" p="md" radius="md" withBorder pos="relative">
            <LoadingOverlay visible={isLoading} />

            {error && (
              <Alert color="red" icon={<IconAlertCircle size={16} />} mb="md">
                Failed to load menu items. Please try again.
              </Alert>
            )}

            {!isLoading && !error && menuItems && menuItems.length === 0 && (
              <Alert color="blue" icon={<IconAlertCircle size={16} />}>
                No menu items found for this lounge.
              </Alert>
            )}

            {!isLoading && !error && menuItems && menuItems.length > 0 && (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Price</Table.Th>
                    <Table.Th>Prep Time</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {menuItems.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        <Group gap="xs">
                          {item.category === "food" ? (
                            <IconToolsKitchen2 size={18} />
                          ) : (
                            <IconCoffee size={18} />
                          )}
                          <div>
                            <Text fw={500}>{item.name}</Text>
                            {item.description && (
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {item.description}
                              </Text>
                            )}
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={item.category === "food" ? "orange" : "blue"}
                          variant="light"
                          tt="capitalize"
                        >
                          {item.category || "N/A"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" tt="capitalize">
                          {item.category === "food"
                            ? item.meal_type?.replace("_", " ") || "N/A"
                            : item.drink_type || "N/A"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500}>ETB {parseFloat(item.price).toFixed(2)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{item.estimated_preparation_time} min</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={item.is_available ? "green" : "red"}
                          variant="light"
                        >
                          {item.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
