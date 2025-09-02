# Integración Frontend - Plataforma Electoral Perú 2026

## 📱 Ejemplos de Integración con Frontend

Esta guía muestra cómo integrar la API de candidatos con diferentes frameworks de frontend.

## 🔗 Base URL de la API

```
Desarrollo: http://localhost:4000/api
Producción: https://tu-dominio.com/api
```

## 📊 Endpoints Principales

### Candidatos
- `GET /candidates` - Lista todos los candidatos
- `GET /candidates/featured` - Candidatos principales
- `GET /candidates/:id` - Candidato específico
- `GET /candidates/search?query=:term` - Búsqueda de candidatos

### Propuestas
- `GET /proposals` - Todas las propuestas
- `GET /candidates/:id/proposals` - Propuestas por candidato

### Partidos Políticos
- `GET /political-parties` - Todos los partidos

## ⚛️ React.js

### 1. Hook personalizado para candidatos

```typescript
// hooks/useCandidates.ts
import { useState, useEffect } from 'react';

interface Candidate {
  id: number;
  full_name: string;
  photo_url: string;
  campaign_slogan: string;
  voting_intention: number;
  approval_rating: number;
  political_party: {
    name: string;
    acronym: string;
    logo_url: string;
  };
  age: number;
}

export const useCandidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('/api/candidates/featured');
        if (!response.ok) throw new Error('Error al cargar candidatos');
        const data = await response.json();
        setCandidates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  return { candidates, loading, error };
};
```

### 2. Componente de tarjeta de candidato

```tsx
// components/CandidateCard.tsx
import React from 'react';

interface CandidateCardProps {
  candidate: {
    id: number;
    full_name: string;
    photo_url: string;
    campaign_slogan: string;
    voting_intention: number;
    political_party: {
      name: string;
      acronym: string;
      logo_url: string;
    };
    age: number;
  };
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-4">
        <img
          src={candidate.photo_url || '/placeholder-avatar.png'}
          alt={candidate.full_name}
          className="w-16 h-16 rounded-full object-cover mr-4"
        />
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {candidate.full_name}
          </h3>
          <p className="text-sm text-gray-600">
            {candidate.political_party.name} ({candidate.political_party.acronym})
          </p>
          <p className="text-sm text-gray-500">{candidate.age} años</p>
        </div>
      </div>

      <p className="text-gray-700 mb-4 italic">
        "{candidate.campaign_slogan}"
      </p>

      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="text-blue-600 font-semibold">
            Intención de voto: {candidate.voting_intention}%
          </span>
        </div>
        <button
          onClick={() => window.location.href = `/candidatos/${candidate.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  );
};
```

### 3. Lista principal de candidatos

```tsx
// components/CandidatesList.tsx
import React from 'react';
import { useCandidates } from '../hooks/useCandidates';
import { CandidateCard } from './CandidateCard';

export const CandidatesList: React.FC = () => {
  const { candidates, loading, error } = useCandidates();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Candidatos Presidenciales 2026
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map(candidate => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
};
```

## 🖖 Vue.js

### 1. Composable para candidatos

```typescript
// composables/useCandidates.ts
import { ref, onMounted } from 'vue';

export function useCandidates() {
  const candidates = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const fetchCandidates = async () => {
    try {
      loading.value = true;
      const response = await fetch('/api/candidates/featured');
      
      if (!response.ok) {
        throw new Error('Error al cargar candidatos');
      }
      
      candidates.value = await response.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchCandidates();
  });

  return {
    candidates,
    loading,
    error,
    refetch: fetchCandidates
  };
}
```

### 2. Componente de candidato

```vue
<!-- components/CandidateCard.vue -->
<template>
  <div class="candidate-card">
    <div class="candidate-header">
      <img 
        :src="candidate.photo_url || '/placeholder-avatar.png'"
        :alt="candidate.full_name"
        class="candidate-photo"
      />
      <div class="candidate-info">
        <h3>{{ candidate.full_name }}</h3>
        <p class="party-name">
          {{ candidate.political_party.name }} ({{ candidate.political_party.acronym }})
        </p>
        <p class="age">{{ candidate.age }} años</p>
      </div>
    </div>

    <p class="slogan">"{{ candidate.campaign_slogan }}"</p>

    <div class="candidate-stats">
      <span class="voting-intention">
        Intención de voto: {{ candidate.voting_intention }}%
      </span>
      <button @click="viewDetails" class="btn-details">
        Ver Detalles
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  candidate: {
    id: number;
    full_name: string;
    photo_url: string;
    campaign_slogan: string;
    voting_intention: number;
    political_party: {
      name: string;
      acronym: string;
    };
    age: number;
  };
}

