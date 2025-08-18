// Estado de la aplicación
let currentPage = 0;
const pages = [
    'welcome-page',
    'form-page',
    'company-config-page',
    'progress-page',
    'questions-page',
    'success-page'
];

// Datos recolectados del usuario
let userData = {
    tipoSociedad: '',
    baseCalculo: 0,
    montoBaseCalculo: 0,
    rango: '',
    factor: 0,
    multaTotal: 0
};

// Variables para el componente de progreso
let progressInterval = null;
let currentProgress = 0;
let targetProgress = 100;
let progressDuration = 5000; // 5 segundos por defecto

// Variables para las preguntas
let allQuestions = [];
let selectedQuestions = [];
let currentQuestionIndex = 0;
let questionAnswers = [];

// Función para calcular multa según tipo de pregunta
function calcularMulta(pregunta, respuesta) {
    if (respuesta !== 'no') return 0;
    
    const nro = pregunta.nro;
    
    // Preguntas especiales 1-4 (valores fijos por tipo de sociedad)
    if (nro >= 1 && nro <= 4) {
        return calcularMultaEspecial(nro);
    }
    
    // Preguntas especiales 46-48 (valores fijos por tipo de sociedad)
    if (nro >= 46 && nro <= 48) {
        return calcularMultaEspecial(nro);
    }
    
    // Preguntas 38 y 45 con valores de texto (suspensión/amonestación)
    if (nro === 38 || nro === 45) {
        // Estas preguntas tienen valores de texto, no multas monetarias
        console.log(`Pregunta ${nro}: ${pregunta.values}`);
        return 0; // No se aplica multa monetaria
    }
    
    // Preguntas normales 5-37, 39-44 con valores por rango
    if (pregunta.values && pregunta.values[userData.rango]) {
        const valorPorcentual = pregunta.values[userData.rango];
        console.log('Calculando multa para pregunta:', nro, 'con valor:', valorPorcentual);
        const baseCalculo = parseFloat(userData.baseCalculo);
        console.log('Base de cálculo:', baseCalculo, 'Monto base:', userData.montoBaseCalculo);
        // Calcular multa
        const multa = baseCalculo * userData.montoBaseCalculo * valorPorcentual;
        console.log('Multa calculada:', multa);
        return multa;
    }
    
    return 0;
}

// Función para preguntas especiales (1-4, 46-48)
function calcularMultaEspecial(nro) {
    switch(nro) {
        case 1:
            return 16000;
        
        case 2:
            const valores2 = {
                'empresa-unipersonal': 2200,
                'srl': 3200,
                'colectiva-comandita': 3200,
                'anonima-mixta': 4200
            };
            return valores2[userData.tipoSociedad] || 0;
        
        case 3:
            const valores3 = {
                'empresa-unipersonal': 1100,
                'srl': 1600,
                'colectiva-comandita': 1600,
                'anonima-mixta': 2100
            };
            return valores3[userData.tipoSociedad] || 0;
        
        case 4:
            const valores4 = {
                'empresa-unipersonal': 200,
                'srl': 400,
                'colectiva-comandita': 400,
                'anonima-mixta': 600
            };
            return valores4[userData.tipoSociedad] || 0;
        
        case 46:
            const valores46 = {
                'empresa-unipersonal': 3100,
                'srl': 6100,
                'colectiva-comandita': 6100,
                'anonima-mixta': 9100
            };
            return valores46[userData.tipoSociedad] || 0;
        
        case 47:
            const valores47 = {
                'empresa-unipersonal': 5000,
                'srl': 10000,
                'colectiva-comandita': 10000,
                'anonima-mixta': 15000
            };
            return valores47[userData.tipoSociedad] || 0;
        
        case 48:
            const valores48 = {
                'empresa-unipersonal': 18000,
                'srl': 18000,
                'colectiva-comandita': 18000,
                'anonima-mixta': 18000
            };
            return valores48[userData.tipoSociedad] || 0;
        
        default:
            return 0;
    }
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    updateProgress();
    setupFormValidation();
    setupFormSubmission();
    setupCompanyConfigValidation(); // Configurar validación de empresa
    loadQuestions(); // Cargar preguntas al inicio
});

// Navegación entre páginas
function nextPage() {
    if (currentPage < pages.length - 1) {
        // Validación especial para la página de configuración de empresa
        if (pages[currentPage] === 'company-config-page') {
            const companyType = document.getElementById('company-type');
            const calculationBase = document.getElementById('calculation-base');
            const baseAmount = document.getElementById('base-amount');
            const continueBtn = document.getElementById('continue-btn');
            
            if (!companyType.value || !calculationBase.value || !baseAmount.value || parseFloat(baseAmount.value) <= 0 || (continueBtn && continueBtn.disabled)) {
                showConfigurationError('Debes completar todos los campos obligatorios antes de continuar');
                return; // Bloquear navegación
            }
            
            // Recolectar datos de configuración de empresa
            userData.tipoSociedad = companyType.value;
            console.log("calculation base:", calculationBase.value);
            userData.baseCalculo = calculationBase.value === 'utilidad-bruta' ? 0.8 : 1;
            userData.montoBaseCalculo = parseFloat(baseAmount.value);
            
            // Determinar rango y factor
            const monto = userData.montoBaseCalculo;
            if (monto <= 10000000) {
                userData.rango = 'A';
                userData.factor = 5;
            } else if (monto <= 20000000) {
                userData.rango = 'B';
                userData.factor = 4;
            } else if (monto <= 40000000) {
                userData.rango = 'C';
                userData.factor = 3;
            } else if (monto <= 80000000) {
                userData.rango = 'D';
                userData.factor = 2;
            } else if (monto <= 160000000) {
                userData.rango = 'E';
                userData.factor = 1;
            } else {
                userData.rango = 'F';
                userData.factor = 0.5;
            }
        }
        
        // Ocultar página actual
        const currentPageElement = document.getElementById(pages[currentPage]);
        currentPageElement.classList.remove('active');
        
        // Mostrar siguiente página
        currentPage++;
        const nextPageElement = document.getElementById(pages[currentPage]);
        
        setTimeout(() => {
            nextPageElement.classList.add('active');
            // Reconfigurar validación si entramos a la página de empresa
            if (pages[currentPage] === 'company-config-page') {
                setupCompanyConfigValidation();
            }
        }, 200);
        
        updateProgress();
        updateSteps();
    }
}

function prevPage() {
    if (currentPage > 0) {
        // Ocultar página actual
        const currentPageElement = document.getElementById(pages[currentPage]);
        currentPageElement.classList.remove('active');
        
        // Mostrar página anterior
        currentPage--;
        const prevPageElement = document.getElementById(pages[currentPage]);
        
        setTimeout(() => {
            prevPageElement.classList.add('active');
        }, 200);
        
        updateProgress();
        updateSteps();
    }
}

// Actualizar barra de progreso
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = ((currentPage + 1) / 5) * 100; // Contamos las primeras 5 páginas principales
    
    if (progressFill) {
        progressFill.style.width = Math.min(progressPercentage, 100) + '%';
    }
}

// Actualizar pasos en la barra de progreso
function updateSteps() {
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step-${i}`);
        if (step) {
            step.classList.remove('active', 'completed');
            
            if (i - 1 < currentPage) {
                step.classList.add('completed');
            } else if (i - 1 === currentPage) {
                step.classList.add('active');
            }
        }
    }
}

// Configurar validación del formulario
function setupFormValidation() {
    const form = document.getElementById('registration-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        // Validación en tiempo real
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

// Validar campo individual
function validateField(input) {
    const value = input.value.trim();
    const fieldName = input.name;
    let isValid = true;
    let errorMessage = '';
    
    // Limpiar estados anteriores
    input.classList.remove('error', 'success');
    
    // Validación por tipo de campo
    switch (fieldName) {
        case 'fullName':
            if (!value) {
                errorMessage = 'El nombre y apellidos son obligatorios';
                isValid = false;
            } else if (value.length < 3) {
                errorMessage = 'El nombre debe tener al menos 3 caracteres';
                isValid = false;
            } else if (!/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]+$/.test(value)) {
                errorMessage = 'El nombre solo puede contener letras y espacios';
                isValid = false;
            }
            break;
            
        case 'company':
            if (!value) {
                errorMessage = 'La empresa es obligatoria';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'El nombre de la empresa debe tener al menos 2 caracteres';
                isValid = false;
            }
            break;
            
        case 'position':
            if (!value) {
                errorMessage = 'El cargo es obligatorio';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'El cargo debe tener al menos 2 caracteres';
                isValid = false;
            }
            break;
            
        case 'email':
            if (!value) {
                errorMessage = 'El email es obligatorio';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errorMessage = 'Por favor, ingresa un email válido';
                isValid = false;
            }
            break;
            
        case 'phone':
            if (!value) {
                errorMessage = 'El teléfono es obligatorio';
                isValid = false;
            } else {
                const digits = value.replace(/\D/g, '');
                const isBoWithCode = /^591[67]\d{7}$/.test(digits);
                const isBoLocal = /^[67]\d{7}$/.test(digits);
                if (!(isBoWithCode || isBoLocal)) {
                    errorMessage = 'Ingresa un teléfono boliviano válido (móvil que inicia en 6 o 7, 8 dígitos; acepta +591)';
                    isValid = false;
                }
            }
            break;
    }
    
    // Mostrar resultado de validación
    if (isValid) {
        input.classList.add('success');
        hideFieldError(fieldName);
    } else {
        input.classList.add('error');
        showFieldError(fieldName, errorMessage);
    }
    
    return isValid;
}

// Mostrar error en campo
function showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.opacity = '1';
    }
}

// Ocultar error en campo
function hideFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.opacity = '0';
    }
}

// Limpiar error al escribir
function clearFieldError(input) {
    input.classList.remove('error');
    hideFieldError(input.name);
}

// Configurar envío del formulario
function setupFormSubmission() {
    const form = document.getElementById('registration-form');
    if (!form) return;
    
    form.addEventListener('submit', handleFormSubmit);
}

// Manejar envío del formulario
function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const inputs = form.querySelectorAll('input[required]');
    let isFormValid = true;
    
    // Validar todos los campos
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    if (isFormValid) {
        // Simular envío del formulario
        const submitButton = form.querySelector('.btn-submit');
        const originalText = submitButton.innerHTML;
        
        // Mostrar estado de carga
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        submitButton.disabled = true;
        
        // Simular procesamiento
        setTimeout(() => {
            // Recopilar datos del formulario
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Mostrar en consola (en producción se enviaría al servidor)
            console.log('Datos del formulario:', data);
            // Guardar email del usuario para envío de reporte
            userData.email = data.email;
            
            // Mostrar página de progreso
            nextPage();
            
            // NO iniciar automáticamente - el usuario debe seleccionar el porcentaje
            
            // Restaurar botón
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
        }, 2000);
    } else {
        // Mostrar mensaje de error general
        showFormError('Por favor, corrige los errores antes de enviar el formulario');
        
        // Scroll al primer campo con error
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstError.focus();
        }
    }
}

// Mostrar error general del formulario
function showFormError(message) {
    // Crear o actualizar mensaje de error
    let errorDiv = document.querySelector('.form-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            background: #fed7d7;
            color: #c53030;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #feb2b2;
            font-weight: 500;
        `;
        
        const form = document.getElementById('registration-form');
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }, 5000);
}

