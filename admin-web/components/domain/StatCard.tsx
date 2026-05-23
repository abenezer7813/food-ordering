import { Card, Text, Group, Stack } from "@mantine/core";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "violet" | "blue" | "teal" | "orange" | "red" | "yellow";
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = "blue",
  isLoading = false,
}: StatCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={600} c="dimmed">
          {title}
        </Text>
        {icon && <div style={{ opacity: 0.6 }}>{icon}</div>}
      </Group>

      {isLoading ? (
        <div style={{ height: 32 }}>
          <div
            style={{
              width: 80,
              height: 24,
              background: "var(--mantine-color-default-hover)",
              borderRadius: 4,
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </div>
      ) : (
        <Stack gap={4}>
          <Text size="xl" fw={700} c={color}>
            {value}
          </Text>
          {trend && (
            <Text size="xs" c={trend.isPositive ? "teal" : "red"}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </Text>
          )}
        </Stack>
      )}
    </Card>
  );
}
