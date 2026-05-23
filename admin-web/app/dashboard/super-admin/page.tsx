"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuthStore } from "@/lib/auth-store";
import { Container, SimpleGrid, Stack } from "@mantine/core";
import { WelcomeSection } from "../WelcomeSection";
import { StatCard } from "@/components/domain/StatCard";
import {
  IconBuildingStore,
  IconBuildingCommunity,
  IconUsers,
  IconUserCheck,
} from "@tabler/icons-react";
import { useLoungesAdmin } from "@/hooks/queries/useLounges";
import { useManagers } from "@/hooks/queries/useStaff";

export default function SuperAdminDashboard() {
  const { user } = useAuthStore();

  const { data: lounges, isLoading: loungesLoading } = useLoungesAdmin();
  const { data: managers, isLoading: managersLoading } = useManagers();

  // Lounge stats
  const totalLounges = lounges?.length ?? 0;
  const activeLounges = lounges?.filter((lounge) => lounge.is_active === true).length ?? 0;

  // Total users = all managers (staff are per-lounge, managers are platform-wide)
  const totalManagers = managers?.length ?? 0;
  const activeManagers = managers?.filter((m: any) => m.is_active === true).length ?? 0;

  return (
    <DashboardShell allowedRoles={["super_admin"]}>
      <Container size="xl">
        <Stack gap="xl">
          <WelcomeSection
            userName={user?.first_name || "Admin"}
            subTitle="Here's what's happening across all lounges today."
          />

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            <StatCard
              title="Total Lounges"
              value={totalLounges}
              icon={<IconBuildingStore size={20} />}
              color="violet"
              isLoading={loungesLoading}
            />

            <StatCard
              title="Active Lounges"
              value={activeLounges}
              icon={<IconBuildingCommunity size={20} />}
              color="teal"
              isLoading={loungesLoading}
            />

            <StatCard
              title="Total Managers"
              value={totalManagers}
              icon={<IconUsers size={20} />}
              color="blue"
              isLoading={managersLoading}
            />

            <StatCard
              title="Active Managers"
              value={activeManagers}
              icon={<IconUserCheck size={20} />}
              color='violet'
              isLoading={managersLoading}
            />
          </SimpleGrid>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
