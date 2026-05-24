'use client'

import { DashboardShell } from "@/components/layout/DashboardShell"
import { useAssignManager, useAddNewManger, useCreateLounge, useDeactivateLounge, useLoungesAdmin } from "@/hooks/queries/useLounges"
import { useManagers } from "@/hooks/queries/useStaff";
import { 
  Table, 
  Button, 
  Modal, 
  TextInput, 
  Tooltip, 
  ScrollArea, 
  Stack, 
  Text, 
  Group, 
  Divider,
  Container,
  Title,
  Paper,
  Badge,
  ActionIcon,
  LoadingOverlay
} from "@mantine/core";
import { modals } from '@mantine/modals';
import { 
  IconBan, 
  IconCheck, 
  IconCircleCheck, 
  IconPlus, 
  IconUserPlus,
  IconBuildingStore
} from "@tabler/icons-react";
import { CreateManagerDrawer } from "@/components/domain/CreateManagerDrawer";
import { useState } from "react";

export default function DashboardLounges() {
    const { data: lounges, refetch, isLoading } = useLoungesAdmin()
    const createLounge = useCreateLounge();
    const assignManager = useAssignManager();
    const deactivateLounge = useDeactivateLounge();
    const [opened, setOpened] = useState(false)
    const [openAddLoungeModal, setOpenAddLoungeModal] = useState(false)
    const [newLoungeName, setNewLoungeName] = useState("")
    const [loungeId, setLoungeId] = useState('')
    const [selectedLoungeName, setSelectedLoungeName] = useState('')
    const { data: managers } = useManagers()
    const [drawerOpened, setDrawerOpened] = useState(false);

    const handleAddLounge = async () => {
        if (!newLoungeName.trim()) return;
        createLounge.mutate(newLoungeName)
        setOpenAddLoungeModal(false)
        setNewLoungeName("")
        refetch();
    }
    
    const handleAssignManager = async (managerId: string, managerName: string, managerEmail: string) => {
        modals.openConfirmModal({
            title: 'Confirm Manager Assignment',
            centered: true,
            children: (
                <Stack gap="sm">
                    <Text size="sm">
                        Are you sure you want to assign <strong>{managerName}</strong> to <strong>{selectedLoungeName}</strong>?
                    </Text>
                    <Text size="xs" c="dimmed">
                        Email: {managerEmail}
                    </Text>
                </Stack>
            ),
            labels: { confirm: 'Assign Manager', cancel: 'Cancel' },
            confirmProps: { color: 'blue' },
            onConfirm: () => {
                assignManager.mutate({ loungeId, managerId });
                setOpened(false);
            },
        });
    }

    const handleDeactivate = async (loungeName: string, isActive: boolean) => {
        const action = isActive ? 'deactivate' : 'activate';
        const actionTitle = isActive ? 'Deactivate' : 'Activate';
        
        modals.openConfirmModal({
            title: `${actionTitle} Lounge`,
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to {action} <strong>{loungeName}</strong>?
                </Text>
            ),
            labels: { confirm: actionTitle, cancel: 'Cancel' },
            confirmProps: { color: isActive ? 'red' : 'green' },
            onConfirm: () => {
                deactivateLounge.mutate(loungeId);
            },
        });
    }

    return (
        <DashboardShell allowedRoles={["super_admin"]}>
            <Container size="xl" py="xl">
                <Stack gap="lg">
                    {/* Header */}
                    <Group justify="space-between">
                        <div>
                            <Title order={2} mb="xs">Lounges</Title>
                            <Text c="dimmed" size="sm">
                                Manage all lounges and their managers
                            </Text>
                        </div>
                        <Button 
                            leftSection={<IconPlus size={18} />}
                            onClick={() => setOpenAddLoungeModal(true)}
                        >
                            Add Lounge
                        </Button>
                    </Group>

                    {/* Lounges Table */}
                    <Paper shadow="sm" p="md" radius="md" withBorder pos="relative">
                        <LoadingOverlay visible={isLoading} />
                        
                        {!isLoading && lounges && lounges.length === 0 ? (
                            <Stack align="center" py="xl">
                                <IconBuildingStore size={48} stroke={1.5} color="gray" />
                                <Text c="dimmed">No lounges found</Text>
                                <Button 
                                    variant="light" 
                                    leftSection={<IconPlus size={16} />}
                                    onClick={() => setOpenAddLoungeModal(true)}
                                >
                                    Add Your First Lounge
                                </Button>
                            </Stack>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Lounge Name</Table.Th>
                                        <Table.Th>Manager</Table.Th>
                                        <Table.Th>Email</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {lounges?.map(lounge => (
                                        <Table.Tr key={lounge.id}>
                                            <Table.Td>
                                                <Text fw={500} tt="capitalize">{lounge.name}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                {lounge.manager ? (
                                                    <Text size="sm" fw={500}>
                                                        {lounge.manager.first_name} {lounge.manager.last_name}
                                                    </Text>
                                                ) : (
                                                    <Text size="sm" c="dimmed">Unassigned</Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                {lounge.manager ? (
                                                    <Text size="sm" c="dimmed">
                                                        {managers?.find(m => m.id === lounge.manager?.id)?.email || "N/A"}
                                                    </Text>
                                                ) : (
                                                    <Text size="sm" c="dimmed">—</Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge 
                                                    color={lounge.is_active ? "green" : "red"}
                                                    variant="light"
                                                >
                                                    {lounge.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs" justify="flex-end">
                                                    <Tooltip label={lounge.manager ? "Reassign Manager" : "Assign Manager"}>
                                                        <ActionIcon 
                                                            variant="light" 
                                                            color="blue"
                                                            onClick={() => {
                                                                setOpened(true)
                                                                setLoungeId(lounge.id)
                                                                setSelectedLoungeName(lounge.name)
                                                            }}
                                                        >
                                                            <IconUserPlus size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    
                                                    <Tooltip label={lounge.is_active ? "Deactivate" : "Activate"}>
                                                        <ActionIcon 
                                                            variant="light"
                                                            color={lounge.is_active ? "red" : "green"}
                                                            onClick={() => {
                                                                setLoungeId(lounge.id)
                                                                handleDeactivate(lounge.name, lounge.is_active)
                                                            }}
                                                        >
                                                            {lounge.is_active ? (
                                                                <IconBan size={18} />
                                                            ) : (
                                                                <IconCircleCheck size={18} />
                                                            )}
                                                        </ActionIcon>
                                                    </Tooltip>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Stack>
            </Container>

            {/* Assign Manager Modal */}
            <Modal 
                centered 
                opened={opened} 
                onClose={() => setOpened(false)} 
                title="Assign Manager"
                size="md"
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        Select an existing manager to assign to this lounge
                    </Text>
                    
                    <ScrollArea h={250}>
                        <Stack gap="xs">
                            {managers && managers.length > 0 ? (
                                managers.map((manager) => (
                                    <Button
                                        key={manager.id}
                                        variant="light"
                                        justify="space-between"
                                        rightSection={<IconCheck size={16} />}
                                        onClick={() => {
                                            handleAssignManager(
                                                manager.id, 
                                                `${manager.first_name} ${manager.last_name}`,
                                                manager.email
                                            );
                                        }}
                                        styles={{
                                            root: { height: "auto", padding: "12px 16px" },
                                            inner: { width: "100%" },
                                        }}
                                    >
                                        <Stack gap={2} align="flex-start">
                                            <Text size="sm" fw={600}>
                                                {manager.first_name} {manager.last_name}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {manager.email}
                                            </Text>
                                        </Stack>
                                    </Button>
                                ))
                            ) : (
                                <Text ta="center" c="dimmed" py="xl">
                                    No managers available
                                </Text>
                            )}
                        </Stack>
                    </ScrollArea>

                    <Divider label="or" labelPosition="center" />

                    <Button
                        variant="light"
                        leftSection={<IconPlus size={16} />}
                        onClick={() => {
                            setOpened(false);
                            setTimeout(() => setDrawerOpened(true), 200);
                        }}
                    >
                        Create New Manager
                    </Button>
                </Stack>
            </Modal>

            {/* Add Lounge Modal */}
            <Modal 
                centered 
                opened={openAddLoungeModal} 
                onClose={() => {
                    setOpenAddLoungeModal(false)
                    setNewLoungeName("")
                }} 
                title="Add New Lounge"
            >
                <Stack gap="md">
                    <TextInput
                        label="Lounge Name"
                        placeholder="Enter lounge name"
                        value={newLoungeName}
                        onChange={(e) => setNewLoungeName(e.currentTarget.value)}
                        required
                    />
                    <Group justify="flex-end">
                        <Button 
                            variant="default"
                            onClick={() => {
                                setOpenAddLoungeModal(false)
                                setNewLoungeName("")
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAddLounge}
                            disabled={!newLoungeName.trim()}
                            loading={createLounge.isPending}
                        >
                            Add Lounge
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Create Manager Drawer */}
            <CreateManagerDrawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                loungeId={loungeId}
            />
        </DashboardShell>
    )
}
