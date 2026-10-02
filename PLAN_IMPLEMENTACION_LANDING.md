# PLAN DE IMPLEMENTACIÓN TÉCNICA: LANDING PAGE VENDO
**Objetivo:** Replicar con fidelidad 1:1 el mockup base de landing page (`Vendo Estilo/Pagina base/VENDO _ Mockup de landing.html`), incorporar el favicon con bordes redondeados a partir de `Vendo Estilo/RESOURSES 300ppi/LOGO ICON LIGHT GREENRecurso 22.jpg`, y validar visualmente con Playwright MCP.

**Ejecutor:** Agente OpenCode (Nemotron 3 Ultra)  
**Planificador & Arquitecto:** Gemini / Antigravity

---

## 1. Identidad de Marca y Sistema de Diseño (Design Tokens)

### 1.1 Paleta de Color Oficial
*   `--ink` (Fondo principal / Dominante 60%): `#01110a`
*   `--forest` (Secundario / Bloques de contraste 30%): `#01442c`
*   `--lime` (Acento / CTA y destacados 10%): `#cef17b`
*   `--cream` (Tipografía principal / Fondo de tarjeta): `#f8ffe6`
*   `--mut` (Texto secundario / Atenuado): `#a9c2a0`

### 1.2 Tipografía
*   **Titulares, botones y llamadas (`h1, h2, h3, .btn`):**  
    `"Fredoka", "Trebuchet MS", sans-serif; font-weight: 600; line-height: 1.05;`  
    *(Nota: Reemplazo web óptimo para la fuente corporativa Berlin Sans FB).*
*   **Cuerpo y textos técnicos (`body, p, small, footer`):**  
    `"Space Mono", ui-monospace, monospace; font-weight: 400; line-height: 1.55; font-size: 17px;`  
    *(Nota: Reemplazo web óptimo para la fuente corporativa OCR-B 10 BT).*
*   **Importación Google Fonts:**
    ```html
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Space+Mono:wght@400;700&display=swap">
    ```

---

## 2. Estructura de Directorios y Archivos

OpenCode debe estructurar el proyecto en la raíz de `/home/joel/Proyectos/Vendo/`:

```text
/home/joel/Proyectos/Vendo/
├── assets/
│   ├── favicon-16x16.png         <-- Generado desde Recurso 22.jpg (bordes redondeados)
│   ├── favicon-32x32.png         <-- Generado desde Recurso 22.jpg (bordes redondeados)
│   ├── apple-touch-icon.png      <-- Generado 180x180 (bordes redondeados)
│   ├── favicon.ico               <-- Multi-tamaño ICO
│   ├── logo-light-green.svg      <-- Copiado desde Vendo Estilo/SVG/LOGOTIPO LIGHT GREEN.svg
│   └── pet-do.svg                <-- Copiado desde Vendo Estilo/SVG/PET DO - VENDO.svg
├── index.html                    <-- Landing page principal completa y optimizada
└── PLAN_IMPLEMENTACION_LANDING.md
```

---

## 3. Fase 1: Generación y Configuración del Favicon

### 3.1 Requisito
*   **Origen:** `Vendo Estilo/RESOURSES 300ppi/LOGO ICON LIGHT GREENRecurso 22.jpg` (imagen cuadrada 1310x1310 con fondo verde oscuro `#01442c` y el isotipo verde lima `#cef17b`).
*   **Acabado:** Cuadrado con esquinas redondeadas suavizadas (*squircle* / radio ~20-22%), fondo exterior transparente (formato PNG con canal alfa RGBA) para que se vea moderno y limpio en las pestañas del navegador.

### 3.2 Script de Transformación (Python + Pillow)
OpenCode debe ejecutar el siguiente script para generar los iconos en `assets/`:

