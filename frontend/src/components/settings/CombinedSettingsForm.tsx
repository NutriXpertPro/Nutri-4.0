'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Palette, 
  Image as ImageIcon, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  PenLine,
  Settings,
  Save
} from 'lucide-react';
import { settingsService, CombinedSettings, BrandingSettings } from '@/services/settings-service';
import { useToast } from '@/components/ui/use-toast';

// Definir os tipos para reutilização
const professionalTitleEnum = ["NUT", "DR", "DRA", "ESP", "MTR", "PHD"] as const;
const genderEnum = ["M", "F", "O"] as const;
const themeEnum = ["light", "dark", "system"] as const;
const languageEnum = ["pt-BR", "en-US"] as const;

interface SettingsFormState {
  // Dados de perfil
  name: string;
  professional_title: string | null;
  gender: string | null;
  profile_picture: File | null;
  profile_picture_url: string | null;
  settings_theme: string;
  settings_language: string;
  settings_notifications_email: boolean;
  settings_notifications_push: boolean;

  // Dados de branding
  logo: File | null;
  logo_url: string | null;
  signature_image: File | null;
  signature_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  business_name: string;
  crn_number: string;
  professional_license: string;
  email_signature: string;
  phone: string;
  address: string;
  document_header: string;
  document_footer: string;
  is_active: boolean;
}

