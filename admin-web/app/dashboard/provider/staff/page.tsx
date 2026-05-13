"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  useStaff,
  useCreateStaff,
  useDeactivateStaff,
} from "@/hooks/queries/useStaff";
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
  TextInput,
  PasswordInput,
  ScrollArea,
  Loader,
  Center,
  Tabs,
  ActionIcon,
  Tooltip,
  Select,
  Drawer,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPlus, IconUserOff, IconUsers } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { Staff, staffApi } from "@/lib/api";
import { queryClient } from "@/lib/query-client";

type StaffRole = "cashier" | "cook";

function CreateStaffDrawer({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
const createStaff = useCreateStaff();

  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "cashier" as StaffRole,
    },
    validate: {
      first_name: (v) => (v.trim() ? null : "First name is required"),
      last_name: (v) => (v.trim() ? null : "Last name is required"),
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Invalid email"),
      password: (v) =>
        v.length >= 6 ? null : "Password must be at least 6 characters",
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    const payload = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      password: values.password,
      role:values.role
    };


    createStaff.mutate(payload, {
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: `${values.role === "cashier" ? "Cashier" : "Cook"} created successfully`,
          color: "green",
        });
        form.reset();
        onClose();
       
      },
      onError: (err: any) =>
        notifications.show({
          title: "Error",
          message: err.message || "Failed to create staff",
          color: "red",
        }),
    });
  });

  const isLoading = createStaff.isPending;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      padding="lg"
      title={
        <Stack gap={2}>
          <Title order={4}>Add Staff Member</Title>
          <Text size="xs" c="dimmed">
            Create a new cashier or cook for your lounge
          </Text>
        </Stack>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Divider label="Role" labelPosition="left" />
          <Select
            label="Role"
            data={[
              { value: "cashier", label: "Cashier" },
              { value: "cook", label: "Cook" },
            ]}
            {...form.getInputProps("role")}
          />

          <Divider label="Personal Info" labelPosition="left" />
          <Group grow>
            <TextInput
              label="First Name"
              placeholder="Abebe"
              required
              {...form.getInputProps("first_name")}
            />
            <TextInput
              label="Last Name"
              placeholder="Kebede"
              required
              {...form.getInputProps("last_name")}
            />
          </Group>

          <Divider label="Account Info" labelPosition="left" />
          <TextInput
            label="Email"
            placeholder="abebe@example.com"
            required
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Default Password"
            placeholder="Min. 6 characters"
            required
            {...form.getInputProps("password")}
          />

          <Button type="submit" fullWidth mt="sm" loading={isLoading}>
            Create Staff
          </Button>
          <Button
            variant="subtle"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}

export default function ManagerStaffPage() {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const { data: staff, isLoading ,refetch} = useStaff();
  const deactivateMutation = useDeactivateStaff();

  const cashiers = staff?.filter((s) => s.role === "cashier") || [];
  const cooks = staff?.filter((s) => s.role === "cook") || [];

  const handleDeactivate = (staffId: string, name: string) => {
    deactivateMutation.mutate(staffId, {
      onSuccess: () =>
        notifications.show({
          title: "Deactivated",
          message: `${name} has been deactivated`,
          color: "orange",
        }),
      onError: (err: any) =>
        notifications.show({
          title: "Error",
          message: err.message || "Failed to deactivate staff",
          color: "red",
        }),
    });
  };

  const renderTable = (data: Staff[]) => (
    <ScrollArea>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
         
          {data.length === 0 ? (
            
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text ta="center" c="dimmed" py="xl">
                  No staff found
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            data.map((member) => (
              <Table.Tr key={member.id}>
                <Table.Td>
                  <Text fw={500}>
                    {member.first_name} {member.last_name}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {member.email}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={member.is_active ? "teal" : "gray"}
                    variant="light"
                  >
                    {member.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {member.is_active && (
                    <Tooltip label="Deactivate">
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        loading={deactivateMutation.isPending}
                        onClick={() =>
                          handleDeactivate(
                            member.id,
                            `${member.first_name} ${member.last_name}`
                          )
                        }
                      >
                        <IconUserOff size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );

  return (
    <DashboardShell allowedRoles={["lounge_manager"]}>
      <Container size="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <div>
              <Title order={2}>Staff Management</Title>
              <Text c="dimmed" size="sm">
                Manage cashiers and cooks in your lounge
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setDrawerOpened(true)}
            >
              Add Staff
            </Button>
          </Group>

          <Paper shadow="sm" radius="md" withBorder>
            {isLoading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : (
              <Tabs defaultValue="cashiers">
                <Tabs.List px="md" pt="xs">
                  <Tabs.Tab value="cashiers" leftSection={<IconUsers size={16} />}>
                    Cashiers ({cashiers.length})
                  </Tabs.Tab>
                  <Tabs.Tab value="cooks" leftSection={<IconUsers size={16} />}>
                    Cooks ({cooks.length})
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="cashiers" p="md">
                  {renderTable(cashiers)}
                </Tabs.Panel>

                <Tabs.Panel value="cooks" p="md">
                  {renderTable(cooks)}
                </Tabs.Panel>
              </Tabs>
            )}
          </Paper>
        </Stack>
      </Container>

      <CreateStaffDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
      />
    </DashboardShell>
  );
}