// Reiniciar formulario para nuevo registro
function restartForm() {
    // Limpiar progreso si está activo
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
    
    // Limpiar formulario
    const form = document.getElementById('registration-form');
    if (form) {
        form.reset();
        
        // Limpiar estados de validación
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error', 'success');
            hideFieldError(input.name);
        });
        
        // Ocultar mensajes de error
        const errorDiv = document.querySelector('.form-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
    
    // Resetear estado del progreso
    currentProgress = 0;
    if (document.getElementById('progress-percentage')) {
        updateProgressDisplay();
    }
    
    // Resetear estado de las preguntas
    selectedQuestions = [];
    currentQuestionIndex = 0;
    questionAnswers = [];
    
    // Volver a la primera página
    const currentPageElement = document.getElementById(pages[currentPage]);
    currentPageElement.classList.remove('active');
    
    currentPage = 0;
    const firstPageElement = document.getElementById(pages[currentPage]);
    
    setTimeout(() => {
        firstPageElement.classList.add('active');
    }, 200);
    
    updateProgress();
    updateSteps();
}

// Validación de accesibilidad por teclado
document.addEventListener('keydown', function(e) {
    // Navegación con teclas de flecha (opcional)
    if (e.altKey) {
        if (e.key === 'ArrowRight' && currentPage < pages.length - 1) {
            nextPage();
        } else if (e.key === 'ArrowLeft' && currentPage > 0) {
            prevPage();
        }
    }
    
    // Enter en botones
    if (e.key === 'Enter' && e.target.classList.contains('btn')) {
        e.target.click();
    }
});

// Mejorar experiencia de usuario
document.addEventListener('DOMContentLoaded', function() {
    // Añadir animaciones suaves
    const style = document.createElement('style');
    style.textContent = `
        .form-group input:focus {
            transform: translateY(-1px);
        }
        
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .btn:active {
            transform: translateY(1px);
        }
        
        .progress-fill {
            background: linear-gradient(
                90deg, 
                #667eea 0%, 
                #764ba2 50%, 
                #667eea 100%
            );
            background-size: 200% 100%;
            animation: progressShimmer 2s linear infinite;
        }
        
        @keyframes progressShimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
    document.head.appendChild(style);
});

// Función utilitaria para formatear teléfono
function formatPhone(input) {
    let digits = input.value.replace(/\D/g, '');

    // Si ingresa 8 dígitos móviles (inicia en 6 o 7), asume Bolivia y antepone 591
    if (/^[67]\d{7}$/.test(digits)) {
        digits = '591' + digits;
    }

    // Formato Bolivia: +591 7XX XXX XX (ejemplo: +591 700 123 45)
    if (/^591[67]\d{7}$/.test(digits)) {
        const local = digits.slice(3); // 8 dígitos
        input.value = `+591 ${local.slice(0,3)} ${local.slice(3,6)} ${local.slice(6,8)}`;
        return;
    }

    // Si no cumple, deja el valor sin cambios (solo dígitos)
    input.value = input.value;
}

// Aplicar formato automático al teléfono
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            // Solo formatear si no está siendo validado
            if (!this.classList.contains('error')) {
                formatPhone(this);
            }
        });
    }

    // Configurar eventos para los controles de progreso
    setupProgressControls();
});

// ===== COMPONENTE DE PROGRESO PERSONALIZABLE =====

// Iniciar animación de progreso (ahora inicia el cuestionario)
async function startProgressAnimation() {
    const targetPercentage = document.getElementById('target-percentage');
    const percentage = targetPercentage ? parseInt(targetPercentage.value) : 75;
    
    // Obtener configuración de empresa de la página anterior
    const companyType = document.getElementById('company-type');
    const calculationBase = document.getElementById('calculation-base');
    
    console.log('Iniciando cuestionario con:', {
        percentage: percentage,
        companyType: companyType ? companyType.value : 'no-configurado',
        calculationBase: calculationBase ? calculationBase.value : 'no-configurado'
    });
    
    // Cargar preguntas si no se han cargado
    if (allQuestions.length === 0) {
        console.log('Cargando preguntas...');
        await loadQuestions();
    }
    
    console.log('Total de preguntas disponibles:', allQuestions.length);
    
    // Seleccionar preguntas en orden secuencial según el porcentaje
        selectRandomQuestions(percentage);
    
    console.log('Preguntas seleccionadas:', selectedQuestions.length);
    console.log('Preguntas:', selectedQuestions);
    
    // Mostrar mensaje de carga
    const startButton = document.querySelector('.btn-start');
    const originalText = startButton.innerHTML;
    startButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparando preguntas...';
    startButton.disabled = true;
    
    // Verificar que tenemos preguntas antes de continuar
    if (selectedQuestions.length === 0) {
        console.error('No se seleccionaron preguntas');
        startButton.innerHTML = originalText;
        startButton.disabled = false;
        return;
    }
    
    // Simular un pequeño delay para el efecto de carga
    setTimeout(() => {
        // Ir a la página de preguntas
        nextPage();
        
        // Iniciar el cuestionario
        startQuestionnaire();
        
        // Restaurar botón (por si vuelven a esta página)
        startButton.innerHTML = originalText;
        startButton.disabled = false;
    }, 1500);
}

// Actualizar visualización del progreso
function updateProgressDisplay() {
    const percentage = Math.round(currentProgress);
    
    // Actualizar progreso circular
    updateCircularProgress(percentage);
    
    // Actualizar progreso lineal
    updateLinearProgress(percentage);
}

// Actualizar progreso circular
function updateCircularProgress(percentage) {
    const circle = document.querySelector('.progress-ring-circle');
    const percentageText = document.getElementById('progress-percentage');
    
    if (circle && percentageText) {
        const radius = 86;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        
        circle.style.strokeDashoffset = offset;
        percentageText.textContent = percentage;
    }
}

// Actualizar progreso lineal
function updateLinearProgress(percentage) {
    const fill = document.getElementById('linear-progress-fill');
    const percentageText = document.getElementById('linear-progress-percentage');
    
    if (fill && percentageText) {
        fill.style.width = percentage + '%';
        percentageText.textContent = percentage;
    }
}

// Mostrar estilo de progreso seleccionado
function showProgressStyle(style) {
    const circularContainer = document.querySelector('.circular-progress');
    const linearContainer = document.querySelector('.linear-progress-container');
    
    if (style === 'linear') {
        if (circularContainer) circularContainer.style.display = 'none';
        if (linearContainer) linearContainer.style.display = 'block';
    } else {
        if (circularContainer) circularContainer.style.display = 'flex';
        if (linearContainer) linearContainer.style.display = 'none';
    }
}

// Activar pasos del proceso
function activateProcessSteps() {
    const steps = ['step-validate', 'step-process', 'step-complete'];
    
    steps.forEach((stepId, index) => {
        setTimeout(() => {
            const step = document.getElementById(stepId);
            if (step) {
                step.classList.add('active');
                
                // Marcar pasos anteriores como completados
                if (index > 0) {
                    const prevStep = document.getElementById(steps[index - 1]);
                    if (prevStep) {
                        prevStep.classList.remove('active');
                        prevStep.classList.add('completed');
                    }
                }
            }
        }, (progressDuration / 3) * index);
    });
}

// Completar progreso y continuar a página de éxito
function completeProgress() {
    // Marcar último paso como completado
    const lastStep = document.getElementById('step-complete');
    if (lastStep) {
        lastStep.classList.remove('active');
        lastStep.classList.add('completed');
    }
    
    // Continuar a página de éxito después de un breve delay
    setTimeout(() => {
        nextPage();
    }, 1000);
}

// Reiniciar animación de progreso
function restartProgress() {
    // Limpiar intervalo
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    // Desactivar visualmente el componente
    const progressComponent = document.querySelector('.progress-component');
    if (progressComponent) {
        progressComponent.classList.remove('active');
    }
    
    // Resetear estado
    currentProgress = 0;
    updateProgressDisplay();
    
    // Resetear pasos del proceso
    const steps = document.querySelectorAll('.step-item');
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
    const firstStep = document.getElementById('step-validate');
    if (firstStep) {
        firstStep.classList.add('active');
    }
}

// Configurar controles de personalización
function setupProgressControls() {
    const styleSelect = document.getElementById('style-select');
    const durationInput = document.getElementById('duration-input');
    const targetPercentage = document.getElementById('target-percentage');
    const targetValue = document.getElementById('target-value');
    
    if (styleSelect) {
        styleSelect.addEventListener('change', function() {
            showProgressStyle(this.value);
        });
    }
    
    // Validar inputs
    if (durationInput) {
        durationInput.addEventListener('change', function() {
            if (this.value < 1) this.value = 1;
            if (this.value > 30) this.value = 30;
        });
    }
    
    // Configurar slider de porcentaje
    if (targetPercentage && targetValue) {
        targetPercentage.addEventListener('input', function() {
            targetValue.textContent = this.value;
            updateSliderBackground(this);
        });
        
        // Inicializar el fondo del slider
        updateSliderBackground(targetPercentage);
    }
}

// Actualizar el fondo del slider según el valor
function updateSliderBackground(slider) {
    const value = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background = `linear-gradient(to right, #667eea 0%, #764ba2 ${value}%, #e2e8f0 ${value}%, #e2e8f0 100%)`;
}

// Establecer porcentaje objetivo desde botones rápidos
function setTargetPercentage(percentage) {
    const targetPercentage = document.getElementById('target-percentage');
    const targetValue = document.getElementById('target-value');
    
    if (targetPercentage && targetValue) {
        targetPercentage.value = percentage;
        targetValue.textContent = percentage;
        updateSliderBackground(targetPercentage);
    }
}

// Función utilitaria para animar números
function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        element.textContent = Math.round(current);
    }, 16);
}

