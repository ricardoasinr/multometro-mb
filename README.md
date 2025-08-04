# 🎯 Multómetro Challenge - Calculadora de Multas AEMP

Una herramienta web interactiva para estimar multas basadas en el Reglamento de Sanciones e Infracciones Comerciales y Contables (Resolución RA/AEMP/Nº009/2021).

## 🚀 Cómo Ejecutar la Aplicación

### 📋 Prerrequisitos

- Un navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional, pero recomendado)

### 🛠️ Opción 1: Ejecutar Directamente (Más Simple)

1. **Descarga o clona el proyecto**

   ```bash
   git clone <url-del-repositorio>
   cd multómetro
   ```

2. **Abre el archivo principal**

   - Navega a la carpeta del proyecto
   - Haz doble clic en `index.html`
   - O arrastra el archivo a tu navegador

3. **¡Listo!** La aplicación se ejecutará en tu navegador

### 🌐 Opción 2: Usar un Servidor Local (Recomendado)

#### Con Python (si tienes Python instalado):

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Con Node.js (si tienes Node.js instalado):

```bash
# Instalar servidor globalmente
npm install -g http-server

# Ejecutar servidor
http-server -p 8000
```

#### Con PHP (si tienes PHP instalado):

```bash
php -S localhost:8000
```

4. **Abrir en el navegador**
   - Ve a `http://localhost:8000`
   - La aplicación estará disponible

## 📁 Estructura del Proyecto

```
multómetro/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── preguntas.json      # Base de datos de preguntas
├── preguntas.csv       # Versión CSV de las preguntas
├── database_schema.sql # Esquema de base de datos (ignorar por ahora)
├── ejemplos_consultas.sql # Ejemplos de consultas (ignorar por ahora)
└── README.md           # Este archivo
```

## 🎮 Cómo Usar la Aplicación

### 1. **Página de Bienvenida**

- Lee la información sobre la herramienta
- Haz clic en "🎯 Comenzar"

### 2. **Formulario de Registro**

- Completa tus datos personales:
  - Nombre y apellidos
  - Empresa
  - Cargo
  - Email
  - Teléfono
- Haz clic en "Continuar"

### 3. **Configuración de Empresa**

- Selecciona el tipo de sociedad
- Elige la base de cálculo
- Ingresa el monto base
- Haz clic en "Continuar al Multómetro"

### 4. **Selección de Porcentaje**

- Ajusta el porcentaje de evaluación (25%, 50%, 75%, 100%)
- O usa el slider para un valor personalizado
- Haz clic en "Iniciar Cuestionario"

### 5. **Cuestionario**

- Responde las preguntas con "Sí" o "No"
- Ve el progreso en tiempo real
- Completa todas las preguntas

### 6. **Resultados**

- Revisa el resumen de tus respuestas
- Ve el porcentaje de evaluación
- Opción de realizar nueva evaluación

## 🔧 Características Técnicas

### ✅ **Funcionalidades Implementadas:**

- ✅ Formulario de registro con validación
- ✅ Configuración de empresa
- ✅ Selección de porcentaje de evaluación
- ✅ Cuestionario dinámico con preguntas aleatorias
- ✅ Progreso visual en tiempo real
- ✅ Cálculo de estadísticas
- ✅ Diseño responsivo
- ✅ Validación de formularios
- ✅ Animaciones suaves

### 🎨 **Diseño:**

- Interfaz moderna y profesional
- Colores corporativos
- Iconos Font Awesome
- Tipografía Inter
- Diseño responsivo para móviles

### 📊 **Datos:**

- 170+ preguntas organizadas por categorías
- Preguntas de Comercial y Contable
- Selección aleatoria según porcentaje
- Estadísticas en tiempo real

## 🗄️ Base de Datos (Opcional)

**Nota:** La aplicación funciona completamente sin base de datos. Los archivos `database_schema.sql` y `ejemplos_consultas.sql` son para uso futuro cuando se implemente persistencia de datos.

Si quieres ignorar la base de datos por ahora:

- ✅ La aplicación funciona perfectamente sin ella
- ✅ Todos los datos se procesan en el navegador
- ✅ No necesitas configurar PostgreSQL
- ✅ No necesitas servidor backend

## 🐛 Solución de Problemas

### Problema: "No se pueden cargar las preguntas"

**Solución:** Asegúrate de que el archivo `preguntas.json` esté en la misma carpeta que `index.html`

### Problema: "Los estilos no se cargan"

**Solución:** Verifica que `styles.css` esté en la misma carpeta

### Problema: "Las funciones no funcionan"

**Solución:** Abre la consola del navegador (F12) para ver errores

### Problema: "No se puede acceder desde otro dispositivo"

**Solución:** Usa un servidor local en lugar de abrir el archivo directamente

## 📱 Compatibilidad

### Navegadores Soportados:

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Dispositivos:

- ✅ Desktop
- ✅ Tablet
- ✅ Móvil

## 🚀 Despliegue

### Para Producción:

1. Sube todos los archivos a tu servidor web
2. Asegúrate de que `index.html` esté en la raíz
3. Verifica que todos los archivos estén en la misma carpeta

### Para Desarrollo:

1. Usa un servidor local (recomendado)
2. Mantén la estructura de carpetas
3. Usa herramientas de desarrollo del navegador

## 📞 Soporte

Si tienes problemas:

1. Verifica que todos los archivos estén presentes
2. Usa un servidor local en lugar de abrir el archivo directamente
3. Revisa la consola del navegador para errores
4. Asegúrate de tener una conexión a internet (para fuentes y iconos)

## 📄 Licencia

Este proyecto es para uso educativo y de demostración.

---

**¡Disfruta usando el Multómetro Challenge! 🎯**
