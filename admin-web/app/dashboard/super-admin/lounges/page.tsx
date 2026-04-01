'use client'

import { DashboardShell } from "@/components/layout/DashboardShell"
import { useAssignManager, useCreateLounge, useDeactivateLounge, useLoungesAdmin } from "@/hooks/queries/useLounges"
import { useManagers } from "@/hooks/queries/useStaff";
import { Table, Button, Modal, TextInput, Select, Tooltip, List, ScrollArea, Stack, Text, Group } from "@mantine/core";
import { IconBan, IconCheck, IconChevronLeft, IconChevronRight, IconCircleCheck, IconPlus, IconToggleLeft, IconUserOff } from "@tabler/icons-react";

import { use, useState } from "react";
export default function DashboardLounges() {
    const { data: lounges, refetch } = useLoungesAdmin()
    const createLounge = useCreateLounge();
    const assignManager = useAssignManager();
    const deactivateLounge = useDeactivateLounge();
    const [opened, setOpened] = useState(false)
    const [openAddLoungeModal, setOpenAddoungeModal] = useState(false)
    const [selectManager, setSelectManager] = useState("")
    const [newLoungeName, setNewLoungeName] = useState("")
    const [loungeId, setLoungeId] = useState('')
    const { data: managers } = useManagers()

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


    return (<DashboardShell>
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

        <Modal centered opened={opened} onClose={() => setOpened(false)} title='assign manager' >
            <ScrollArea >
                <Stack justify='right'>
                    {managers && managers.length > 0 ? (
                        managers.map((manager) => (
                            <Button
                                key={manager.id}
                                variant="outline"
                                onClick={() => {
                                    handleAssignManager(manager.id);
                                    setOpened(false);
                                }}
                            >
                                {manager.first_name + " " + manager.last_name}
                            </Button>
                        ))
                    ) : (
                        <Text>No managers available.</Text>
                    )}
                </Stack>
            </ScrollArea>

            {/* Add new manager */}
            <Group justify='stretch' my={10}>
                <TextInput
                    w='100%'
                    placeholder="Manger Name"
                    value={newLoungeName}
                    onChange={(e) => setNewLoungeName(e.currentTarget.value)}
                />
            </Group>
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