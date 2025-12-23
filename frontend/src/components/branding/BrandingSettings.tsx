'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Palette, Image as ImageIcon, User, Phone, MapPin, Mail } from 'lucide-react';
import api from '@/services/api';

interface BrandingSettings {
  id?: string;
  logo?: string;
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

const BrandingSettings = () => {
  const [branding, setBranding] = useState<BrandingSettings>({
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar configurações de branding do backend
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        setLoading(true);
        const response = await api.get('/branding/branding/me');
        setBranding(response.data);

        if (response.data.logo) {
          setLogoPreview(response.data.logo);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de branding:', error);
        // Criar configurações padrão se não existirem
        try {
          const response = await api.patch('/branding/branding/me', {
            primary_color: '#22c55e',
            secondary_color: '#059669'
          });
          setBranding(response.data);
          if (response.data.logo) {
            setLogoPreview(response.data.logo);
          }
        } catch (createError) {
          console.error('Erro ao criar configurações de branding:', createError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  // Manipular mudança de arquivo de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Salvar configurações de branding
  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Adicionar campos de texto
      Object.entries(branding).forEach(([key, value]) => {
        if (key !== 'logo' && key !== 'id') {
          formData.append(key, String(value));
        }
      });

      // Adicionar arquivo de logo se existir
      if (fileInputRef.current?.files?.[0]) {
        formData.append('logo', fileInputRef.current.files[0]);
      }

      const response = await api.patch('/branding/branding/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setBranding(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar configurações de branding:', error);
    }
  };

  // Manipular mudança em campos de texto
  const handleChange = (field: keyof BrandingSettings, value: string) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
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
              <label htmlFor="logo-upload" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Logo do Consultório
              </label>
              <div className="mt-2 flex items-center space-x-4">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Pré-visualização do logo"
                      className="w-24 h-24 object-contain rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => {
                        setLogoPreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
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
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="primary-color" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Cor Primária
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="primary-color"
                    type="color"
                    value={branding.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-12 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    value={branding.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondary-color" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Cor Secundária
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={branding.secondary_color}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="w-12 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    value={branding.secondary_color}
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
                <label htmlFor="business-name" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Nome Comercial
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="business-name"
                    value={branding.business_name}
                    onChange={(e) => handleChange('business_name', e.target.value)}
                    placeholder="Ex: Clínica NutriSaudável"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="crn-number" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Número do CRN
                  </label>
                  <Input
                    id="crn-number"
                    value={branding.crn_number}
                    onChange={(e) => handleChange('crn_number', e.target.value)}
                    placeholder="Ex: SP12345"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label htmlFor="license" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Licença Profissional
                  </label>
                  <Input
                    id="license"
                    value={branding.professional_license}
                    onChange={(e) => handleChange('professional_license', e.target.value)}
                    placeholder="Ex: Nutricionista"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Telefone
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={branding.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Endereço
                </label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={branding.address}
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
            <label htmlFor="email-signature" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Assinatura de E-mail
            </label>
            <Textarea
              id="email-signature"
              value={branding.email_signature}
              onChange={(e) => handleChange('email_signature', e.target.value)}
              placeholder="Ex: Atenciosamente, Dr. Seu Nome - CRN: 12345"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="document-header" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Cabeçalho de Documentos
              </label>
              <Textarea
                id="document-header"
                value={branding.document_header}
                onChange={(e) => handleChange('document_header', e.target.value)}
                placeholder="Conteúdo para o cabeçalho de documentos PDF"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="document-footer" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Rodapé de Documentos
              </label>
              <Textarea
                id="document-footer"
                value={branding.document_footer}
                onChange={(e) => handleChange('document_footer', e.target.value)}
                placeholder="Conteúdo para o rodapé de documentos PDF"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Botão de salvamento */}
        <div className="flex justify-end mt-6">
          <Button onClick={handleSave}>
            <Palette className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandingSettings;