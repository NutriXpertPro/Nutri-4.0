"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { PatientCard, PatientCardSkeleton } from "@/components/patients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Search,
    UserPlus,
    Users,
    ChevronLeft,
    ChevronRight,
    Filter,
    LayoutGrid,
    List,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { usePatients } from "@/hooks/usePatients"
import patientService from "@/services/patient-service"

export default function PatientsPage() {
    const router = useRouter()
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
    const { patients, isLoading: isPatientsLoading, error } = usePatients()

    const [searchQuery, setSearchQuery] = React.useState("")
    const [sortBy, setSortBy] = React.useState("recent")
    const [filterStatus, setFilterStatus] = React.useState("all")
    const [currentPage, setCurrentPage] = React.useState(1)
    const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
    const itemsPerPage = 6

    const [searchResults, setSearchResults] = React.useState<{ id: number; name: string }[]>([]);
    const [isSearchFocused, setIsSearchFocused] = React.useState(false);

    React.useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
            return;
        }

        const fetchResults = async () => {
            const results = await patientService.search(searchQuery);
            setSearchResults(results);
        };

        const debounceTimer = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);


    // Filtrar e ordenar pacientes
    const filteredPatients = React.useMemo(() => {
        if (!patients) return []

        let result = [...patients]

        // Busca
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.email.toLowerCase().includes(query)
            )
        }

        // Filtro de status
        if (filterStatus !== "all") {
            const isActive = filterStatus === "active"
            result = result.filter((p) => p.status === isActive)
        }

        // Ordenação
        if (sortBy === "recent") {
            result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        } else if (sortBy === "name") {
            result.sort((a, b) => a.name.localeCompare(b.name))
        }

        return result
    }, [patients, searchQuery, sortBy, filterStatus])

    // Paginação
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
    const paginatedPatients = filteredPatients.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Loading state - espera auth e dados
    if (isAuthLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }


    if (error) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-12 text-center text-destructive">
                    <p>Erro ao carregar pacientes.</p>
                    <p className="text-sm mt-2 font-mono bg-destructive/10 p-2 rounded">
                        {error instanceof Error ? error.message : JSON.stringify(error)}
                    </p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary" />
                        Meus Pacientes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {patients?.length || 0} pacientes cadastrados
                    </p>
                </div>
                <Button className="gap-2" asChild>
                    <Link href="/patients/new">
                        <UserPlus className="h-4 w-4" />
                        Novo Paciente
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="flex-1">
                  <Popover open={isSearchFocused && searchQuery.length > 0 && searchResults.length > 0} onOpenChange={setIsSearchFocused}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por nome..."
                          value={searchQuery}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)} // Delay blur to allow click
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="pl-9 w-full"
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandList>
                          {searchResults.length === 0 && searchQuery.length > 1 ? (
                            <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                          ) : null}
                          <CommandGroup>
                            {searchResults.map((patient) => (
                              <CommandItem
                                key={patient.id}
                                onSelect={() => {
                                  setSearchQuery(patient.name);
                                  setIsSearchFocused(false);
                                }}
                              >
                                {patient.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>


                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">Mais Recentes</SelectItem>
                        <SelectItem value="name">Nome (A-Z)</SelectItem>
                    </SelectContent>
                </Select>

                {/* Filter Status */}
                <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1) }}>
                    <SelectTrigger className="w-full md:w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border rounded-lg p-1 gap-1">
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon-sm"
                        onClick={() => setViewMode("grid")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon-sm"
                        onClick={() => setViewMode("list")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Results Info */}
            {searchQuery && (
                <div className="mb-4">
                    <Badge variant="secondary">
                        {filteredPatients.length} resultado(s) para "{searchQuery}"
                    </Badge>
                </div>
            )}

            {/* Patient Grid */}
            {isPatientsLoading ? (
                <div className={cn(
                    "grid gap-4",
                    viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                )}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <PatientCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">Nenhum paciente encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery
                            ? "Tente buscar por outro termo"
                            : "Cadastre seu primeiro paciente"}
                    </p>
                    <Button asChild>
                        <Link href="/patients/new">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Novo Paciente
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-4",
                    viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                )}>
                    {paginatedPatients.map((patient) => (
                        <PatientCard
                            key={patient.id}
                            patient={{
                                ...patient,
                                id: patient.id.toString(),
                                createdAt: patient.created_at,
                                status: patient.status ? 'active' : 'inactive',
                                progress: { value: 0, isPositive: true },
                                phone: patient.phone || '',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <Button
                                key={i}
                                variant={currentPage === i + 1 ? "default" : "outline"}
                                size="icon"
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </DashboardLayout>
    )
}
