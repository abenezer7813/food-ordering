'use client'

import { DashboardShell } from "@/components/layout/DashboardShell"
import { useAssignManager, useCreateLounge, useDeactivateLounge, useLoungesAdmin } from "@/hooks/queries/useLounges"
import { Table, Button, Modal, TextInput, Select, Tooltip, List, ScrollArea, Stack, Text, Group } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import { use, useState } from "react";
export default function DashboardLounges() {
    const { data: lounges, refetch } = useLoungesAdmin()
    const createLounge = useCreateLounge();
    const deactivateLounge = useDeactivateLounge();
    const [opened, setOpened] = useState(false)
    const [openAddLoungeModal, setOpenAddoungeModal] = useState(false)
    const [selectManager, setSelectManager] = useState("")
    const [newLoungeName, setNewLoungeName] = useState("")
    const [loungeId, setLoungeId] = useState('')
    const [managers, setManagers] = useState([{ name: "kebede", id: '1234' }])

    const handleAddLounge = async () => {
        createLounge.mutate(newLoungeName)
        setOpenAddoungeModal(false)
        refetch();
    }
    const handleAssignManager = async (loungeId: string) => {
        //useAssignManager().mutate(loungeId,)

    }
    const handleDeactivate = async () => {
        deactivateLounge.mutate(loungeId)

    }


    return (<DashboardShell>
        <Group justify="right">
            <Button onClick={() => setOpenAddoungeModal(true)}>Add Lounge</Button>
        </Group>
        <Table striped highlightOnHover >
            <Table.Thead>
                <Table.Tr>
                    <Table.Td>Name</Table.Td>
                    <Table.Td>Manager</Table.Td>
                    <Table.Td>Actions</Table.Td>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {lounges?.map(lounge => (
                    <Table.Tr key={lounge.id}>
                        <Table.Td>{lounge.name}</Table.Td>
                        <Table.Td>{lounge.manager?.name || "Unassigned"}</Table.Td>
                        <Table.Td>
                            <Tooltip label="assign Manager">
                                <Button onClick={() => setOpened(true)} leftSection={<IconPlus size={18} />} size='compact-sm' variant='transparent' ></Button>

                            </Tooltip>
                            {<Button color="red" onClick={() => handleDelete(lounge.id)}>Delete</Button>}
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
        <Modal centered opened={opened} onClose={() => setOpened(false)} title='assign manager' >
            <ScrollArea style={{ height: 300 }}>
                <Stack >
                    {managers.length > 0 ? (
                        managers.map((manager) => (
                            <Button
                                key={manager.id}
                                variant="outline"
                                onClick={() => {
                                    //  handleAssignManager(loungeId, manager.id);
                                    setOpened(false); // close modal after assign
                                }}
                            >
                                {manager.name}
                            </Button>
                        ))
                    ) : (
                        <Text>No managers available.</Text>
                    )}
                </Stack>
            </ScrollArea>

            {/* Add new manager */}
            <Group justify="right" >
                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => "handleAddManager(loungeId)"}
                >
                    Add New Manager
                </Button>
            </Group>
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
    </DashboardShell>)
}