import { Card, Group, Text, Badge, Button, Stack } from "@mantine/core";
import { Order } from "@/lib/api";

interface OrderCardProps {
  order: Order;
  onAction?: (orderId: string, action: string) => void;
  actionLoading?: boolean;
  showActions?: boolean;
}

export function OrderCard({
  order,
  onAction,
  actionLoading,
  showActions = true,
}: OrderCardProps) {
  const statusColor = {
    pending: "yellow",
    preparing: "blue",
    ready: "green",
    collected: "gray",
    confirmed: "indigo",
  } as const;

  const orderTypeColor = order.order_type === "online" ? "violet" : "gray";

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Group justify="space-between" wrap="nowrap">
        <Stack gap="xs" style={{ flex: 1 }}>
          <Group gap="xs">
            <Text size="sm" c="dimmed" ff="monospace">
              #{order.id.slice(0, 8)}
            </Text>
            <Badge color={statusColor[order.status] ?? "gray"} size="sm">
              {order.status}
            </Badge>
            <Badge color={orderTypeColor} size="sm">
              {order.order_type}
            </Badge>
          </Group>

          <Group gap="md">
            <Text size="sm">
              Total:{" "}
              <Text component="span" fw={600}>
                {order.total_amount} ETB
              </Text>
            </Text>
            {order.estimated_ready_time && (
              <Text size="sm" c="dimmed">
                Est. ready: {order.estimated_ready_time} min
              </Text>
            )}
          </Group>
        </Stack>

        {showActions && (
          <Group gap="xs">
            {order.status === "ready" && onAction && (
              <Button
                size="sm"
                color="teal"
                onClick={() => onAction(order.id, "mark-collected")}
                loading={actionLoading}
              >
                Mark Collected
              </Button>
            )}
          </Group>
        )}
      </Group>
    </Card>
  );
}