-- ===============================================
-- DATOS SEMILLA PARA PLATAFORMA ELECTORAL PERÚ 2026
-- ===============================================

-- ===============================================
-- 1. PARTIDOS POLÍTICOS
-- ===============================================

INSERT INTO political_parties (name, acronym, ideology, founding_date, description, status) VALUES
('Fuerza Popular', 'FP', 'Derecha', '2010-12-29', 'Partido político de tendencia conservadora fundado por Keiko Fujimori', 'active'),
('Perú Libre', 'PL', 'Izquierda', '2016-10-10', 'Partido político de izquierda marxista-leninista', 'active'),
('Alianza para el Progreso', 'APP', 'Centro-derecha', '2001-11-01', 'Partido político regionalista de centro-derecha', 'active'),
('Acción Popular', 'AP', 'Centro', '1956-07-07', 'Partido político histórico de tendencia democrática y popular', 'active'),
('Renovación Popular', 'RP', 'Derecha', '2020-02-14', 'Partido político conservador de derecha', 'active'),
('Avanza País', 'AVP', 'Centro-derecha', '2020-10-15', 'Partido político liberal de centro-derecha', 'active'),
('Podemos Perú', 'PP', 'Centro', '2020-07-22', 'Partido político de centro con tendencia populista', 'active'),
('Juntos por el Perú', 'JP', 'Centro-izquierda', '2017-04-20', 'Partido de centro-izquierda progresista', 'active'),
('Somos Perú', 'SP', 'Centro', '1998-05-01', 'Partido político de centro democrático', 'active'),
('Partido Morado', 'PM', 'Centro', '2018-07-01', 'Partido político progresista de centro', 'active');

-- ===============================================
-- 2. CATEGORÍAS DE PROPUESTAS
-- ===============================================

INSERT INTO categories (name, description, icon_name, color_hex, order_index) VALUES
('Economía', 'Propuestas relacionadas con el crecimiento económico, empleo y desarrollo empresarial', 'economy', '#2E7D32', 1),
('Salud', 'Propuestas para mejorar el sistema de salud pública y privada', 'health', '#C62828', 2),
('Educación', 'Propuestas para reformar y mejorar el sistema educativo', 'education', '#1565C0', 3),
('Seguridad', 'Propuestas para combatir la delincuencia y mejorar la seguridad ciudadana', 'security', '#E65100', 4),
('Corrupción', 'Propuestas para combatir la corrupción y fortalecer las instituciones', 'anti-corruption', '#6A1B9A', 5),
('Medio Ambiente', 'Propuestas para proteger el medio ambiente y combatir el cambio climático', 'environment', '#2E7D32', 6),
('Infraestructura', 'Propuestas para mejorar la infraestructura del país', 'infrastructure', '#5D4037', 7),
('Derechos Humanos', 'Propuestas para proteger y promover los derechos humanos', 'human-rights', '#AD1457', 8),
('Agricultura', 'Propuestas para el desarrollo del sector agrícola', 'agriculture', '#689F38', 9),
('Tecnología', 'Propuestas para impulsar la transformación digital', 'technology', '#0277BD', 10);

-- ===============================================
-- 3. CANDIDATOS PRINCIPALES (Datos ficticios para ejemplo)
-- ===============================================

INSERT INTO candidates (first_name, last_name, date_of_birth, place_of_birth, biography, profession, political_party_id, position, campaign_slogan, approval_rating, voting_intention) VALUES
('Keiko', 'Fujimori', '1975-05-25', 'Lima', 'Política peruana, lideresa de Fuerza Popular. Hija del expresidente Alberto Fujimori.', 'Administradora', 1, 'president', 'Fuerza y corazón por el Perú', 25.50, 22.30),
('Pedro', 'Castillo', '1969-10-19', 'Cajamarca', 'Profesor y político peruano, expresidente del Perú entre 2021 y 2022.', 'Profesor', 2, 'president', 'No más pobres en un país rico', 15.20, 12.80),
('César', 'Acuña', '1952-11-11', 'Trujillo', 'Empresario y político peruano, fundador de la Universidad César Vallejo.', 'Empresario', 3, 'president', 'Progreso para todos', 18.30, 16.70),
('Yonhy', 'Lescano', '1956-08-07', 'Lima', 'Periodista y político peruano, excongresista y candidato presidencial.', 'Periodista', 4, 'president', 'La honestidad como política de Estado', 12.40, 10.90),
('Rafael', 'López Aliaga', '1961-02-11', 'Lima', 'Empresario y político peruano, alcalde de Lima.', 'Empresario', 5, 'president', 'Orden, trabajo y progreso', 20.10, 18.50),
('Hernando', 'de Soto', '1941-06-02', 'Arequipa', 'Economista peruano, reconocido internacionalmente por sus trabajos sobre economía informal.', 'Economista', 6, 'president', 'El capitalismo popular', 14.60, 13.20);

