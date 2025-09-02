-- ===============================================
-- SCHEMA PARA PLATAFORMA ELECTORAL PERÚ 2026
-- Base de datos: PostgreSQL (Supabase)
-- ===============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===============================================
-- 1. TABLA: political_parties
-- ===============================================
CREATE TABLE political_parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    acronym VARCHAR(10) NOT NULL UNIQUE,
    ideology VARCHAR(50),
    founding_date DATE,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    is_coalition BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 2. TABLA: categories
-- ===============================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50), -- Para iconos de UI (economy, health, education, etc.)
    color_hex VARCHAR(7), -- Color en hexadecimal para UI
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 3. TABLA: candidates
-- ===============================================
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    date_of_birth DATE NOT NULL,
    place_of_birth VARCHAR(100),
    photo_url TEXT,
    biography TEXT,
    profession VARCHAR(100),
    political_party_id INTEGER REFERENCES political_parties(id),
    position VARCHAR(20) DEFAULT 'president' CHECK (position IN ('president', 'vice_president_1', 'vice_president_2')),
    campaign_slogan VARCHAR(200),
    campaign_website TEXT,
    social_media JSONB, -- {twitter, facebook, instagram, tiktok, youtube}
    approval_rating DECIMAL(5,2) DEFAULT 0.00, -- Porcentaje de aprobación
    voting_intention DECIMAL(5,2) DEFAULT 0.00, -- Intención de voto
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_approval_rating CHECK (approval_rating >= 0 AND approval_rating <= 100),
    CONSTRAINT valid_voting_intention CHECK (voting_intention >= 0 AND voting_intention <= 100)
);

-- ===============================================
-- 4. TABLA: candidate_education
-- ===============================================
CREATE TABLE candidate_education (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    institution_name VARCHAR(200) NOT NULL,
    degree VARCHAR(150) NOT NULL,
    field_of_study VARCHAR(150),
    start_year INTEGER,
    end_year INTEGER,
    is_completed BOOLEAN DEFAULT TRUE,
    location VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_years CHECK (
        start_year IS NULL OR end_year IS NULL OR start_year <= end_year
    ),
    CONSTRAINT valid_year_range CHECK (
        start_year IS NULL OR (start_year >= 1950 AND start_year <= EXTRACT(YEAR FROM NOW()) + 10)
    )
);

