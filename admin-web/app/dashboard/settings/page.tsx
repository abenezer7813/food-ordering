"use client";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  Divider,
  PasswordInput,
  Avatar,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconUser, IconMail, IconLock, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { useAuthStore } from "@/lib/auth-store";
import { useState } from "react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form
  const profileForm = useForm({
    initialValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    },
    validate: {
      first_name: (value) => (!value ? "First name is required" : null),
      last_name: (value) => (!value ? "Last name is required" : null),
    },
  });

  // Password form
  const passwordForm = useForm({
    initialValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    validate: {
      current_password: (value) => (!value ? "Current password is required" : null),
      new_password: (value) =>
        !value
          ? "New password is required"
          : value.length < 6
          ? "Password must be at least 6 characters"
          : null,
      confirm_password: (value, values) =>
        value !== values.new_password ? "Passwords do not match" : null,
    },
  });

  const handleProfileUpdate = async (values: typeof profileForm.values) => {
    setIsUpdatingProfile(true);
    try {
      console.log("Updating profile with values:", values);
      const response = await api.patch<{ success: boolean; message: string; user: any }>("/auth/profile", values);
      console.log("Profile update response:", response);
      
      // Update the user in the auth store and localStorage
      if (response.user) {
        // Update localStorage first
        localStorage.setItem("user", JSON.stringify(response.user));
        
        // Update Zustand store - this should trigger re-renders
        useAuthStore.setState({ user: response.user });
        
        // Force update the form with new values
        profileForm.setValues({
          first_name: response.user.first_name,
          last_name: response.user.last_name,
        });
      }
      
      notifications.show({
        title: "Success",
        message: response.message || "Profile updated successfully",
        color: "green",
        icon: <IconCheck size={18} />,
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      console.error("Error response:", error.response);
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || error.response?.data?.message || error.message || "Failed to update profile",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (values: typeof passwordForm.values) => {
    setIsChangingPassword(true);
    try {
      console.log("Changing password...");
      const response = await api.patch<{ success: boolean; message: string }>("/auth/change-password", {
        current_password: values.current_password,
        new_password: values.new_password,
      });
      
      notifications.show({
        title: "Success",
        message: response.message || "Password changed successfully",
        color: "green",
        icon: <IconCheck size={18} />,
      });
      
      passwordForm.reset();
    } catch (error: any) {
      console.error("Password change error:", error);
      console.error("Error response:", error.response);
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || error.response?.data?.message || error.message || "Failed to change password",
        color: "red",
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Title order={2} mb="xs">
            Settings
          </Title>
          <Text c="dimmed" size="sm">
            Manage your account settings and preferences
          </Text>
        </Box>

        {/* Profile Section */}
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Group mb="lg">
            <Avatar color="indigo" radius="xl" size="lg">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </Avatar>
            <Box>
              <Title order={3} size="h4">
                Profile Information
              </Title>
              <Text c="dimmed" size="sm">
                Update your personal details
              </Text>
            </Box>
          </Group>

          <form onSubmit={profileForm.onSubmit(handleProfileUpdate)}>
            <Stack gap="md">
              <Group grow>
                <TextInput
                  label="First Name"
                  placeholder="Enter first name"
                  leftSection={<IconUser size={16} />}
                  {...profileForm.getInputProps("first_name")}
                />
                <TextInput
                  label="Last Name"
                  placeholder="Enter last name"
                  leftSection={<IconUser size={16} />}
                  {...profileForm.getInputProps("last_name")}
                />
              </Group>

              <TextInput
                label="Email"
                value={user?.email || ""}
                leftSection={<IconMail size={16} />}
                disabled
                styles={{
                  input: {
                    cursor: "not-allowed",
                  },
                }}
              />

              <TextInput
                label="Role"
                value={user?.role?.replace("_", " ") || ""}
                leftSection={<IconUser size={16} />}
                disabled
                styles={{
                  input: {
                    cursor: "not-allowed",
                    textTransform: "capitalize",
                  },
                }}
              />

              <Group justify="flex-end">
                <Button
                  type="submit"
                  loading={isUpdatingProfile}
                  leftSection={<IconCheck size={18} />}
                >
                  Update Profile
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>

        {/* Password Section */}
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Box mb="lg">
            <Title order={3} size="h4" mb="xs">
              Change Password
            </Title>
            <Text c="dimmed" size="sm">
              Update your password to keep your account secure
            </Text>
          </Box>

          <form onSubmit={passwordForm.onSubmit(handlePasswordChange)}>
            <Stack gap="md">
              <PasswordInput
                label="Current Password"
                placeholder="Enter current password"
                leftSection={<IconLock size={16} />}
                {...passwordForm.getInputProps("current_password")}
              />

              <Divider />

              <PasswordInput
                label="New Password"
                placeholder="Enter new password"
                leftSection={<IconLock size={16} />}
                {...passwordForm.getInputProps("new_password")}
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                leftSection={<IconLock size={16} />}
                {...passwordForm.getInputProps("confirm_password")}
              />

              <Group justify="flex-end">
                <Button
                  type="submit"
                  loading={isChangingPassword}
                  leftSection={<IconCheck size={16} />}
                  color="indigo"
                >
                  Change Password
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}
