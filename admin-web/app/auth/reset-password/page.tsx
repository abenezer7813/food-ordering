"use client";
import { useState, Suspense } from "react";
import {
  Box,
  Container,
  Stack,
  Title,
  Text,
  PasswordInput,
  Button,
  Group,
  Anchor,
  PinInput,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPassword } from "@/hooks/queries/useAuth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const resetPasswordMutation = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (otp.length < 6) {
      setValidationError("Please enter the 6-digit OTP");
      return;
    }
    if (newPassword.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    resetPasswordMutation.mutate({ email, otp, new_password: newPassword });
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "var(--mantine-color-body)",
      }}
    >
      <Container size="xs" style={{ width: "100%" }}>
        <Stack gap="lg">
          <Anchor
            component="button"
            onClick={() => router.push("/auth/forgot-password")}
            c="dimmed"
          >
            <Group gap="xs">
              <IconArrowLeft size={16} />
              <Text size="sm">Back</Text>
            </Group>
          </Anchor>

          <Stack gap="xs">
            <Title order={2}>Reset password</Title>
            <Text size="sm" c="dimmed">
              Enter the OTP sent to <strong>{email}</strong> and your new
              password.
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  OTP Code
                </Text>
                <PinInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  type="number"
                  size="md"
                />
              </Stack>

              <PasswordInput
                label="New Password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                size="md"
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size="md"
                error={validationError}
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={resetPasswordMutation.isPending}
              >
                Reset Password
              </Button>
            </Stack>
          </form>
        </Stack>
      </Container>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}