// Configurar validación en tiempo real para la página de empresa
function setupCompanyConfigValidation() {
    const companyType = document.getElementById('company-type');
    const calculationBase = document.getElementById('calculation-base');
    const baseAmount = document.getElementById('base-amount');
    const continueBtn = document.getElementById('continue-btn');
    
    if (!companyType || !calculationBase || !baseAmount || !continueBtn) {
        return; // Los elementos no existen en esta página
    }
    
    // Función para validar todos los campos
    function validateCompanyFields() {
        const isCompanyTypeValid = companyType.value.trim() !== '';
        const isCalculationBaseValid = calculationBase.value.trim() !== '';
        const isBaseAmountValid = baseAmount.value.trim() !== '' && parseFloat(baseAmount.value) > 0;
        const allFieldsValid = isCompanyTypeValid && isCalculationBaseValid && isBaseAmountValid;
        
        // Habilitar/deshabilitar botón
        continueBtn.disabled = !allFieldsValid;
        
        // Actualizar estilos del botón
        if (allFieldsValid) {
            continueBtn.classList.remove('btn-disabled');
            continueBtn.classList.add('btn-enabled');
        } else {
            continueBtn.classList.add('btn-disabled');
            continueBtn.classList.remove('btn-enabled');
        }
        
        // Actualizar texto de ayuda
        const requirementText = document.querySelector('.requirement-text');
        if (requirementText) {
            if (allFieldsValid) {
                requirementText.textContent = '✓ Todos los campos completados - Puedes continuar';
                requirementText.classList.add('requirement-completed');
            } else {
                requirementText.textContent = 'Completa todos los campos obligatorios (*) para continuar';
                requirementText.classList.remove('requirement-completed');
            }
        }
        
        return allFieldsValid;
    }
    
    // Agregar eventos de validación
    companyType.addEventListener('change', validateCompanyFields);
    calculationBase.addEventListener('change', validateCompanyFields);
    baseAmount.addEventListener('input', validateCompanyFields);
    baseAmount.addEventListener('change', validateCompanyFields);
    
    // Validación inicial
    validateCompanyFields();
}

// Validar y continuar desde configuración de empresa
function validateAndContinue() {
    const companyType = document.getElementById('company-type');
    const calculationBase = document.getElementById('calculation-base');
    const baseAmount = document.getElementById('base-amount');
    const continueBtn = document.getElementById('continue-btn');
    
    // Verificar que el botón no esté deshabilitado
    if (continueBtn.disabled) {
        showConfigurationError('Debes completar todos los campos obligatorios antes de continuar');
        return;
    }
    
    if (!companyType.value) {
        showConfigurationError('Por favor, selecciona el tipo de sociedad');
        companyType.focus();
        return;
    }
    
    if (!calculationBase.value) {
        showConfigurationError('Por favor, selecciona la base de cálculo');
        calculationBase.focus();
        return;
    }
    
    if (!baseAmount.value || parseFloat(baseAmount.value) <= 0) {
        showConfigurationError('Por favor, ingresa un monto válido mayor a 0');
        baseAmount.focus();
        return;
    }
    
    console.log('Configuración de empresa completada:', {
        companyType: companyType.value,
        calculationBase: calculationBase.value,
        baseAmount: parseFloat(baseAmount.value)
    });
    
    // Continuar a la página de progreso
    nextPage();
}

// Mostrar error de configuración
function showConfigurationError(message) {
    // Crear o actualizar mensaje de error
    let errorDiv = document.querySelector('.configuration-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'configuration-error';
        errorDiv.style.cssText = `
            background: #fed7d7;
            color: #c53030;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border: 1px solid #feb2b2;
            font-weight: 500;
            text-align: center;
        `;
        
        const configContainer = document.querySelector('.company-configuration');
        configContainer.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Ocultar automáticamente después de 4 segundos
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }, 4000);
}

// ===== FUNCIONALIDAD DE PREGUNTAS =====

// Cargar preguntas desde el archivo JSON
async function loadQuestions() {
    try {
        console.log('Intentando cargar preguntas.json...');
        const response = await fetch('preguntas.json');
        console.log('Respuesta del fetch:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo de preguntas: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Datos cargados del JSON:', data.length, 'preguntas');
        
        allQuestions = data;
        console.log(`Cargadas ${allQuestions.length} preguntas exitosamente`);
        
        // Verificar que las preguntas tienen la estructura correcta
        if (allQuestions.length > 0) {
            console.log('Ejemplo de pregunta:', allQuestions[0]);
        }
        
    } catch (error) {
        console.error('Error cargando preguntas:', error);
        console.log('Usando preguntas de fallback...');
        // Preguntas de fallback en caso de error
        allQuestions = [
            { pregunta: "¿Su empresa está actualmente matriculada en el Registro de Comercio?", categoria: "Comercial" },
            { pregunta: "¿Lleva su empresa una contabilidad formal y actualizada?", categoria: "Contable" },
            { pregunta: "¿Cuenta su empresa con los libros contables obligatorios?", categoria: "Contable" },
            { pregunta: "¿Ha actualizado los datos de su empresa en el Registro de Comercio cuando ha sido necesario?", categoria: "Comercial" }
        ];
        console.log('Preguntas de fallback cargadas:', allQuestions.length);
    }
}