-- ===============================================
-- 4. EDUCACIÓN DE CANDIDATOS (Ejemplos)
-- ===============================================

INSERT INTO candidate_education (candidate_id, institution_name, degree, field_of_study, start_year, end_year, location) VALUES
(1, 'Universidad de Boston', 'Bachiller', 'Administración de Empresas', 1994, 1998, 'Boston, Estados Unidos'),
(1, 'Columbia University', 'Maestría', 'Administración Pública', 1999, 2001, 'Nueva York, Estados Unidos'),
(2, 'Universidad Nacional Pedro Ruiz Gallo', 'Bachiller', 'Educación Primaria', 1988, 1994, 'Lambayeque, Perú'),
(3, 'Universidad Nacional de Trujillo', 'Bachiller', 'Educación', 1971, 1975, 'Trujillo, Perú'),
(3, 'Universidad Nacional de Trujillo', 'Doctor', 'Educación', 1995, 1998, 'Trujillo, Perú'),
(4, 'Universidad Nacional Mayor de San Marcos', 'Bachiller', 'Ciencias de la Comunicación', 1975, 1980, 'Lima, Perú'),
(5, 'Universidad del Pacífico', 'Bachiller', 'Administración', 1980, 1984, 'Lima, Perú'),
(6, 'Universidad Nacional Mayor de San Marcos', 'Bachiller', 'Economía', 1960, 1965, 'Lima, Perú'),
(6, 'Graduate Institute of International Studies', 'PhD', 'Economía Internacional', 1967, 1971, 'Ginebra, Suiza');

-- ===============================================
-- 5. EXPERIENCIA LABORAL (Ejemplos)
-- ===============================================

INSERT INTO candidate_experience (candidate_id, position_title, organization, start_date, end_date, experience_type, description) VALUES
(1, 'Congresista', 'Congreso de la República', '2006-07-28', '2011-07-27', 'political', 'Representante por Lima'),
(1, 'Primera Dama', 'Presidencia de la República', '1994-07-28', '2000-11-20', 'political', 'Primera Dama durante el gobierno de Alberto Fujimori'),
(2, 'Profesor de Primaria', 'Escuela Rural de Cajamarca', '1995-03-01', '2017-12-31', 'professional', 'Docente en escuela rural'),
(2, 'Presidente de Rondas Campesinas', 'FENOC', '2005-01-01', '2017-12-31', 'volunteer', 'Líder de organizaciones campesinas'),
(3, 'Alcalde de Trujillo', 'Municipalidad de Trujillo', '2007-01-01', '2014-12-31', 'political', 'Alcalde de la ciudad de Trujillo'),
(3, 'Gobernador Regional', 'Gobierno Regional La Libertad', '2015-01-01', '2018-12-31', 'political', 'Gobernador Regional de La Libertad'),
(4, 'Periodista', 'Willax Televisión', '2018-01-01', '2021-12-31', 'professional', 'Conductor de programa de noticias'),
(4, 'Congresista', 'Congreso de la República', '2020-07-28', '2021-07-27', 'political', 'Representante por Lima'),
(5, 'Alcalde de Lima', 'Municipalidad de Lima', '2023-01-01', NULL, 'political', 'Alcalde actual de Lima Metropolitana'),
(6, 'Presidente del ILD', 'Instituto Libertad y Democracia', '1981-01-01', NULL, 'professional', 'Fundador y presidente del think tank');

-- ===============================================
-- 6. PROPUESTAS DE CANDIDATOS (Ejemplos)
-- ===============================================

