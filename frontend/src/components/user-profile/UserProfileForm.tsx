"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UserProfile, UpdateUserProfile } from "@/services/user-service";
import { useEffect, useState, useRef } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

// Define the enum values as a const array to be used for both type and validation
const professionalTitleEnum = ["NUT", "DR", "DRA", "ESP", "MTR", "PHD", ""] as const;
const genderEnum = ["M", "F", "O", ""] as const;
const themeEnum = ["light", "dark", "system"] as const;
const languageEnum = ["pt-BR", "en-US"] as const;

// Define the Zod schema using the const arrays
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }).max(50, { message: "O nome não pode ter mais de 50 caracteres." }),
  professional_title: z.enum(professionalTitleEnum).optional(),
  gender: z.enum(genderEnum).optional(),
  settings_theme: z.enum(themeEnum, { message: "Selecione um tema válido." }),
  settings_language: z.enum(languageEnum, { message: "Selecione um idioma válido." }),
  settings_notifications_email: z.boolean(),
  settings_notifications_push: z.boolean(),
  profile_picture: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function UserProfileForm() {
  const queryClient = useQueryClient();
  const { user: authUser, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: userProfile, isLoading, isError } = useQuery<UserProfile, Error>({
    queryKey: ["userProfile"],
    queryFn: () => userService.getMyProfile(),
    enabled: !!authUser?.id,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name,
        professional_title: (userProfile.professional_title || "") as typeof professionalTitleEnum[number],
        gender: (userProfile.gender || "") as typeof genderEnum[number],
        settings_theme: userProfile.settings.theme as typeof themeEnum[number],
        settings_language: userProfile.settings.language as typeof languageEnum[number],
        settings_notifications_email: userProfile.settings.notifications_email,
        settings_notifications_push: userProfile.settings.notifications_push,
      });
      if (userProfile.profile_picture) {
        setPreviewImage(userProfile.profile_picture);
      } else {
        setPreviewImage(null);
      }
    }
  }, [userProfile, form]);

  const updateProfileMutation = useMutation<UserProfile, Error, UpdateUserProfile>({
    mutationFn: (data) => userService.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      refreshUser();
      toast({
        title: "Sucesso!",
        description: "Seu perfil foi atualizado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao atualizar o perfil: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      form.setValue("profile_picture", event.target.files, { shouldValidate: true });
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    form.setValue("profile_picture", null, { shouldValidate: true, shouldDirty: true });
  };

  async function onSubmit(data: ProfileFormValues) {
    const fileList = data.profile_picture as FileList | null;
    const profilePictureFile = fileList?.[0];
    
    const settingsData = {
        theme: data.settings_theme,
        language: data.settings_language,
        notifications_email: data.settings_notifications_email,
        notifications_push: data.settings_notifications_push,
    };

    updateProfileMutation.mutate({
      name: data.name,
      professional_title: data.professional_title,
      gender: data.gender,
      profile_picture: data.profile_picture === null ? null : profilePictureFile,
      settings: settingsData
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-destructive">
        Erro ao carregar dados do perfil.
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormItem>
          <FormLabel>Foto de Perfil</FormLabel>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Foto de Perfil"
                  layout="fill"
                  objectFit="cover"
                />
              ) : (
                <span className="text-4xl text-muted-foreground">👤</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Input
                id="profile_picture_upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="w-auto cursor-pointer"
              />
              {previewImage && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="w-fit"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover Foto
                </Button>
              )}
            </div>
          </div>
          <FormDescription>
            Faça upload de uma foto para o seu perfil. Max 5MB.
          </FormDescription>
          <FormMessage />
        </FormItem>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
              </FormControl>
              <FormDescription>
                Este é o nome que será exibido publicamente.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="professional_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título Profissional</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu título" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  <SelectItem value="NUT">Nutricionista</SelectItem>
                  <SelectItem value="DR">Dr.</SelectItem>
                  <SelectItem value="DRA">Dra.</SelectItem>
                  <SelectItem value="ESP">Especialista</SelectItem>
                  <SelectItem value="MTR">Mestre</SelectItem>
                  <SelectItem value="PHD">PhD</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Seu título pode ser exibido ao lado do seu nome.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gênero</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu gênero" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Não especificar</SelectItem>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                  <SelectItem value="O">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="settings_theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tema da Interface</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Escolha o tema visual da aplicação.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="settings_language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Idioma</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">Inglês (EUA)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                O idioma da sua interface.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="settings_notifications_email"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Notificações por Email
                </FormLabel>
                <FormDescription>
                  Receba notificações importantes por email.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="settings_notifications_push"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Notificações Push
                </FormLabel>
                <FormDescription>
                  Receba notificações instantâneas no seu navegador ou dispositivo.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={updateProfileMutation.isPending || !form.formState.isDirty}>
          {updateProfileMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Atualizar perfil
        </Button>
      </form>
    </Form>
  );
}