const props = defineProps<Props>();

const viewDetails = () => {
  // Vue Router navigation
  navigateTo(`/candidatos/${props.candidate.id}`);
};
</script>

<style scoped>
.candidate-card {
  @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow;
}

.candidate-header {
  @apply flex items-center mb-4;
}

.candidate-photo {
  @apply w-16 h-16 rounded-full object-cover mr-4;
}

.candidate-info h3 {
  @apply text-xl font-bold text-gray-900;
}

.party-name {
  @apply text-sm text-gray-600;
}

.age {
  @apply text-sm text-gray-500;
}

.slogan {
  @apply text-gray-700 mb-4 italic;
}

.candidate-stats {
  @apply flex justify-between items-center;
}

.voting-intention {
  @apply text-blue-600 font-semibold text-sm;
}

.btn-details {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors;
}
</style>
```

## 🅰️ Angular

### 1. Servicio de candidatos

```typescript
// services/candidates.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

export interface Candidate {
  id: number;
  full_name: string;
  photo_url: string;
  campaign_slogan: string;
  voting_intention: number;
  approval_rating: number;
  political_party: {
    name: string;
    acronym: string;
    logo_url: string;
  };
  age: number;
}

@Injectable({
  providedIn: 'root'
})
export class CandidatesService {
  private apiUrl = `${environment.apiUrl}/candidates`;
  private candidatesSubject = new BehaviorSubject<Candidate[]>([]);
  
  public candidates$ = this.candidatesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getFeaturedCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}/featured`);
  }

  getCandidateById(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
  }

  searchCandidates(query: string): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}/search`, {
      params: { query }
    });
  }

  loadFeaturedCandidates(): void {
    this.getFeaturedCandidates().subscribe(candidates => {
      this.candidatesSubject.next(candidates);
    });
  }
}
```

### 2. Componente de lista

```typescript
// components/candidates-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CandidatesService, Candidate } from '../services/candidates.service';