INSERT INTO proposals (candidate_id, category_id, title, summary, detailed_description, priority_level, implementation_timeline, target_beneficiaries) VALUES
(1, 1, 'Reactivación Económica Post-Pandemia', 'Plan integral para reactivar la economía peruana mediante incentivos empresariales y generación de empleo.', 'Implementación de medidas tributarias que incentiven la inversión privada, creación de zonas económicas especiales y programas de formalización empresarial.', 1, '6_months', 'Empresarios, trabajadores, emprendedores'),
(1, 2, 'Fortalecimiento del Sistema de Salud', 'Modernización del sistema de salud pública con infraestructura y tecnología de punta.', 'Construcción de nuevos hospitales, implementación de telemedicina y capacitación del personal médico.', 2, '4_years', 'Toda la población peruana'),
(2, 3, 'Educación Gratuita y de Calidad', 'Garantizar educación pública gratuita desde inicial hasta universidad.', 'Incremento del presupuesto educativo al 6% del PBI, construcción de colegios y universidades públicas.', 1, '4_years', 'Estudiantes de todos los niveles'),
(2, 1, 'Economía Popular y Solidaria', 'Fortalecimiento de la economía popular mediante cooperativas y empresas sociales.', 'Creación de banco de desarrollo para microempresarios y formalización del sector informal.', 2, '1_year', 'Microempresarios, trabajadores informales'),
(3, 7, 'Infraestructura para el Desarrollo', 'Programa masivo de construcción de carreteras, puentes y obras de irrigación.', 'Inversión en infraestructura que conecte las regiones y facilite el desarrollo económico.', 1, '4_years', 'Población rural, empresarios, transportistas'),
(4, 5, 'Lucha Frontal Contra la Corrupción', 'Implementación de mecanismos anticorrupción y fortalecimiento de instituciones.', 'Creación de fiscalías especializadas y sistema de inteligencia anticorrupción.', 1, 'immediate', 'Toda la ciudadanía'),
(5, 4, 'Mano Dura Contra la Delincuencia', 'Plan integral de seguridad ciudadana con mayor presencia policial.', 'Aumento del presupuesto policial, construcción de comisarías y sistema de videovigilancia.', 1, '1_year', 'Ciudadanos en zonas urbanas'),
(6, 1, 'El Otro Sendero Económico', 'Formalización masiva de la economía informal mediante simplificación de trámites.', 'Reducción de barreras burocráticas y costos de formalización para microempresarios.', 1, '6_months', 'Emprendedores informales, microempresarios');

-- ===============================================
-- 7. ENCUESTAS (Datos de ejemplo)
-- ===============================================

INSERT INTO polls (poll_name, polling_company, poll_date, sample_size, margin_of_error, methodology, poll_type) VALUES
('Encuesta Nacional de Intención de Voto - Enero 2024', 'Ipsos Perú', '2024-01-15', 1200, 2.8, 'Encuesta telefónica y presencial en 24 departamentos', 'voting_intention'),
('Pulso Perú - Febrero 2024', 'GfK', '2024-02-10', 1500, 2.5, 'Encuesta online y presencial', 'voting_intention'),
('Estudio de Opinión - Marzo 2024', 'CPI', '2024-03-05', 1000, 3.1, 'Encuesta presencial en viviendas', 'approval'),
('Barómetro Electoral - Abril 2024', 'Datum', '2024-04-20', 1300, 2.7, 'Encuesta telefónica nacional', 'voting_intention');

-- ===============================================
-- 8. RESULTADOS DE ENCUESTAS
-- ===============================================

INSERT INTO poll_results (poll_id, candidate_id, percentage, position) VALUES
-- Encuesta Ipsos Enero 2024
(1, 1, 22.3, 1),
(1, 5, 18.5, 2),
(1, 3, 16.7, 3),
(1, 6, 13.2, 4),
(1, 2, 12.8, 5),
(1, 4, 10.9, 6),

-- Encuesta GfK Febrero 2024
(2, 1, 24.1, 1),
(2, 5, 19.8, 2),
(2, 3, 15.9, 3),
(2, 6, 14.7, 4),
(2, 2, 11.5, 5),
(2, 4, 9.8, 6),

-- Encuesta CPI Marzo 2024 (Aprobación)
(3, 1, 25.5, 1),
(3, 5, 20.1, 2),
(3, 3, 18.3, 3),
(3, 6, 14.6, 4),
(3, 2, 15.2, 5),
(3, 4, 12.4, 6);

-- ===============================================
-- 9. EVENTOS DE CAMPAÑA
-- ===============================================

