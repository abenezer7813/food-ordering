"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useManagers } from "@/hooks/queries/useStaff";
import { CreateManagerDrawer } from "@/components/domain/CreateManagerDrawer";
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
} from "@mantine/core";
import { IconPlus, IconUsers } from "@tabler/icons-react";

export default function ManagersPage() {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const { data: managers, isLoading } = useManagers();

  return (
    <DashboardShell allowedRoles={["super_admin"]}>
      <Container size="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <div>
              <Title order={2}>Managers</Title>
              <Text c="dimmed" size="sm">
                View and create lounge managers
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setDrawerOpened(true)}
            >
              Create Manager
            </Button>
          </Group>

          <Paper shadow="sm" radius="md" withBorder>
            {isLoading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : !managers || managers.length === 0 ? (
              <Center py="xl">
                <Stack align="center" gap="xs">
                  <IconUsers size={40} color="gray" />
                  <Text c="dimmed">No managers yet</Text>
                </Stack>
              </Center>
            ) : (
              <ScrollArea>
                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Created</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {managers.map((manager) => (
                      <Table.Tr key={manager.id}>
                        <Table.Td>
                          <Text fw={500}>
                            {manager.first_name} {manager.last_name}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {manager.email}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={manager.is_active ? "teal" : "gray"}
                            variant="light"
                          >
                            {manager.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {new Date(manager.created_at).toLocaleDateString()}
                          </Text>
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

      <CreateManagerDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        loungeId=""
      />
    </DashboardShell>
  );
}
