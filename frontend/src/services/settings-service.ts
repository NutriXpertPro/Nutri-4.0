import api from './api';
import { UserProfile, UpdateUserProfile } from './user-service';

export interface BrandingSettings {
  id?: string;
  logo?: string | File | null;
  signature_image?: string | File | null;
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

export interface CombinedSettings {
  profile: UserProfile;
  branding: BrandingSettings;
}

export interface UpdateCombinedSettings {
  profile?: UpdateUserProfile;
  branding?: Partial<BrandingSettings>;
}

export const settingsService = {
  async getCombinedSettings(): Promise<CombinedSettings> {
    const [profileResponse, brandingResponse] = await Promise.all([
      api.get<UserProfile>('/users/me/'),
      api.get<BrandingSettings>('/branding/branding/me/')
    ]);

    return {
      profile: profileResponse.data,
      branding: brandingResponse.data
    };
  },

  async updateCombinedSettings(data: UpdateCombinedSettings): Promise<CombinedSettings> {
    const updatePromises = [];

    if (data.profile) {
      // Para atualizar o perfil, precisamos lidar com o upload de arquivos
      const profilePromise = this.updateProfileWithFiles(data.profile);
      updatePromises.push(profilePromise);
    } else {
      updatePromises.push(api.get<UserProfile>('/users/me/'));
    }

    if (data.branding) {
      // Para atualizar o branding, precisamos lidar com o upload de arquivos
      const brandingPromise = this.updateBrandingWithFiles(data.branding);
      updatePromises.push(brandingPromise);
    } else {
      updatePromises.push(api.get<BrandingSettings>('/branding/branding/me/'));
    }

    const [profileResponse, brandingResponse] = await Promise.all(updatePromises);

    return {
      profile: profileResponse.data,
      branding: brandingResponse.data
    };
  },

  async updateProfileWithFiles(data: UpdateUserProfile) {
    const formData = new FormData();
    let isFormData = false;

    if (data.profile_picture !== undefined) {
      isFormData = true;
      if (data.profile_picture === null) {
        formData.append('profile_picture', '');
      } else if (data.profile_picture instanceof File) {
        formData.append('profile_picture', data.profile_picture);
      }
    }

    if (isFormData) {
      if (data.name !== undefined) formData.append('name', data.name);
      if (data.professional_title !== undefined) formData.append('professional_title', data.professional_title === null ? '' : data.professional_title);
      if (data.gender !== undefined) formData.append('gender', data.gender === null ? '' : data.gender);
      if (data.settings) {
        formData.append('settings.theme', data.settings.theme || '');
        formData.append('settings.language', data.settings.language || '');
        formData.append('settings.notifications_email', String(data.settings.notifications_email));
        formData.append('settings.notifications_push', String(data.settings.notifications_push));
      }

      return api.patch('/users/me/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      return api.patch('/users/me/', data);
    }
  },

  async updateBrandingWithFiles(data: Partial<BrandingSettings>) {
    const formData = new FormData();

    // Adicionar campos de texto
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'logo' && key !== 'signature_image' && key !== 'id' && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Adicionar arquivo de logo se existir
    if (data.logo && typeof data.logo === 'object' && data.logo instanceof File) {
      formData.append('logo', data.logo);
    }

    // Adicionar arquivo de assinatura se existir
    if (data.signature_image && typeof data.signature_image === 'object' && data.signature_image instanceof File) {
      formData.append('signature_image', data.signature_image);
    }

    return api.patch('/branding/branding/me/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};