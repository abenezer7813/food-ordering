import { Title, Text, Stack, } from "@mantine/core";
interface WelcomeSectionProps {
    userName: string,
    subTitle: string
}
export function WelcomeSection({ userName, subTitle }: WelcomeSectionProps) {
    return (
        <Stack gap="xs">
            <Title order={2}>
                Good Morning, {userName} 👋
            </Title>
            <Text>
                {subTitle}
            </Text>

        </Stack>
    );
}