INSERT INTO campaign_events (candidate_id, event_title, event_type, event_date, location, description, attendees_count) VALUES
(1, 'Lanzamiento de Campaña', 'rally', '2024-01-10 19:00:00-05', 'Lima, Plaza San Martín', 'Evento de lanzamiento oficial de campaña presidencial', 15000),
(2, 'Encuentro con Maestros', 'meeting', '2024-01-15 16:00:00-05', 'Cusco, Auditorio Municipal', 'Reunión con gremio de profesores para presentar propuestas educativas', 800),
(3, 'Foro Empresarial del Norte', 'proposal_presentation', '2024-01-20 09:00:00-05', 'Trujillo, Centro de Convenciones', 'Presentación de propuestas económicas ante empresarios del norte', 300),
(4, 'Debate sobre Transparencia', 'debate', '2024-01-25 20:00:00-05', 'Lima, Universidad del Pacífico', 'Debate sobre transparencia y lucha anticorrupción', 500),
(5, 'Marcha por la Seguridad', 'rally', '2024-02-01 17:00:00-05', 'Lima, Av. Abancay', 'Marcha ciudadana por la seguridad y el orden', 8000),
(6, 'Conferencia Magistral: Economía Informal', 'proposal_presentation', '2024-02-05 14:00:00-05', 'Arequipa, UNSA', 'Conferencia sobre formalización de la economía', 400);

-- ===============================================
-- 10. NOTICIAS (Ejemplos)
-- ===============================================

INSERT INTO news (title, summary, content, author, source, publication_date, candidate_ids, category_ids, tags, is_featured) VALUES
('Keiko Fujimori presenta su plan económico', 'La candidata de Fuerza Popular detalló sus propuestas para reactivar la economía nacional', 'En un evento realizado en Lima, Keiko Fujimori presentó su plan económico que incluye incentivos tributarios y programas de formalización empresarial...', 'Juan Pérez', 'El Comercio', '2024-01-11 08:00:00-05', ARRAY[1], ARRAY[1], ARRAY['economia', 'propuestas', 'fujimori'], true),
('Pedro Castillo se reúne con dirigentes campesinos', 'El candidato de Perú Libre sostuvo encuentros con líderes de organizaciones rurales', 'Pedro Castillo mantuvo una serie de reuniones con dirigentes campesinos para discutir políticas agrarias...', 'María García', 'La República', '2024-01-16 14:30:00-05', ARRAY[2], ARRAY[9], ARRAY['agricultura', 'castillo', 'campesinos'], false),
('Nueva encuesta muestra empate técnico entre candidatos', 'Los últimos sondeos revelan una competencia reñida entre los principales postulantes', 'Según la encuesta de Ipsos, existe un empate técnico entre los tres primeros candidatos...', 'Carlos López', 'RPP Noticias', '2024-01-16 18:00:00-05', ARRAY[1,2,3,5], ARRAY[], ARRAY['encuestas', 'intencion-voto'], true),
('César Acuña anuncia inversión en infraestructura regional', 'El candidato de APP prometió obras por 50 mil millones de soles', 'Durante su visita a Trujillo, César Acuña anunció un ambicioso plan de infraestructura...', 'Ana Rodríguez', 'Gestión', '2024-01-21 10:15:00-05', ARRAY[3], ARRAY[7], ARRAY['infraestructura', 'acuña', 'inversion'], false);

-- ===============================================
-- ACTUALIZACIÓN DE ESTADÍSTICAS
-- ===============================================

-- Actualizar estadísticas de tablas para optimizar consultas
ANALYZE political_parties;
ANALYZE candidates;
ANALYZE proposals;
ANALYZE polls;
ANALYZE poll_results;
ANALYZE campaign_events;
ANALYZE news;

-- ===============================================
-- VERIFICACIÓN DE DATOS
-- ===============================================

-- Mostrar resumen de datos insertados
SELECT 'Partidos Políticos' as tabla, COUNT(*) as registros FROM political_parties
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categories
UNION ALL
SELECT 'Candidatos', COUNT(*) FROM candidates
UNION ALL
SELECT 'Educación Candidatos', COUNT(*) FROM candidate_education
UNION ALL
SELECT 'Experiencia Candidatos', COUNT(*) FROM candidate_experience
UNION ALL
SELECT 'Propuestas', COUNT(*) FROM proposals
UNION ALL
SELECT 'Encuestas', COUNT(*) FROM polls
UNION ALL
SELECT 'Resultados Encuestas', COUNT(*) FROM poll_results
UNION ALL
SELECT 'Eventos de Campaña', COUNT(*) FROM campaign_events
UNION ALL
SELECT 'Noticias', COUNT(*) FROM news;