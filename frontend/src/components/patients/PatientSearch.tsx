import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, User, Calendar, Target } from "lucide-react"
import { Patient } from "@/services/patient-service"

interface PatientSearchProps {
  patients: Patient[]
  onPatientSelect: (patient: Patient) => void
  placeholder?: string
}

export function PatientSearch({ patients, onPatientSelect, placeholder = "Buscar paciente..." }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filteredPatients, setFilteredPatients] = React.useState<Patient[]>(patients)

  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(term) ||
        patient.email.toLowerCase().includes(term)
      )
      setFilteredPatients(filtered)
    }
  }, [searchTerm, patients])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
              onClick={() => onPatientSelect(patient)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.email}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>Nenhum paciente encontrado</p>
            <p className="text-sm">Tente usar outro termo de busca</p>
          </div>
        )}
      </div>
    </div>
  )
}