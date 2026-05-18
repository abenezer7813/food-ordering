"use client";
import { useState, Suspense } from "react";
import {
  Box,
  Container,
  Stack,
  Title,
  Text,
  Button,
  Group,
  Anchor,
  PinInput,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyAdminOtp } from "@/hooks/queries/useAuth";

function AdminOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");

  const verifyOtpMutation = useVerifyAdminOtp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    verifyOtpMutation.mutate({ email, otp });
  };

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
          <Anchor
            component="button"
            onClick={() => router.push("/auth/login")}
            c="dimmed"
          >
            <Group gap="xs">
              <IconArrowLeft size={16} />
              <Text size="sm">Back to login</Text>
            </Group>
          </Anchor>

          <Stack gap="xs">
            <Title order={2}>Admin Verification</Title>
            <Text size="sm" c="dimmed">
              Enter the OTP sent to <strong>{email}</strong> to complete your
              login.
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

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={verifyOtpMutation.isPending}
                disabled={otp.length < 6}
              >
                Verify & Login
              </Button>
            </Stack>
          </form>
        </Stack>
      </Container>
    </Box>
  );
}

export default function AdminOtpPage() {
  return (
    <Suspense>
      <AdminOtpForm />
    </Suspense>
  );
}