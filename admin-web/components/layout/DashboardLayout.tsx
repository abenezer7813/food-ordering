"use client";
import { ReactNode, useEffect } from "react";
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
  Indicator,
  Tooltip,
  Select,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBolt,
  IconLayoutDashboard,
  IconShoppingCart,
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
  IconBell,
} from "@tabler/icons-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { useLogout } from "@/hooks/queries/useAuth";
import { useMyLounge, useMyLounges } from "@/hooks/queries/useStaff";
import { useTopUpRequests } from "@/hooks/queries/useWallet";
import { useActiveLoungeStore } from "@/lib/active-lounge-store";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

  const role = user?.role;
  const showLounge = ["cashier", "cook", "lounge_manager"].includes(role ?? "");
  const showNotifications = ["cashier", "lounge_manager"].includes(role ?? "");
  const isManager = role === "lounge_manager";

  // For cashier/cook: single lounge
  const { data: myLounge } = useMyLounge();

  // For manager: multiple lounges
  const { data: myLounges } = useMyLounges();
  const { activeLoungeId, setActiveLounge } = useActiveLoungeStore();

  // Initialize active lounge for manager on first load
  useEffect(() => {
    if (isManager && myLounges && myLounges.length > 0 && !activeLoungeId) {
      setActiveLounge(myLounges[0].id, myLounges[0].name);
    }
  }, [isManager, myLounges, activeLoungeId, setActiveLounge]);

  // Pending top-up count for notification bell
  const loungeIdForNotifications = isManager ? activeLoungeId : myLounge?.lounge_id;
  const { data: topUpRequests } = useTopUpRequests(
    showNotifications ? (loungeIdForNotifications ?? null) : null
  );

  const pendingCount =
    role === "cashier"
      ? (topUpRequests?.filter((r) => r.status === "pending").length ?? 0)
      : role === "lounge_manager"
      ? (topUpRequests?.filter(
          (r) => r.status === "cashier_approved" && r.payment_method === "bank_transfer"
        ).length ?? 0)
      : 0;

  const notificationHref =
    role === "cashier"
      ? "/dashboard/cashier/topup"
      : "/dashboard/provider/topup";

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getRolePath = (role: string) => {
    const paths: Record<string, string> = {
      super_admin: "super-admin",
      lounge_manager: "provider",
      cashier: "cashier",
      cook: "cook",
    };
    return paths[role] || role;
  };

  const getNavigationItems = () => {
    const commonItems = [
      {
        icon: IconLayoutDashboard,
        label: t("nav.dashboard"),
        href: `/dashboard/${getRolePath(role || "")}`,
      },
    ];

    const roleBasedItems: Record<string, any[]> = {
      super_admin: [
        { icon: IconBuildingStore, label: t("nav.lounges"), href: "/dashboard/super-admin/lounges" },
        { icon: IconUsers, label: t("nav.managers"), href: "/dashboard/super-admin/managers" },
      ],
      lounge_manager: [
        { icon: IconMenuOrder, label: t("nav.menu"), href: "/dashboard/provider/menu" },
        { icon: IconMessage, label: t("nav.feedback"), href: "/dashboard/provider/feedback" },
        { icon: IconShoppingCart, label: t("nav.orders"), href: "/dashboard/provider/orders" },
        { icon: IconUsers, label: t("nav.staff"), href: "/dashboard/provider/staff" },
        { icon: IconWallet, label: t("nav.topup"), href: "/dashboard/provider/topup" },
        { icon: IconReportAnalytics, label: t("nav.reports"), href: "/dashboard/provider/reports" },
      ],
      cashier: [
        { icon: IconShoppingCart, label: t("nav.orders"), href: "/dashboard/cashier/orders" },
        { icon: IconMenuOrder, label: t("nav.menu"), href: "/dashboard/cashier/menu" },
        { icon: IconWallet, label: t("nav.topup"), href: "/dashboard/cashier/topup" },
        { icon: IconReportAnalytics, label: t("nav.reports"), href: "/dashboard/cashier/reports" },
      ],
      cook: [
        { icon: IconShoppingCart, label: t("nav.orders"), href: "/dashboard/cook/orders" },
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
          {/* Left: logo + lounge name */}
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
              <Text fw={700} size="lg" tt="capitalize">
                {showLounge && !isManager && myLounge?.lounge_name
                  ? myLounge.lounge_name
                  : "UniLounge"}
              </Text>
            </Group>

            {/* Lounge switcher for managers */}
            {isManager && myLounges && myLounges.length > 0 && (
              <Select
                placeholder={t("header.selectLounge")}
                data={myLounges.map((l) => ({ value: l.id, label: l.name }))}
                value={activeLoungeId}
                onChange={(value) => {
                  if (value) {
                    const lounge = myLounges.find((l) => l.id === value);
                    if (lounge) {
                      setActiveLounge(lounge.id, lounge.name);
                    }
                  }
                }}
                w={200}
                styles={{
                  input: { textTransform: "capitalize" },
                }}
              />
            )}
          </Group>

          {/* Right: language switcher + dark mode + notification bell + user menu */}
          <Group gap="sm">
            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Dark/light toggle */}
            <ActionIcon
              variant="default"
              onClick={() => toggleColorScheme()}
              size="lg"
            >
              {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>

            {/* Notification bell — cashier & manager only */}
            {showNotifications && (
              <Tooltip
                label={
                  pendingCount > 0
                    ? `${pendingCount} ${pendingCount > 1 ? t("header.notifications.pendingPlural") : t("header.notifications.pending")}`
                    : t("header.notifications.none")
                }
              >
                <Indicator
                  color="red"
                  size={16}
                  label={pendingCount > 9 ? "9+" : pendingCount}
                  disabled={pendingCount === 0}
                  processing={pendingCount > 0}
                >
                  <ActionIcon
                    variant="default"
                    size="lg"
                    onClick={() => router.push(notificationHref)}
                  >
                    <IconBell size={18} />
                  </ActionIcon>
                </Indicator>
              </Tooltip>
            )}

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
                <Menu.Label>{t("header.account")}</Menu.Label>
                <Menu.Item
                  leftSection={<IconSettings size={16} />}
                  onClick={() => router.push("/dashboard/settings")}
                >
                  {t("header.settings")}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={16} />}
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? t("header.loggingOut") : t("header.logout")}
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
            {showLounge && !isManager && myLounge?.lounge_name && (
              <Text size="xs" c="dimmed" mt={4}>
                📍 {myLounge.lounge_name}
              </Text>
            )}
            {isManager && activeLoungeId && (
              <Text size="xs" c="dimmed" mt={4} tt="capitalize">
                📍 {myLounges?.find((l) => l.id === activeLoungeId)?.name}
              </Text>
            )}
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
