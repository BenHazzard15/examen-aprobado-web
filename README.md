# Examen Aprobado - Rediseño Web Ultra Profesional

Sitio web oficial modernizado de **Examen Aprobado** (`https://examen-aprobado.com/`), Escuela de Derecho líder en preparación para exámenes de grado y pregrado (Derecho Civil y Procesal).

Reconstruido desde cero con arquitectura frontend limpia (HTML5 semántico, CSS moderno con variables y glassmorphism, y JavaScript modular vanilla sin dependencias pesadas).

---

## 🚀 Cómo Ejecutar Localmente

Puedes iniciar el proyecto con cualquiera de los siguientes métodos rápidos:

### Opción 1: Con Node.js / npx (Recomendado)
```bash
npm start
# o directamente:
npx serve .
```

### Opción 2: Con Python (Sin instalar nada extra)
```bash
python -m http.server 3000
```
Luego abre tu navegador en: [http://localhost:3000](http://localhost:3000)

### Opción 3: Con VSCode / Antigravity IDE Live Server
Haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.

---

## 📁 Estructura del Proyecto

```text
Examen-Aprobado-web/
├── css/
│   └── styles.css           # Sistema de diseño completo (paleta, tipografía, glassmorphism, responsive)
├── js/
│   └── main.js              # Controlador interactivo (nav sticky, menú móvil, tabs, lightbox, forms, WhatsApp)
├── images/                  # 23 activos originales extraídos en alta resolución
│   ├── logo.jpg             # Logotipo oficial circular de Examen Aprobado
│   ├── hero.jpg             # Fotografía principal de cátedra / código
│   ├── interrogador.jpg     # Fotografía docente / interrogación
│   ├── clases-grabadas.png  # Fotografía de clase online (Google Meet)
│   ├── clases-particulares.png # Fotografía de sesión particular presencial
│   ├── interrogaciones.jpg  # Fotografía de mesa de interrogación de grado
│   ├── graduados-exito-1.png # Alumnos celebrando aprobación de grado
│   ├── graduados-exito-2.png # Graduados con distinción
│   ├── cafe-alumnos.jpg     # Docente Samuel Madrid con alumna (taza EA)
│   ├── estudio-campus.jpg   # Alumnas estudiando Código Civil en campus
│   ├── apunte-civil.png     # Cuaderno de apuntes Derecho Civil I
│   └── ... (más capturas y fotos reales)
├── index.html               # Estructura semántica HTML5 con SEO y accesibilidad
├── package.json             # Scripts de ejecución local
└── README.md                # Documentación del proyecto
```

---

## ✨ Mejoras de UI/UX Implementadas

1. **Identidad de Marca 100% Fiel**:
   - Respeto estricto a los colores institucionales: Azul Marino Profundo (`#0a1120` / `#0f1a2e`) y Tono Arena Dorada original (`#dfc8ac`).
   - Uso del logotipo original y todas las fotografías reales de la academia.
   - Textos, copys y tono pedagógico exactos preservados con corrección ortográfica y jerarquía mejorada.

2. **Header Superior Sticky con Glassmorphism**:
   - Efecto `backdrop-filter: blur(16px)` que se adapta dinámicamente al scroll.
   - Navegación clara con indicador activo (*ScrollSpy*).
   - Menú móvil accesible tipo *drawer* con animación fluida y soporte para botón escape.

3. **Experiencia Mobile-First Real**:
   - Áreas táctiles cómodas (mínimo 44px - 48px).
   - Sin desbordamientos horizontales (`overflow-x: hidden`).
   - Escala tipográfica armónica ('Playfair Display' + 'Outfit').

4. **Componentes Interactivos Modernos**:
   - **Galería Dinámica**: Filtro por categorías ("Todos", "Graduados Exitosos", "Interrogaciones & Clases", "Comunidad") + Lightbox modal al hacer clic en cualquier foto.
   - **Métricas y Barra de Confianza**: Indicadores clave de impacto visual.
   - **Formularios con Enlace a WhatsApp**: Reserva de cupos y contacto con redirección instantánea y mensaje predefinido para maximizar la conversión.
   - **Botón Flotante Pulsante de WhatsApp**: Acceso rápido con un toque desde cualquier dispositivo.
   - **Banner de Cookies**: Idéntico al original, con persistencia en `localStorage`.
   - **Mapa Interactivo**: Ubicación exacta en Av. Las Condes 10.465, oficina 731.
