"use client";
import { ReactNode, useState } from "react";
import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  Avatar,
  Menu,
  UnstyledButton,
  Box,
  Stack,
  Badge,
  ActionIcon,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBolt,
  IconLayoutDashboard,
  IconShoppingCart,
  IconChefHat,
  IconUsers,
  IconReportAnalytics,
  IconSettings,
  IconLogout,
  IconSun,
  IconMoon,
  IconBuildingStore,
  IconMenuOrder,
  IconChevronDown,
  IconWallet,
  IconMessage,
} from "@tabler/icons-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { useLogout } from "@/hooks/queries/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Navigation items based on role
  const getNavigationItems = () => {
    const role = user?.role;

const getRolePath = (role: string) => {
  const paths: Record<string, string> = {
    super_admin: "super-admin",
    lounge_manager: "provider",
    cashier: "cashier",
    cook: "cook",
  };
  return paths[role] || role;
};
    const commonItems = [
      {
        icon: IconLayoutDashboard,
        label: "Dashboard",
        href: `/dashboard/${getRolePath(role||"")}`,
      },
    ];

    const roleBasedItems: Record<string, any[]> = {
      super_admin: [
        { icon: IconBuildingStore, label: "Lounges", href: "/dashboard/super-admin/lounges" },
        { icon: IconUsers, label: "Managers", href: "/dashboard/super-admin/managers" },
      ],
      lounge_manager: [
        { icon: IconMenuOrder, label: "Menu", href: "/dashboard/provider/menu" },
        { icon: IconMessage, label: "Feedback", href: "/dashboard/provider/feedback" },
        { icon: IconShoppingCart, label: "Orders", href: "/dashboard/provider/orders" },
        { icon: IconUsers, label: "Staff", href: "/dashboard/provider/staff" },
        { icon: IconReportAnalytics, label: "Reports", href: "/dashboard/provider/reports" },
      ],
      cashier: [
        { icon: IconShoppingCart, label: "Orders", href: "/dashboard/cashier/orders" },
        { icon: IconMenuOrder, label: "Menu", href: "/dashboard/cashier/menu" },
      
        { icon: IconReportAnalytics, label: "Reports", href: "/dashboard/cashier/reports" },
      ],
      cook: [
        { icon: IconShoppingCart, label: "Orders", href: "/dashboard/cook/orders" },
      
      ],
    };

    return [...commonItems, ...(roleBasedItems[role || ""] || [])];
  };

  const navigationItems = getNavigationItems();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="xs">
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconBolt size={18} color="white" />
              </Box>
              <Text fw={700} size="lg">
                UniLounge
              </Text>
            </Group>
          </Group>

          <Group gap="sm">
            <ActionIcon
              variant="default"
              onClick={() => toggleColorScheme()}
              size="lg"
            >
              {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>

            {/* User Menu */}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar color="indigo" radius="xl" size="sm">
                      {user?.first_name?.[0]}
                      {user?.last_name?.[0]}
                    </Avatar>
                    <Box visibleFrom="sm">
                      <Text size="sm" fw={500}>
                        {user?.first_name} {user?.last_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {user?.role?.replace("_", " ")}
                      </Text>
                    </Box>
                    <IconChevronDown size={14} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item
                  leftSection={<IconSettings size={16} />}
                  onClick={() => router.push("/dashboard/settings")}
                >
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={16} />}
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar/Sidebar */}
      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap="xs">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.5} />}
                active={pathname === item.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                  toggle();
                }}
                variant="subtle"
              />
            ))}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Box
            p="md"
            style={(theme) => ({
              background:
                colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : theme.colors.gray[0],
              borderRadius: theme.radius.md,
            })}
          >
            <Group gap="xs" mb="xs">
              <Avatar color="indigo" radius="xl" size="md">
                {user?.first_name?.[0]}
                {user?.last_name?.[0]}
              </Avatar>
              <Stack gap={0} style={{ flex: 1 }}>
                <Text size="sm" fw={500} lineClamp={1}>
                  {user?.first_name} {user?.last_name}
                </Text>
                <Badge size="xs" variant="light" color="indigo">
                  {user?.role?.replace("_", " ")}
                </Badge>
              </Stack>
            </Group>
            <Text size="xs" c="dimmed">
              {user?.email}
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}