@Component({
  selector: 'app-candidates-list',
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8">
        Candidatos Presidenciales 2026
      </h1>

      <div *ngIf="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>

      <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-candidate-card 
          *ngFor="let candidate of candidates" 
          [candidate]="candidate"
          (viewDetails)="onViewDetails($event)">
        </app-candidate-card>
      </div>
    </div>
  `
})
export class CandidatesListComponent implements OnInit {
  candidates: Candidate[] = [];
  loading = true;
  error: string | null = null;

  constructor(private candidatesService: CandidatesService) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  private loadCandidates(): void {
    this.candidatesService.getFeaturedCandidates().subscribe({
      next: (candidates) => {
        this.candidates = candidates;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar candidatos';
        this.loading = false;
      }
    });
  }

  onViewDetails(candidateId: number): void {
    // Angular Router navigation
    this.router.navigate(['/candidatos', candidateId]);
  }
}
```

## 📱 JavaScript Vanilla

### Función para cargar candidatos

```javascript
// js/candidates.js
class CandidatesAPI {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async getFeaturedCandidates() {
    try {
      const response = await fetch(`${this.baseUrl}/candidates/featured`);
      if (!response.ok) throw new Error('Error al cargar candidatos');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async searchCandidates(query) {
    try {
      const url = new URL(`${this.baseUrl}/candidates/search`, window.location.origin);
      url.searchParams.append('query', query);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error en la búsqueda');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  renderCandidateCard(candidate) {
    return `
      <div class="candidate-card" data-id="${candidate.id}">
        <div class="candidate-header">
          <img src="${candidate.photo_url || '/placeholder-avatar.png'}" 
               alt="${candidate.full_name}" 
               class="candidate-photo">
          <div class="candidate-info">
            <h3>${candidate.full_name}</h3>
            <p class="party-name">${candidate.political_party.name} (${candidate.political_party.acronym})</p>
            <p class="age">${candidate.age} años</p>
          </div>
        </div>
        <p class="slogan">"${candidate.campaign_slogan}"</p>
        <div class="candidate-stats">
          <span class="voting-intention">Intención de voto: ${candidate.voting_intention}%</span>
          <button onclick="viewCandidateDetails(${candidate.id})" class="btn-details">
            Ver Detalles
          </button>
        </div>
      </div>
    `;
  }

  async loadAndRenderCandidates(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      container.innerHTML = '<div class="loading">Cargando candidatos...</div>';
      
      const candidates = await this.getFeaturedCandidates();
      
      container.innerHTML = candidates
        .map(candidate => this.renderCandidateCard(candidate))
        .join('');
        
    } catch (error) {
      container.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
  }
}

// Uso
const candidatesAPI = new CandidatesAPI();

// Cargar candidatos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  candidatesAPI.loadAndRenderCandidates('candidates-container');
});

// Función global para ver detalles
function viewCandidateDetails(candidateId) {
  window.location.href = `/candidatos/${candidateId}`;
}
```

## 🎨 CSS Base (Tailwind)

```css
/* Estilos base para las tarjetas de candidatos */
.candidate-card {
  @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer;
}

.candidate-header {
  @apply flex items-center mb-4;
}

.candidate-photo {
  @apply w-16 h-16 rounded-full object-cover mr-4;
}

.candidate-info h3 {
  @apply text-xl font-bold text-gray-900;
}

.party-name {
  @apply text-sm text-gray-600;
}

.age {
  @apply text-sm text-gray-500;
}

.slogan {
  @apply text-gray-700 mb-4 italic text-center;
}

.candidate-stats {
  @apply flex justify-between items-center;
}

.voting-intention {
  @apply text-blue-600 font-semibold text-sm;
}

.btn-details {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors;
}

.loading {
  @apply flex justify-center items-center py-12 text-gray-600;
}

.error {
  @apply bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded;
}
```

## 🔍 Búsqueda Avanzada

### Componente de búsqueda (React)

```tsx
// components/CandidateSearch.tsx
import React, { useState } from 'react';

interface SearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: SearchFilters) => void;
}

interface SearchFilters {
  party_id?: number;
  position?: string;
}

export const CandidateSearch: React.FC<SearchProps> = ({ onSearch, onFilter }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = () => {
    onSearch(query);
    onFilter(filters);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar candidatos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        
        <select
          value={filters.position || ''}
          onChange={(e) => setFilters({...filters, position: e.target.value || undefined})}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las posiciones</option>
          <option value="president">Presidente</option>
          <option value="vice_president_1">Vicepresidente 1</option>
          <option value="vice_president_2">Vicepresidente 2</option>
        </select>
        
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Buscar
        </button>
      </div>
    </div>
  );
};
```

## 📊 Gráficos y Estadísticas

### Componente de encuestas (Chart.js)

```tsx
// components/PollChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';

interface PollData {
  candidate_name: string;
  polls: Array<{
    date: string;
    percentage: number;
  }>;
}

interface PollChartProps {
  data: PollData[];
}

export const PollChart: React.FC<PollChartProps> = ({ data }) => {
  const chartData = {
    labels: data[0]?.polls.map(poll => poll.date) || [],
    datasets: data.map((candidate, index) => ({
      label: candidate.candidate_name,
      data: candidate.polls.map(poll => poll.percentage),
      borderColor: `hsl(${index * 360 / data.length}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 360 / data.length}, 70%, 50%, 0.1)`,
      tension: 0.1,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Evolución de Intención de Voto',
      },
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Line data={chartData} options={options} />
    </div>
  );
};
```

Esta documentación proporciona ejemplos prácticos de cómo integrar la API de candidatos con diferentes frameworks de frontend, incluyendo componentes reutilizables, manejo de estado, y características avanzadas como búsqueda y visualización de datos.