"use client";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useOrders } from "@/hooks/queries/useOrders";
import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Paper,
  Group,
  Button,
  ThemeIcon,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconShoppingCart,
  IconClock,
  IconCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

function StatBox({
  label,
  value,
  icon,
  color,
  isLoading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
}) {
  return (
    <Paper withBorder p="lg" radius="md">
      <Group>
        <ThemeIcon size="xl" radius="md" color={color} variant="light">
          {icon}
        </ThemeIcon>
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          {isLoading ? (
            <Loader size="sm" mt={4} />
          ) : (
            <Text size="xl" fw={700}>
              {value}
            </Text>
          )}
        </div>
      </Group>
    </Paper>
  );
}

export default function CookDashboard() {
  const router = useRouter();
  const { data: orders, isLoading } = useOrders();

  const pending = orders?.filter((o) => o.status === "confirmed").length || 0;
  const preparing = orders?.filter((o) => o.status === "preparing").length || 0;
  const ready = orders?.filter((o) => o.status === "ready").length || 0;

  return (
    <DashboardShell allowedRoles={["cook"]}>
      <Container size="xl">
        <Stack gap="xl">
          <Group justify="space-between">
            <div>
              <Title order={2}>Kitchen Dashboard</Title>
              <Text c="dimmed" size="sm">
                Track and update order statuses
              </Text>
            </div>
            <Button
              rightSection={<IconArrowRight size={16} />}
              onClick={() => router.push("/dashboard/cook/orders")}
            >
              View All Orders
            </Button>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <StatBox
              label="Confirmed"
              value={pending}
              icon={<IconShoppingCart size={22} />}
              color="yellow"
              isLoading={isLoading}
            />
            <StatBox
              label="Preparing"
              value={preparing}
              icon={<IconClock size={22} />}
              color="orange"
              isLoading={isLoading}
            />
            <StatBox
              label="Ready"
              value={ready}
              icon={<IconCheck size={22} />}
              color="teal"
              isLoading={isLoading}
            />
          </SimpleGrid>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