// Seleccionar preguntas en orden secuencial según el porcentaje
function selectSequentialQuestions(percentage) {
    const totalQuestions = allQuestions.length;
        const questionsToSelect = Math.ceil((percentage / 100) * totalQuestions);
        // Crear una copia del array para no modificar el original
        const questionsCopy = [...allQuestions];
        selectedQuestions = [];
        // Seleccionar aleatoriamente
        for (let i = 0; i < questionsToSelect && questionsCopy.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * questionsCopy.length);
            selectedQuestions.push(questionsCopy[randomIndex]);
            questionsCopy.splice(randomIndex, 1);
        }
        console.log(`Seleccionadas ${selectedQuestions.length} preguntas de ${totalQuestions} (${percentage}%) aleatorias`);
    
    // Seleccionar las primeras N preguntas en orden
    selectedQuestions = allQuestions.slice(0, questionsToSelect);
    
    console.log(`Seleccionadas ${selectedQuestions.length} preguntas de ${totalQuestions} (${percentage}%) en orden secuencial`);
    return selectedQuestions;
}

// Iniciar cuestionario
function startQuestionnaire() {
    currentQuestionIndex = 0;
    questionAnswers = [];
    userData.multaTotal = 0; // Reiniciar contador de multas
    console.log('Iniciando cuestionario. Preguntas seleccionadas:', selectedQuestions.length);
    displayCurrentQuestion();
    updateQuestionsProgress();
}

// Mostrar pregunta actual
function displayCurrentQuestion() {
    console.log(`Mostrando pregunta ${currentQuestionIndex + 1} de ${selectedQuestions.length}`);
    
    const questionContainer = document.getElementById('current-question');
    const questionNumber = document.getElementById('question-number');
    const questionTotal = document.getElementById('question-total');
    const categoryBadge = document.getElementById('question-category');
    
    if (currentQuestionIndex < selectedQuestions.length) {
        const question = selectedQuestions[currentQuestionIndex];
        console.log('Pregunta actual:', question.pregunta);
        
        if (questionContainer) {
            questionContainer.textContent = question.pregunta;
        }
        
        if (questionNumber) {
            questionNumber.textContent = currentQuestionIndex + 1;
        }
        
        if (questionTotal) {
            questionTotal.textContent = selectedQuestions.length;
        }
        
        if (categoryBadge) {
            categoryBadge.textContent = question.categoria;
            categoryBadge.className = `category-badge category-${question.categoria.toLowerCase()}`;
        }
        
        // Limpiar selección anterior
        const radioButtons = document.querySelectorAll('input[name="answer"]');
        radioButtons.forEach(radio => radio.checked = false);
    } else {
        console.error('Índice de pregunta fuera de rango en displayCurrentQuestion');
    }
}

// Responder pregunta actual
function answerQuestion(answer) {
    console.log(`Respondiendo pregunta ${currentQuestionIndex + 1} de ${selectedQuestions.length} con: ${answer}`);
    
    if (currentQuestionIndex >= selectedQuestions.length) {
        console.error('Índice de pregunta fuera de rango');
        return;
    }
    
    const question = selectedQuestions[currentQuestionIndex];
    
    // Calcular multa si la respuesta es "no"
    const multa = calcularMulta(question, answer);
    if (multa > 0) {
        userData.multaTotal += multa;
        console.log(`Pregunta ${question.nro}: Multa de $${multa.toFixed(2)} - Total acumulado: $${userData.multaTotal.toFixed(2)}`);
    }
    
    questionAnswers.push({
        question: question.pregunta,
        category: question.categoria,
        answer: answer,
        values: question.values,
        multa: multa
    });
    
    console.log('Respuesta guardada. Total respuestas:', questionAnswers.length);
    
    // Avanzar a la siguiente pregunta o completar
    setTimeout(() => {
        currentQuestionIndex++;
        console.log(`Avanzando a pregunta ${currentQuestionIndex + 1} de ${selectedQuestions.length}`);
        
        if (currentQuestionIndex < selectedQuestions.length) {
            console.log('Mostrando siguiente pregunta');
            displayCurrentQuestion();
            updateQuestionsProgress();
        } else {
            console.log('Completando cuestionario');
            completeQuestionnaire();
        }
    }, 300);
}

// Actualizar barra de progreso de preguntas
function updateQuestionsProgress() {
    const progressBar = document.getElementById('questions-progress-fill');
    const progressText = document.getElementById('questions-progress-text');
    
    const progress = ((currentQuestionIndex) / selectedQuestions.length) * 100;
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    
    if (progressText) {
        progressText.textContent = `${currentQuestionIndex} de ${selectedQuestions.length}`;
    }
}

// Completar cuestionario
function completeQuestionnaire() {
    console.log('Cuestionario completado:', questionAnswers);
    
    // Mostrar resultados básicos
    const yesAnswers = questionAnswers.filter(a => a.answer === 'yes').length;
    const noAnswers = questionAnswers.filter(a => a.answer === 'no').length;
    
    // Actualizar página de éxito con resultados
    updateSuccessPageWithResults(yesAnswers, noAnswers);
    
    // Ir a página de éxito
    nextPage();
}