```python
import os
from PIL import Image, ImageDraw

source_path = "Vendo Estilo/RESOURSES 300ppi/LOGO ICON LIGHT GREENRecurso 22.jpg"
assets_dir = "assets"
os.makedirs(assets_dir, exist_ok=True)

# Cargar imagen original
img = Image.open(source_path).convert("RGBA")
w, h = img.size

# Crear máscara de bordes redondeados con super-muestreo (antialiasing de alta calidad)
scale = 2
mask_size = (w * scale, h * scale)
mask = Image.new("L", mask_size, 0)
draw = ImageDraw.Draw(mask)

# Radio de curvatura (~20% del ancho)
corner_radius = int(w * scale * 0.22)
draw.rounded_rectangle([(0, 0), mask_size], radius=corner_radius, fill=255)

# Redimensionar máscara al tamaño original suavizando bordes
mask = mask.resize((w, h), Image.Resampling.LANCZOS)

# Aplicar la máscara a la imagen
output_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
output_img.paste(img, (0, 0), mask=mask)

# Exportar variantes
output_img.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(assets_dir, "favicon-16x16.png"))
output_img.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(assets_dir, "favicon-32x32.png"))
output_img.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(assets_dir, "apple-touch-icon.png"))
output_img.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(assets_dir, "android-chrome-192x192.png"))
output_img.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(assets_dir, "android-chrome-512x512.png"))

# Generar ICO multi-tamaño
output_img.save(
    os.path.join(assets_dir, "favicon.ico"),
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)
print("✅ Favicons generados exitosamente en assets/")
```

### 3.3 Etiquetas HTML requeridas en `<head>`
```html
<link rel="icon" type="image/x-icon" href="assets/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
```

---

## 4. Fase 2: Configuración de Recursos Vectoriales (Logotipo y Mascota Do)

OpenCode debe copiar los SVGs oficiales a la carpeta `assets/` para mantener una arquitectura limpia y desacoplada de cadenas base64 gigantes (aunque se pueden mantener inline o como archivos SVG limpios referenciados):
1. Copiar `Vendo Estilo/SVG/LOGOTIPO LIGHT GREEN.svg` -> `assets/logo-light-green.svg`
2. Copiar `Vendo Estilo/SVG/PET DO - VENDO.svg` -> `assets/pet-do.svg`

*(Nota: En el CSS, la variable `--logo` puede apuntar a `url("assets/logo-light-green.svg")`, o bien conservar el Data-URI para carga instantánea de 0 latencia).*

---

## 5. Fase 3: Construcción de `index.html`

El archivo `index.html` debe replicar exactamente la estructura semántica, diseño visual y micro-interacciones del mockup base.

### 5.1 Especificación de Secciones:

1. **Header / Navbar (`<nav>` dentro de `.wrap`):**
   * Enlace con clase `.logo` (aspect-ratio: 3.06, height: 34px).
   * Botón secundario `.btn.ghost` con texto `"Escríbenos"` que dirija a `#contacto`.
2. **Hero Section (`<header class="hero">`):**
   * Columna izquierda:
     * `<h1>`: `"Que tu negocio se encuentre, se vea y venda."`
     * `<p>`: `"Páginas web y Google Maps optimizado para comercios de Valencia, Carabobo. Sin promesas infladas: trabajo claro y resultados que puedes comprobar."`
     * Contenedor `.cta`:
       * Botón primario `.btn`: `"Hablar por WhatsApp"` (enlace a WhatsApp o `#contacto`).
       * Botón fantasma `.btn.ghost`: `"Ver servicios"` (enlace ancla `#servicios`).
   * Columna derecha (`.do`):
     * Bocadillo de diálogo `.bub`: `"Soy Do. Te ayudo a optimizar tu marca."`
     * Imagen de Do (`assets/pet-do.svg` o SVG inline) con `alt="Do, la mascota de VENDO"`.
