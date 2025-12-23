"use client"

import * as React from "react"
import { CommandDialog, CommandInput, CommandList, CommandItem } from "@/components/ui/command"
import { useDietEditorStore } from '@/stores/diet-editor-store'

interface NavigationCommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function NavigationCommandPalette({ isOpen, onClose }: NavigationCommandPaletteProps) {
  const { activeTab, setActiveTab } = useDietEditorStore()

  const navigationOptions = [
    { id: 'overview', label: 'Visão Geral', shortcut: 'Ctrl+1' },
    { id: 'context', label: 'Contexto', shortcut: 'Ctrl+2' },
    { id: 'analysis', label: 'Análise', shortcut: 'Ctrl+3' },
    { id: 'diet', label: 'Dieta', shortcut: 'Ctrl+4' },
    { id: 'anamnesis', label: 'Anamnese', shortcut: 'Ctrl+5' },
  ]

  const handleSelect = (tabId: string) => {
    setActiveTab(tabId === activeTab ? '' : tabId)
    onClose()
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        onClose();
      }

      if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const index = parseInt(e.key) - 1
        if (index >= 0 && index < navigationOptions.length) {
          handleSelect(navigationOptions[index].id)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, activeTab, onClose])

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder="Digite o nome da aba ou use atalhos (Ctrl+1-5) ou Esc para fechar..." />
      <CommandList>
        {navigationOptions.map((option) => (
          <CommandItem
            key={option.id}
            onSelect={() => handleSelect(option.id)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            <span className="text-xs text-muted-foreground">{option.shortcut}</span>
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  )
}