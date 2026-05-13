"use client";

import { useAddNewManger } from "@/hooks/queries/useLounges";
import { useAssignManager } from "@/hooks/queries/useLounges";
import {
  Drawer,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

interface CreateManagerDrawerProps {
  opened: boolean;
  onClose: () => void;
  loungeId: string;
}

export function CreateManagerDrawer({
  opened,
  onClose,
  loungeId,
}: CreateManagerDrawerProps) {
  const addNewManager = useAddNewManger();
  const assignManager = useAssignManager();

  const form = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
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
    addNewManager.mutate(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (data: any) => {
          // After creating, assign to lounge
          const managerId = data?.manager?.id;
          if (managerId && loungeId) {
            assignManager.mutate(
              { loungeId, managerId },
              {
                onSuccess: () => {
                  notifications.show({
                    title: "Success",
                    message: "Manager created and assigned to lounge",
                    color: "green",
                  });
                  form.reset();
                  onClose();
                },
                onError: (err: any) => {
                  // Manager created but assign failed
                  notifications.show({
                    title: "Partially done",
                    message:
                      "Manager created but could not be assigned. Assign manually.",
                    color: "orange",
                  });
                  form.reset();
                  onClose();
                },
              }
            );
          } else {
            // No manager id returned, just close
            notifications.show({
              title: "Success",
              message: "Manager created. Assign them manually from the list.",
              color: "teal",
            });
            form.reset();
            onClose();
          }
        },
        onError: (err: any) => {
          notifications.show({
            title: "Error",
            message: err.message || "Failed to create manager",
            color: "red",
          });
        },
      }
    );
  });

  const isLoading = addNewManager.isPending || assignManager.isPending;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Stack gap={2}>
          <Title order={4}>Create New Manager</Title>
          <Text size="xs" c="dimmed">
            Manager will be assigned to the selected lounge
          </Text>
        </Stack>
      }
      position="right"
      size="md"
      padding="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Divider label="Personal Info" labelPosition="left" />

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
            Create & Assign Manager
          </Button>
          <Button variant="subtle" fullWidth onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}
