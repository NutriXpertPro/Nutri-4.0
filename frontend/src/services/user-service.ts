import api from "./api";

export interface UserProfile {
    id: number;
    email: string;
    name: string;
    user_type: string;
    professional_title?: string;
    gender?: string;
    profile_picture?: string | null;
    settings: {
        theme: string;
        language: string;
        notifications_email: boolean;
        notifications_push: boolean;
    };
    created_at: string;
}

export interface UpdateUserProfile {
    name?: string;
    professional_title?: string | null;
    gender?: string | null;
    profile_picture?: File | null;
    settings?: {
        theme?: string;
        language?: string;
        notifications_email?: boolean;
        notifications_push?: boolean;
    };
}

export const userService = {
    async getMyProfile(): Promise<UserProfile> {
        const response = await api.get<UserProfile>("/users/me/");
        return response.data;
    },

    async updateMyProfile(data: UpdateUserProfile): Promise<UserProfile> {
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

            const response = await api.patch<UserProfile>("/users/me/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } else {
            const response = await api.patch<UserProfile>("/users/me/", data);
            return response.data;
        }
    },
};

