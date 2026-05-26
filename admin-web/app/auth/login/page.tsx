"use client";
import { useState, useEffect } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Stack,
  Alert,
  ActionIcon,
  useMantineColorScheme,
  Box,
  Anchor,
} from "@mantine/core";
import {
  IconSun,
  IconMoon,
  IconBolt,
  IconArrowRight,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useLogin } from "@/hooks/queries/useAuth";
import { useRouter } from "next/navigation";



export default function LoginPage() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const router = useRouter();
  const loginMutation = useLogin();

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Min 6 characters";
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });

    if (!emailError && !passwordError) {
      loginMutation.mutate({ email, password });
    }
  };



  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--mantine-color-body)",
      }}
    >
      {/* Left Panel */}
      <Box
        style={{
          width: 420,
          flexShrink: 0,
          background: "#0f1117",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        visibleFrom="lg"
      >
        <Group gap="sm">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconBolt size={16} color="white" />
          </Box>
          <Text fw={600} c="white">
            UniLounge
          </Text>
        </Group>

        <Stack gap="xl">
          <Stack gap="xs">
            <Text size="xl" fw={700} c="white" lh={1.3}>
              Manage your university
              <br />
              lounge operations
            </Text>
            <Text size="sm" c="dimmed" lh={1.6}>
              A modern admin dashboard for orders, menus, staff, and real-time
              analytics — all in one place.
            </Text>
          </Stack>

          <Stack gap="sm">
            {[
              "Real-time order tracking",
              "Role-based access control",
              "Sales analytics & reports",
              "Multi-lounge management",
            ].map((feature) => (
              <Group key={feature} gap="sm">
                <Box
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "rgba(99,102,241,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#818cf8",
                    }}
                  />
                </Box>
                <Text size="xs" c="gray.3">
                  {feature}
                </Text>
              </Group>
            ))}
          </Stack>
        </Stack>

        <Text size="xs" c="gray.7">
          © 2026 UniLounge. All rights reserved.
        </Text>
      </Box>

      {/* Right Panel */}
      <Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        <Group justify="space-between" p="md">
          <Group gap="xs" hiddenFrom="lg">
            <Box
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconBolt size={14} color="white" />
            </Box>
            <Text fw={600} size="sm">
              UniLounge
            </Text>
          </Group>

          <ActionIcon
            variant="default"
            onClick={() => toggleColorScheme()}
            ml="auto"
          >
            {colorScheme === "dark" ? (
              <IconSun size={18} />
            ) : (
              <IconMoon size={18} />
            )}
          </ActionIcon>
        </Group>

        {/* Form */}
        <Container
          size="xs"
          style={{ flex: 1, display: "flex", alignItems: "center" }}
        >
          <Box style={{ width: "100%" }}>
            <Stack gap="lg" mb="xl">
              <Title order={2}>Welcome back</Title>
              <Text size="sm" c="dimmed">
                Sign in to your admin account
              </Text>
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="Email address"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  size="md"
                />

                <PasswordInput
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  size="md"
                />

                <Group justify="flex-end">
                  <Anchor
                    size="sm"
                    component="button"
                    type="button"
                    onClick={() => router.push("/auth/forgot-password")}
                  >
                    Forgot password?
                  </Anchor>
                </Group>

                {loginMutation.isError && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    color="red"
                    variant="light"
                  >
                    {loginMutation.error?.message || "Login failed"}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  loading={loginMutation.isPending}
                  rightSection={<IconArrowRight size={16} />}
                >
                  Sign in
                </Button>
              </Stack>
            </form>


          </Box>
        </Container>
      </Box>
    </Box>
  );
}