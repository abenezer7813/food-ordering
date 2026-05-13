"use client";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useFeedback } from "@/hooks/queries/useFeedback";
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  SimpleGrid,
  Badge,
  Table,
  ScrollArea,
  Loader,
  Center,
  ThemeIcon,
  Progress,
  Divider,
} from "@mantine/core";
import { IconStar, IconMessage, IconMoodSmile } from "@tabler/icons-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <Group gap={2}>
      {[1, 2, 3, 4, 5].map((star) => (
        <IconStar
          key={star}
          size={14}
          fill={star <= rating ? "#f59f00" : "none"}
          color={star <= rating ? "#f59f00" : "#ced4da"}
        />
      ))}
    </Group>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <Group gap="sm">
      <Group gap={2} w={80}>
        {[1, 2, 3, 4, 5].map((s) => (
          <IconStar
            key={s}
            size={10}
            fill={s <= star ? "#f59f00" : "none"}
            color={s <= star ? "#f59f00" : "#ced4da"}
          />
        ))}
      </Group>
      <Progress value={percent} size="sm" color="yellow" style={{ flex: 1 }} />
      <Text size="xs" c="dimmed" w={24} ta="right">
        {count}
      </Text>
    </Group>
  );
}

export default function ManagerFeedbackPage() {
  const { data: feedback, isLoading } = useFeedback();

  const total = feedback?.length || 0;
  const avgRating =
    total > 0
      ? feedback!.reduce((sum, f) => sum + f.rating, 0) / total
      : 0;

  // Count per star
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedback?.filter((f) => f.rating === star).length || 0,
  }));

  const getRatingColor = (avg: number) => {
    if (avg >= 4) return "teal";
    if (avg >= 3) return "yellow";
    return "red";
  };

  const getRatingLabel = (avg: number) => {
    if (avg >= 4.5) return "Excellent";
    if (avg >= 4) return "Very Good";
    if (avg >= 3) return "Good";
    if (avg >= 2) return "Fair";
    return "Poor";
  };

  return (
    <DashboardShell allowedRoles={["lounge_manager"]}>
      <Container size="xl">
        <Stack gap="xl">
          <div>
            <Title order={2}>Customer Feedback</Title>
            <Text c="dimmed" size="sm">
              Reviews and ratings from your lounge customers
            </Text>
          </div>

          {isLoading ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : !feedback || total === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <IconMessage size={40} color="gray" />
                <Text c="dimmed">No feedback yet</Text>
              </Stack>
            </Center>
          ) : (
            <>
              {/* Summary */}
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                {/* Average Rating */}
                <Paper withBorder p="lg" radius="md">
                  <Group>
                    <ThemeIcon
                      size="xl"
                      radius="md"
                      color={getRatingColor(avgRating)}
                      variant="light"
                    >
                      <IconStar size={22} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                        Average Rating
                      </Text>
                      <Group gap="xs" align="center">
                        <Text size="xl" fw={700}>
                          {avgRating.toFixed(1)}
                        </Text>
                        <Badge color={getRatingColor(avgRating)} variant="light" size="sm">
                          {getRatingLabel(avgRating)}
                        </Badge>
                      </Group>
                    </div>
                  </Group>
                </Paper>

                {/* Total Reviews */}
                <Paper withBorder p="lg" radius="md">
                  <Group>
                    <ThemeIcon size="xl" radius="md" color="blue" variant="light">
                      <IconMessage size={22} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                        Total Reviews
                      </Text>
                      <Text size="xl" fw={700}>
                        {total}
                      </Text>
                    </div>
                  </Group>
                </Paper>

                {/* Satisfaction */}
                <Paper withBorder p="lg" radius="md">
                  <Group>
                    <ThemeIcon size="xl" radius="md" color="green" variant="light">
                      <IconMoodSmile size={22} />
                    </ThemeIcon>
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                        Satisfied (4-5★)
                      </Text>
                      <Text size="xl" fw={700}>
                        {total > 0
                          ? Math.round(
                              (feedback!.filter((f) => f.rating >= 4).length /
                                total) *
                                100
                            )
                          : 0}
                        %
                      </Text>
                    </div>
                  </Group>
                </Paper>
              </SimpleGrid>

              {/* Rating breakdown */}
              <Paper withBorder p="lg" radius="md">
                <Text fw={600} mb="md">
                  Rating Breakdown
                </Text>
                <Divider mb="md" />
                <Stack gap="xs">
                  {ratingCounts.map(({ star, count }) => (
                    <RatingBar key={star} star={star} count={count} total={total} />
                  ))}
                </Stack>
              </Paper>

              {/* Feedback Table */}
              <Paper shadow="sm" radius="md" withBorder>
                <Text fw={600} p="md" pb={0}>
                  All Reviews
                </Text>
                <Divider mt="md" />
                <ScrollArea>
                  <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Rating</Table.Th>
                        <Table.Th>Comment</Table.Th>
                        <Table.Th>Order ID</Table.Th>
                        <Table.Th>Date</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {feedback.map((item) => (
                        <Table.Tr key={item.id}>
                          <Table.Td>
                            <StarRating rating={item.rating} />
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {item.comment || (
                                <Text size="sm" c="dimmed" fs="italic">
                                  No comment
                                </Text>
                              )}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" ff="monospace">
                              #{item.order_id.slice(0, 8)}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed">
                              {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Paper>
            </>
          )}
        </Stack>
      </Container>
    </DashboardShell>
  );
}