const CombinedSettingsForm = () => {
  const [settings, setSettings] = useState<SettingsFormState>({
    // Dados de perfil
    name: '',
    professional_title: null,
    gender: null,
    profile_picture: null,
    profile_picture_url: null,
    settings_theme: 'system',
    settings_language: 'pt-BR',
    settings_notifications_email: false,
    settings_notifications_push: false,
    
    // Dados de branding
    logo: null,
    logo_url: null,
    signature_image: null,
    signature_image_url: null,
    primary_color: '#22c55e',
    secondary_color: '#059669',
    business_name: '',
    crn_number: '',
    professional_license: '',
    email_signature: '',
    phone: '',
    address: '',
    document_header: '',
    document_footer: '',
    is_active: true
  });
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Carregar configurações combinadas
  useEffect(() => {
    let isMounted = true; // Flag para evitar atualizações em componentes desmontados

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getCombinedSettings();

        if (isMounted) { // Verificar se o componente ainda está montado
          setSettings({
            // Dados de perfil
            name: data.profile.name || '',
            professional_title: data.profile.professional_title || null,
            gender: data.profile.gender || null,
            profile_picture: null, // Não carregamos o arquivo, apenas a URL
            profile_picture_url: data.profile.profile_picture || null,
            settings_theme: data.profile.settings.theme || 'system',
            settings_language: data.profile.settings.language || 'pt-BR',
            settings_notifications_email: data.profile.settings.notifications_email,
            settings_notifications_push: data.profile.settings.notifications_push,

            // Dados de branding
            logo: null, // Não carregamos o arquivo, apenas a URL
            logo_url: data.branding.logo || null,
            signature_image: null, // Não carregamos o arquivo, apenas a URL
            signature_image_url: data.branding.signature_image || null,
            primary_color: data.branding.primary_color || '#22c55e',
            secondary_color: data.branding.secondary_color || '#059669',
            business_name: data.branding.business_name || '',
            crn_number: data.branding.crn_number || '',
            professional_license: data.branding.professional_license || '',
            email_signature: data.branding.email_signature || '',
            phone: data.branding.phone || '',
            address: data.branding.address || '',
            document_header: data.branding.document_header || '',
            document_footer: data.branding.document_footer || '',
            is_active: data.branding.is_active
          });
        }
      } catch (error) {
        if (isMounted) { // Verificar se o componente ainda está montado
          console.error('Erro ao carregar configurações:', error);
          toast({
            title: 'Erro',
            description: 'Falha ao carregar as configurações',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) { // Verificar se o componente ainda está montado
          setLoading(false);
        }
      }
    };

    fetchSettings();

    // Cleanup function para definir isMounted como false quando o componente for desmontado
    return () => {
      isMounted = false;
    };
  }, []); // Remover toast das dependências para evitar reexecução desnecessária

  // Manipular mudança de arquivo de foto de perfil
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, profile_picture_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
      setSettings(prev => ({ ...prev, profile_picture: file }));
    }
  };

  // Manipular mudança de arquivo de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, logo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
      setSettings(prev => ({ ...prev, logo: file }));
    }
  };

  // Manipular mudança de arquivo de assinatura
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, signature_image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
      setSettings(prev => ({ ...prev, signature_image: file }));
    }
  };

  // Manipular mudança em campos de texto
  const handleChange = (field: keyof SettingsFormState, value: string | boolean | null) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Salvar configurações combinadas
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Preparar dados para atualização
      const updateData = {
        profile: {
          name: settings.name,
          professional_title: settings.professional_title,
          gender: settings.gender,
          profile_picture: settings.profile_picture,
          settings: {
            theme: settings.settings_theme,
            language: settings.settings_language,
            notifications_email: settings.settings_notifications_email,
            notifications_push: settings.settings_notifications_push,
          }
        },
        branding: {
          logo: settings.logo,
          signature_image: settings.signature_image,
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          business_name: settings.business_name,
          crn_number: settings.crn_number,
          professional_license: settings.professional_license,
          email_signature: settings.email_signature,
          phone: settings.phone,
          address: settings.address,
          document_header: settings.document_header,
          document_footer: settings.document_footer,
          is_active: settings.is_active
        }
      };

      await settingsService.updateCombinedSettings(updateData);

      toast({
        title: 'Sucesso!',
        description: 'Configurações atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar as configurações',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seção de Informações do Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Informações do Perfil
          </CardTitle>
          <CardDescription>
            Configure suas informações pessoais e preferências
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foto de Perfil */}
            <div>
              <Label htmlFor="profile-picture-upload">Foto de Perfil</Label>
              <div className="mt-2 flex items-center space-x-4">
                {settings.profile_picture_url ? (
                  <div className="relative">
                    <img
                      src={settings.profile_picture_url}
                      alt="Pré-visualização da foto de perfil"
                      className="w-24 h-24 object-cover rounded-full border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => {
                        setSettings(prev => ({ ...prev, profile_picture_url: null, profile_picture: null }));
                        if (profilePictureInputRef.current) {
                          profilePictureInputRef.current.value = '';
                        }
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-full bg-muted">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div>
                  <Input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    ref={profilePictureInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => profilePictureInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Foto
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG (máx. 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Nome e Título Profissional */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="professional-title">Título Profissional</Label>
                <Select
                  value={settings.professional_title || "none"}
                  onValueChange={(value) => handleChange('professional_title', value === "none" ? null : value)}
                >
                  <SelectTrigger id="professional-title" className="mt-1">
                    <SelectValue placeholder="Selecione seu título" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="NUT">Nutricionista</SelectItem>
                    <SelectItem value="DR">Dr.</SelectItem>
                    <SelectItem value="DRA">Dra.</SelectItem>
                    <SelectItem value="ESP">Especialista</SelectItem>
                    <SelectItem value="MTR">Mestre</SelectItem>
                    <SelectItem value="PHD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Configurações de Preferências */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="theme">Tema da Interface</Label>
              <Select
                value={settings.settings_theme}
                onValueChange={(value) => handleChange('settings_theme', value)}
              >
                <SelectTrigger id="theme" className="mt-1">
                  <SelectValue placeholder="Selecione um tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={settings.settings_language}
                onValueChange={(value) => handleChange('settings_language', value)}
              >
                <SelectTrigger id="language" className="mt-1">
                  <SelectValue placeholder="Selecione um idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">Inglês (EUA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configurações de Notificações */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">
                  Notificações por Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações importantes por email.
                </p>
              </div>
              <Switch
                checked={settings.settings_notifications_email}
                onCheckedChange={(checked) => handleChange('settings_notifications_email', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">
                  Notificações Push
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações instantâneas no seu navegador ou dispositivo.
                </p>
              </div>
              <Switch
                checked={settings.settings_notifications_push}
                onCheckedChange={(checked) => handleChange('settings_notifications_push', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Configurações de Branding
          </CardTitle>
          <CardDescription>
            Personalize sua identidade visual na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Identidade Visual */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="logo-upload">Logo do Consultório</Label>
                <div className="mt-2 flex items-center space-x-4">
                  {settings.logo_url ? (
                    <div className="relative">
                      <img
                        src={settings.logo_url}
                        alt="Pré-visualização do logo"
                        className="w-24 h-24 object-contain rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => {
                          setSettings(prev => ({ ...prev, logo_url: null, logo: null }));
                          if (logoInputRef.current) {
                            logoInputRef.current.value = '';
                          }
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <div>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      ref={logoInputRef}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatos: JPG, PNG (máx. 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Assinatura Digital */}
              <div>
                <Label htmlFor="signature-upload">Assinatura Digital</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  O fundo será removido automaticamente
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  {settings.signature_image_url ? (
                    <div className="relative">
                      <div className="w-40 h-20 border rounded-lg bg-white flex items-center justify-center p-2">
                        <img
                          src={settings.signature_image_url}
                          alt="Pré-visualização da assinatura"
                          className="max-w-full max-h-full object-contain"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => {
                          setSettings(prev => ({ ...prev, signature_image_url: null, signature_image: null }));
                          if (signatureInputRef.current) {
                            signatureInputRef.current.value = '';
                          }
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-40 h-20 border-2 border-dashed rounded-lg bg-muted">
                      <PenLine className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  <div>
                    <Input
                      id="signature-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureChange}
                      ref={signatureInputRef}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => signatureInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Assinatura
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG ou JPG • Fundo branco ou transparente
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="primary-color"
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="w-12 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => handleChange('secondary_color', e.target.value)}
                      className="w-12 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => handleChange('secondary_color', e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Informações de Contato */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="business-name">Nome Comercial</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="business-name"
                      value={settings.business_name}
                      onChange={(e) => handleChange('business_name', e.target.value)}
                      placeholder="Ex: Clínica NutriSaudável"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="crn-number">Número do CRN</Label>
                    <Input
                      id="crn-number"
                      value={settings.crn_number}
                      onChange={(e) => handleChange('crn_number', e.target.value)}
                      placeholder="Ex: SP12345"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="license">Licença Profissional</Label>
                    <Input
                      id="license"
                      value={settings.professional_license}
                      onChange={(e) => handleChange('professional_license', e.target.value)}
                      placeholder="Ex: Nutricionista"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={settings.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Rua, número, bairro, cidade"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Assinatura e Documentos */}
          <div className="mt-6 space-y-6">
            <div>
              <Label htmlFor="email-signature">Assinatura de E-mail</Label>
              <Textarea
                id="email-signature"
                value={settings.email_signature}
                onChange={(e) => handleChange('email_signature', e.target.value)}
                placeholder="Ex: Atenciosamente, Dr. Seu Nome - CRN: 12345"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="document-header">Cabeçalho de Documentos</Label>
                <Textarea
                  id="document-header"
                  value={settings.document_header}
                  onChange={(e) => handleChange('document_header', e.target.value)}
                  placeholder="Conteúdo para o cabeçalho de documentos PDF"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="document-footer">Rodapé de Documentos</Label>
                <Textarea
                  id="document-footer"
                  value={settings.document_footer}
                  onChange={(e) => handleChange('document_footer', e.target.value)}
                  placeholder="Conteúdo para o rodapé de documentos PDF"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão de salvamento */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Todas as Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CombinedSettingsForm;