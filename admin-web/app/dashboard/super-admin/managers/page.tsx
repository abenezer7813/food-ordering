'use client'

import { DashboardShell } from "@/components/layout/DashboardShell"
import { useManagers, useDeactivateStaff } from "@/hooks/queries/useStaff";
import { useLoungesAdmin } from "@/hooks/queries/useLounges";
import { CreateManagerDrawer } from "@/components/domain/CreateManagerDrawer";
import { 
  Table, 
  Tooltip, 
  Stack, 
  Text, 
  Group, 
  Container,
  Title,
  Paper,
  Badge,
  ActionIcon,
  LoadingOverlay,
  Avatar,
  Button,
} from "@mantine/core";
import { modals } from '@mantine/modals';
import { 
  IconBan, 
  IconCircleCheck, 
  IconPlus, 
  IconUserCircle,
  IconMail,
  IconBuildingStore,
} from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export default function SuperAdminManagersPage() {
    const { data: managers, refetch, isLoading } = useManagers();
    const { data: lounges } = useLoungesAdmin();
    const deactivateStaff = useDeactivateStaff();
    const [drawerOpened, setDrawerOpened] = useState(false);

    const handleDeactivateManager = (managerId: string, managerName: string, isActive: boolean) => {
        const action = isActive ? 'deactivate' : 'activate';
        const actionTitle = isActive ? 'Deactivate' : 'Activate';
        
        modals.openConfirmModal({
            title: `${actionTitle} Manager`,
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to {action} <strong>{managerName}</strong>?
                </Text>
            ),
            labels: { confirm: actionTitle, cancel: 'Cancel' },
            confirmProps: { color: isActive ? 'red' : 'green' },
            onConfirm: () => {
                deactivateStaff.mutate(managerId, {
                    onSuccess: () => {
                        notifications.show({
                            title: 'Success',
                            message: `Manager ${action}d successfully`,
                            color: 'green',
                        });
                        refetch();
                    },
                    onError: (error: any) => {
                        notifications.show({
                            title: 'Error',
                            message: error.response?.data?.error || `Failed to ${action} manager`,
                            color: 'red',
                        });
                    },
                });
            },
        });
    };

    const getManagerLounges = (managerId: string) => {
        return lounges?.filter(lounge => lounge.manager?.id === managerId) || [];
    };

    return (
        <DashboardShell allowedRoles={["super_admin"]}>
            <Container size="xl" py="xl">
                <Stack gap="lg">
                    {/* Header */}
                    <Group justify="space-between">
                        <div>
                            <Title order={2} mb="xs">Managers</Title>
                            <Text c="dimmed" size="sm">
                                Manage all lounge managers in the system
                            </Text>
                        </div>
                        <Button 
                            leftSection={<IconPlus size={18} />}
                            onClick={() => setDrawerOpened(true)}
                        >
                            Add Manager
                        </Button>
                    </Group>

                    {/* Managers Table */}
                    <Paper shadow="sm" p="md" radius="md" withBorder pos="relative">
                        <LoadingOverlay visible={isLoading} />
                        
                        {!isLoading && managers && managers.length === 0 ? (
                            <Stack align="center" py="xl">
                                <IconUserCircle size={48} stroke={1.5} color="gray" />
                                <Text c="dimmed">No managers found</Text>
                                <Button 
                                    variant="light" 
                                    leftSection={<IconPlus size={16} />}
                                    onClick={() => setDrawerOpened(true)}
                                >
                                    Add Your First Manager
                                </Button>
                            </Stack>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Manager</Table.Th>
                                        <Table.Th>Email</Table.Th>
                                        <Table.Th>Assigned Lounges</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {managers?.map(manager => {
                                        const assignedLounges = getManagerLounges(manager.id);
                                        return (
                                            <Table.Tr key={manager.id}>
                                                <Table.Td>
                                                    <Group gap="sm">
                                                        <Avatar color="indigo" radius="xl">
                                                            {manager.first_name[0]}{manager.last_name[0]}
                                                        </Avatar>
                                                        <div>
                                                            <Text fw={500}>
                                                                {manager.first_name} {manager.last_name}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
                                                                Manager
                                                            </Text>
                                                        </div>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Group gap="xs">
                                                        <IconMail size={16} color="gray" />
                                                        <Text size="sm">{manager.email}</Text>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>
                                                    {assignedLounges.length > 0 ? (
                                                        <Group gap="xs">
                                                            <IconBuildingStore size={16} color="gray" />
                                                            <Stack gap={2}>
                                                                {assignedLounges.map(lounge => (
                                                                    <Text key={lounge.id} size="sm" tt="capitalize">
                                                                        {lounge.name}
                                                                    </Text>
                                                                ))}
                                                            </Stack>
                                                        </Group>
                                                    ) : (
                                                        <Text size="sm" c="dimmed">No lounges assigned</Text>
                                                    )}
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge 
                                                        color={manager.is_active ? "green" : "red"}
                                                        variant="light"
                                                    >
                                                        {manager.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Group gap="xs" justify="flex-end">
                                                        <Tooltip label={manager.is_active ? "Deactivate" : "Activate"}>
                                                            <ActionIcon 
                                                                variant="light"
                                                                color={manager.is_active ? "red" : "green"}
                                                                onClick={() => {
                                                                    handleDeactivateManager(
                                                                        manager.id,
                                                                        `${manager.first_name} ${manager.last_name}`,
                                                                        manager.is_active
                                                                    );
                                                                }}
                                                                loading={deactivateStaff.isPending}
                                                            >
                                                                {manager.is_active ? (
                                                                    <IconBan size={18} />
                                                                ) : (
                                                                    <IconCircleCheck size={18} />
                                                                )}
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Stack>
            </Container>

            {/* Create Manager Drawer */}
            <CreateManagerDrawer
                opened={drawerOpened}
                onClose={() => {
                    setDrawerOpened(false);
                    refetch();
                }}
                loungeId="" // Empty since we're not assigning to a specific lounge
            />
        </DashboardShell>
    )
}
