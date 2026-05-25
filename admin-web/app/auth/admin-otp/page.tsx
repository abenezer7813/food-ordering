"use client";
import { useState, Suspense, useEffect, useRef } from "react";
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
import { useVerifyAdminOtp, useResendAdminOtp } from "@/hooks/queries/useAuth";

const RESEND_COOLDOWN = 5 * 60; // 5 minutes in seconds

function AdminOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const verifyOtpMutation = useVerifyAdminOtp();
  const resendOtpMutation = useResendAdminOtp();

  // Start countdown on mount
  useEffect(() => {
    startCountdown();
    return () => clearTimer();
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startCountdown() {
    clearTimer();
    setCountdown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const handleResend = () => {
    resendOtpMutation.mutate({ email }, {
      onSuccess: () => {
        setOtp("");
        startCountdown();
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    verifyOtpMutation.mutate({ email, otp });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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

              <Group justify="center" gap="xs">
                <Text size="sm" c="dimmed">
                  Didn&apos;t receive the code?
                </Text>
                {countdown > 0 ? (
                  <Text size="sm" c="dimmed">
                    Resend in{" "}
                    <Text span fw={600} c="blue">
                      {formatTime(countdown)}
                    </Text>
                  </Text>
                ) : (
                  <Anchor
                    component="button"
                    size="sm"
                    onClick={handleResend}
                    disabled={resendOtpMutation.isPending}
                  >
                    {resendOtpMutation.isPending ? "Sending..." : "Resend OTP"}
                  </Anchor>
                )}
              </Group>
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
