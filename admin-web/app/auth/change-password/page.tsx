"use client";
import { useState } from "react";
import {
  Box,
  Container,
  Stack,
  Title,
  Text,
  PasswordInput,
  Button,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconLock } from "@tabler/icons-react";
import { useFirstTimeChangePassword } from "@/hooks/queries/useAuth";

export default function ChangePasswordPage() {
  const { mutate, isPending } = useFirstTimeChangePassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (newPassword !== confirm) {
      return setError("Passwords do not match.");
    }

    mutate({ new_password: newPassword });
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "#f8f9fa",
      }}
    >
      <Container size="xs" style={{ width: "100%" }}>
        <Stack gap="lg">
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconLock size={24} color="white" />
          </Box>

          <Stack gap="xs">
            <Title order={2}>Set Your New Password</Title>
            <Text size="sm" c="dimmed">
              This is your first login. Please set a new password to continue.
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <PasswordInput
                label="New Password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                size="md"
                required
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                size="md"
                required
              />

              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red"
                  variant="light"
                >
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={isPending}
              >
                Set Password & Continue
              </Button>
            </Stack>
          </form>
        </Stack>
      </Container>
    </Box>
  );
}