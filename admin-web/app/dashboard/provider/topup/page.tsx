"use client";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useActiveLoungeStore } from "@/lib/active-lounge-store";
import {
  useTopUpRequests,
  useManagerApproveTopUp,
  useRejectTopUp,
} from "@/hooks/queries/useWallet";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Badge,
  Table,
  ScrollArea,
  Loader,
  Center,
  Button,
  Tabs,
  Modal,
  Textarea,
  Anchor,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { TopUpRequest } from "@/lib/api";
import {
  IconWallet,
  IconCheck,
  IconX,
  IconCash,
  IconBuildingBank,
} from "@tabler/icons-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "yellow",
  cashier_approved: "blue",
  manager_approved: "green",
  rejected: "red",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  cashier_approved: "Cashier Approved",
  manager_approved: "Approved",
  rejected: "Rejected",
};

function RequestsTable({
  data,
  loungeId,
  showApprove,
}: {
  data: TopUpRequest[];
  loungeId: string;
  showApprove: boolean;
}) {
  const approveMutation = useManagerApproveTopUp(loungeId);
  const rejectMutation = useRejectTopUp(loungeId);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [rejectOpened, { open: openReject, close: closeReject }] = useDisclosure(false);

  const handleApprove = (requestId: string) => {
    approveMutation.mutate(requestId, {
      onSuccess: () =>
        notifications.show({
          title: "Approved",
          message: "Wallet topped up successfully",
          color: "teal",
        }),
      onError: (err: any) =>
        notifications.show({ title: "Error", message: err.message, color: "red" }),
    });
  };

  const handleRejectOpen = (requestId: string) => {
    setRejectTarget(requestId);
    setReason("");
    openReject();
  };

  const handleRejectConfirm = () => {
    if (!rejectTarget || !reason.trim()) return;
    rejectMutation.mutate(
      { requestId: rejectTarget, reason },
      {
        onSuccess: () => {
          notifications.show({ title: "Rejected", message: "Request rejected", color: "orange" });
          closeReject();
        },
        onError: (err: any) =>
          notifications.show({ title: "Error", message: err.message, color: "red" }),
      }
    );
  };

  if (data.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <IconWallet size={40} color="gray" />
          <Text c="dimmed">No requests found</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <>
      <Modal
        opened={rejectOpened}
        onClose={closeReject}
        title="Reject Top-up Request"
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Please provide a reason for rejection.
          </Text>
          <Textarea
            label="Rejection Reason"
            placeholder="e.g. Receipt not valid"
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            required
            minRows={3}
          />
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeReject}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleRejectConfirm}
              loading={rejectMutation.isPending}
              disabled={!reason.trim()}
            >
              Reject
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Method</Table.Th>
              <Table.Th>Receipt</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Date</Table.Th>
              {showApprove && <Table.Th>Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((req) => (
              <Table.Tr key={req.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {req.customer
                      ? `${req.customer.first_name} ${req.customer.last_name}`
                      : "—"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {req.customer?.email}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={600}>{parseFloat(req.amount).toFixed(2)} ETB</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    size="sm"
                    variant="light"
                    color={req.payment_method === "cash" ? "teal" : "blue"}
                    leftSection={
                      req.payment_method === "cash" ? (
                        <IconCash size={12} />
                      ) : (
                        <IconBuildingBank size={12} />
                      )
                    }
                  >
                    {req.payment_method === "cash" ? "Cash" : "Bank Transfer"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {req.receipt_image_url ? (
                    <Anchor href={req.receipt_image_url} target="_blank" size="xs">
                      View Receipt
                    </Anchor>
                  ) : (
                    <Text size="xs" c="dimmed">—</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={STATUS_COLORS[req.status]}
                    variant="light"
                    size="sm"
                  >
                    {STATUS_LABELS[req.status]}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" c="dimmed">
                    {new Date(req.created_at).toLocaleDateString()}
                  </Text>
                </Table.Td>
                {showApprove && (
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        color="teal"
                        leftSection={<IconCheck size={12} />}
                        loading={approveMutation.isPending}
                        onClick={() => handleApprove(req.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant="light"
                        leftSection={<IconX size={12} />}
                        onClick={() => handleRejectOpen(req.id)}
                      >
                        Reject
                      </Button>
                    </Group>
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </>
  );
}

export default function ManagerTopUpPage() {
  const { activeLoungeId: loungeId } = useActiveLoungeStore();
  const { data: requests, isLoading } = useTopUpRequests(loungeId);

  // Manager sees cashier_approved bank transfers awaiting final approval
  const awaitingApproval =
    requests?.filter(
      (r) => r.status === "cashier_approved" && r.payment_method === "bank_transfer"
    ) ?? [];

  const allRequests = requests ?? [];

  if (!loungeId) {
    return (
      <DashboardShell allowedRoles={["lounge_manager"]}>
        <Center py="xl"><Loader /></Center>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell allowedRoles={["lounge_manager"]}>
      <Container size="xl">
        <Stack gap="xl">
          <div>
            <Title order={2}>Wallet Top-up Requests</Title>
            <Text c="dimmed" size="sm">
              Final approval for bank transfer top-ups
            </Text>
          </div>

          <Paper shadow="sm" radius="md" withBorder>
            <Tabs defaultValue="awaiting">
              <Tabs.List px="md" pt="xs">
                <Tabs.Tab value="awaiting" leftSection={<IconWallet size={16} />}>
                  Awaiting Approval ({awaitingApproval.length})
                </Tabs.Tab>
                <Tabs.Tab value="all">
                  All Requests ({allRequests.length})
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="awaiting" p="md">
                {isLoading ? (
                  <Center py="xl"><Loader /></Center>
                ) : (
                  <RequestsTable
                    data={awaitingApproval}
                    loungeId={loungeId!}
                    showApprove={true}
                  />
                )}
              </Tabs.Panel>

              <Tabs.Panel value="all" p="md">
                {isLoading ? (
                  <Center py="xl"><Loader /></Center>
                ) : (
                  <RequestsTable
                    data={allRequests}
                    loungeId={loungeId!}
                    showApprove={false}
                  />
                )}
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
