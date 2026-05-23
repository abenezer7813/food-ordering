"use client";
import { useState } from "react";
import {
  Box,
  Container,
  Stack,
  Title,
  Text,
  TextInput,
  Button,
  Group,
  Anchor,
} from "@mantine/core";
import { IconArrowLeft, IconMail } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useForgotPassword } from "@/hooks/queries/useAuth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        },
      }
    );
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
            <Title order={2}>Forgot password?</Title>
            <Text size="sm" c="dimmed">
              Enter your email and we'll send you an OTP to reset your password.
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Email address"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftSection={<IconMail size={16} />}
                size="md"
                required
              />

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={forgotPasswordMutation.isPending}
              >
                Send OTP
              </Button>
            </Stack>
          </form>
        </Stack>
      </Container>
    </Box>
  );
}