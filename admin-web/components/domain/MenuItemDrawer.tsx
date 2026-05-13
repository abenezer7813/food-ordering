"use client";
import { useEffect, useRef, useState } from "react";
import {
  Drawer,
  Stack,
  TextInput,
  NumberInput,
  Textarea,
  Button,
  Title,
  Text,
  Divider,
  Image,
  Group,
  ActionIcon,
  Box,
  Loader,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUpload, IconX, IconPhoto } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useCreateMenuItem, useUpdateMenuItem } from "@/hooks/queries/useMenu";
import { MenuItem } from "@/lib/api";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.secure_url;
}

interface MenuItemDrawerProps {
  opened: boolean;
  onClose: () => void;
  editItem?: MenuItem | null;
}

export function MenuItemDrawer({ opened, onClose, editItem }: MenuItemDrawerProps) {
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      price: 0,
      estimated_preparation_time: 10,
      image_url: "",
    },
    validate: {
      name: (v) => (v.trim() ? null : "Name is required"),
      price: (v) => (v > 0 ? null : "Price must be greater than 0"),
      estimated_preparation_time: (v) => (v > 0 ? null : "Prep time must be greater than 0"),
    },
  });

  // Reset form when editItem changes
  useEffect(() => {
    if (opened) {
      if (editItem) {
        form.setValues({
          name: editItem.name,
          description: editItem.description || "",
          price: parseFloat(editItem.price),
          estimated_preparation_time: editItem.estimated_preparation_time,
          image_url: editItem.image_url || "",
        });
        setImagePreview(editItem.image_url || null);
      } else {
        form.reset();
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [opened, editItem]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    form.setFieldValue("image_url", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = form.onSubmit(async (values) => {
    let imageUrl = values.image_url;

    // Upload to Cloudinary if new file selected
    if (imageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadToCloudinary(imageFile);
      } catch (err) {
        notifications.show({
          title: "Upload Failed",
          message: "Could not upload image. Try again.",
          color: "red",
        });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const payload = {
      name: values.name,
      description: values.description || undefined,
      price: values.price,
      estimated_preparation_time: values.estimated_preparation_time,
      image_url: imageUrl || undefined,
    };

    if (editItem) {
      updateMutation.mutate(
        { itemId: editItem.id, data: payload },
        {
          onSuccess: () => {
            notifications.show({ title: "Success", message: "Menu item updated", color: "green" });
            onClose();
          },
          onError: (err: any) =>
            notifications.show({ title: "Error", message: err.message, color: "red" }),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          notifications.show({ title: "Success", message: "Menu item created", color: "green" });
          form.reset();
          setImageFile(null);
          setImagePreview(null);
          onClose();
        },
        onError: (err: any) =>
          notifications.show({ title: "Error", message: err.message, color: "red" }),
      });
    }
  });

  const isLoading = uploading || createMutation.isPending || updateMutation.isPending;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      padding="lg"
      title={
        <Stack gap={2}>
          <Title order={4}>{editItem ? "Edit Menu Item" : "Add Menu Item"}</Title>
          <Text size="xs" c="dimmed">
            {editItem ? "Update the details below" : "Fill in the details to add a new item"}
          </Text>
        </Stack>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Divider label="Item Info" labelPosition="left" />

          <TextInput
            label="Name"
            placeholder="e.g. Tibs"
            required
            {...form.getInputProps("name")}
          />

          <Textarea
            label="Description"
            placeholder="Brief description (optional)"
            rows={3}
            {...form.getInputProps("description")}
          />

          <Group grow>
            <NumberInput
              label="Price (ETB)"
              placeholder="0.00"
              min={0}
              decimalScale={2}
              required
              {...form.getInputProps("price")}
            />
            <NumberInput
              label="Prep Time (min)"
              placeholder="10"
              min={1}
              required
              {...form.getInputProps("estimated_preparation_time")}
            />
          </Group>

          <Divider label="Image" labelPosition="left" />

          {/* Image preview */}
          {imagePreview ? (
            <Box pos="relative">
              <Image
                src={imagePreview}
                alt="Preview"
                radius="md"
                h={180}
                fit="cover"
              />
              <ActionIcon
                pos="absolute"
                top={8}
                right={8}
                color="red"
                variant="filled"
                size="sm"
                onClick={handleRemoveImage}
              >
                <IconX size={14} />
              </ActionIcon>
            </Box>
          ) : (
            <Box
              onClick={() => fileInputRef.current?.click()}
              style={(theme) => ({
                border: `2px dashed ${theme.colors.gray[4]}`,
                borderRadius: theme.radius.md,
                padding: theme.spacing.xl,
                cursor: "pointer",
                textAlign: "center",
              })}
            >
              <Stack align="center" gap="xs">
                <IconPhoto size={32} color="gray" />
                <Text size="sm" c="dimmed">
                  Click to select an image
                </Text>
                <Text size="xs" c="dimmed">
                  PNG, JPG up to 5MB
                </Text>
              </Stack>
            </Box>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          {!imagePreview && (
            <Button
              variant="outline"
              leftSection={<IconUpload size={16} />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image
            </Button>
          )}

          <Divider />

          <Button type="submit" fullWidth loading={isLoading}>
            {uploading
              ? "Uploading image..."
              : editItem
              ? "Save Changes"
              : "Add Item"}
          </Button>
          <Button variant="subtle" fullWidth onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}
