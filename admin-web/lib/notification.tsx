import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";


export function notifySuccess(message: string, title = 'success') {
    return notifications.show({
        title,
        message: message,
        color: 'green',
        icon: <IconCheck size={16} />
    })
}
export function notifyError(message: string, title = 'Error') {
    return notifications.show({
        title,
        message: message,
        color: 'red',
        icon: <IconX size={16} />
    })
}