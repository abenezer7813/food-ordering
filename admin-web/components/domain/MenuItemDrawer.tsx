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
  Select,
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
      category: null as "food" | "drink" | null,
      meal_type: null as "breakfast" | "lunch" | "dinner" | "all_day" | null,
      drink_type: null as "juice" | "coffee" | "tea" | "water" | "soda" | "smoothie" | "other" | null,
    },
    validate: {
      name: (v) => (v.trim() ? null : "Name is required"),
      price: (v) => (v > 0 ? null : "Price must be greater than 0"),
      estimated_preparation_time: (v) => (v > 0 ? null : "Prep time must be greater than 0"),
    },
  });

  useEffect(() => {
    if (opened) {
      if (editItem) {
        form.setValues({
          name: editItem.name,
          description: editItem.description || "",
          price: parseFloat(editItem.price),
          estimated_preparation_time: editItem.estimated_preparation_time,
          image_url: editItem.image_url || "",
          category: editItem.category ?? null,
          meal_type: editItem.meal_type ?? null,
          drink_type: editItem.drink_type ?? null,
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

    if (imageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadToCloudinary(imageFile);
      } catch (err) {
        notifications.show({ title: "Upload Failed", message: "Could not upload image. Try again.", color: "red" });
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
      category: values.category ?? undefined,
      meal_type: values.category === "food" ? (values.meal_type ?? undefined) : undefined,
      drink_type: values.category === "drink" ? (values.drink_type ?? undefined) : undefined,
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
  const category = form.values.category;

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

          <Divider label="Classification" labelPosition="left" />

          <Select
            label="Category"
            placeholder="Select category"
            data={[
              { value: "food", label: "🍽️ Food" },
              { value: "drink", label: "🥤 Drink" },
            ]}
            clearable
            {...form.getInputProps("category")}
            onChange={(v) => {
              form.setFieldValue("category", v as any);
              // clear the conditional field when switching
              form.setFieldValue("meal_type", null);
              form.setFieldValue("drink_type", null);
            }}
          />

          {category === "food" && (
            <Select
              label="Meal Type"
              placeholder="When is it served?"
              data={[
                { value: "breakfast", label: "🌅 Breakfast" },
                { value: "lunch", label: "☀️ Lunch" },
                { value: "dinner", label: "🌙 Dinner" },
                { value: "all_day", label: "🕐 All Day" },
              ]}
              clearable
              {...form.getInputProps("meal_type")}
            />
          )}

          {category === "drink" && (
            <Select
              label="Drink Type"
              placeholder="Type of drink"
              data={[
                { value: "juice", label: "🍊 Juice" },
                { value: "coffee", label: "☕ Coffee" },
                { value: "tea", label: "🍵 Tea" },
                { value: "water", label: "💧 Water" },
                { value: "soda", label: "🥤 Soda" },
                { value: "smoothie", label: "🥛 Smoothie" },
                { value: "other", label: "🫙 Other" },
              ]}
              clearable
              {...form.getInputProps("drink_type")}
            />
          )}

          <Divider label="Image" labelPosition="left" />

          {imagePreview ? (
            <Box pos="relative">
              <Image src={imagePreview} alt="Preview" radius="md" h={180} fit="cover" />
              <ActionIcon
                pos="absolute" top={8} right={8}
                color="red" variant="filled" size="sm"
                onClick={handleRemoveImage}
              >
                <IconX size={14} />
              </ActionIcon>
            </Box>
          ) : (
            <Box
              onClick={() => fileInputRef.current?.click()}
              style={(theme) => ({
                border: `2px dashed var(--mantine-color-default-border)`,
                borderRadius: theme.radius.md,
                padding: theme.spacing.xl,
                cursor: "pointer",
                textAlign: "center",
              })}
            >
              <Stack align="center" gap="xs">
                <IconPhoto size={32} color="gray" />
                <Text size="sm" c="dimmed">Click to select an image</Text>
                <Text size="xs" c="dimmed">PNG, JPG up to 5MB</Text>
              </Stack>
            </Box>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          {!imagePreview && (
            <Button variant="outline" leftSection={<IconUpload size={16} />} onClick={() => fileInputRef.current?.click()}>
              Upload Image
            </Button>
          )}

          <Divider />

          <Button type="submit" fullWidth loading={isLoading}>
            {uploading ? "Uploading image..." : editItem ? "Save Changes" : "Add Item"}
          </Button>
          <Button variant="subtle" fullWidth onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}

