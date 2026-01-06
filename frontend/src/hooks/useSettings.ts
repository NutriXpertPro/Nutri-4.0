import { useState, useEffect } from 'react'
import { settingsAPI } from '@/services/api'

interface Settings {
    notifications: {
        email: boolean
        push: boolean
        sms: boolean
        reminderTime: number // minutes before
        snooze: boolean
    }
    privacy: {
        shareProgress: boolean
        showInCommunity: boolean
    }
    theme: {
        color: string
        mode: 'light' | 'dark' | 'system'
    }
}

export function useSettings() {
    const [settings, setSettings] = useState<Settings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await settingsAPI.getSettings()
            setSettings(response.data)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar configurações')
            console.error('Error fetching settings:', err)
        } finally {
            setLoading(false)
        }
    }

    const updateSettings = async (data: Partial<Settings>) => {
        try {
            setSaving(true)
            const response = await settingsAPI.updateSettings(data)
            setSettings(response.data)
            setError(null)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao salvar configurações')
            console.error('Error updating settings:', err)
            throw err
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    return { settings, loading, error, saving, updateSettings, refetch: fetchSettings }
}
