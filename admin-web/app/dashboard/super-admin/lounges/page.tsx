'use client'

import { DashboardShell } from "@/components/layout/DashboardShell"
import { useAssignManager, useAddNewManger, useCreateLounge, useDeactivateLounge, useLoungesAdmin } from "@/hooks/queries/useLounges"
import { useManagers } from "@/hooks/queries/useStaff";
import { Table, Button, Modal, TextInput, Select, Tooltip, List, ScrollArea, Stack, Text, Group, Divider } from "@mantine/core";
import { IconBan, IconCheck, IconChevronLeft, IconChevronRight, IconCircleCheck, IconPlus, IconToggleLeft, IconUserOff } from "@tabler/icons-react";
import { CreateManagerDrawer } from "@/components/domain/CreateManagerDrawer";
import { use, useState } from "react";
export default function DashboardLounges() {
    const { data: lounges, refetch } = useLoungesAdmin()
    const createLounge = useCreateLounge();
    const addNewMager = useAddNewManger();
    const assignManager = useAssignManager();
    const deactivateLounge = useDeactivateLounge();
    const [opened, setOpened] = useState(false)
    const [openAddLoungeModal, setOpenAddoungeModal] = useState(false)
    const [selectManager, setSelectManager] = useState("")
    const [newLoungeName, setNewLoungeName] = useState("")
    const [loungeId, setLoungeId] = useState('')
    const { data: managers } = useManagers()
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [drawerOpened, setDrawerOpened] = useState(false);

    const handleAddLounge = async () => {
        createLounge.mutate(newLoungeName)
        setOpenAddoungeModal(false)
        refetch();
    }
    const handleAssignManager = async (managerId: string) => {
        assignManager.mutate({ loungeId, managerId });

    }

    const handleDeactivate = async () => {
        deactivateLounge.mutate(loungeId)

    }


    return (
    <DashboardShell>
       console.log("managers:", managers)
        <Group justify="right">
            <Button onClick={() => setOpenAddoungeModal(true)}>Add Lounge</Button>
        </Group>
        <Table striped highlightOnHover >
            <Table.Thead>
                <Table.Tr>
                    <Table.Td>Name</Table.Td>
                    <Table.Td>Manager</Table.Td>
                    <Table.Td>Status</Table.Td>
                    <Table.Td>Actions</Table.Td>
                    <Table.Td></Table.Td>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {lounges?.map(lounge => (
                    <Table.Tr key={lounge.id}>
                        <Table.Td>{lounge.name}</Table.Td>
                        <Table.Td>{lounge.manager?.first_name + " " + lounge.manager?.last_name || "Unassigned"}</Table.Td>
                        <Table.Td>{lounge.is_active ? <Text c='green'>Active</Text> : <Text c='red'> Inactive</Text>}</Table.Td>
                        <Table.Td>
                            <Tooltip label={lounge.manager?.first_name ? "reassign manager" : "assign Manager"}>
                                <Button onClick={() => {
                                    setOpened(true)
                                    setLoungeId(lounge.id)
                                }} leftSection={<IconPlus size={18} />} size='compact-sm' variant='transparent' ></Button>

                            </Tooltip>
                            <Tooltip bg='grayS' label={lounge.is_active ? "deactivate" : "activate"}>
                                <Button onClick={() => {
                                    setLoungeId(lounge.id)
                                    handleDeactivate()
                                }} leftSection={lounge.is_active ? <IconBan color="red" size={16} /> : <IconCircleCheck color='green' size={16} />} size='compact-sm' variant='transparent' ></Button>

                            </Tooltip>


                        </Table.Td>
                        <Table.Td>
                            <Tooltip bg='grayS' label="Edit">
                                <Button onClick={() => {
                                    setLoungeId(lounge.id)
                                    handleDeactivate()
                                }} leftSection={<IconChevronRight color='gray' size={30} />} size='compact-sm' variant='transparent' ></Button>

                            </Tooltip>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>

        <Modal centered opened={opened} onClose={() => setOpened(false)} title='Assign Manager'>
  <Stack gap="md">
    <Text size="sm" c="dimmed">Select an existing manager to assign to this lounge</Text>
    
    <ScrollArea h={250}>
      <Stack gap="xs">
        {managers && managers.length > 0 ? (
          managers.map((manager) => (
            <Button
              key={manager.id}
              variant="outline"
              justify="space-between"
              rightSection={<IconCheck size={16} />}
              onClick={() => {
                handleAssignManager(manager.id);
                setOpened(false);
              }}
              styles={{
                root: { height: "auto", padding: "10px 14px" },
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
          <Text ta="center" c="dimmed" py="xl">No managers available</Text>
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


        {/* modal for adding lounge  */}
        <Modal centered opened={openAddLoungeModal} onClose={() => setOpenAddoungeModal(false)} title="Add Lounge">
            <TextInput
                placeholder="Lounge Name"
                value={newLoungeName}
                onChange={(e) => setNewLoungeName(e.currentTarget.value)}
            />
            <Group justify="right"><Button mt="md" onClick={handleAddLounge}>Add</Button></Group>
        </Modal>
        <CreateManagerDrawer
            opened={drawerOpened}
            onClose={() => setDrawerOpened(false)}
            loungeId={loungeId}
        />
    </DashboardShell>)

}