-- ===============================================
-- 5. TABLA: candidate_experience
-- ===============================================
CREATE TABLE candidate_experience (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    position_title VARCHAR(150) NOT NULL,
    organization VARCHAR(200) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    location VARCHAR(100),
    description TEXT,
    experience_type VARCHAR(20) DEFAULT 'professional' CHECK (
        experience_type IN ('professional', 'political', 'academic', 'volunteer')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (
        start_date IS NULL OR end_date IS NULL OR start_date <= end_date
    )
);

-- ===============================================
-- 6. TABLA: proposals
-- ===============================================
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    title VARCHAR(300) NOT NULL,
    summary TEXT NOT NULL,
    detailed_description TEXT,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5), -- 1=highest, 5=lowest
    feasibility_score DECIMAL(3,2), -- Score de factibilidad (1.00 - 5.00)
    estimated_cost DECIMAL(15,2), -- Costo estimado en soles
    implementation_timeline VARCHAR(50), -- "immediate", "6_months", "1_year", "4_years"
    target_beneficiaries TEXT, -- Descripción de beneficiarios
    expected_impact TEXT,
    source_documents JSONB, -- Enlaces a documentos fuente
    tags TEXT[], -- Array de tags para búsqueda
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 7. TABLA: polls
-- ===============================================
CREATE TABLE polls (
    id SERIAL PRIMARY KEY,
    poll_name VARCHAR(200) NOT NULL,
    polling_company VARCHAR(150) NOT NULL,
    poll_date DATE NOT NULL,
    sample_size INTEGER,
    margin_of_error DECIMAL(4,2),
    methodology TEXT,
    poll_type VARCHAR(20) DEFAULT 'voting_intention' CHECK (
        poll_type IN ('voting_intention', 'approval', 'image', 'specific_topic')
    ),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 8. TABLA: poll_results
-- ===============================================
CREATE TABLE poll_results (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    percentage DECIMAL(5,2) NOT NULL,
    position INTEGER, -- Posición en el ranking
    notes TEXT,
    
    -- Constraints
    CONSTRAINT valid_percentage CHECK (percentage >= 0 AND percentage <= 100),
    CONSTRAINT unique_candidate_per_poll UNIQUE (poll_id, candidate_id)
);

-- ===============================================
-- 9. TABLA: campaign_events
-- ===============================================
CREATE TABLE campaign_events (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    event_title VARCHAR(200) NOT NULL,
    event_type VARCHAR(30) DEFAULT 'rally' CHECK (
        event_type IN ('rally', 'debate', 'interview', 'proposal_presentation', 'meeting', 'other')
    ),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200),
    description TEXT,
    attendees_count INTEGER,
    media_coverage_links JSONB, -- Enlaces a cobertura mediática
    photo_urls TEXT[], -- Array de URLs de fotos
    video_urls TEXT[], -- Array de URLs de videos
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 10. TABLA: news
-- ===============================================
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT,
    author VARCHAR(100),
    source VARCHAR(150),
    source_url TEXT,
    publication_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    candidate_ids INTEGER[], -- Array de IDs de candidatos mencionados
    category_ids INTEGER[], -- Array de IDs de categorías relacionadas
    tags TEXT[], -- Array de tags
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===============================================

-- Candidatos
CREATE INDEX idx_candidates_political_party ON candidates(political_party_id);
CREATE INDEX idx_candidates_active ON candidates(is_active);
CREATE INDEX idx_candidates_position ON candidates(position);
CREATE INDEX idx_candidates_full_name_trgm ON candidates USING gin(full_name gin_trgm_ops);

-- Propuestas
CREATE INDEX idx_proposals_candidate ON proposals(candidate_id);
CREATE INDEX idx_proposals_category ON proposals(category_id);
CREATE INDEX idx_proposals_published ON proposals(is_published);
CREATE INDEX idx_proposals_priority ON proposals(priority_level);
CREATE INDEX idx_proposals_tags ON proposals USING gin(tags);

-- Educación y experiencia
CREATE INDEX idx_candidate_education_candidate ON candidate_education(candidate_id);
CREATE INDEX idx_candidate_experience_candidate ON candidate_experience(candidate_id);
CREATE INDEX idx_candidate_experience_type ON candidate_experience(experience_type);

-- Encuestas
CREATE INDEX idx_polls_date ON polls(poll_date DESC);
CREATE INDEX idx_poll_results_poll ON poll_results(poll_id);
CREATE INDEX idx_poll_results_candidate ON poll_results(candidate_id);

-- Eventos
CREATE INDEX idx_campaign_events_candidate ON campaign_events(candidate_id);
CREATE INDEX idx_campaign_events_date ON campaign_events(event_date DESC);
CREATE INDEX idx_campaign_events_type ON campaign_events(event_type);

-- Noticias
CREATE INDEX idx_news_publication_date ON news(publication_date DESC);
CREATE INDEX idx_news_published ON news(is_published);
CREATE INDEX idx_news_featured ON news(is_featured);
CREATE INDEX idx_news_candidate_ids ON news USING gin(candidate_ids);
CREATE INDEX idx_news_tags ON news USING gin(tags);

-- ===============================================
-- TRIGGERS PARA UPDATED_AT
-- ===============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_political_parties_updated_at 
    BEFORE UPDATE ON political_parties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at 
    BEFORE UPDATE ON candidates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at 
    BEFORE UPDATE ON proposals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at 
    BEFORE UPDATE ON news 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- FUNCIONES ÚTILES
-- ===============================================

-- Función para calcular edad de candidato
CREATE OR REPLACE FUNCTION calculate_candidate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para buscar propuestas por texto
CREATE OR REPLACE FUNCTION search_proposals(search_term TEXT)
RETURNS TABLE (
    proposal_id INTEGER,
    candidate_name TEXT,
    title TEXT,
    summary TEXT,
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        c.full_name,
        p.title,
        p.summary,
        GREATEST(
            similarity(p.title, search_term),
            similarity(p.summary, search_term)
        ) as sim
    FROM proposals p
    JOIN candidates c ON p.candidate_id = c.id
    WHERE p.is_published = true
    AND (
        p.title ILIKE '%' || search_term || '%' 
        OR p.summary ILIKE '%' || search_term || '%'
        OR search_term = ANY(p.tags)
    )
    ORDER BY sim DESC, p.priority_level ASC;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- COMENTARIOS EN TABLAS
-- ===============================================

COMMENT ON TABLE political_parties IS 'Partidos políticos y coaliciones participantes en las elecciones';
COMMENT ON TABLE candidates IS 'Candidatos a presidente y vicepresidentes';
COMMENT ON TABLE proposals IS 'Propuestas de gobierno de los candidatos organizadas por categorías';
COMMENT ON TABLE polls IS 'Encuestas de opinión pública y intención de voto';
COMMENT ON TABLE campaign_events IS 'Eventos de campaña electoral de los candidatos';
COMMENT ON TABLE news IS 'Noticias y actualizaciones relacionadas con la campaña electoral';

-- ===============================================
-- VISTAS ÚTILES
-- ===============================================

-- Vista consolidada de candidatos con información de partido
CREATE VIEW v_candidates_complete AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.full_name,
    calculate_candidate_age(c.date_of_birth) as age,
    c.place_of_birth,
    c.photo_url,
    c.biography,
    c.profession,
    c.position,
    c.campaign_slogan,
    c.approval_rating,
    c.voting_intention,
    pp.name as party_name,
    pp.acronym as party_acronym,
    pp.ideology as party_ideology,
    pp.logo_url as party_logo_url,
    c.is_active,
    c.created_at
FROM candidates c
LEFT JOIN political_parties pp ON c.political_party_id = pp.id;

-- Vista de últimas encuestas por candidato
CREATE VIEW v_latest_poll_results AS
SELECT DISTINCT ON (pr.candidate_id)
    pr.candidate_id,
    c.full_name,
    pr.percentage,
    pr.position,
    p.poll_name,
    p.polling_company,
    p.poll_date
FROM poll_results pr
JOIN polls p ON pr.poll_id = p.id
JOIN candidates c ON pr.candidate_id = c.id
WHERE p.poll_type = 'voting_intention' 
AND p.is_published = true
ORDER BY pr.candidate_id, p.poll_date DESC;

-- ===============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ===============================================

-- Habilitar RLS en tablas sensibles
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública de candidatos activos
CREATE POLICY "Candidatos activos son públicos" ON candidates
    FOR SELECT TO public
    USING (is_active = true);

-- Política para lectura pública de propuestas publicadas
CREATE POLICY "Propuestas publicadas son públicas" ON proposals
    FOR SELECT TO public
    USING (is_published = true);

-- Política para lectura pública de noticias publicadas
CREATE POLICY "Noticias publicadas son públicas" ON news
    FOR SELECT TO public
    USING (is_published = true);