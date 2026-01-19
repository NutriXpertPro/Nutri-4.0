"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout"
import { PatientCard, PatientCardSkeleton } from "@/components/patients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard"
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
import { Card } from "@/components/ui/card"
import {
    Search,
    UserPlus,
    Users,
    ChevronLeft,
    ChevronRight,
    Filter,
    LayoutGrid,
    List,
    Activity,
    TrendingUp,
    Calendar,
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
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 mb-8 px-1">
                <div>
                    <h1 className="text-h1 capitalize font-normal">Meus Pacientes</h1>
                    <p className="text-subtitle mt-1 flex items-center gap-2">
                        <Users className="h-4 w-4 text-amber-500" />
                        Gerencie sua base de clientes da elite
                    </p>
                </div>
                <Button className="h-12 px-8 rounded-2xl text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all gap-3" asChild>
                    <Link href="/patients/new">
                        <UserPlus className="h-4 w-4" />
                        Novo Paciente
                    </Link>
                </Button>
            </div>

            {/* Metrics Row - DESIGN SYSTEM CONSISTENCY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total de Pacientes"
                    value={isPatientsLoading ? "..." : (patients?.length || 0)}
                    icon={Users}
                    variant="theme"
                />
                <StatCard
                    title="Ativos"
                    value={isPatientsLoading ? "..." : (patients?.filter(p => p.status).length || 0)}
                    icon={Activity}
                    variant="green"
                    subtitle="Em tratamento"
                />
                <StatCard
                    title="Novos este Mês"
                    value={isPatientsLoading ? "..." : (patients?.filter(p => {
                        const date = new Date(p.created_at);
                        const today = new Date();
                        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
                    }).length || 0)}
                    icon={Calendar}
                    variant="amber"
                    subtitle="Crescimento"
                />
                <StatCard
                    title="Média de Adesão"
                    value={isPatientsLoading ? "..." : "0%"}
                    icon={TrendingUp}
                    variant="violet"
                    trend={{ value: 2, label: "vs mês ant.", isPositive: true }}
                />
            </div>

            {/* Filters Area */}
            <Card variant="glass" className="p-2 mb-8 border-none bg-background/40">
                <div className="flex flex-col md:flex-row gap-2">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Popover open={isSearchFocused && searchQuery.length > 0 && searchResults.length > 0} onOpenChange={setIsSearchFocused}>
                            <PopoverTrigger asChild>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="Pesquisar por nome ou e-mail..."
                                        value={searchQuery}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="pl-11 h-12 bg-transparent border-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground/40"
                                    />
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-1 bg-background/80 backdrop-blur-xl border-border/10 rounded-2xl shadow-2xl" align="start">
                                <Command className="bg-transparent">
                                    <CommandList>
                                        {searchResults.length === 0 && searchQuery.length > 1 ? (
                                            <CommandEmpty className="py-4 text-xs text-muted-foreground text-center">Nenhum paciente encontrado.</CommandEmpty>
                                        ) : null}
                                        <CommandGroup>
                                            {searchResults.map((patient) => (
                                                <CommandItem
                                                    key={patient.id}
                                                    onSelect={() => {
                                                        setSearchQuery(patient.name);
                                                        setIsSearchFocused(false);
                                                    }}
                                                    className="rounded-xl h-10 text-sm hover:bg-primary/10"
                                                >
                                                    <Users className="h-3.5 w-3.5 mr-2 opacity-40" />
                                                    {patient.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex items-center gap-2 px-2 border-l border-border/5">
                        {/* Sort */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-10 border-none bg-transparent hover:bg-muted/30 rounded-xl text-xs uppercase tracking-widest min-w-40 focus:ring-0">
                                <span className="opacity-40 mr-1 italic lowercase">sort:</span>
                                <SelectValue placeholder="Ordenar" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/10 shadow-2xl">
                                <SelectItem value="recent" className="rounded-xl text-xs">Mais Recentes</SelectItem>
                                <SelectItem value="name" className="rounded-xl text-xs">Nome (A-Z)</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Filter Status */}
                        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1) }}>
                            <SelectTrigger className="h-10 border-none bg-transparent hover:bg-muted/30 rounded-xl text-xs uppercase tracking-widest min-w-[130px] focus:ring-0">
                                <span className="opacity-40 mr-1 italic lowercase">status:</span>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/10 shadow-2xl">
                                <SelectItem value="all" className="rounded-xl text-xs">Todos</SelectItem>
                                <SelectItem value="active" className="rounded-xl text-xs">Ativos</SelectItem>
                                <SelectItem value="inactive" className="rounded-xl text-xs">Inativos</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="w-px h-6 bg-border/10 mx-1" />

                        {/* View Mode Toggle */}
                        <div className="flex bg-muted/20 rounded-xl p-1 gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewMode("grid")}
                                className={cn("h-8 w-8 rounded-lg transition-all", viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-transparent")}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewMode("list")}
                                className={cn("h-8 w-8 rounded-lg transition-all", viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-transparent")}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

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
                    <h3 className="text-lg mb-1">Nenhum paciente encontrado</h3>
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
                            patient={patient}
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