// Actualizar página de éxito con resultados
function updateSuccessPageWithResults(yesAnswers, noAnswers) {
    const successMessage = document.querySelector('.success-message');
    const successNote = document.querySelector('.success-note');
    
    if (successMessage) {
        successMessage.innerHTML = `
            Gracias por completar el cuestionario. Has respondido ${selectedQuestions.length} preguntas.
        `;
    }
    
    if (successNote) {
        successNote.innerHTML = `
            <div class="results-summary">
                <h3>Resumen de Respuestas:</h3>
                <div class="results-stats">
                    <div class="stat-item stat-yes">
                        <span class="stat-number">${yesAnswers}</span>
                        <span class="stat-label">Sí</span>
                    </div>
                    <div class="stat-item stat-no">
                        <span class="stat-number">${noAnswers}</span>
                        <span class="stat-label">No</span>
                    </div>
                    <div class="stat-item stat-total">
                        <span class="stat-number">${selectedQuestions.length}</span>
                        <span class="stat-label">Total</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Mostrar todos los datos recolectados al final de la encuesta
    console.log('Configuración de empresa:', userData);
    console.log('Respuestas del cuestionario:', {
        totalPreguntas: selectedQuestions.length,
        respuestasSi: yesAnswers,
        respuestasNo: noAnswers,
        porcentajeCompliance: Math.round((yesAnswers / selectedQuestions.length) * 100),
        multaTotal: userData.multaTotal
    });
    console.log('Detalle de multas por pregunta:', questionAnswers.map(q => ({
        pregunta: q.question,
        respuesta: q.answer,
        multa: q.multa,
        nro: q.nro
    })));
}

// Generar reporte PDF usando plantilla HTML y html2canvas
function generarReportePDF() {
    console.log('Iniciando generación de reporte PDF con html2canvas...');
    
    // Mostrar indicador de carga
    const loadingMessage = document.createElement('div');
    loadingMessage.innerHTML = 'Generando PDF... <span id="pdf-loading-spinner" style="display:inline-block;animation:spin 1s linear infinite;">⏳</span>';
    loadingMessage.style.cssText = `
        position:fixed;
        top:20px;
        right:20px;
        background:#f8f9fa;
        border:1px solid #ddd;
        padding:10px 20px;
        border-radius:5px;
        box-shadow:0 2px 5px rgba(0,0,0,0.2);
        z-index:9999;
    `;
    document.body.appendChild(loadingMessage);
    
    // Añadir animación de giro
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Cargar la plantilla HTML
    fetch('./reporte-template.html')
        .then(response => response.text())
        .then(template => {
            // Calcular datos para el reporte
            const yesAnswers = questionAnswers.filter(a => a.answer === 'yes').length;
            const noAnswers = questionAnswers.filter(a => a.answer === 'no').length;
            const compliance = Math.round((yesAnswers / selectedQuestions.length) * 100);
            const multasDetalle = questionAnswers.filter(q => q.multa > 0);
            
            // Mapear tipo de sociedad para mostrar
            const tipoSociedadNombres = {
                'empresa-unipersonal': 'Empresa Unipersonal',
                'srl': 'SRL',
                'colectiva-comandita': 'Sociedad Colectiva/Comandita',
                'anonima-mixta': 'Sociedad Anónima/Mixta'
            };
            
            // Reemplazar placeholders en la plantilla
            let reportHTML = template
                .replace(/{{fecha}}/g, new Date().toLocaleDateString('es-ES'))
                .replace(/{{tipoSociedad}}/g, tipoSociedadNombres[userData.tipoSociedad] || userData.tipoSociedad)
                .replace(/{{baseCalculo}}/g, userData.baseCalculo === 1 ? 'Utilidad Bruta' : 'Capital')
                .replace(/{{montoBase}}/g, `Bs. ${userData.montoBaseCalculo.toLocaleString('es-ES')}`)
                .replace(/{{rango}}/g, `${userData.rango} (Factor: ${userData.factor}%)`)
                .replace(/{{totalPreguntas}}/g, selectedQuestions.length)
                .replace(/{{respuestasSi}}/g, yesAnswers)
                .replace(/{{respuestasNo}}/g, noAnswers)
                .replace(/{{compliance}}/g, compliance)
                .replace(/{{totalMultas}}/g, `Bs. ${userData.multaTotal.toLocaleString('es-ES', {minimumFractionDigits: 2})}`);
            
            // Crear DOM temporal para el reporte
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = reportHTML;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            document.body.appendChild(tempDiv);
            
            // Agregar las multas dinámicamente
            const multasList = tempDiv.querySelector('#multas-list');
            if (multasList && multasDetalle.length > 0) {
                multasDetalle.forEach((item, index) => {
                    const multaDiv = document.createElement('div');
                    multaDiv.className = 'multa-item';
                    multaDiv.innerHTML = `
                        <div class="multa-question">${item.question}</div>
                        <div class="multa-amount">Bs. ${item.multa.toLocaleString('es-ES', {minimumFractionDigits: 2})}</div>
                    `;
                    multasList.appendChild(multaDiv);
                });
            }
            
            // Obtener el contenedor del reporte
            const reportContainer = tempDiv.querySelector('#report-content');
            
            // Configurar html2canvas
            const canvas = html2canvas(reportContainer, {
                scale: 2, // Mayor resolución
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: 800, // Ancho fijo
                height: reportContainer.scrollHeight,
                scrollX: 0,
                scrollY: 0
            });
            
            canvas.then(function(canvas) {
                try {
                    // Verificar disponibilidad de jsPDF
                    let jsPDF;
                    if (window.jspdf && window.jspdf.jsPDF) {
                        jsPDF = window.jspdf.jsPDF;
                    } else if (window.jsPDF) {
                        jsPDF = window.jsPDF;
                    } else {
                        throw new Error('jsPDF no está disponible');
                    }
                    
                    // Crear PDF
                    const imgData = canvas.toDataURL('image/jpeg', 0.95);
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    
                    // Calcular dimensiones para ajustar al PDF
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgWidth = pdfWidth - 20; // Margen de 10mm a cada lado
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    
                    let heightLeft = imgHeight;
                    let position = 10; // Margen superior
                    
                    // Agregar primera página
                    pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                    heightLeft -= (pdfHeight - 20);
                    
                    // Agregar páginas adicionales si es necesario
                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight + 10;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                        heightLeft -= (pdfHeight - 20);
                    }
                    
                    // Generar blob del PDF
                    const fileName = `Reporte_Multometro_${new Date().toISOString().slice(0, 10)}.pdf`;
                    const blob = pdf.output('blob');
                    const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
                    
                    // Limpiar elementos temporales
                    document.body.removeChild(tempDiv);
                    document.body.removeChild(loadingMessage);
                    
                    // Enviar por email o descargar para pruebas
                    const email = userData.email;
                    if (email) {
                        const formData = new FormData();
                        formData.append('email', email);
                        formData.append('pdf', pdfFile);
                        
                        fetch('https://apigmail-lunw.onrender.com/send-email', {
                            method: 'POST',
                            body: formData
                        })
                        .then(res => res.json())
                        .then(result => {
                            if (result.success) {
                                console.log('Email enviado exitosamente');
                            } else {
                                console.error('Error al enviar email:', result.error || 'Desconocido');
                            }
                        })
                        .catch(error => {
                            console.error('Error en envío de PDF:', error);
                            
                            // En caso de error, descargar
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.style.display = 'none';
                            a.href = url;
                            a.download = fileName;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        });
                    } else {
                        // Si no hay email, solo descargar para pruebas
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    }
                    
                    console.log('Reporte PDF generado con éxito:', fileName);
                    
                } catch (error) {
                    console.error('Error generando PDF:', error);
                    document.body.removeChild(tempDiv);
                    document.body.removeChild(loadingMessage);
                    
                    // Fallback al reporte de texto
                    generarReporteTexto();
                }
            })
            .catch(error => {
                console.error('Error en html2canvas:', error);
                document.body.removeChild(tempDiv);
                document.body.removeChild(loadingMessage);
                
                // Fallback al reporte de texto
                generarReporteTexto();
            });
            
        })
        .catch(error => {
            console.error('Error cargando plantilla HTML:', error);
            document.body.removeChild(loadingMessage);
            
            // Fallback al reporte de texto
            generarReporteTexto();
        });
}

// Función fallback para generar reporte de texto
function generarReporteTexto() {
    console.log('Generando reporte de texto como fallback...');
    
    const yesAnswers = questionAnswers.filter(a => a.answer === 'yes').length;
    const noAnswers = questionAnswers.filter(a => a.answer === 'no').length;
    const compliance = Math.round((yesAnswers / selectedQuestions.length) * 100);
    const multasDetalle = questionAnswers.filter(q => q.multa > 0);
    
    let reportText = `REPORTE MULTÓMETRO CHALLENGE\n`;
    reportText += `Generado el: ${new Date().toLocaleDateString('es-ES')}\n\n`;
    reportText += `INFORMACIÓN DE LA EMPRESA:\n`;
    reportText += `- Tipo de Sociedad: ${userData.tipoSociedad}\n`;
    reportText += `- Base de Cálculo: ${userData.baseCalculo === 1 ? 'Utilidad Bruta' : 'Capital'}\n`;
    reportText += `- Monto Base: Bs. ${userData.montoBaseCalculo.toLocaleString('es-ES')}\n`;
    reportText += `- Rango: ${userData.rango} (Factor: ${userData.factor}%)\n\n`;
    
    reportText += `RESULTADOS:\n`;
    reportText += `- Total preguntas: ${selectedQuestions.length}\n`;
    reportText += `- Respuestas "Sí": ${yesAnswers}\n`;
    reportText += `- Respuestas "No": ${noAnswers}\n`;
    reportText += `- Nivel de Compliance: ${compliance}%\n\n`;
    
    reportText += `TOTAL ESTIMADO DE MULTAS: Bs. ${userData.multaTotal.toLocaleString('es-ES', {minimumFractionDigits: 2})}\n\n`;
    
    if (multasDetalle.length > 0) {
        reportText += `DETALLE DE MULTAS:\n`;
        multasDetalle.forEach((item, index) => {
            reportText += `${index + 1}. ${item.question}\n`;
            reportText += `   Multa: Bs. ${item.multa.toLocaleString('es-ES', {minimumFractionDigits: 2})}\n\n`;
        });
    }
    
    // Crear blob de texto y descargar
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const fileName = `Reporte_Multometro_${new Date().toISOString().slice(0, 10)}.txt`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('Reporte de texto generado:', fileName);
}
