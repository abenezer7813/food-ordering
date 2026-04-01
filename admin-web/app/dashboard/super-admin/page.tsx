"use client"

import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuthStore } from "@/lib/auth-store"
import { Container, SimpleGrid, Stack } from "@mantine/core";
import { WelcomeSection } from "../WelcomeSection";
import { StatCard } from "@/components/domain/StatCard";
import { IconBuildingStore, IconCurrencyDollar, IconShoppingCart, IconUser } from "@tabler/icons-react";
import { size } from "zod";
import { useLoungesAdmin } from "@/hooks/queries/useLounges";

export default function SuperAdminDasdhboard() {
    const { user } = useAuthStore();
    const { data: lounges, isLoading, isError } = useLoungesAdmin();
    const totalLounges = lounges?.length ?? 0;
    const activeLounges=lounges?.filter((lounge)=>{lounge.is_active===true}).l
    return (<DashboardShell allowedRoles={["super_admin"]}>
        <Container size={'xl'}>
            < Stack gap={'xl'}>
                <WelcomeSection
                    userName={user?.first_name || "Admin"}
                    subTitle="Here's what's happening across all lounges today."></WelcomeSection>


                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={'lg'}>
                    <StatCard
                        title="Total Lounges"
                        value={totalLounges}
                        icon={<IconBuildingStore size={20} />} color="violet"
                        trend={{ value: 2, isPositive: true }}
                        isLoading={isLoading} 
                />

                    <StatCard
                        title="Total Users"
                        value={4}
                        icon={<IconUser size={20} />}

                        color="blue"
                        trend={{ value: 1, isPositive: true }} />
                    <StatCard
                        title="Total Orders"
                        value={4}
                        icon={<IconShoppingCart size={20} />}
                        color="orange"
                        trend={{ value: 1, isPositive: true }} />
                    <StatCard
                        title="Monthly Revenue"
                        value={4}
                        icon={<IconCurrencyDollar size={20} />}
                        color="blue"
                        trend={{ value: 1, isPositive: true }} />
                </SimpleGrid>
            </Stack>
        </Container>
    </DashboardShell>);
}