3. **Sección Google Maps (`<section class="maps">`):**
   * Fondo verde bosque `var(--forest)` (`#01442c`).
   * Columna izquierda:
     * `<h2>`: `"Aparece cuando te buscan en Google Maps."`
     * `<p>`: `"Creamos, verificamos y ordenamos tu Perfil de Empresa: horarios, fotos, catálogo, botón de WhatsApp y respuestas a tus clientes. Las reseñas se piden a clientes reales, nunca se inventan."`
   * Columna derecha (`.card`):
     * Tarjeta fondo crema `var(--cream)` (`#f8ffe6`), borde con sombra lima translúcida (`box-shadow: 0 0 0 6px rgba(206,241,123,.25)`).
     * Elemento `.pin`: Gradiente lineal simulando mapa, con pseudo-elemento `:after` formando el pin de ubicación geométrico.
     * `<h3>`: `"Tu negocio"`
     * `<small>`: `"Ejemplo de perfil optimizado · Valencia, Carabobo"`
     * Pills de acciones (`.acts`): `"Llamar"`, `"WhatsApp"`, `"Cómo llegar"`, `"Sitio web"`.
4. **Sección Servicios (`<section class="svc" id="servicios">`):**
   * `<h2>`: `"Lo que hacemos por tu negocio"`
   * Grid de filas divisorias (`.row` con borde superior `2px solid var(--forest)`):
     * **Fila 1:** `<h3>Páginas web</h3>` / `<p>Sitio rápido y pensado para el celular, con tu catálogo, tus datos de contacto y un botón directo a WhatsApp.</p>`
     * **Fila 2:** `<h3>Google Maps</h3>` / `<p>Perfil de Empresa creado, verificado y optimizado para que los vecinos y visitantes te encuentren primero.</p>`
     * **Fila 3:** `<h3>Marketing local</h3>` / `<p>Reseñas reales, WhatsApp Business, catálogos digitales y embudos de venta simples. También te ayudamos a vender en Yummy cuando aplica.</p>`
5. **Franja CTA Final (`<section class="band" id="contacto">`):**
   * Fondo verde lima `var(--lime)` (`#cef17b`) y texto oscuro `var(--ink)`.
   * `<h2>`: `"Cuéntanos de tu negocio y armamos tu plan."`
   * Botón inverso `.btn`: Fondo `var(--ink)`, texto `var(--lime)`: `"Escribir por WhatsApp"`.
6. **Footer (`<footer>`):**
   * Logo institucional `.logo`.
   * Texto de ubicación: `"Valencia, Carabobo · Venezuela"`.

### 5.2 Estilos Responsivos y Accesibilidad
* `@media(max-width: 760px)`:
  * `.hero`, `.maps .wrap`, `.row` pasan a una sola columna (`grid-template-columns: 1fr`).
  * En el hero móvil, `.do` pasa arriba con `order: -1` para impacto visual inmediato de la mascota.
* Accesibilidad:
  * Respetar `prefers-reduced-motion: reduce`.
  * Estados `:focus-visible` con anillo `3px solid var(--lime)`.
  * `viewport-fit=cover` y soporte de áreas seguras en iOS (`env(safe-area-inset-top)` / `bottom`).

---

## 6. Fase 4: Protocolo de Verificación Visual con Playwright MCP

OpenCode debe verificar la correcta ejecución utilizando las herramientas de Playwright MCP:

1. **Iniciar servidor estático local temporal:**
   ```bash
   python3 -m http.server 8085 --directory /home/joel/Proyectos/Vendo &
   ```
2. **Navegación y Capturas con Playwright:**
   * **Desktop (1280x800):**
     * Abrir `http://localhost:8085/index.html`.
     * Tomar screenshot de la página completa para comparar pixel a pixel con el mockup base.
     * Verificar que el título de la pestaña y el favicon cargan correctamente sin errores 404 en la consola de red.
   * **Mobile (375x812 / iPhone o Pixel viewport):**
     * Ajustar viewport a móvil.
     * Tomar screenshot del hero y de las secciones para verificar el orden inverso de la mascota Do y el empaquetado de las tarjetas y botones.
3. **Checklist de Calidad:**
   * [ ] Favicon redondeado visible y enlazado en `<head>`.
   * [ ] Colores exactos según la guía (#01110A, #01442C, #CEF17B, #F8FFE6).
   * [ ] Tipografías Google Fonts Fredoka y Space Mono cargadas e inspeccionadas.
   * [ ] Enlaces ancla `#servicios` y `#contacto` con desplazamiento suave (`scroll-behavior: smooth`).
   * [ ] Cierre limpio del servidor de prueba.
